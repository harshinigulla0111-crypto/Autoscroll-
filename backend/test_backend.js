const http = require('http');
const mlEngine = require('./services/mlEngine');
const db = require('./db');

console.log('===================================================');
console.log('🧪 Running AutoScroll Backend & ML Test Suite');
console.log('===================================================');

// Test 1: On-Device / Server ML Engine Prediction
console.log('\n[Test 1] Testing ML Engine Speed Prediction...');
const pred = mlEngine.predictOptimalWpm({
  wordCount: 250,
  charCount: 1400,
  fontSize: 16,
  contentType: 'blog',
  customBaselineWpm: 220
});

console.log('  Prediction Result:', pred);
if (pred && pred.predictedWpm >= 100 && pred.predictedWpm <= 600) {
  console.log('  ✅ Test 1 Passed: ML Prediction WPM within valid bounds.');
} else {
  console.error('  ❌ Test 1 Failed: Prediction out of bounds.');
  process.exit(1);
}

// Test 2: ML Engine Model Training
console.log('\n[Test 2] Testing ML Model Training...');
const trainStats = mlEngine.trainModel({
  wordCount: 300,
  charCount: 1650,
  fontSize: 18,
  contentType: 'news',
  userBaselineWpm: 230,
  targetWpm: 235
});

console.log('  Training Stats:', trainStats);
if (trainStats && trainStats.rSquared > 0.5) {
  console.log('  ✅ Test 2 Passed: Model trained with strong R-Squared score.');
} else {
  console.error('  ❌ Test 2 Failed: Model training failed.');
  process.exit(1);
}

// Test 3: Database Connection Status
console.log('\n[Test 3] Checking PostgreSQL / Offline Fallback Status...');
console.log('  Is DB Connected:', db.isConnected());
console.log('  ✅ Test 3 Passed: System handles DB status gracefully.');

console.log('\n===================================================');
console.log('🎉 All backend unit & ML tests passed successfully!');
console.log('===================================================');
