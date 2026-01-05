import { processDocumentAI } from './documentAI.service.js';
import { structureTableData } from '../utils/tableParser.js';
import { convertTablesToExcel } from '../utils/excelParser.js';

/**
 * Process image and extract text and tables
 * @param {string} imagePath - Path to the uploaded image file
 * @param {string} excelOutputPath - Path to save the Excel file
 * @returns {Promise<Object>} - Extracted data
 */
export const processOCR = async (imagePath, excelOutputPath) => {
  try {
    const result = await processDocumentAI(imagePath);
    
    // Convert tables to Excel
    await convertTablesToExcel(result.tables, excelOutputPath);
    
    // Structure tables as JSON
    const structuredTables = result.tables.map(table => 
      structureTableData(table)
    );

    return {
      text: result.text,
      tables: structuredTables,
      confidence: result.confidence,
      tableCount: result.tables.length
    };
  } catch (error) {
    console.error("OCR Error:", error.message);
    throw new Error("OCR_FAILED");
  }
};