import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';
import { evaluateBlockDifficulty } from './difficultyAnalyzer';

// Set local bundler asset URL for pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Universal Document Converter - Transforms raw documents into a Semantic Document Tree
 */

/**
 * Helper to generate unique node IDs
 */
function genId(prefix = 'node') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Parse Markdown/Plain Text/HTML into structured Semantic Node Tree
 */
export function parseMarkdownOrTextToNodes(rawText, title = 'Document') {
  if (!rawText || typeof rawText !== 'string') return [];

  const lines = rawText.split('\n');
  const nodes = [];
  let currentParagraphLines = [];
  let inCodeBlock = false;
  let codeBlockLines = [];

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      const text = currentParagraphLines.join(' ').trim();
      if (text.length > 0) {
        const stats = evaluateBlockDifficulty('paragraph', text);
        nodes.push({
          id: genId('p'),
          type: 'paragraph',
          text,
          fontSize: 18,
          fontWeight: 400,
          ...stats
        });
      }
      currentParagraphLines = [];
    }
  };

  const flushCodeBlock = () => {
    if (codeBlockLines.length > 0) {
      const text = codeBlockLines.join('\n');
      const stats = evaluateBlockDifficulty('code', text);
      nodes.push({
        id: genId('code'),
        type: 'code',
        text,
        fontSize: 15,
        fontWeight: 500,
        ...stats
      });
      codeBlockLines = [];
    }
  };

  lines.forEach(line => {
    const trimmed = line.trim();

    // Check code block fence ```
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        flushCodeBlock();
      } else {
        flushParagraph();
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      flushParagraph();
      const text = trimmed.replace(/^#\s+/, '');
      const stats = evaluateBlockDifficulty('h1', text);
      nodes.push({ id: genId('h1'), type: 'h1', text, fontSize: 28, fontWeight: 700, ...stats });
    } else if (trimmed.startsWith('## ')) {
      flushParagraph();
      const text = trimmed.replace(/^##\s+/, '');
      const stats = evaluateBlockDifficulty('h2', text);
      nodes.push({ id: genId('h2'), type: 'h2', text, fontSize: 24, fontWeight: 700, ...stats });
    } else if (trimmed.startsWith('### ')) {
      flushParagraph();
      const text = trimmed.replace(/^###\s+/, '');
      const stats = evaluateBlockDifficulty('h3', text);
      nodes.push({ id: genId('h3'), type: 'h3', text, fontSize: 20, fontWeight: 600, ...stats });
    }
    // Block quotes
    else if (trimmed.startsWith('> ')) {
      flushParagraph();
      const text = trimmed.replace(/^>\s+/, '');
      const stats = evaluateBlockDifficulty('quote', text);
      nodes.push({ id: genId('quote'), type: 'quote', text, fontSize: 18, fontWeight: 400, ...stats });
    }
    // Bullet lists
    else if (/^[-*+]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      flushParagraph();
      const text = trimmed.replace(/^([-*+]|\d+\.)\s+/, '');
      const stats = evaluateBlockDifficulty('list', text);
      nodes.push({ id: genId('list'), type: 'list', text, fontSize: 17, fontWeight: 400, ...stats });
    }
    // Empty line separates paragraphs
    else if (trimmed.length === 0) {
      flushParagraph();
    } else {
      currentParagraphLines.push(trimmed);
    }
  });

  flushParagraph();
  if (inCodeBlock) flushCodeBlock();

  return nodes;
}

/**
 * Process PDF File and Scanned PDF
 */
export async function processPdfDocument(file, onProgress) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  let allNodes = [];
  let isScanned = true;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (onProgress) {
      onProgress({ status: `Extracting page ${pageNum} of ${numPages}...`, percent: Math.round((pageNum / numPages) * 70) });
    }

    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageStrings = textContent.items.map(item => item.str);
    const pageText = pageStrings.join(' ').trim();

    if (pageText.length > 30) {
      isScanned = false;
      // Add Page Marker Node
      const pageHeadingStats = evaluateBlockDifficulty('h2', `Page ${pageNum}`);
      allNodes.push({ id: genId('page'), type: 'h2', text: `--- Page ${pageNum} ---`, fontSize: 22, fontWeight: 700, ...pageHeadingStats });
      
      const pageNodes = parseMarkdownOrTextToNodes(pageText);
      allNodes.push(...pageNodes);
    }
  }

  // If scanned PDF (no text layer), perform Tesseract OCR
  if (isScanned || allNodes.length === 0) {
    if (onProgress) onProgress({ status: 'Scanned PDF detected. Executing Tesseract OCR...', percent: 75 });
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng');
    const ret = await worker.recognize(file);
    await worker.terminate();

    const ocrNodes = parseMarkdownOrTextToNodes(ret.data.text || 'Scanned PDF page.');
    allNodes = ocrNodes;
  }

  const title = file.name.replace(/\.[^/.]+$/, '');
  const totalWords = allNodes.reduce((acc, n) => acc + (n.wordCount || 0), 0);
  const totalChars = allNodes.reduce((acc, n) => acc + (n.charCount || 0), 0);
  const avgDifficulty = allNodes.length > 0 ? (allNodes.reduce((acc, n) => acc + n.difficulty, 0) / allNodes.length) : 0.3;

  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title,
    filename: file.name,
    fileType: isScanned ? 'scanned_pdf' : 'pdf',
    nodes: allNodes,
    totalWords,
    totalChars,
    avgDifficulty: Math.round(avgDifficulty * 100) / 100,
    pageCount: numPages,
    createdAt: new Date().toISOString()
  };
}

