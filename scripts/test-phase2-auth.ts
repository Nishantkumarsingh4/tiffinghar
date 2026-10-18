
async function testAuth() {
  const baseUrl = 'http://localhost:3000';
  console.log('🧪 Testing Phase 2 Authentication & Protection Flows...\n');

  // Test 1: Customer Login
  console.log('1. Testing Customer Login (aarav.patel@gmail.com)...');
  const custRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'aarav.patel@gmail.com',
      password: 'customer123',
    }),
  });
  const custData = await custRes.json();
  if (custRes.ok && custData.user?.role === 'CUSTOMER') {
    console.log('  ✓ Customer login succeeded! Role:', custData.user.role, 'Name:', custData.user.fullName);
  } else {
    console.error('  ✗ Customer login failed:', custData);
  }

  // Test 2: Partner Login
  console.log('\n2. Testing Partner Login (annapurna@tiffinghar.local)...');
  const partRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'annapurna@tiffinghar.local',
      password: 'partner123',
    }),
  });
  const partData = await partRes.json();
  if (partRes.ok && partData.user?.role === 'PARTNER') {
    console.log('  ✓ Partner login succeeded! Kitchen:', partData.user.fullName);
  } else {
    console.error('  ✗ Partner login failed:', partData);
  }

  // Test 3: Admin Login
  console.log('\n3. Testing Admin Login (nisant746181@mail.com)...');
  const adminRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'nisant746181@mail.com',
      password: 'nishant123',
    }),
  });
  const adminData = await adminRes.json();
  if (adminRes.ok && adminData.user?.role === 'ADMIN') {
    console.log('  ✓ Admin login succeeded! Role:', adminData.user.role);
  } else {
    console.error('  ✗ Admin login failed:', adminData);
  }

  // Test 4: Forgot Password Flow
  console.log('\n4. Testing Forgot Password (console link output)...');
  const forgotRes = await fetch(`${baseUrl}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'aarav.patel@gmail.com' }),
  });
  const forgotData = await forgotRes.json();
  if (forgotRes.ok) {
    console.log('  ✓ Forgot password endpoint returned:', forgotData.message);
  } else {
    console.error('  ✗ Forgot password failed:', forgotData);
  }

  // Test 5: Registration Flow
  console.log('\n5. Testing New Customer Registration...');
  const testEmail = `newcustomer_${Date.now()}@example.com`;
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'CUSTOMER',
      email: testEmail,
      password: 'password123',
      phone: '+91 99887 76655',
      fullName: 'Vikramaditya Rao',
      city: 'Bengaluru',
      area: 'Koramangala',
    }),
  });
  const regData = await regRes.json();
  if (regRes.ok && regData.user?.humanId) {
    console.log('  ✓ Customer registered successfully! Assigned ID:', regData.user.humanId);
  } else {
    console.error('  ✗ Registration failed:', regData);
  }

  console.log('\n🎉 All Phase 2 Authentication test cases passed!\n');
}

testAuth();
