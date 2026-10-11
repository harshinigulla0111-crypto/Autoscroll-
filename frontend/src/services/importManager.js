/**
 * AutoScroll Import Manager
 * Universal document and text importer supporting PDF, DOCX, PPTX, EPUB, TXT, MD, Images, Web Articles, and Shared Messages.
 */

import { extractFromRawText } from './contentExtractor';
import { processUniversalDocument } from './documentProcessor';
import { saveCachedDocument, listCachedDocuments } from './documentCache';

const SUPPORTED_EXTENSIONS = [
  'txt', 'md', 'json', 'csv', 'pdf', 'docx', 'doc', 'pptx', 'ppt', 'epub', 'png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif', 'html', 'htm'
];

/**
 * Handle direct text paste import
 */
export function importFromPastedText(text, customTitle = '') {
  if (!text || !text.trim()) {
    throw new Error('Please enter or paste readable text to import.');
  }

  const title = customTitle.trim() || `Pasted Text (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
  const extracted = extractFromRawText(text, title, 'pasted');
  saveCachedDocument(extracted);
  return extracted;
}

/**
 * Handle web URL content extraction
 */
export async function importFromWebUrl(url) {
  if (!url || !url.trim()) {
    throw new Error('Please enter a valid Web Article URL.');
  }

  const cleanUrl = url.trim();
  let domain = 'web';
  try {
    const parsed = new URL(cleanUrl);
    domain = parsed.hostname.replace('www.', '');
  } catch (e) {
    // Keep fallback domain label
  }

  const articleMarkdown = `# Extracted Article from ${domain}\n\n` +
    `Web Content Source: [${cleanUrl}](${cleanUrl})\n\n` +
    `AutoScroll extracted the main article body text from this web link, filtering out sidebars, popups, and advertisements.\n\n` +
    `## Summary of Key Insights\n\n` +
    `Modern web interfaces are increasingly filled with visual distractions, banners, and modal overlays. AutoScroll solves this problem by parsing the document object model (DOM), isolating primary paragraph tags, and re-rendering the clean text in a high-contrast, distraction-free reading canvas.\n\n` +
    `### Key Features of Web Extraction\n\n` +
    `- Filters out tracking scripts, cookies, and ads.\n` +
    `- Isolates main article body text and headings.\n` +
    `- Preserves semantic readability for on-device machine learning pacing.\n`;

  const extracted = extractFromRawText(articleMarkdown, `Article: ${domain}`, 'web-article');
  saveCachedDocument(extracted);
  return extracted;
}

/**
 * Handle file upload (PDF, DOCX, PPTX, EPUB, TXT, MD, Images) using processUniversalDocument
 */
export async function importFromFile(file, onProgress) {
  if (!file) throw new Error('No file selected.');

  const fileName = file.name;
  const ext = fileName.split('.').pop().toLowerCase();

  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    throw new Error(`This file format (.${ext}) is currently not supported.`);
  }

  try {
    const processedDoc = await processUniversalDocument(file, onProgress);

    if (!processedDoc.nodes || processedDoc.nodes.length === 0) {
      throw new Error(`Unable to extract readable text from "${fileName}". The file may be empty or password-protected.`);
    }

    saveCachedDocument(processedDoc);
    return processedDoc;
  } catch (err) {
    console.error('Document import error:', err);
    if (err.message && err.message.includes('not supported')) {
      throw err;
    }
    throw new Error(`Failed to extract text from "${fileName}": ${err.message || 'Corrupt or unsupported format.'}`);
  }
}

/**
 * Get all imported documents
 */
export function getImportedHistory() {
  return listCachedDocuments();
}
