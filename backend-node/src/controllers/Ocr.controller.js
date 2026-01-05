import { processOCR } from '../services/Ocr.service.js';
import { imgUrlConverter } from '../utils/helpingFunctions.js';
import { saveDocument, getAllDocuments } from '../services/document.service.js';
import { saveExcelToFile } from '../utils/excelGenerator.js';
import fs from 'fs/promises';
import path from 'path';

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file provided'
      });
    }

    const imagePath = req.file.path;
    console.log('Processing image:', imagePath);
    
    const extractedData = await processOCR(imagePath);
    console.log('OCR processing completed, saving files...');

    // Create outputs folder if it doesn't exist
    const outputDir = 'outputs';
    await fs.mkdir(outputDir, { recursive: true });

    // Get base filename without extension
    const baseName = path.parse(req.file.filename).name;
    const timestamp = Date.now();
    const outputBaseName = `${baseName}-${timestamp}`;

    // Save Excel file if we have data
    let excelUrl = null;
    if (extractedData.excelBuffer) {
      const excelFilename = `${outputBaseName}.xlsx`;
      const excelPath = path.join(outputDir, excelFilename);
      await saveExcelToFile(extractedData.excelBuffer, excelPath);
      excelUrl = `/api/outputs/${excelFilename}`;
    }

    // Save JSON file
    const jsonFilename = `${outputBaseName}.json`;
    const jsonPath = path.join(outputDir, jsonFilename);
    await fs.writeFile(jsonPath, JSON.stringify({
      text: extractedData.text,
      tables: extractedData.tables,
      confidence: extractedData.confidence,
      tableCount: extractedData.tableCount
    }, null, 2));

    // Save to database with file paths
    await saveDocument(
      imgUrlConverter(imagePath),
      {
        text: extractedData.text,
        tables: extractedData.tables,
        confidence: extractedData.confidence,
        tableCount: extractedData.tableCount
      },
      excelUrl ? `/outputs/${outputBaseName}.xlsx` : null,
      `/outputs/${jsonFilename}`
    );

    return res.status(200).json({
      message: 'Image processed successfully',
      data: {
        excelUrl,
        jsonUrl: `/api/outputs/${jsonFilename}`,
        confidence: extractedData.confidence,
        tableCount: extractedData.tableCount,
        hasTables: extractedData.tableCount > 0
      }
    });

  } catch (error) {
    console.error('Error processing image:', error);
    return res.status(500).json({
      error: 'Failed to process image',
      details: error.message,
      code: error.code
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const documents = await getAllDocuments();
    return res.status(200).json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({
      error: 'Failed to fetch documents',
      details: error.message
    });
  }
};