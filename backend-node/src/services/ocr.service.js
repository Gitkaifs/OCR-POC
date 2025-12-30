const Tesseract = require("tesseract.js");
const fs = require("fs").promises;

/**
 * Run OCR and return RAW text
 */
async function runOCR(filePath) {
  try {
    await fs.access(filePath);

    const result = await Tesseract.recognize(
      filePath,
      "eng",
      {
        logger: () => {}, // disable logs
        tessedit_pageseg_mode: 6,
        preserve_interword_spaces: 1
      }
    );

    return result.data.text; // RAW TEXT ONLY
  } catch (error) {
    console.error("OCR Error:", error.message);
    throw new Error("OCR_FAILED");
  }
}

module.exports = { runOCR };
