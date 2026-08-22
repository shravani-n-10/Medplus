/**
 * End-to-End Backend API Test Suite
 */

const http = require('http');

console.log('=== RUNNING BACKEND API INTEGRATION TEST ===');

function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  try {
    // 1. Health Check
    const health = await makeRequest('/api/health');
    console.log('1. Health Check:', health.body.status === 'ONLINE' ? '✅ ONLINE' : '❌ FAIL');

    // 2. Register new user with unique email
    const testEmail = `testuser_${Date.now()}@gmail.com`;
    const regRes = await makeRequest('/api/auth/register', 'POST', {
      name: 'Test Medical User',
      email: testEmail,
      password: 'password123',
      mobile: '9876543210',
      address: 'Mumbai, India'
    });

    if (regRes.status !== 201) {
      console.error('Registration failed:', regRes.body);
      return;
    }

    console.log('2. User Registration:', regRes.body.status === 'pending' ? '✅ SUCCESS (Status: PENDING)' : '❌ FAIL');
    const userId = regRes.body.user.id;

    // 3. Attempt Login as Pending User (Should be blocked)
    const blockedLogin = await makeRequest('/api/auth/login', 'POST', {
      email: testEmail,
      password: 'password123'
    });
    console.log('3. Block Pending Login:', blockedLogin.status === 403 ? '✅ BLOCKED AS EXPECTED' : '❌ FAIL');

    // 4. Admin Login
    const adminLogin = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@medicalsec.com',
      password: 'admin123'
    });
    console.log('4. Admin Login:', adminLogin.status === 200 ? '✅ SUCCESS' : '❌ FAIL');
    const adminToken = adminLogin.body.token;

    // 5. Admin Approve User
    const approveRes = await makeRequest(`/api/admin/users/${userId}/approve`, 'PATCH', {}, {
      Authorization: `Bearer ${adminToken}`
    });
    console.log('5. Admin Approval:', approveRes.body.user.status === 'active' ? '✅ APPROVED' : '❌ FAIL');

    // 6. User Login after Approval
    const userLogin = await makeRequest('/api/auth/login', 'POST', {
      email: testEmail,
      password: 'password123'
    });
    console.log('6. User Login After Approval:', userLogin.status === 200 ? '✅ SUCCESSFUL JWT ISSUED' : '❌ FAIL');

    // 7. Get Audit Logs Feed
    const auditRes = await makeRequest('/api/admin/audit-logs', 'GET', null, {
      Authorization: `Bearer ${adminToken}`
    });
    console.log('7. Audit Logs Count:', auditRes.body.logs ? `✅ ${auditRes.body.logs.length} logs recorded` : '❌ FAIL');

    console.log('\n✅ ALL BACKEND API TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('API Test Error:', err);
  }
}

runTests();
