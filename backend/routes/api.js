const express = require('express');
const router = express.Router();
const mlEngine = require('../services/mlEngine');

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Predict optimal reading speed using ML Model
 */
router.post('/ml/predict', (req, res) => {
  try {
    const { wordCount, charCount, fontSize, contentType, customBaselineWpm } = req.body;
    const prediction = mlEngine.predictOptimalWpm({
      wordCount: parseInt(wordCount) || 200,
      charCount: parseInt(charCount) || 1100,
      fontSize: parseInt(fontSize) || 16,
      contentType: contentType || 'blog',
      customBaselineWpm: customBaselineWpm ? parseInt(customBaselineWpm) : null
    });
    res.json({ success: true, prediction });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Train ML Model with new reading session data
 */
router.post('/ml/train', (req, res) => {
  try {
    const { wordCount, charCount, fontSize, contentType, targetWpm, userBaselineWpm } = req.body;
    
    let sample = null;
    if (wordCount && targetWpm) {
      sample = {
        wordCount: parseInt(wordCount),
        charCount: parseInt(charCount) || wordCount * 5,
        fontSize: parseInt(fontSize) || 16,
        contentType: contentType || 'blog',
        userBaselineWpm: parseInt(userBaselineWpm) || mlEngine.userBaselineWpm,
        targetWpm: parseInt(targetWpm)
      };
    }

    const trainResult = mlEngine.trainModel(sample);
    res.json({ success: true, stats: trainResult });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Save Voice Reading Diagnostic Test result
 */
router.post('/voicetest/save', (req, res) => {
  try {
    const { measuredWpm, timeSeconds, totalWords, paragraphTitle } = req.body;

    if (!measuredWpm || measuredWpm <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid measured WPM' });
    }

    const updatedBaseline = mlEngine.updateBaselineFromVoiceTest(measuredWpm);

    res.json({
      success: true,
      message: 'Voice test saved successfully and ML model re-calibrated',
      userBaselineWpm: updatedBaseline,
      stats: mlEngine.getStats()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get ML Model statistics and user profile
 */
router.get('/user/profile', (req, res) => {
  try {
    const stats = mlEngine.getStats();
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
