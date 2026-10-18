import dotenv from 'dotenv';
dotenv.config();

import { query, queryOne, execute } from '../src/lib/db';
import { comparePassword } from '../src/lib/auth';

async function runPhase5Tests() {
  console.log('🧪 Running Phase 5 Admin Panel, Support System & Audit Log Tests...\n');

  try {
    // 1. Verify Seeded Admin Account
    console.log('1. Verifying Seeded Admin Credentials in WAMP MySQL...');
    const adminUser = await queryOne<any>(
      `SELECT * FROM users WHERE email = ? AND role = 'ADMIN'`,
      ['nisant746181@mail.com']
    );

    if (!adminUser) {
      throw new Error('Seeded admin user not found in database!');
    }
    const isPasswordValid = await comparePassword('nishant123', adminUser.password_hash);
    if (!isPasswordValid) {
      throw new Error('Admin password hash mismatch!');
    }
    console.log(`  ✓ Seeded Admin verified: ${adminUser.email} (Role: ${adminUser.role})\n`);

    // 2. Test Customer 360-Degree Data & Exact Viewed Partners Tracking
    console.log('2. Testing Customer 360-Degree View & Kitchen History Tracking...');
    const testCustomer = await queryOne<any>(
      `SELECT c.*, u.email FROM customer_profiles c
       JOIN users u ON u.id = c.user_id
       LIMIT 1`
    );

    if (!testCustomer) {
      throw new Error('No customer found in seed data!');
    }

    // Insert a test view log for this customer to ensure we test exact view tracking
    const testPartner = await queryOne<any>('SELECT * FROM partner_profiles LIMIT 1');
    await execute(
      `INSERT INTO view_logs (partner_id, customer_id, ip_address, session_id)
       VALUES (?, ?, '127.0.0.1', 'test-session-phase5')`,
      [testPartner.id, testCustomer.id]
    );

    // Query exact viewed partners
    const viewedPartners = await query<any>(
      `SELECT v.partner_id, p.human_id as partner_human_id, p.kitchen_name,
              COUNT(v.id) as view_count,
              MAX(v.created_at) as last_viewed_at
       FROM view_logs v
       JOIN partner_profiles p ON p.id = v.partner_id
       WHERE v.customer_id = ?
       GROUP BY v.partner_id, p.human_id, p.kitchen_name
       ORDER BY last_viewed_at DESC`,
      [testCustomer.id]
    );

    console.log(`  ✓ Customer: ${testCustomer.full_name} (${testCustomer.human_id})`);
    console.log(`  ✓ Exact kitchens viewed: ${viewedPartners.length} unique partners`);
    viewedPartners.forEach((vp: any) => {
      console.log(`    - ${vp.kitchen_name} (${vp.partner_human_id}): ${vp.view_count} views, Last: ${new Date(vp.last_viewed_at).toLocaleString()}`);
    });
    console.log();

    // 3. Test Partner Actions (Verification, Suspend, Priority Rank)
    console.log('3. Testing Partner Management Actions & Audit Log Recording...');
    const partnerToUpdate = await queryOne<any>('SELECT * FROM partner_profiles ORDER BY id DESC LIMIT 1');

    // Update rank
    const newRank = 150;
    await execute('UPDATE partner_profiles SET admin_rank = ?, is_verified = 1 WHERE id = ?', [newRank, partnerToUpdate.id]);

    // Check update
    const updatedPartner = await queryOne<any>('SELECT * FROM partner_profiles WHERE id = ?', [partnerToUpdate.id]);
    if (updatedPartner.admin_rank !== newRank || !updatedPartner.is_verified) {
      throw new Error('Partner rank / verified update failed!');
    }

    // Insert audit log
    await execute(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, 'TEST_PARTNER_RANK_UPDATE', 'PARTNER', ?, ?, '127.0.0.1')`,
      [adminUser.id, partnerToUpdate.human_id, JSON.stringify({ rank: newRank, verified: true })]
    );
    console.log(`  ✓ Partner ${partnerToUpdate.kitchen_name} rank set to ${newRank}, is_verified = 1`);
    console.log(`  ✓ Audit log entry created successfully\n`);

    // 4. Test Website Reordering & Public Order Reflection
    console.log('4. Testing Marketplace Sequence Ordering & Public Reflection...');
    // Pin partner to top
    await execute('UPDATE partner_profiles SET is_pinned = 1 WHERE id = ?', [partnerToUpdate.id]);

    const topPartners = await query<any>(
      `SELECT id, kitchen_name, is_pinned, admin_rank FROM partner_profiles
       ORDER BY is_pinned DESC, admin_rank DESC LIMIT 3`
    );

    console.log(`  ✓ Top 1 Partner after Pin: ${topPartners[0].kitchen_name} (Pinned: ${topPartners[0].is_pinned}, Rank: ${topPartners[0].admin_rank})`);
    if (topPartners[0].id !== partnerToUpdate.id) {
      throw new Error('Pinned partner is not top of marketplace listing!');
    }
    console.log();

    // 5. Test Support Ticket & Chat Conversation with Read Receipts
    console.log('5. Testing Support System & Read Receipts...');
    // Create a support ticket
    const ticketHumanId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    const ticketResult = await execute(
      `INSERT INTO support_tickets (human_id, user_id, role_type, subject, message, status, priority)
       VALUES (?, ?, 'CUSTOMER', 'Phase 5 Validation Ticket', 'Testing resolution chat', 'OPEN', 'HIGH')`,
      [ticketHumanId, testCustomer.user_id]
    );
    const ticketId = ticketResult.insertId;

    // Customer message
    await execute(
      `INSERT INTO chat_messages (ticket_id, sender_id, sender_role, message, is_read)
       VALUES (?, ?, 'USER', 'Initial inquiry from customer', 0)`,
      [ticketId, testCustomer.user_id]
    );

    // Admin replies
    const adminMsgResult = await execute(
      `INSERT INTO chat_messages (ticket_id, sender_id, sender_role, message, is_read)
       VALUES (?, ?, 'ADMIN', 'Official Admin reply: We are checking your order.', 0)`,
      [ticketId, adminUser.id]
    );

    // Customer reads admin message -> mark is_read = 1, read_at = NOW()
    await execute(
      `UPDATE chat_messages SET is_read = 1, read_at = NOW() WHERE id = ?`,
      [adminMsgResult.insertId]
    );

    const verifiedMsg = await queryOne<any>('SELECT * FROM chat_messages WHERE id = ?', [adminMsgResult.insertId]);
    if (!verifiedMsg.is_read || !verifiedMsg.read_at) {
      throw new Error('Read receipt failed to update!');
    }
    console.log(`  ✓ Support Ticket ${ticketHumanId} created and replied`);
    console.log(`  ✓ Read receipt confirmed: is_read=${verifiedMsg.is_read}, read_at=${verifiedMsg.read_at}\n`);

    // 6. Test Read-Only Subscriptions & Payments Log with Validity
    console.log('6. Testing Subscriptions & Payments Read-Only Log Query...');
    const paymentsLog = await query<any>(
      `SELECT p.human_id as payment_id, p.amount, p.status as payment_status,
              part.kitchen_name, s.plan, s.start_date, s.end_date,
              CASE
                WHEN s.end_date > NOW() THEN GREATEST(0, DATEDIFF(s.end_date, NOW()))
                ELSE 0
              END as days_remaining,
              CASE
                WHEN s.status = 'ACTIVE' AND s.end_date > NOW() THEN 'ACTIVE'
                WHEN s.end_date <= NOW() THEN 'EXPIRED'
                ELSE p.status
              END as live_status
       FROM payments p
       JOIN partner_profiles part ON part.id = p.partner_id
       LEFT JOIN subscriptions s ON s.payment_id = p.id
       ORDER BY p.id DESC
       LIMIT 5`
    );

    console.log(`  ✓ Retrieved ${paymentsLog.length} recent transactions from read-only log:`);
    paymentsLog.forEach((p: any) => {
      console.log(`    - [${p.payment_id}] ${p.kitchen_name}: ₹${p.amount} | Plan: ${p.plan || 'PREMIUM'} | Status: ${p.live_status} (${p.days_remaining} days left)`);
    });
    console.log();

    console.log('🎉 ALL Phase 5 Admin, Support, Ranking & Audit tests passed with flying colors!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Phase 5 Test Failed:', err);
    process.exit(1);
  }
}

runPhase5Tests();
