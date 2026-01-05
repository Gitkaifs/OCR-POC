import Document from '../models/document.model.js';
import { processOCR } from './Ocr.service.js';

/**
 * Main OCR flow
 * - imagePath comes from multer (uploads folder)
 * - image is NOT stored in DB
 */
export const processDocument = async ({
  imagePath,
  originalFileName,
  fileSize,
  mimeType
}) => {

  const document = await Document.create({
    imagePath,
    status: 'PROCESSING',
    meta: {
      originalFileName,
      fileSize,
      mimeType
    }
  });

  try {
    const { rawText, cleanedText } = await processOCR(imagePath);

    document.extractedText = cleanedText;
    document.status = 'SUCCESS';
    await document.save();

    return {
      documentId: document._id,
      status: document.status
    };

  } catch (error) {
    document.status = 'FAILURE';
    await document.save();
    throw error;
  }
};

/**
 * List documents (for "My Docs" screen)
 */
export const getAllDocuments = async () => {
  return Document.find()
    .select('imagePath excelPath jsonPath extractedText confidence tableCount createdAt')
    .sort({ createdAt: -1 });
};

/**
 * Single document with OCR content
 */
export const getDocumentById = async (documentId) => {
  const document = await Document.findById(documentId);
  if (!document) return null;

  return {
    document
  };
};

/**
 * Save document with Excel path
 */
export const saveDocument = async (imagePath, extractedData, excelPath, jsonPath) => {
  const document = await Document.create({
    imagePath,
    excelPath,
    jsonPath,
    extractedText: extractedData.text,
    tables: extractedData.tables,
    confidence: extractedData.confidence,
    tableCount: extractedData.tableCount
  });

  return document;
};