import { processOCR } from '../services/Ocr.service.js';
import { imgUrlConverter } from '../utils/helpingFunctions.js';
import { saveDocument, getAllDocuments } from '../services/document.service.js';
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
    
    // Create outputs folder
    const outputDir = 'outputs';
    await fs.mkdir(outputDir, { recursive: true });

    // Get base filename without extension
    const baseName = path.parse(req.file.filename).name;

    // Define Excel output path
    const excelPath = path.join(outputDir, `${baseName}.xlsx`);

    // Process OCR and generate Excel
    const extractedData = await processOCR(imagePath, excelPath);

    // Save JSON file
    const jsonPath = path.join(outputDir, `${baseName}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(extractedData, null, 2));

    // Save to database with file paths
    await saveDocument(
      imgUrlConverter(imagePath),
      extractedData,
      `/outputs/${baseName}.xlsx`,
      `/outputs/${baseName}.json`
    );

    return res.status(200).json({
      message: 'Image processed successfully',
      data: {
        confidence: extractedData.confidence,
        tableCount: extractedData.tableCount,
        excelPath: `/api/outputs/${baseName}.xlsx`,
        jsonPath: `/api/outputs/${baseName}.json`
      }
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Failed to process image',
      details: error.message
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const database = await getAllDocuments();

    res.status(200).json({
      allData: database,
      message: "All data fetched from DB."
    });
  } catch (err) {
    res.status(404).json({
      message: "Data not found.",
      errorMsg: err.message
    });
  }
};