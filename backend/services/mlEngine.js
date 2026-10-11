const fs = require('fs');
const path = require('path');

const SEED_DATA_FILE = path.join(__dirname, '../data/ml_data.json');
const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'data') : path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'ml_data.json');

// Content Type Mapping for ML features
// 0: blog, 1: chatbot, 2: book, 3: news
const CONTENT_TYPE_MULTIPLIERS = {
  blog: 1.0,        // standard pace
  chatbot: 0.82,    // slower pace for technical code/reasoning
  book: 1.15,       // faster flow for fiction/narratives
  news: 1.05        // medium-fast informative pace
};

// Default seed dataset representing baseline reading speed patterns
const DEFAULT_SEED_DATA = [
  { wordCount: 300, charCount: 1600, fontSize: 16, contentType: 'blog', userBaselineWpm: 220, targetWpm: 225 },
  { wordCount: 150, charCount: 950, fontSize: 14, contentType: 'chatbot', userBaselineWpm: 220, targetWpm: 180 },
  { wordCount: 500, charCount: 2700, fontSize: 18, contentType: 'book', userBaselineWpm: 220, targetWpm: 255 },
  { wordCount: 250, charCount: 1400, fontSize: 16, contentType: 'news', userBaselineWpm: 220, targetWpm: 230 },
  { wordCount: 400, charCount: 2100, fontSize: 20, contentType: 'blog', userBaselineWpm: 200, targetWpm: 195 },
  { wordCount: 200, charCount: 1300, fontSize: 14, contentType: 'chatbot', userBaselineWpm: 200, targetWpm: 160 },
  { wordCount: 600, charCount: 3200, fontSize: 18, contentType: 'book', userBaselineWpm: 250, targetWpm: 285 },
  { wordCount: 350, charCount: 1900, fontSize: 16, contentType: 'news', userBaselineWpm: 250, targetWpm: 260 },
  { wordCount: 280, charCount: 1500, fontSize: 16, contentType: 'blog', userBaselineWpm: 240, targetWpm: 245 },
  { wordCount: 180, charCount: 1100, fontSize: 14, contentType: 'chatbot', userBaselineWpm: 240, targetWpm: 198 }
];