/**
 * Process DOCX Document using Mammoth
 */
export async function processDocxDocument(file, onProgress) {
  if (onProgress) onProgress({ status: 'Parsing Microsoft Word document structure...', percent: 30 });
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const rawText = result.value || '';

  const nodes = parseMarkdownOrTextToNodes(rawText);
  const title = file.name.replace(/\.[^/.]+$/, '');
  const totalWords = nodes.reduce((acc, n) => acc + (n.wordCount || 0), 0);
  const totalChars = nodes.reduce((acc, n) => acc + (n.charCount || 0), 0);
  const avgDifficulty = nodes.length > 0 ? (nodes.reduce((acc, n) => acc + n.difficulty, 0) / nodes.length) : 0.3;

  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title,
    filename: file.name,
    fileType: 'docx',
    nodes,
    totalWords,
    totalChars,
    avgDifficulty: Math.round(avgDifficulty * 100) / 100,
    createdAt: new Date().toISOString()
  };
}

/**
 * Process EPUB eBooks
 */
export async function processEpubDocument(file, onProgress) {
  if (onProgress) onProgress({ status: 'Unzipping EPUB book & loading chapters...', percent: 30 });
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const contentFiles = Object.keys(zip.files).filter(filename => 
    /\.(xhtml|html|htm)$/i.test(filename) && !filename.includes('toc')
  );

  let bookTitle = file.name.replace(/\.[^/.]+$/, '');
  let allNodes = [];
  const parser = new DOMParser();

  for (let i = 0; i < contentFiles.length; i++) {
    const filename = contentFiles[i];
    const contentStr = await zip.files[filename].async('string');
    const doc = parser.parseFromString(contentStr, 'text/html');

    const titleEl = doc.querySelector('title');
    if (titleEl && titleEl.textContent && bookTitle === file.name.replace(/\.[^/.]+$/, '')) {
      bookTitle = titleEl.textContent.trim();
    }

    const bodyText = doc.body ? doc.body.textContent : '';
    if (bodyText.trim()) {
      const chapterNodes = parseMarkdownOrTextToNodes(bodyText);
      allNodes.push(...chapterNodes);
    }
  }

  const totalWords = allNodes.reduce((acc, n) => acc + (n.wordCount || 0), 0);
  const totalChars = allNodes.reduce((acc, n) => acc + (n.charCount || 0), 0);
  const avgDifficulty = allNodes.length > 0 ? (allNodes.reduce((acc, n) => acc + n.difficulty, 0) / allNodes.length) : 0.25;

  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: bookTitle,
    filename: file.name,
    fileType: 'epub',
    nodes: allNodes,
    totalWords,
    totalChars,
    avgDifficulty: Math.round(avgDifficulty * 100) / 100,
    chapterCount: contentFiles.length,
    createdAt: new Date().toISOString()
  };
}

/**
 * Process Image Files & Screenshots
 */
