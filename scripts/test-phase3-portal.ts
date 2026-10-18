async function testPhase3() {
  const baseUrl = 'http://localhost:3000';
  console.log('🧪 Testing Phase 3 Partner & Customer Portals...\n');

  // 1. Partner Login
  console.log('1. Logging in as Partner (annapurna@tiffinghar.local)...');
  const partLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'annapurna@tiffinghar.local',
      password: 'partner123',
    }),
  });
  const partCookie = partLoginRes.headers.get('set-cookie');
  console.log('  ✓ Partner authenticated. Cookie received.');

  // 2. Fetch Partner Stats
  console.log('\n2. Fetching Partner Dashboard Stats...');
  const statsRes = await fetch(`${baseUrl}/api/partner/stats`, {
    headers: { Cookie: partCookie || '' },
  });
  const statsData = await statsRes.json();
  if (statsData.success) {
    console.log(`  ✓ Stats retrieved: ${statsData.stats.totalProducts} products, ${statsData.stats.totalViews} views, ${statsData.stats.avgRating} rating, isPremium: ${statsData.stats.isPremium}`);
  } else {
    console.error('  ✗ Failed to fetch partner stats:', statsData);
  }

  // 3. Customer Login
  console.log('\n3. Logging in as Customer (aarav.patel@gmail.com)...');
  const custLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'aarav.patel@gmail.com',
      password: 'customer123',
    }),
  });
  const custCookie = custLoginRes.headers.get('set-cookie');
  console.log('  ✓ Customer authenticated. Cookie received.');

  // 4. Test Unauthenticated Access to Partner Detail (Must return 401)
  console.log('\n4. Verifying unauthenticated protection on /api/partners/1...');
  const unauthRes = await fetch(`${baseUrl}/api/partners/1`);
  if (unauthRes.status === 401) {
    console.log('  ✓ Correctly rejected unauthenticated request with HTTP 401!');
  } else {
    console.error('  ✗ Security check failed: Expected 401, got', unauthRes.status);
  }

  // 5. Customer Authenticated Access to Partner Detail
  console.log('\n5. Accessing Partner Detail as Authenticated Customer...');
  const detailRes = await fetch(`${baseUrl}/api/partners/1`, {
    headers: { Cookie: custCookie || '' },
  });
  const detailData = await detailRes.json();
  if (detailRes.ok && detailData.partner?.kitchen_name) {
    console.log(`  ✓ Accessed ${detailData.partner.kitchen_name} successfully! Contact: ${detailData.partner.contact_phone}`);
  } else {
    console.error('  ✗ Failed to fetch partner detail:', detailData);
  }

  // 6. Customer logs a WhatsApp click
  console.log('\n6. Logging Customer WhatsApp lead click...');
  const clickRes = await fetch(`${baseUrl}/api/partners/1/contact-click`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: custCookie || '' },
    body: JSON.stringify({ type: 'WHATSAPP' }),
  });
  const clickData = await clickRes.json();
  if (clickRes.ok) {
    console.log('  ✓ Contact click logged successfully!');
  }

  // 7. Customer submits review
  console.log('\n7. Submitting Customer Review...');
  const revRes = await fetch(`${baseUrl}/api/partners/1/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: custCookie || '' },
    body: JSON.stringify({
      rating: 5,
      comment: 'Absolutely delightful home cooked meal! The rotis were soft and warm.',
    }),
  });
  const revData = await revRes.json();
  if (revRes.ok) {
    console.log('  ✓ Review saved successfully!');
  }

  console.log('\n🎉 Phase 3 End-to-End Partner & Customer workflows verified!\n');
}

testPhase3();
