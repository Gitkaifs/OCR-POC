const Tesseract = require("tesseract.js");
const fs = require("fs").promises;

async function runOCR(filePath) {
  try {
    await fs.access(filePath);

    const result = await Tesseract.recognize(
      filePath,
      "eng",
      {
        logger: () => {}
      }
    );

    return result.data.text;
  } catch (error) {
    console.error("OCR Error:", error.message);
    throw new Error("OCR_FAILED");
  }
}

module.exports = { runOCR };
