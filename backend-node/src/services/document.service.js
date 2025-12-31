import Document from '../models/document.model.js';
import DocumentContent from '../models/documentContent.model.js';
import {processOCR} from './Ocr.service.js';

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

  // 1. Create document entry (NO image binary)
  const document = await Document.create({
    imagePath,
    status: 'PROCESSING', // temporary internal state
    meta: {
      originalFileName,
      fileSize,
      mimeType
    }
  });

  try {
    // 2. Run OCR using local image
    const { rawText, cleanedText } = await processOCR(imagePath);

    // 3. Save OCR content
    await DocumentContent.create({
      documentId: document._id,
      rawText,
      cleanedText
    });

    // 4. Update document status
    document.extractedText = cleanedText;
    document.status = 'SUCCESS';
    await document.save();

    return {
      documentId: document._id,
      status: document.status
    };

  } catch (error) {
    // 5. Failure case
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
    .select('status extractedText createdAt')
    .sort({ createdAt: -1 });
};

/**
 * Single document with OCR content
 */
export const getDocumentById = async (documentId) => {
  const document = await Document.findById(documentId);
  if (!document) return null;

  const content = await DocumentContent.findOne({ documentId });

  return {
    document,
    content
  };
};
