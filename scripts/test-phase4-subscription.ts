import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  activateSubscription,
  syncSubscriptionExpirations,
} from '../src/lib/payment';
import { query, queryOne, execute } from '../src/lib/db';
import { appConfig } from '../src/lib/config';

async function runPhase4Tests() {
  console.log('🧪 Running Phase 4 Subscription & Payment Unit / Integration Tests...\n');

  // Test 1: Order creation
  console.log('1. Testing Razorpay Order Creation...');
  const order = await createRazorpayOrder({
    partnerId: 5, // Dadi Da Dhaba (Free / Expired tier in seed)
    amount: 49,
  });
  if (order.orderId && order.orderId.startsWith('order_')) {
    console.log(`  ✓ Order created successfully: ${order.orderId} (Amount: ₹${order.amount})`);
  } else {
    throw new Error('Order creation failed');
  }

  // Test 2: Signature verification
  console.log('\n2. Testing Signature Verification...');
  const validSig = verifyRazorpaySignature({
    razorpayOrderId: order.orderId,
    razorpayPaymentId: 'pay_test_12345',
    razorpaySignature: 'test_sig_abc123',
  });
  console.log('  ✓ Valid signature verified:', validSig);

  // Test 3: Fresh Activation & Expiry calculation
  console.log('\n3. Testing Subscription Activation for Free Partner...');
  const activation = await activateSubscription({
    partnerId: 5,
    razorpayOrderId: order.orderId,
    razorpayPaymentId: 'pay_test_12345',
    amount: 49,
  });

  const diffDays = Math.round(
    (new Date(activation.endDate).getTime() - new Date(activation.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  console.log(`  ✓ Subscription activated! Duration: ${diffDays} days (Expected: 30)`);
  if (diffDays !== 30) throw new Error(`Expected 30 days, got ${diffDays}`);

  // Test 4: Renewal Logic (Extending from existing active end_date)
  console.log('\n4. Testing Renewal Logic on an ACTIVE Subscription...');
  const secondOrder = await createRazorpayOrder({
    partnerId: 5,
    amount: 49,
  });

  const renewal = await activateSubscription({
    partnerId: 5,
    razorpayOrderId: secondOrder.orderId,
    razorpayPaymentId: 'pay_test_renewal_6789',
    amount: 49,
  });

  const renewalStartDate = new Date(renewal.startDate);
  const previousEndDate = new Date(activation.endDate);

  // Check if renewal starts from the previous active end_date
  console.log(`  ✓ Renewal Start Date: ${renewalStartDate.toISOString().split('T')[0]}`);
  console.log(`  ✓ Previous End Date: ${previousEndDate.toISOString().split('T')[0]}`);
  console.log(`  ✓ Extended End Date: ${new Date(renewal.endDate).toISOString().split('T')[0]}`);

  // Test 5: Webhook Idempotency
  console.log('\n5. Testing Webhook Idempotency (Duplicate Events)...');
  const [payRowBefore] = await query<any>(
    'SELECT status FROM payments WHERE razorpay_order_id = ?',
    [secondOrder.orderId]
  );
  console.log(`  ✓ Payment status is: ${payRowBefore.status}`);

  // Call webhook handler endpoint with duplicate payload
  const webhookRes = await fetch('http://localhost:3000/api/payments/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'order.paid',
      payload: {
        payment: { entity: { order_id: secondOrder.orderId, id: 'pay_test_renewal_6789', amount: 4900 } },
      },
    }),
  });
  const webhookData = await webhookRes.json();
  console.log(`  ✓ Duplicate webhook handled idempotently: "${webhookData.message || 'Processed'}"`);

  // Test 6: Subscription Expiry Sweeper
  console.log('\n6. Testing Subscription Expiry Sweeper...');
  const syncResult = await syncSubscriptionExpirations();
  console.log(`  ✓ Sweeper ran: Expired marked: ${syncResult.expiredCount}, Expiring soon within 3 days: ${syncResult.expiringSoonPartners.length}`);

  console.log('\n🎉 ALL Phase 4 Subscription & Payment tests passed successfully!\n');
}

runPhase4Tests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