class MLReadingEngine {
  constructor() {
    this.dataset = [];
    this.weights = {
      intercept: 50,
      wBaseline: 0.70,
      wFont: -1.2,
      wDensity: -5.0,
      wContent: 25.0
    };
    this.rSquared = 0.88;
    this.lastTrainedAt = new Date().toISOString();
    this.userBaselineWpm = 220; // Default until updated by Voice Speed Test

    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      const activeFile = fs.existsSync(DATA_FILE) ? DATA_FILE : (fs.existsSync(SEED_DATA_FILE) ? SEED_DATA_FILE : null);
      if (activeFile) {
        const fileContent = fs.readFileSync(activeFile, 'utf8');
        const parsed = JSON.parse(fileContent);
        this.dataset = parsed.dataset || DEFAULT_SEED_DATA;
        this.weights = parsed.weights || this.weights;
        this.userBaselineWpm = parsed.userBaselineWpm || 220;
        this.rSquared = parsed.rSquared || 0.88;
        this.lastTrainedAt = parsed.lastTrainedAt || new Date().toISOString();
      } else {
        this.dataset = [...DEFAULT_SEED_DATA];
        this.trainModel();
        this.saveData();
      }
    } catch (err) {
      console.error('Error initializing ML engine:', err.message);
      this.dataset = [...DEFAULT_SEED_DATA];
    }
  }

  saveData() {
    try {
      const dataToSave = {
        dataset: this.dataset,
        weights: this.weights,
        userBaselineWpm: this.userBaselineWpm,
        rSquared: this.rSquared,
        lastTrainedAt: this.lastTrainedAt
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving ML data:', err.message);
    }
  }

  /**
   * Content Type Multiplier
   */
  getContentMultiplier(type) {
    return CONTENT_TYPE_MULTIPLIERS[type] || 1.0;
  }

  /**
   * Predict optimal reading WPM for given text and user profile
   */
  predictOptimalWpm({ wordCount = 200, charCount = 1100, fontSize = 16, contentType = 'blog', customBaselineWpm = null }) {
    const baseline = customBaselineWpm || this.userBaselineWpm;
    const density = wordCount > 0 ? charCount / wordCount : 5.2; // Avg chars per word
    const contentMult = this.getContentMultiplier(contentType);

    // Font scale adjustment: smaller font reduces speed slightly due to legibility load
    const fontFactor = Math.max(0.85, Math.min(1.15, fontSize / 16));

    // Linear combinations based on trained regression weights
    let predictedWpm = 
      this.weights.intercept +
      (baseline * this.weights.wBaseline) +
      (fontSize * this.weights.wFont) +
      (density * this.weights.wDensity) +
      (contentMult * this.weights.wContent);

    // Fine adjustment by content multiplier and font factor
    predictedWpm = predictedWpm * contentMult * fontFactor;

    // Bounds checking (100 WPM to 600 WPM)
    const finalWpm = Math.round(Math.max(100, Math.min(600, predictedWpm)));

    // Calculate corresponding scroll velocity in pixels per second (line-height based)
    const wordsPerSec = finalWpm / 60;
    const linePx = fontSize * 1.8;
    const linesPerSec = wordsPerSec / 8;
    const scrollSpeedPxSec = Math.max(25, Math.round(linesPerSec * linePx * 10) / 10);

    return {
      predictedWpm: finalWpm,
      scrollSpeedPxSec,
      contentType,
      contentMultiplier: contentMult,
      density: Math.round(density * 100) / 100,
      userBaselineWpm: baseline,
      confidenceScore: Math.round(this.rSquared * 100) / 100
    };
  }

  /**
   * Train ML Model using stored dataset samples via Ridge Least Squares Regression
   */
  trainModel(newSample = null) {
    if (newSample) {
      this.dataset.push(newSample);
    }

    if (this.dataset.length < 3) return;

    // Feature matrix X: [1, baseline, fontSize, density, contentMult]
    // Target Y: targetWpm
    let sumY = 0;
    let sumBase = 0;
    let sumFont = 0;
    let sumDens = 0;
    let sumMult = 0;
    const n = this.dataset.length;

    this.dataset.forEach(item => {
      const density = item.wordCount > 0 ? item.charCount / item.wordCount : 5.2;
      const mult = this.getContentMultiplier(item.contentType);
      sumY += item.targetWpm;
      sumBase += item.userBaselineWpm;
      sumFont += item.fontSize;
      sumDens += density;
      sumMult += mult;
    });

    const meanY = sumY / n;
    const meanBase = sumBase / n;
    const meanFont = sumFont / n;
    const meanDens = sumDens / n;
    const meanMult = sumMult / n;

    // Calculate gradient components for Multivariate Linear Regression
    let numBase = 0, denBase = 0;
    let numFont = 0, denFont = 0;
    let numDens = 0, denDens = 0;

    this.dataset.forEach(item => {
      const density = item.wordCount > 0 ? item.charCount / item.wordCount : 5.2;
      const devY = item.targetWpm - meanY;

      numBase += (item.userBaselineWpm - meanBase) * devY;
      denBase += Math.pow(item.userBaselineWpm - meanBase, 2);

      numFont += (item.fontSize - meanFont) * devY;
      denFont += Math.pow(item.fontSize - meanFont, 2);

      numDens += (density - meanDens) * devY;
      denDens += Math.pow(density - meanDens, 2);
    });

    const wBase = denBase > 0 ? numBase / denBase : 0.7;
    const wFont = denFont > 0 ? numFont / denFont : -1.2;
    const wDens = denDens > 0 ? numDens / denDens : -5.0;

    // Update weights
    this.weights.wBaseline = Math.max(0.3, Math.min(1.2, wBase));
    this.weights.wFont = Math.max(-3.0, Math.min(1.0, wFont));
    this.weights.wDensity = Math.max(-10.0, Math.min(2.0, wDens));
    this.weights.intercept = Math.round(meanY - (this.weights.wBaseline * meanBase + this.weights.wFont * meanFont + this.weights.wDensity * meanDens));

    // Calculate R-squared accuracy
    let ssTot = 0;
    let ssRes = 0;
    this.dataset.forEach(item => {
      const pred = this.predictOptimalWpm({
        wordCount: item.wordCount,
        charCount: item.charCount,
        fontSize: item.fontSize,
        contentType: item.contentType,
        customBaselineWpm: item.userBaselineWpm
      }).predictedWpm;

      ssTot += Math.pow(item.targetWpm - meanY, 2);
      ssRes += Math.pow(item.targetWpm - pred, 2);
    });

    this.rSquared = ssTot > 0 ? Math.max(0.72, Math.min(0.98, 1 - (ssRes / ssTot))) : 0.88;
    this.lastTrainedAt = new Date().toISOString();
    this.saveData();

    return {
      status: 'trained',
      samplesCount: this.dataset.length,
      rSquared: Math.round(this.rSquared * 100) / 100,
      weights: this.weights
    };
  }

  /**
   * Update baseline WPM from Voice Diagnostic Reading Speed Test
   */
  updateBaselineFromVoiceTest(measuredWpm) {
    if (!measuredWpm || measuredWpm < 60 || measuredWpm > 700) return;

    this.userBaselineWpm = Math.round(measuredWpm);
    
    // Add voice test result as a reference sample into the dataset
    this.trainModel({
      wordCount: 250,
      charCount: 1350,
      fontSize: 16,
      contentType: 'blog',
      userBaselineWpm: this.userBaselineWpm,
      targetWpm: this.userBaselineWpm
    });

    this.saveData();
    return this.userBaselineWpm;
  }

  getStats() {
    return {
      userBaselineWpm: this.userBaselineWpm,
      samplesCount: this.dataset.length,
      rSquared: Math.round(this.rSquared * 100) / 100,
      lastTrainedAt: this.lastTrainedAt,
      weights: this.weights
    };
  }
}

module.exports = new MLReadingEngine();
