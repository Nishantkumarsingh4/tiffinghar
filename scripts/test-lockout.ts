async function testLockout() {
  const url = 'http://localhost:3000/api/auth/login';
  const email = `lockout_${Date.now()}@example.com`;

  // Register test user
  await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'CUSTOMER',
      email,
      password: 'correctpassword',
      phone: '+91 99999 88888',
      fullName: 'Lockout Test User',
    }),
  });

  console.log('Testing 5 consecutive incorrect password attempts on:', email);
  for (let i = 1; i <= 5; i++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'wrongpassword' }),
    });
    const data = await res.json();
    console.log(`Attempt ${i} -> HTTP ${res.status}: ${data.error}`);
  }
}

testLockout();
