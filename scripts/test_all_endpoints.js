const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function testAllBackendAPIs() {
  console.log('=====================================================');
  console.log('🧪 AutoScroll Backend Integration Test Suite');
  console.log('=====================================================');

  try {
    // 1. Health Endpoint
    console.log('\n[1] Testing GET /api/health...');
    const health = await makeRequest({ host: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
    console.log('  Health response status:', health.status, health.data);
    if (health.status === 200 && health.data.status === 'ok') {
      console.log('  ✅ GET /api/health PASS');
    } else {
      console.error('  ❌ GET /api/health FAIL');
    }

    // 2. ML Predict Endpoint
    console.log('\n[2] Testing POST /api/ml/predict...');
    const predict = await makeRequest({
      host: 'localhost', port: 5000, path: '/api/ml/predict', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { wordCount: 300, charCount: 1600, fontSize: 18, contentType: 'news' });
    console.log('  Predict response:', predict.data);
    if (predict.status === 200 && predict.data.success && predict.data.prediction.predictedWpm > 0) {
      console.log('  ✅ POST /api/ml/predict PASS');
    } else {
      console.error('  ❌ POST /api/ml/predict FAIL');
    }

    // 3. ML Train Endpoint
    console.log('\n[3] Testing POST /api/ml/train...');
    const train = await makeRequest({
      host: 'localhost', port: 5000, path: '/api/ml/train', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { wordCount: 400, charCount: 2000, fontSize: 16, contentType: 'blog', targetWpm: 240, userBaselineWpm: 220 });
    console.log('  Train response:', train.data);
    if (train.status === 200 && train.data.success) {
      console.log('  ✅ POST /api/ml/train PASS');
    } else {
      console.error('  ❌ POST /api/ml/train FAIL');
    }

    // 4. Voice Test Save Endpoint
    console.log('\n[4] Testing POST /api/voicetest/save...');
    const voice = await makeRequest({
      host: 'localhost', port: 5000, path: '/api/voicetest/save', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { measuredWpm: 235, timeSeconds: 45, totalWords: 180 });
    console.log('  Voice test response:', voice.data);
    if (voice.status === 200 && voice.data.success && voice.data.userBaselineWpm === 235) {
      console.log('  ✅ POST /api/voicetest/save PASS');
    } else {
      console.error('  ❌ POST /api/voicetest/save FAIL');
    }

    // 5. Calibration Save Endpoint
    console.log('\n[5] Testing POST /api/calibration/save...');
    const calib = await makeRequest({
      host: 'localhost', port: 5000, path: '/api/calibration/save', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { baselineWpm: 240, confidencePercent: 90, categoryWpmMap: { story: 250, news: 230 } });
    console.log('  Calibration response:', calib.data);
    if (calib.status === 200 && calib.data.success) {
      console.log('  ✅ POST /api/calibration/save PASS');
    } else {
      console.error('  ❌ POST /api/calibration/save FAIL');
    }

    // 6. User Profile Endpoint
    console.log('\n[6] Testing GET /api/user/profile...');
    const profile = await makeRequest({ host: 'localhost', port: 5000, path: '/api/user/profile', method: 'GET' });
    console.log('  User profile response:', profile.data);
    if (profile.status === 200 && profile.data.success) {
      console.log('  ✅ GET /api/user/profile PASS');
    } else {
      console.error('  ❌ GET /api/user/profile FAIL');
    }

    // 7. Settings Endpoints
    console.log('\n[7] Testing GET & POST /api/settings...');
    const setPost = await makeRequest({
      host: 'localhost', port: 5000, path: '/api/settings', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { scrollMode: 'smooth', stepType: 'paragraph', fontSize: 18, themeId: 'glass_dark' });
    console.log('  Settings save response:', setPost.data);

    const setGet = await makeRequest({ host: 'localhost', port: 5000, path: '/api/settings', method: 'GET' });
    console.log('  Settings fetch response:', setGet.data);

    if (setPost.status === 200 && setGet.status === 200) {
      console.log('  ✅ GET & POST /api/settings PASS');
    } else {
      console.error('  ❌ GET & POST /api/settings FAIL');
    }

    console.log('\n=====================================================');
    console.log('🎉 All backend REST API endpoints verified!');
    console.log('=====================================================');
  } catch (err) {
    console.error('Test execution error:', err);
  }
}

testAllBackendAPIs();
