import { processDocumentAI } from './documentAI.service.js';
import { convertAllTablesToCSV, structureTableData } from '../utils/tableParser.js';

/**
 * Process image and extract text and tables
 * @param {string} imagePath - Path to the uploaded image file
 * @returns {Promise<Object>} - Extracted data
 */
export const processOCR = async (imagePath) => {
  try {
    const result = await processDocumentAI(imagePath);
    
    // Convert tables to CSV
    const csvData = convertAllTablesToCSV(result.tables);
    
    // Structure tables as JSON
    const structuredTables = result.tables.map(table => 
      structureTableData(table)
    );

    return {
      text: result.text,
      tables: structuredTables,
      csvData: csvData,
      confidence: result.confidence,
      tableCount: result.tables.length
    };
  } catch (error) {
    console.error("OCR Error:", error.message);
    throw new Error("OCR_FAILED");
  }
};