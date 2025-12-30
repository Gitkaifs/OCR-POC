// test-ocr.js (TEMP FILE)

const { runOCR } = require("./ocr.service");

(async () => {
  try {
    const text = await runOCR("./image.jpg");
    console.log("Extracted text:");
    console.log(text);
    console.log("\n--- End of text ---");
  } catch (error) {
    console.error("Error:", error.message);
  }
})();
