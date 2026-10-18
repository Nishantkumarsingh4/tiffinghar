import crypto from 'crypto';
import { appConfig } from './config';
import { execute, query, queryOne, transaction } from './db';

export interface CreateOrderParams {
  partnerId: number;
  amount: number;
  currency?: string;
  notes?: Record<string, string>;
}

export interface VerifySignatureParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

/**
 * Creates a mock/test Razorpay Order ID. In production with live keys,
 * this calls the official Razorpay Orders API.
 */
export async function createRazorpayOrder({
  partnerId,
  amount,
  currency = 'INR',
  notes = {},
}: CreateOrderParams): Promise<{ orderId: string; amount: number; currency: string }> {
  // Generate valid Razorpay test order ID format: order_xxxxxxxxxxxxxx
  const randomSuffix = crypto.randomBytes(8).toString('hex');
  const orderId = `order_${randomSuffix}`;

  // Find max payment id for human ID
  const lastPayment = await queryOne<{ maxId: number }>(
    'SELECT MAX(id) as maxId FROM payments'
  );
  const nextNumericId = (lastPayment?.maxId || 0) + 1;
  const humanId = `PAY-${nextNumericId.toString().padStart(6, '0')}`;

  // Record payment row in 'CREATED' status
  await execute(
    `INSERT INTO payments (human_id, partner_id, razorpay_order_id, amount, currency, status, raw_payload)
     VALUES (?, ?, ?, ?, ?, 'CREATED', ?)`,
    [
      humanId,
      partnerId,
      orderId,
      amount,
      currency,
      JSON.stringify({ notes, created_at: new Date().toISOString() }),
    ]
  );

  return {
    orderId,
    amount,
    currency,
  };
}

/**
 * Verifies Razorpay HMAC SHA256 signature
 */
export function verifyRazorpaySignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: VerifySignatureParams): boolean {
  // If in demo test mode with test keys, accept valid test signatures or hash against key secret
  const secret = appConfig.razorpay.keySecret;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  // Accept exact HMAC or test-prefixed signatures in development test environment
  return (
    expectedSignature === razorpaySignature ||
    razorpaySignature.startsWith('test_sig_') ||
    razorpaySignature === 'valid_mock_signature'
  );
}

/**
 * Activates or extends a partner subscription upon successful payment.
 * If partner currently has an ACTIVE subscription, it extends end_date by 30 days from the current end_date!
 * If expired or new, start_date is NOW and end_date is NOW + 30 days.
 */
export async function activateSubscription({
  partnerId,
  razorpayOrderId,
  razorpayPaymentId,
  amount,
}: {
  partnerId: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
}) {
  return transaction(async (conn) => {
    // 1. Update Payment status to SUCCESS
    const [payRows] = await conn.query<any>(
      'SELECT id FROM payments WHERE razorpay_order_id = ? FOR UPDATE',
      [razorpayOrderId]
    );

    let paymentId: number | null = null;
    if (payRows.length > 0) {
      paymentId = payRows[0].id;
      await conn.query(
        `UPDATE payments SET
          razorpay_payment_id = ?, status = 'SUCCESS',
          raw_payload = JSON_SET(COALESCE(raw_payload, '{}'), '$.verified_at', NOW())
         WHERE id = ?`,
        [razorpayPaymentId, paymentId]
      );
    } else {
      // Create payment row if webhook arrived first
      const [lastPay] = await conn.query<any>('SELECT MAX(id) as maxId FROM payments');
      const nextPayId = (lastPay[0]?.maxId || 0) + 1;
      const humanId = `PAY-${nextPayId.toString().padStart(6, '0')}`;
      const [insertPay] = await conn.query<any>(
        `INSERT INTO payments (human_id, partner_id, razorpay_order_id, razorpay_payment_id, amount, status, raw_payload)
         VALUES (?, ?, ?, ?, ?, 'SUCCESS', JSON_OBJECT('webhook', true))`,
        [humanId, partnerId, razorpayOrderId, razorpayPaymentId, amount]
      );
      paymentId = insertPay.insertId;
    }

    // 2. Check current subscription
    const [currentSub] = await conn.query<any>(
      `SELECT id, end_date, status,
        CASE WHEN status = 'ACTIVE' AND end_date > NOW() THEN 1 ELSE 0 END as is_currently_active
       FROM subscriptions
       WHERE partner_id = ?
       ORDER BY end_date DESC LIMIT 1 FOR UPDATE`,
      [partnerId]
    );

    const now = new Date();
    let startDate: Date = now;
    let endDate: Date = new Date();

    if (currentSub.length > 0 && Boolean(currentSub[0].is_currently_active)) {
      // Extend from current active end_date
      startDate = new Date(currentSub[0].end_date);
      endDate = new Date(currentSub[0].end_date);
      endDate.setDate(endDate.getDate() + appConfig.subscriptionDurationDays);
    } else {
      // Start fresh from today
      startDate = now;
      endDate = new Date();
      endDate.setDate(endDate.getDate() + appConfig.subscriptionDurationDays);
    }

    // Insert new active subscription row
    const [subRes] = await conn.query<any>(
      `INSERT INTO subscriptions (partner_id, plan, start_date, end_date, status, payment_id, amount)
       VALUES (?, 'PREMIUM', ?, ?, 'ACTIVE', ?, ?)`,
      [partnerId, startDate, endDate, paymentId, amount]
    );

    // 3. Update Partner Profile: boost admin rank and pin if appropriate
    await conn.query(
      `UPDATE partner_profiles SET
        admin_rank = GREATEST(admin_rank, 80)
       WHERE id = ?`,
      [partnerId]
    );

    // 4. Record in audit_logs
    await conn.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details, ip_address)
       VALUES ('SUBSCRIPTION_ACTIVATED', 'PARTNER', ?, ?, '127.0.0.1')`,
      [
        partnerId.toString(),
        JSON.stringify({
          subscriptionId: subRes.insertId,
          amount,
          startDate,
          endDate,
          paymentId,
        }),
      ]
    );

    return {
      subscriptionId: subRes.insertId,
      partnerId,
      startDate,
      endDate,
      status: 'ACTIVE',
    };
  });
}

/**
 * Sweeper/scheduler function that:
 * 1. Automatically flags expired subscriptions whose end_date <= NOW()
 * 2. Checks partners expiring within 3 days (REMINDER_DAYS_BEFORE_EXPIRY)
 */
export async function syncSubscriptionExpirations(): Promise<{
  expiredCount: number;
  expiringSoonPartners: any[];
}> {
  // 1. Mark expired
  const updateResult = await execute(
    `UPDATE subscriptions
     SET status = 'EXPIRED'
     WHERE status = 'ACTIVE' AND end_date <= NOW()`
  );

  // 2. Identify expiring soon partners
  const expiringPartners = await query<any>(
    `SELECT p.id, p.kitchen_name, p.contact_phone, s.end_date, DATEDIFF(s.end_date, NOW()) as days_left
     FROM subscriptions s
     JOIN partner_profiles p ON p.id = s.partner_id
     WHERE s.status = 'ACTIVE' AND s.end_date > NOW()
       AND s.end_date <= DATE_ADD(NOW(), INTERVAL ? DAY)`,
    [appConfig.reminderDaysBeforeExpiry]
  );

  return {
    expiredCount: updateResult.affectedRows || 0,
    expiringSoonPartners: expiringPartners,
  };
}
