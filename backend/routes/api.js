const express = require('express');
const router = express.Router();
const mlEngine = require('../services/mlEngine');
const db = require('../db');
const { authenticateToken } = require('./auth');

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    databaseConnected: db.isConnected(),
    timestamp: new Date().toISOString()
  });
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
router.post('/ml/train', async (req, res) => {
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

    // Save session stats to PostgreSQL if database is connected
    if (db.isConnected() && req.user) {
      await db.query(
        `INSERT INTO reading_sessions (user_id, estimated_reading_speed, content_type) VALUES ($1, $2, $3)`,
        [req.user.id, targetWpm || 220, contentType || 'blog']
      );
    }

    res.json({ success: true, stats: trainResult });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Save Voice Reading Diagnostic Test result
 */
router.post('/voicetest/save', async (req, res) => {
  try {
    const { measuredWpm, timeSeconds, totalWords, paragraphTitle } = req.body;

    if (!measuredWpm || measuredWpm <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid measured WPM' });
    }

    const updatedBaseline = mlEngine.updateBaselineFromVoiceTest(measuredWpm);

    if (db.isConnected() && req.user) {
      await db.query(
        `UPDATE reading_profiles SET baseline_reading_speed = $1, updated_at = NOW() WHERE user_id = $2`,
        [updatedBaseline, req.user.id]
      );
    }

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
router.get('/user/profile', async (req, res) => {
  try {
    const stats = mlEngine.getStats();

    if (db.isConnected() && req.user) {
      const dbProfile = await db.query('SELECT * FROM reading_profiles WHERE user_id = $1', [req.user.id]);
      if (dbProfile.rows.length > 0) {
        const p = dbProfile.rows[0];
        stats.userBaselineWpm = p.baseline_reading_speed;
        stats.confidencePercent = p.confidence_percent;
        stats.categoryWpmMap = p.category_wpm_map;
      }
    }

    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/calibration/save
 * Save calibration test results
 */
router.post('/calibration/save', authenticateToken, async (req, res) => {
  try {
    const { baselineWpm, confidencePercent, categoryWpmMap } = req.body;

    if (db.isConnected() && req.user) {
      await db.query(
        `INSERT INTO calibration_results (user_id, estimated_reading_speed, difficulty_level)
         VALUES ($1, $2, $3)`,
        [req.user.id, baselineWpm || 220, 0.5]
      );

      await db.query(
        `UPDATE reading_profiles
         SET baseline_reading_speed = $1, confidence_percent = $2, category_wpm_map = $3, calibration_status = 'completed', updated_at = NOW()
         WHERE user_id = $4`,
        [baselineWpm || 220, confidencePercent || 85, JSON.stringify(categoryWpmMap || {}), req.user.id]
      );
    }

    if (baselineWpm) {
      mlEngine.userBaselineWpm = baselineWpm;
    }

    res.json({
      success: true,
      message: 'Calibration results saved to profile',
      stats: mlEngine.getStats()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET & POST /api/settings
 * Synchronize user settings
 */
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    if (db.isConnected() && req.user) {
      const settingsRes = await db.query('SELECT * FROM user_settings WHERE user_id = $1', [req.user.id]);
      if (settingsRes.rows.length > 0) {
        return res.json({ success: true, settings: settingsRes.rows[0] });
      }
    }
    res.json({
      success: true,
      settings: {
        scrollMode: 'smooth',
        stepType: 'paragraph',
        breakRemindersEnabled: true,
        breakIntervalMinutes: 20
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/settings', authenticateToken, async (req, res) => {
  try {
    const settings = req.body;
    if (db.isConnected() && req.user) {
      await db.query(
        `UPDATE user_settings
         SET scroll_mode = $1, step_type = $2, font_family = $3, font_size = $4, theme_id = $5, break_reminders_enabled = $6, break_interval_minutes = $7, updated_at = NOW()
         WHERE user_id = $8`,
        [
          settings.scrollMode || 'smooth',
          settings.stepType || 'paragraph',
          settings.fontFamily || 'sans-serif',
          settings.fontSize || 18,
          settings.themeId || 'glass_dark',
          settings.breakRemindersEnabled !== false,
          settings.breakIntervalMinutes || 20,
          req.user.id
        ]
      );
    }
    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
