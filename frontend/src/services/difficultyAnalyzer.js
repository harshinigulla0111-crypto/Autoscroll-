/**
 * AI Difficulty & Readability Analysis Engine for AutoScroll AI
 */

/**
 * Estimate syllable count in an English word
 */
function countSyllables(word) {
  word = word.toLowerCase().trim();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const syllables = word.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
}

/**
 * Compute readability stats (Flesch Reading Ease & ARI)
 */
export function calculateReadability(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return { fleschScore: 70, difficultyScore: 0.2, avgSentenceLen: 10, avgWordLen: 4.8 };
  }

  const cleanText = text.trim();
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = Math.max(1, sentences.length);
  
  const words = cleanText.split(/\s+/).filter(w => w.trim().length > 0);
  const wordCount = Math.max(1, words.length);
  const charCount = cleanText.length;

  let totalSyllables = 0;
  words.forEach(w => {
    totalSyllables += countSyllables(w);
  });

  const avgSentenceLen = wordCount / sentenceCount;
  const avgWordLen = charCount / wordCount;
  const syllablesPerWord = totalSyllables / wordCount;

  // Flesch Reading Ease score: 206.835 - 1.015*(words/sentences) - 84.6*(syllables/words)
  const fleschScore = Math.max(0, Math.min(100, 206.835 - (1.015 * avgSentenceLen) - (84.6 * syllablesPerWord)));

  // Convert Flesch Score (0-100) to difficulty score (0.0 to 1.0)
  // Higher Flesch score = easier reading. So difficulty = (100 - Flesch) / 100
  let difficultyScore = Math.max(0.1, Math.min(0.9, (100 - fleschScore) / 100));

  // Technical syntax bonus (code keywords, symbols, numbers)
  if (/[{}()[\]<>=;:&$#\\]/.test(cleanText) || /\b(const|function|class|return|import|export|if|else|struct|public|void)\b/.test(cleanText)) {
    difficultyScore = Math.min(0.95, difficultyScore + 0.35);
  }

  return {
    fleschScore: Math.round(fleschScore),
    difficultyScore: Math.round(difficultyScore * 100) / 100,
    avgSentenceLen: Math.round(avgSentenceLen * 10) / 10,
    avgWordLen: Math.round(avgWordLen * 10) / 10,
    wordCount,
    charCount
  };
}

/**
 * Evaluate difficulty and pause duration for a semantic document block
 */
export function evaluateBlockDifficulty(type, text = '', fontSize = 18, fontWeight = 400) {
  const stats = calculateReadability(text);
  let baseDifficulty = stats.difficultyScore;
  let pauseDurationSec = 0;

  switch (type) {
    case 'h1':
      baseDifficulty = 0.10;
      pauseDurationSec = 0;
      break;
    case 'h2':
      baseDifficulty = 0.12;
      pauseDurationSec = 0;
      break;
    case 'h3':
      baseDifficulty = 0.15;
      pauseDurationSec = 0;
      break;
    case 'quote':
      baseDifficulty = 0.25;
      pauseDurationSec = 0;
      break;
    case 'list':
      baseDifficulty = Math.min(0.5, baseDifficulty * 0.9);
      pauseDurationSec = 0;
      break;
    case 'image':
      baseDifficulty = 0.50;
      pauseDurationSec = 0.3; // Brief visual pause for diagrams
      break;
    case 'table':
      baseDifficulty = 0.85; // Dense tabular data reads slower via velocity
      pauseDurationSec = 0;
      break;
    case 'code':
      baseDifficulty = 0.92; // Technical code blocks read slower via velocity
      pauseDurationSec = 0;
      break;
    case 'formula':
      baseDifficulty = 0.95;
      pauseDurationSec = 0;
      break;
    case 'paragraph':
    default:
      pauseDurationSec = 0;
      break;
  }

  // Font size scale modifier (smaller text = slightly higher reading friction)
  const fontModifier = fontSize < 16 ? 1.1 : fontSize > 22 ? 0.92 : 1.0;
  const finalDifficulty = Math.round(Math.max(0.05, Math.min(0.98, baseDifficulty * fontModifier)) * 100) / 100;

  return {
    difficulty: finalDifficulty,
    pauseDurationSec,
    fleschScore: stats.fleschScore,
    wordCount: stats.wordCount,
    charCount: stats.charCount,
    avgSentenceLen: stats.avgSentenceLen
  };
}

/**
 * Predict target reading WPM and scroll speed for a node block
 */
export function predictNodeReadingProfile(node, userBaselineWpm = 220, userMultiplier = 1.0) {
  const { difficulty } = evaluateBlockDifficulty(
    node.type,
    node.text,
    node.fontSize || 18,
    node.fontWeight || 400
  );

  // Paragraph length modifier: longer/denser paragraphs require more cognitive processing time
  const wordCount = node.wordCount || (node.text ? node.text.trim().split(/\s+/).filter(Boolean).length : 0);
  const lengthFactor = wordCount > 100 ? 0.72 : wordCount > 60 ? 0.82 : wordCount > 35 ? 0.90 : 1.0;

  // WPM multiplier: higher difficulty or longer paragraph reduces reading pace (slower scroll)
  const difficultyWpmMultiplier = Math.max(0.35, (1.35 - (difficulty * 0.90)) * lengthFactor);

  // Compute final block WPM incorporating baseline, difficulty, paragraph length, and speed slider
  const targetWpm = Math.round(userBaselineWpm * difficultyWpmMultiplier * userMultiplier);
  const clampedWpm = Math.max(20, Math.min(800, targetWpm));

  // Compute scroll velocity in pixels/second:
  // wordsPerSec = WPM / 60; approx 8 words per line; line height ~ (fontSize * 1.8)
  const wordsPerSec = clampedWpm / 60;
  const linePx = (node.fontSize || 18) * 1.8;
  const linesPerSec = wordsPerSec / 8;
  const scrollSpeedPxSec = Math.max(3.0, Math.round(linesPerSec * linePx * 10) / 10);

  // Compute estimated reading duration for this paragraph/block in seconds based on reader's WPM
  const readingTimeSec = wordCount > 0 ? (wordCount / (clampedWpm / 60)) : 1.5;

  return {
    difficulty,
    wordCount,
    targetWpm: clampedWpm,
    scrollSpeedPxSec,
    estimatedDurationSec: Math.round(readingTimeSec * 10) / 10
  };
}
