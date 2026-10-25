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

    // 8. Festival Offers & Popup Management
    console.log('\n--- 8. Festival Offers & Popup Management ---');
    
    // 8.1 Public Active Festival Offer when none active
    const initActiveOffer = await makeRequest({ path: '/api/cms/festival-offers/active' });
    assert(initActiveOffer.statusCode === 200, 'GET /api/cms/festival-offers/active status 200');
    assert(initActiveOffer.json?.success === true, 'GET /api/cms/festival-offers/active success true');

    // 8.2 Auth Protection on Festival Admin Endpoints
    const unauthGet = await makeRequest({ path: '/api/cms/festival-offers' });
    assert(unauthGet.statusCode === 401, 'GET /api/cms/festival-offers without token returns 401 Unauthorized');

    const unauthPost = await makeRequest({
      method: 'POST',
      path: '/api/cms/festival-offers',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ festivalName: 'Hacking Festival' })
    });
    assert(unauthPost.statusCode === 401, 'POST /api/cms/festival-offers without token returns 401');

    const unauthPut = await makeRequest({
      method: 'PUT',
      path: '/api/cms/festival-offers/fake_id',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ festivalName: 'Hacking Festival' })
    });
    assert(unauthPut.statusCode === 401, 'PUT /api/cms/festival-offers/:id without token returns 401');

    const unauthToggle = await makeRequest({
      method: 'PATCH',
      path: '/api/cms/festival-offers/fake_id/toggle'
    });
    assert(unauthToggle.statusCode === 401, 'PATCH /api/cms/festival-offers/:id/toggle without token returns 401');

    const unauthDelete = await makeRequest({
      method: 'DELETE',
      path: '/api/cms/festival-offers/fake_id'
    });
    assert(unauthDelete.statusCode === 401, 'DELETE /api/cms/festival-offers/:id without token returns 401');

    // 8.3 Input Validation (Invalid theme & Invalid date range)
    const invalidThemeRes = await makeRequest({
      method: 'POST',
      path: '/api/cms/festival-offers',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        festivalName: 'Invalid Theme Test',
        heading: 'Test Heading',
        theme: 'not_a_valid_theme',
        startDate: '2026-10-25T10:00:00+05:30',
        endDate: '2026-10-30T10:00:00+05:30'
      })
    });
    assert(invalidThemeRes.statusCode === 400, 'POST /api/cms/festival-offers rejects invalid theme with 400');

    const invalidDateRes = await makeRequest({
      method: 'POST',
      path: '/api/cms/festival-offers',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        festivalName: 'Invalid Date Test',
        heading: 'Test Heading',
        theme: 'diwali',
        startDate: '2026-10-30T10:00:00+05:30',
        endDate: '2026-10-20T10:00:00+05:30'
      })
    });
    assert(invalidDateRes.statusCode === 400, 'POST /api/cms/festival-offers rejects end date before start date with 400');

    // 8.4 Create Valid Active Campaign (Start: -1 hour, End: +24 hours)
    const nowEpoch = Date.now();
    const liveStart = new Date(nowEpoch - 60 * 60 * 1000).toISOString();
    const liveEnd = new Date(nowEpoch + 24 * 60 * 60 * 1000).toISOString();

    const createLiveRes = await makeRequest({
      method: 'POST',
      path: '/api/cms/festival-offers',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        festivalName: 'Diwali Shubh Labh Dhamaka 2026',
        theme: 'diwali',
        heading: 'Flat 20% Off on Interior & Exterior Painting',
        description: 'Celebrate Diwali with royal finishes and dust-free machine sanding in Lucknow.',
        offerDetails: ['Free Dampness Inspection', 'Asian Paints Royale Emulsion', '3-Year Warranty'],
        ctaText: 'Claim Festive Offer on WhatsApp',
        ctaType: 'whatsapp',
        startDate: liveStart,
        endDate: liveEnd,
        isEnabled: true,
        cooldownHours: 24
      })
    });
    assert(createLiveRes.statusCode === 200, 'Admin creates live festival offer with HTTP 200');
    assert(createLiveRes.json?.success === true, 'Create offer returns success: true');
    const createdOfferId = createLiveRes.json?.data?.id;
    assert(Boolean(createdOfferId), `Created offer ID: ${createdOfferId}`);

    // 8.5 Public Active Retrieval
    const activeCheck = await makeRequest({ path: '/api/cms/festival-offers/active' });
    assert(activeCheck.statusCode === 200, 'Public GET active festival offer status 200');
    assert(activeCheck.json?.activeOffer?.id === createdOfferId, 'Public active offer matches live campaign ID');
    assert(activeCheck.json?.activeOffer?.theme === 'diwali', 'Public active offer theme is diwali');

    // 8.6 Scheduling: Expired and Future Offers
    const expiredStart = new Date(nowEpoch - 48 * 60 * 60 * 1000).toISOString();
    const expiredEnd = new Date(nowEpoch - 24 * 60 * 60 * 1000).toISOString();
    const createExpiredRes = await makeRequest({
      method: 'POST',
      path: '/api/cms/festival-offers',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        festivalName: 'Past Expired Campaign',
        theme: 'holi',
        heading: 'Old Expired Holi Offer',
        startDate: expiredStart,
        endDate: expiredEnd,
        isEnabled: true
      })
    });
    assert(createExpiredRes.statusCode === 200, 'Admin creates past expired offer with HTTP 200');

    const activeAfterExpired = await makeRequest({ path: '/api/cms/festival-offers/active' });
    assert(activeAfterExpired.json?.activeOffer?.id === createdOfferId, 'Expired campaign does not displace active campaign');

    // 8.7 Toggle Enabled / Disabled
    const toggleOff = await makeRequest({
      method: 'PATCH',
      path: `/api/cms/festival-offers/${createdOfferId}/toggle`,
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(toggleOff.statusCode === 200, 'Admin toggles offer status with HTTP 200');
    assert(toggleOff.json?.data?.isEnabled === false, 'Toggled offer isEnabled is now false');

    const activeWhenDisabled = await makeRequest({ path: '/api/cms/festival-offers/active' });
    assert(activeWhenDisabled.json?.activeOffer === null, 'Disabled campaign does not display in public active offer');

    const toggleOn = await makeRequest({
      method: 'PATCH',
      path: `/api/cms/festival-offers/${createdOfferId}/toggle`,
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(toggleOn.json?.data?.isEnabled === true, 'Toggled offer back to isEnabled: true');

    // 8.8 Edit / Update Offer
    const editRes = await makeRequest({
      method: 'PUT',
      path: `/api/cms/festival-offers/${createdOfferId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        festivalName: 'Diwali Maha Dhamaka 2026',
        theme: 'diwali',
        heading: 'Updated 25% Off on Full Painting',
        description: 'Updated description',
        startDate: liveStart,
        endDate: liveEnd,
        isEnabled: true
      })
    });
    assert(editRes.statusCode === 200, 'Admin updates festival offer with HTTP 200');
    assert(editRes.json?.data?.heading === 'Updated 25% Off on Full Painting', 'Offer heading updated successfully');

    // 8.9 Admin List Offers
    const listRes = await makeRequest({
      path: '/api/cms/festival-offers',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(listRes.statusCode === 200, 'GET /api/cms/festival-offers status 200');
    assert(Array.isArray(listRes.json?.offers), 'Admin list returns offers array');
    assert(listRes.json?.offers?.length >= 2, `Admin offers list contains ${listRes.json?.offers?.length} offers`);

    // 8.10 Delete Offers
    const deleteRes = await makeRequest({
      method: 'DELETE',
      path: `/api/cms/festival-offers/${createdOfferId}`,
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(deleteRes.statusCode === 200, 'DELETE /api/cms/festival-offers/:id returns 200');

    if (createExpiredRes.json?.data?.id) {
      await makeRequest({
        method: 'DELETE',
        path: `/api/cms/festival-offers/${createExpiredRes.json?.data?.id}`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
    }

    const activeAfterDelete = await makeRequest({ path: '/api/cms/festival-offers/active' });
    assert(activeAfterDelete.json?.activeOffer === null, 'Active offer is null after deletion of campaign');

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
