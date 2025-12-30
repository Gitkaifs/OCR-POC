/**
 * OCR Processing Service
 * 
 * This module will be implemented by your colleague.
 * It should accept an image file path and return extracted text.
 * 
 * For now, this is a mock implementation for testing purposes.
 */

/**
 * Process image and extract text
 * @param {string} imagePath - Path to the uploaded image file
 * @returns {Promise<string>} - Extracted text from the image
 */
export const processOCR = async (imagePath) => {
  // Simulate OCR processing time
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Mock implementation - your colleague will replace this with actual OCR logic
  // Example: using Tesseract.js, Google Vision API, etc.
  
  // For testing: return mock text
  return "This is mock extracted text. Your colleague will implement actual OCR logic here.";
  
  // Actual implementation should:
  // 1. Read the image from imagePath
  // 2. Process it with an OCR library
  // 3. Return the extracted text
  // 4. Throw an error if image is unreadable
};