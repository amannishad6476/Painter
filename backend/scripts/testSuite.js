import http from 'http';
import app from '../server.js';
import { generateAdminToken } from '../utils/auth.js';
import { query } from '../config/db.js';

const PORT = 5599;

function makeRequest({ method = 'GET', path, headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path,
        method,
        headers
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(rawData);
          } catch (e) {}
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: rawData,
            json
          });
        });
      }
    );

    req.on('error', reject);

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

function createMultipartBody(fieldName, filename, mimeType, buffer) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const crlf = '\r\n';

  let header = `--${boundary}${crlf}`;
  header += `Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"${crlf}`;
  header += `Content-Type: ${mimeType}${crlf}${crlf}`;

  const footer = `${crlf}--${boundary}--${crlf}`;

  const fullBuffer = Buffer.concat([
    Buffer.from(header, 'utf8'),
    buffer,
    Buffer.from(footer, 'utf8')
  ]);

  return {
    contentType: `multipart/form-data; boundary=${boundary}`,
    body: fullBuffer
  };
}

async function runTests() {
  console.log('🧪 Starting Munnalal Painter Backend Verification Test Suite...\n');

  const server = app.listen(PORT);
  await new Promise((resolve) => server.once('listening', resolve));
  console.log(`Server listening on port ${PORT} for tests`);

  let passed = 0;
  let failed = 0;

  const assert = (condition, title) => {
    if (condition) {
      console.log(`  ✓ PASS: ${title}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${title}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    console.log('\n--- 1. Health Check & Diagnostics ---');
    const health = await makeRequest({ path: '/api/health' });
    assert(health.statusCode === 200 && health.json?.status === 'ok', 'GET /api/health responds with ok');

    // 2. Fetch all CMS data & verify gallery preservation
    console.log('\n--- 2. CMS All Data & Gallery Preservation ---');
    const allData = await makeRequest({ path: '/api/cms/all' });
    assert(allData.statusCode === 200, 'GET /api/cms/all status 200');
    assert(allData.json?.success === true, 'GET /api/cms/all success true');
    assert(Array.isArray(allData.json?.gallery), 'Gallery is an array');
    assert(allData.json?.gallery.length >= 8, `All 8 default gallery items preserved (found ${allData.json?.gallery.length})`);
    const hasG1 = allData.json?.gallery.some((g) => g.id === 'g1');
    const hasG8 = allData.json?.gallery.some((g) => g.id === 'g8');
    assert(hasG1 && hasG8, 'Found items g1 and g8 in gallery');

    // 3. Admin Auth Protection on /upload
    console.log('\n--- 3. Admin Auth Protection on /api/cms/upload ---');
    const unauthUpload = await makeRequest({
      method: 'POST',
      path: '/api/cms/upload',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 1 })
    });
    assert(unauthUpload.statusCode === 401, 'POST /api/cms/upload without token returns HTTP 401 Unauthorized');
    assert(unauthUpload.json?.error?.includes('Unauthorized'), 'Error message states admin authentication required');

    const tamperedUpload = await makeRequest({
      method: 'POST',
      path: '/api/cms/upload',
      headers: {
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.signature',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: 1 })
    });
    assert(tamperedUpload.statusCode === 401, 'POST /api/cms/upload with tampered token returns HTTP 401');

    // 4. Admin Login Endpoint
    console.log('\n--- 4. Admin Login Endpoint ---');
    const badLogin = await makeRequest({
      method: 'POST',
      path: '/api/cms/auth/login',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'WrongPassword123!' })
    });
    assert(badLogin.statusCode === 401, 'POST /api/cms/auth/login with bad password returns HTTP 401');

    const goodLogin = await makeRequest({
      method: 'POST',
      path: '/api/cms/auth/login',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'Aman#2255' })
    });
    assert(goodLogin.statusCode === 200, 'POST /api/cms/auth/login with valid password returns HTTP 200');
    assert(typeof goodLogin.json?.token === 'string' && goodLogin.json?.token.length > 50, 'Admin JWT token successfully issued');
    const adminToken = goodLogin.json.token;

    // 5. Authenticated Admin Upload
    console.log('\n--- 5. Authenticated Admin Upload ---');
    // Create a 1x1 test PNG buffer
    const testPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    const { contentType: adminCt, body: adminBody } = createMultipartBody(
      'file',
      'test_admin_image.png',
      'image/png',
      testPng
    );

    const authUpload = await makeRequest({
      method: 'POST',
      path: '/api/cms/upload',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': adminCt,
        'Content-Length': adminBody.length
      },
      body: adminBody
    });

    assert(authUpload.statusCode === 200, 'Authenticated POST /api/cms/upload returns HTTP 200');
    assert(authUpload.json?.success === true, 'Upload response success is true');
    assert(Boolean(authUpload.json?.url), `Upload returned media URL: ${authUpload.json?.url}`);
    const uploadedMediaId = authUpload.json?.id;

    // Verify in database: zero Base64 stored!
    const dbCheck = await query(`SELECT * FROM media_files WHERE id = $1`, [uploadedMediaId]);
    const storedRow = dbCheck.rows[0];
    assert(Boolean(storedRow), 'Record successfully stored in media_files table');
    assert(Boolean(storedRow.url), 'media_files.url is populated');
    assert(storedRow.data === null || storedRow.data === undefined, 'CRITICAL: media_files.data is NULL (ZERO Base64 stored in database!)');

    // 6. Public Customer Review Photo Upload
    console.log('\n--- 6. Public Customer Review Photo Upload ---');
    const { contentType: revCt, body: revBody } = createMultipartBody(
      'file',
      'review_avatar.jpg',
      'image/jpeg',
      testPng
    );

    // Should succeed without admin token
    const revUpload = await makeRequest({
      method: 'POST',
      path: '/api/cms/review-upload',
      headers: {
        'Content-Type': revCt,
        'Content-Length': revBody.length
      },
      body: revBody
    });

    assert(revUpload.statusCode === 200, 'Public POST /api/cms/review-upload succeeds without admin auth');
    assert(revUpload.json?.success === true, 'Review upload response success is true');
    assert(Boolean(revUpload.json?.url), `Review upload URL: ${revUpload.json?.url}`);

    // Reject non-image on review upload
    const { contentType: badRevCt, body: badRevBody } = createMultipartBody(
      'file',
      'test_video.mp4',
      'video/mp4',
      Buffer.from('fake-video-bytes')
    );
    const badRevUpload = await makeRequest({
      method: 'POST',
      path: '/api/cms/review-upload',
      headers: {
        'Content-Type': badRevCt,
        'Content-Length': badRevBody.length
      },
      body: badRevBody
    });
    assert(badRevUpload.statusCode === 400, 'Review upload rejects non-image (video/mp4) with HTTP 400');

    // Reject > 1MB on review upload
    const largeBuffer = Buffer.alloc(1.2 * 1024 * 1024, 0);
    const { contentType: largeRevCt, body: largeRevBody } = createMultipartBody(
      'file',
      'large_image.jpg',
      'image/jpeg',
      largeBuffer
    );
    const largeRevUpload = await makeRequest({
      method: 'POST',
      path: '/api/cms/review-upload',
      headers: {
        'Content-Type': largeRevCt,
        'Content-Length': largeRevBody.length
      },
      body: largeRevBody
    });
    assert(largeRevUpload.statusCode === 400, 'Review upload rejects > 1MB image with HTTP 400');

    // 7. Media Serving & Redirection
    console.log('\n--- 7. Media Serving Endpoint /api/cms/media/:id ---');
    const serveMedia = await makeRequest({
      path: `/api/cms/media/${uploadedMediaId}`
    });
    assert(
      serveMedia.statusCode === 200 || serveMedia.statusCode === 302,
      `GET /api/cms/media/:id serves or redirects with code ${serveMedia.statusCode}`
    );

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
  }

  console.log('\n====================================================');
  console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
