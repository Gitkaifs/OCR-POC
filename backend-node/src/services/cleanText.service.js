

const readline = require('readline');

/**
 * Clean raw OCR text and make it human-readable
 * @param {string} rawText
 * @returns {string} cleaned and formatted text
 */
const cleanOCRText = (rawText) => {
  if (!rawText) return '';

  let text = rawText;

  // 1. Replace multiple spaces, tabs, or new lines with a single space
  text = text.replace(/\s+/g, ' ');

  // 2. Remove unwanted characters but keep letters, numbers, and punctuation
  text = text.replace(/[^a-zA-Z0-9.,!? \n]/g, '');

  // 3. Normalize line breaks: remove extra empty lines
  text = text.replace(/\n\s*\n/g, '\n');

  // 4. Trim extra spaces
  text = text.trim();

  // 5. Capitalize first letter of each sentence
  text = text.replace(/(^|[.!?]\s+)([a-z])/g, (match, p1, p2) =>
    p1 + p2.toUpperCase()
  );

  return text;
};

/**
 * Interactive function to take input from user and print cleaned OCR text
 */
const startInteractiveClean = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter the OCR text to clean:\n', (inputText) => {
    const cleaned = cleanOCRText(inputText);

    console.log('\n===== Cleaned OCR Text =====\n');
    console.log(cleaned);

    rl.close();
  });
};

// Export functions
module.exports = {
  cleanOCRText,
  startInteractiveClean
};

// If this file is run directly, start interactive mode
if (require.main === module) {
  startInteractiveClean();
}
