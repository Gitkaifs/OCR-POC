import dotenv from 'dotenv';
dotenv.config();

import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import fs from 'fs/promises';
import path from 'path';

const client = new DocumentProcessorServiceClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

const processorName = `projects/${process.env.PROJECT_ID}/locations/${process.env.LOCATION}/processors/${process.env.PROCESSOR_ID}`;

/**
 * Process image using Google Document AI
 * @param {string} imagePath - Path to the uploaded image
 * @returns {Promise<Object>} - Extracted text and tables
 */
export const processDocumentAI = async (imagePath) => {
  try {
    await fs.access(imagePath);
    const imageFile = await fs.readFile(imagePath);
    const encodedImage = Buffer.from(imageFile).toString('base64');

    // Determine MIME type
    const ext = path.extname(imagePath).toLowerCase();
    const mimeTypeMap = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.pdf': 'application/pdf'
    };
    const mimeType = mimeTypeMap[ext] || 'image/png';

    const request = {
      name: processorName,
      rawDocument: {
        content: encodedImage,
        mimeType: mimeType,
      },
    };

    const [result] = await client.processDocument(request);
    const { document } = result;

    return {
      text: document.text || '',
      tables: extractTables(document),
      confidence: calculateConfidence(document)
    };
  } catch (error) {
    console.error('Document AI Error:', error.message);
    throw new Error('DOCUMENT_AI_FAILED');
  }
};

/**
 * Extract tables from document
 */
function extractTables(document) {
  if (!document.pages || document.pages.length === 0) return [];

  const tables = [];
  
  for (const page of document.pages) {
    if (!page.tables) continue;

    for (const table of page.tables) {
      const tableData = {
        rows: [],
        confidence: table.layout?.confidence || 0
      };

      // Extract header rows
      if (table.headerRows) {
        for (const row of table.headerRows) {
          const rowData = row.cells.map(cell => 
            getText(cell.layout, document.text)
          );
          tableData.rows.push(rowData);
        }
      }

      // Extract body rows
      if (table.bodyRows) {
        for (const row of table.bodyRows) {
          const rowData = row.cells.map(cell => 
            getText(cell.layout, document.text)
          );
          tableData.rows.push(rowData);
        }
      }

      tables.push(tableData);
    }
  }

  return tables;
}

/**
 * Get text from layout
 */
function getText(layout, fullText) {
  if (!layout || !layout.textAnchor) return '';
  
  const textSegments = layout.textAnchor.textSegments || [];
  return textSegments
    .map(segment => {
      const startIndex = parseInt(segment.startIndex) || 0;
      const endIndex = parseInt(segment.endIndex) || fullText.length;
      return fullText.substring(startIndex, endIndex);
    })
    .join('')
    .trim();
}

/**
 * Calculate overall confidence score
 */
function calculateConfidence(document) {
  if (!document.pages || document.pages.length === 0) return 0;
  
  let totalConfidence = 0;
  let count = 0;

  for (const page of document.pages) {
    if (page.blocks) {
      for (const block of page.blocks) {
        if (block.layout?.confidence) {
          totalConfidence += block.layout.confidence;
          count++;
        }
      }
    }
  }

  return count > 0 ? (totalConfidence / count) : 0;
}