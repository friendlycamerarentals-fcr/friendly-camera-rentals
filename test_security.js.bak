const http = require('http');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(url, method, data = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (cookie) {
      options.headers['Cookie'] = cookie;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: JSON.parse(body),
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body,
          });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log("Starting Security API tests...");

  try {
    // 1. Try to fetch customers without authentication
    console.log("\n1. Fetching customers without authentication...");
    const res1 = await makeRequest(`${BASE_URL}/api/customers`, 'GET');
    console.log("Status:", res1.status);
    console.log("Response:", res1.data);
    if (res1.status === 401) {
      console.log("✅ Correctly blocked (401 Unauthorized)!");
    } else {
      console.log("❌ Failed to block unauthorized request.");
    }

    // 2. Try to fetch service bookings without authentication
    console.log("\n2. Fetching service bookings without authentication...");
    const res2 = await makeRequest(`${BASE_URL}/api/services`, 'GET');
    console.log("Status:", res2.status);
    console.log("Response:", res2.data);
    if (res2.status === 401) {
      console.log("✅ Correctly blocked (401 Unauthorized)!");
    } else {
      console.log("❌ Failed to block unauthorized request.");
    }

    // 3. Log in as Admin to get a valid signed token
    console.log("\n3. Logging in as Admin...");
    const loginRes = await makeRequest(`${BASE_URL}/api/admin/login`, 'POST', {
      email: "admin@fcr.in",
      password: "admin@fcr123"
    });
    console.log("Status:", loginRes.status);
    console.log("Response:", loginRes.data);

    let cookie = null;
    const cookieHeader = loginRes.headers['set-cookie'];
    if (cookieHeader && cookieHeader.length > 0) {
      // Extract admin_auth cookie
      cookie = cookieHeader[0].split(';')[0];
      console.log("Extracted Cookie:", cookie);
    }

    if (cookie) {
      // 4. Try to fetch customers WITH a valid token cookie
      console.log("\n4. Fetching customers WITH valid admin JWT cookie...");
      const res3 = await makeRequest(`${BASE_URL}/api/customers`, 'GET', null, cookie);
      console.log("Status:", res3.status);
      console.log("Success:", res3.data.success);
      if (res3.status === 200 && res3.data.success) {
        console.log("✅ Access granted (200 OK) with valid signed JWT token!");
      } else {
        console.log("❌ Failed to access page with valid token.");
      }
    } else {
      console.log("❌ Login did not return set-cookie header.");
    }

    console.log("\nAll security tests completed.");
  } catch (err) {
    console.error("Test execution failed:", err);
  }
}

// Wait for dev server to start
setTimeout(runTests, 4000);
