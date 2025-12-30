/**
 * Clean raw OCR text and make it human-readable
 */
const cleanOCRText = (rawText) => {
  if (!rawText) return '';

  let text = rawText;

  text = text.replace(/\s+/g, ' ');
  text = text.replace(/[^a-zA-Z0-9.,!? ]/g, '');
  text = text.trim();

  text = text.replace(/(^|[.!?]\s+)([a-z])/g, (m, p1, p2) =>
    p1 + p2.toUpperCase()
  );

  return text;
};

module.exports = { cleanOCRText };
