/**
 * Semantic Node Types for AutoScroll AI Document Tree
 */
export const BLOCK_TYPES = {
  HEADING_1: 'h1',
  HEADING_2: 'h2',
  HEADING_3: 'h3',
  PARAGRAPH: 'paragraph',
  LIST: 'list',
  CODE: 'code',
  TABLE: 'table',
  IMAGE: 'image',
  FORMULA: 'formula',
  QUOTE: 'quote'
};

/**
 * Expected Structure of a Semantic Node:
 * @typedef {Object} SemanticNode
 * @property {string} id
 * @property {string} type - 'h1'|'h2'|'h3'|'paragraph'|'list'|'code'|'table'|'image'|'formula'|'quote'
 * @property {string} text - Raw text content
 * @property {string} [html] - Preserved HTML markup if applicable
 * @property {number} fontSize - Measured or computed font size in px
 * @property {number} fontWeight - Measured font weight (400, 600, 700)
 * @property {number} charCount
 * @property {number} wordCount
 * @property {number} difficulty - Normalized difficulty score 0.0 to 1.0
 * @property {number} pauseDurationSec - Pause duration when entering block (e.g. 1.2s for h1, 2.0s for code)
 * @property {number} targetWpm - Predicted reading speed for block
 * @property {number} scrollSpeedPxSec - Calculated vertical scroll speed in px/sec
 * @property {string} [imageUrl] - Image source URL if image block
 * @property {string[]} [listItems] - Array of list items if list block
 * @property {string[][]} [tableRows] - 2D matrix of cell values if table block
 */

/**
 * Document Tree Data Contract:
 * @typedef {Object} DocumentTree
 * @property {string} id
 * @property {string} title
 * @property {string} fileType - 'pdf'|'scanned_pdf'|'docx'|'epub'|'txt'|'md'|'html'|'image'|'clipboard'
 * @property {SemanticNode[]} nodes
 * @property {number} totalWords
 * @property {number} totalChars
 * @property {number} avgDifficulty
 * @property {number} estimatedTotalMinutes
 * @property {string} createdAt
 */
