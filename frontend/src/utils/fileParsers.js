import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set local bundler asset URL for pdfjs worker (works 100% offline & without CDN dependency)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Helper to compute reading text statistics
 */
export function computeTextStats(text) {
  if (!text || typeof text !== 'string') {
    return { wordCount: 0, charCount: 0, avgWordLen: '5.0', contentType: 'blog' };
  }

  const cleanText = text.trim();
  const words = cleanText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = cleanText.length;
  const avgWordLen = wordCount > 0 ? (charCount / wordCount).toFixed(1) : '5.0';

  // Basic content-type auto classifier based on vocabulary & structure
  let contentType = 'blog';
  const lower = cleanText.toLowerCase();

  if (lower.includes('chapter') || lower.includes('once upon') || lower.includes('said') || lower.includes('whispered')) {
    contentType = 'book';
  } else if (lower.includes('function') || lower.includes('const ') || lower.includes('algorithm') || lower.includes('model') || lower.includes('api')) {
    contentType = 'chatbot';
  } else if (lower.includes('reported') || lower.includes('today') || lower.includes('reuters') || lower.includes('san francisco')) {
    contentType = 'news';
  }

  return { wordCount, charCount, avgWordLen, contentType };
}

/**
 * Parse plain text, Markdown, or code files (.txt, .md, .csv, .json, .rtf)
 */
export function parseTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const stats = computeTextStats(text);
      const title = file.name.replace(/\.[^/.]+$/, '');

      resolve({
        id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title,
        filename: file.name,
        type: 'text',
        content: text,
        ...stats,
        uploadedAt: new Date().toISOString()
      });
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}

/**
 * Parse PDF document page-by-page using pdfjs-dist
 */
export async function parsePdfFile(file, onProgress) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    const numPages = pdf.numPages;
    let fullTextArr = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      if (onProgress) {
        onProgress({ current: pageNum, total: numPages, percent: Math.round((pageNum / numPages) * 100) });
      }
      
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items.map(item => item.str);
      const pageText = pageStrings.join(' ');
      
      if (pageText.trim()) {
        fullTextArr.push(`--- Page ${pageNum} ---\n${pageText}`);
      }
    }

    const fullText = fullTextArr.join('\n\n');
    const stats = computeTextStats(fullText);
    const title = file.name.replace(/\.[^/.]+$/, '');

    return {
      id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      filename: file.name,
      type: 'pdf',
      pageCount: numPages,
      content: fullText,
      ...stats,
      uploadedAt: new Date().toISOString()
    };
  } catch (err) {
    console.error('Error parsing PDF file:', err);
    throw new Error(`Failed to parse PDF document (${err.message || 'Corrupt or protected PDF'}).`);
  }
}

/**
 * Parse EPUB eBook using JSZip & DOMParser
 */
export async function parseEpubFile(file, onProgress) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    let bookTitle = file.name.replace(/\.[^/.]+$/, '');
    let chapterTexts = [];
    
    // Find all xhtml/html content files in zip
    const contentFiles = Object.keys(zip.files).filter(filename => 
      /\.(xhtml|html|htm)$/i.test(filename) && !filename.includes('toc')
    );

    const parser = new DOMParser();
    const totalFiles = contentFiles.length;

    for (let i = 0; i < totalFiles; i++) {
      const filename = contentFiles[i];
      if (onProgress) {
        onProgress({ current: i + 1, total: totalFiles, percent: Math.round(((i + 1) / totalFiles) * 100) });
      }

      const contentStr = await zip.files[filename].async('string');
      const doc = parser.parseFromString(contentStr, 'text/html');

      // Try to extract document title from metadata if available
      const titleEl = doc.querySelector('title');
      if (titleEl && titleEl.textContent && bookTitle === file.name.replace(/\.[^/.]+$/, '')) {
        bookTitle = titleEl.textContent.trim();
      }

      // Extract text content from body elements
      const body = doc.body;
      if (body) {
        // Remove script, style tags
        const scripts = body.querySelectorAll('script, style');
        scripts.forEach(s => s.remove());

        const paragraphs = Array.from(body.querySelectorAll('p, h1, h2, h3, h4, div'))
          .map(el => el.textContent.trim())
          .filter(t => t.length > 0);

        if (paragraphs.length > 0) {
          chapterTexts.push(paragraphs.join('\n\n'));
        } else if (body.textContent.trim()) {
          chapterTexts.push(body.textContent.trim());
        }
      }
    }

    const fullText = chapterTexts.join('\n\n=== Chapter Break ===\n\n');
    const stats = computeTextStats(fullText);

    return {
      id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: bookTitle,
      filename: file.name,
      type: 'epub',
      chapterCount: contentFiles.length,
      content: fullText || 'No readable text extracted from EPUB file.',
      ...stats,
      contentType: 'book',
      uploadedAt: new Date().toISOString()
    };
  } catch (err) {
    console.error('Error parsing EPUB file:', err);
    throw new Error(`Failed to parse EPUB book file (${err.message}).`);
  }
}

/**
 * Process Image File for Visual Scrolling and OCR text extraction
 */
export async function parseImageFile(file, performOcr = false, onProgress) {
  return new Promise(async (resolve, reject) => {
    try {
      const imageUrl = URL.createObjectURL(file);
      const title = file.name.replace(/\.[^/.]+$/, '');
      
      let ocrText = '';
      let isOcrDone = false;

      if (performOcr) {
        try {
          const { createWorker } = await import('tesseract.js');
          const worker = await createWorker('eng');
          if (onProgress) onProgress({ status: 'Recognizing text via OCR...', percent: 40 });
          
          const ret = await worker.recognize(file);
          ocrText = ret.data.text;
          await worker.terminate();
          isOcrDone = true;
        } catch (ocrErr) {
          console.warn('OCR processing error fallback:', ocrErr);
          ocrText = `Image document uploaded: ${file.name}.\n(OCR text extraction unavailable or encountered an error).`;
        }
      }

      const stats = computeTextStats(ocrText);

      resolve({
        id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title,
        filename: file.name,
        type: 'image',
        imageUrl,
        content: ocrText,
        isOcrDone,
        ...stats,
        uploadedAt: new Date().toISOString()
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Execute OCR on an existing uploaded image object
 */
export async function extractOcrFromImage(imageDoc, onProgress) {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng');
  
  if (onProgress) onProgress({ status: 'Starting Tesseract OCR engine...', percent: 20 });
  const ret = await worker.recognize(imageDoc.imageUrl);
  if (onProgress) onProgress({ status: 'Extracting text content...', percent: 90 });
  await worker.terminate();

  const ocrText = ret.data.text || 'No text detected in image.';
  const stats = computeTextStats(ocrText);

  return {
    ...imageDoc,
    content: ocrText,
    isOcrDone: true,
    ...stats
  };
}