export async function processImageDocument(file, performOcr = true, onProgress) {
  const imageUrl = URL.createObjectURL(file);
  const title = file.name.replace(/\.[^/.]+$/, '');

  let ocrNodes = [];
  if (performOcr) {
    if (onProgress) onProgress({ status: 'Recognizing image text via Tesseract OCR...', percent: 50 });
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      const ret = await worker.recognize(file);
      await worker.terminate();

      if (ret.data.text && ret.data.text.trim()) {
        ocrNodes = parseMarkdownOrTextToNodes(ret.data.text);
      }
    } catch (err) {
      console.warn('OCR processing fallback note:', err);
    }
  }

  // Create primary visual image node
  const imgNodeStats = evaluateBlockDifficulty('image', title);
  const primaryImgNode = {
    id: genId('img'),
    type: 'image',
    title,
    text: `Image document: ${title}`,
    imageUrl,
    fontSize: 18,
    fontWeight: 600,
    ...imgNodeStats
  };

  const nodes = [primaryImgNode, ...ocrNodes];
  const totalWords = nodes.reduce((acc, n) => acc + (n.wordCount || 0), 0);

  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title,
    filename: file.name,
    fileType: 'image',
    imageUrl,
    nodes,
    totalWords,
    totalChars: title.length,
    avgDifficulty: 0.50,
    createdAt: new Date().toISOString()
  };
}

/**
 * Process PPTX Presentation Documents using JSZip XML parsing
 */
export async function processPptxDocument(file, onProgress) {
  if (onProgress) onProgress({ status: 'Unzipping PPTX presentation & parsing slides...', percent: 30 });
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const slideFiles = Object.keys(zip.files)
    .filter(filename => /^ppt\/slides\/slide\d+\.xml$/i.test(filename))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
      const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
      return numA - numB;
    });

  let presentationTitle = file.name.replace(/\.[^/.]+$/, '');
  let allNodes = [];
  const parser = new DOMParser();

  for (let i = 0; i < slideFiles.length; i++) {
    const filename = slideFiles[i];
    const xmlStr = await zip.files[filename].async('string');
    const xmlDoc = parser.parseFromString(xmlStr, 'application/xml');

    const textNodes = Array.from(xmlDoc.getElementsByTagName('a:t'));
    const slideText = textNodes.map(t => t.textContent).join(' ').trim();

    if (slideText) {
      const slideHeadingStats = evaluateBlockDifficulty('h2', `Slide ${i + 1}`);
      allNodes.push({ id: genId('slide'), type: 'h2', text: `--- Slide ${i + 1} ---`, fontSize: 22, fontWeight: 700, ...slideHeadingStats });
      const parsedSlideNodes = parseMarkdownOrTextToNodes(slideText);
      allNodes.push(...parsedSlideNodes);
    }
  }

  if (allNodes.length === 0) {
    allNodes = parseMarkdownOrTextToNodes(`Presentation: ${presentationTitle}`);
  }

  const totalWords = allNodes.reduce((acc, n) => acc + (n.wordCount || 0), 0);
  const totalChars = allNodes.reduce((acc, n) => acc + (n.charCount || 0), 0);
  const avgDifficulty = allNodes.length > 0 ? (allNodes.reduce((acc, n) => acc + n.difficulty, 0) / allNodes.length) : 0.3;

  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: presentationTitle,
    filename: file.name,
    fileType: 'pptx',
    nodes: allNodes,
    totalWords,
    totalChars,
    avgDifficulty: Math.round(avgDifficulty * 100) / 100,
    slideCount: slideFiles.length,
    createdAt: new Date().toISOString()
  };
}

/**
 * Universal Entry Point for Processing Any File
 */
export async function processUniversalDocument(file, onProgress) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'pdf') {
    return await processPdfDocument(file, onProgress);
  } else if (['pptx', 'ppt'].includes(ext)) {
    return await processPptxDocument(file, onProgress);
  } else if (['docx', 'doc'].includes(ext)) {
    return await processDocxDocument(file, onProgress);
  } else if (ext === 'epub') {
    return await processEpubDocument(file, onProgress);
  } else if (['png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif'].includes(ext)) {
    return await processImageDocument(file, true, onProgress);
  } else {
    // Plain text, Markdown, HTML, Clipboard, CSV, JSON
    if (onProgress) onProgress({ status: 'Reading text file...', percent: 50 });
    const text = await file.text();
    const nodes = parseMarkdownOrTextToNodes(text, file.name.replace(/\.[^/.]+$/, ''));
    const title = file.name.replace(/\.[^/.]+$/, '');
    const totalWords = nodes.reduce((acc, n) => acc + (n.wordCount || 0), 0);

    return {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      filename: file.name,
      fileType: ext,
      nodes,
      totalWords,
      totalChars: text.length,
      avgDifficulty: 0.25,
      createdAt: new Date().toISOString()
    };
  }
}

