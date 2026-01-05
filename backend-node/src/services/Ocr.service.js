import { processDocumentAI } from './documentAI.service.js';
import { structureTableData } from '../utils/tableParser.js';
import { convertTablesToExcel } from '../utils/excelGenerator.js';

/**
 * Process image and extract text and tables
 * @param {string} imagePath - Path to the uploaded image file
 * @returns {Promise<Object>} - Extracted data with text, tables, and Excel buffer
 */
export const processOCR = async (imagePath) => {
  try {
    console.log('Starting OCR processing for:', imagePath);
    
    // Process the document using Document AI
    const result = await processDocumentAI(imagePath);
    console.log('Document AI processing completed');
    console.log('Raw result:', JSON.stringify(result, null, 2));
    
    if (!result.tables || result.tables.length === 0) {
      console.warn('No tables found in the document');
      return {
        text: result.text || '',
        tables: [],
        excelBuffer: null,
        confidence: result.confidence || 0,
        tableCount: 0
      };
    }

    console.log(`Found ${result.tables.length} tables in document`);

    // Structure tables as JSON
    console.log('Structuring table data...');
    const structuredTables = result.tables.map((table, index) => {
      try {
        console.log(`\n--- Processing Table ${index + 1} ---`);
        console.log('Raw table data:', JSON.stringify(table, null, 2));
        
        const structured = structureTableData(table);
        
        console.log('Structured table data:', JSON.stringify(structured, null, 2));
        console.log(`Table ${index + 1} structured with ${structured.rows?.length || 0} rows`);
        
        return structured;
      } catch (error) {
        console.error(`Error processing table ${index + 1}:`, error);
        return { rows: [], error: error.message };
      }
    }).filter(table => table.rows && table.rows.length > 0);

    console.log(`\nValid structured tables: ${structuredTables.length}`);

    // Convert tables to Excel if we have valid tables
    let excelBuffer = null;
    if (structuredTables.length > 0) {
      try {
        console.log('Converting tables to Excel...');
        console.log('Tables being sent to Excel converter:', JSON.stringify(structuredTables, null, 2));
        
        excelBuffer = await convertTablesToExcel(structuredTables);
        
        if (excelBuffer) {
          console.log(`Excel conversion successful. Buffer size: ${excelBuffer.length} bytes`);
        } else {
          console.warn('Excel conversion returned null');
        }
      } catch (error) {
        console.error('Error converting tables to Excel:', error);
        console.error('Error stack:', error.stack);
        // Don't fail the whole process if Excel conversion fails
      }
    } else {
      console.warn('No valid structured tables to convert to Excel');
    }

    return {
      text: result.text || '',
      tables: structuredTables,
      excelBuffer: excelBuffer,
      confidence: result.confidence || 0,
      tableCount: structuredTables.length
    };

  } catch (error) {
    console.error('OCR Processing Error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      path: imagePath
    });
    throw new Error(`OCR_FAILED: ${error.message}`);
  }
};