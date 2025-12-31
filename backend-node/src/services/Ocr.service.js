
// const Tesseract = require("tesseract.js");
import Tesseract from "tesseract.js";
// const fs = require("fs").promises;
import fs from 'fs/promises';

/**
 * Process image and extract text
 * @param {string} imagePath - Path to the uploaded image file
 * @returns {Promise<string>} - Extracted text from the image
 */
export const processOCR = async (imagePath) => {
  try {
    await fs.access(imagePath);

    const result = await Tesseract.recognize(
      imagePath,
      "eng",
      {
        logger: () => {}, // disable logs
        tessedit_pageseg_mode: 6,
        preserve_interword_spaces: 1
      }
    );

    return result.data.text; // Return the extracted text
  } catch (error) {
    console.error("OCR Error:", error.message);
    throw new Error("OCR_FAILED");
  }
};
