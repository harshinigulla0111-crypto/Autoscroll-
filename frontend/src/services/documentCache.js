/**
 * High-performance document caching service for AutoScroll AI
 * Saves document trees, difficulty analysis, and OCR results in LocalStorage/IndexedDB
 */

const CACHE_PREFIX = 'autoscroll_ai_doc_';

export function saveCachedDocument(doc) {
  try {
    if (!doc || !doc.id) return;
    const key = `${CACHE_PREFIX}${doc.id}`;
    const payload = JSON.stringify(doc);
    localStorage.setItem(key, payload);
  } catch (err) {
    console.warn('LocalStorage cache write error:', err);
  }
}

export function getCachedDocument(docId) {
  try {
    const key = `${CACHE_PREFIX}${docId}`;
    const payload = localStorage.getItem(key);
    return payload ? JSON.parse(payload) : null;
  } catch (err) {
    console.warn('LocalStorage cache read error:', err);
    return null;
  }
}

export function listCachedDocuments() {
  const docs = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        const item = localStorage.getItem(key);
        if (item) {
          docs.push(JSON.parse(item));
        }
      }
    }
  } catch (err) {
    console.warn('LocalStorage list error:', err);
  }
  return docs;
}

export function removeCachedDocument(docId) {
  try {
    const key = `${CACHE_PREFIX}${docId}`;
    localStorage.removeItem(key);
  } catch (err) {
    console.warn('LocalStorage delete error:', err);
  }
}
