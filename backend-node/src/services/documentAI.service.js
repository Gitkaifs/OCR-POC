import dotenv from 'dotenv';
dotenv.config();

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Process image using Claude Vision API (replaces Google Document AI)
 * @param {string} imagePath - Path to the uploaded image
 * @returns {Promise<Object>} - Extracted text and tables
 */
export const processDocumentAI = async (imagePath) => {
  try {
    await fs.access(imagePath);
    const imageFile = await fs.readFile(imagePath);
    const encodedImage = Buffer.from(imageFile).toString('base64');

    // Determine MIME type
    const ext = path.extname(imagePath).toLowerCase();
    const mimeTypeMap = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.gif': 'image/gif'
    };
    const mimeType = mimeTypeMap[ext] || 'image/jpeg';

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType,
              data: encodedImage
            }
          },
          {
            type: 'text',
           text: `Extract this construction measurement form table into JSON.

STRICT RULES:
1. FIRST ROW MUST BE HEADERS (even if not clearly visible):
   ["No.", "Description of work or Material", "No.", "Length", "Breadth", "Height", "Quantity", "Remarks"]

2. Extract all data rows with exactly 8 columns:
   - Column 1 (No.): Only A-Z letters or numbers (e.g., "A", "B", "1", "2")
   - Column 2 (Description): Any construction-related text
   - Column 3 (No.): Only numbers are 1 or -1
   - Column 4 (Length): Only numbers with feet-inch format (e.g., "6-4", "3.5") or decimals
   - Column 5 (Breadth): Only numbers with feet-inch format or decimals
   - Column 6 (Height): Only numbers with feet-inch format or decimals
   - Column 7 (Quantity): Only decimal numbers, can be negative (e.g., "308.808", "-4.812")
   - Column 8 (Remarks): Any text

3. Data spanning any 2 columns - should be placed in LEFT column between those 2
4. If text doesn't match column rules - use empty string ""
5. Unreadable text - use empty string ""
6. English language only

Format: {"tables": [{"rows": [
  ["No.", "Description of work or Material", "No.", "Length", "Breadth", "Height", "Quantity", "Remarks"],
  [data_row_1],
  [data_row_2],
  ...
]}]}

Return ONLY valid JSON.`
          }
        ]
      }]
    });

    // Parse Claude response
    const responseText = message.content[0].text;
    let jsonData;
    
    try {
      // Remove markdown code blocks if present
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       responseText.match(/```\s*([\s\S]*?)\s*```/);
      
      const jsonStr = jsonMatch ? jsonMatch[1] : responseText;
      jsonData = JSON.parse(jsonStr.trim());
    } catch (error) {
      console.error('Failed to parse Claude response:', responseText);
      throw new Error('CLAUDE_PARSE_FAILED');
    }

    // Transform to existing format
    const tables = extractTables(jsonData);
    
    return {
      text: '', // Claude focuses on structured data
      tables: tables,
      confidence: 0.85 // Claude doesn't provide confidence scores
    };

  } catch (error) {
    console.error('Document AI Error:', error.message);
    throw new Error('DOCUMENT_AI_FAILED');
  }
};

/**
 * Extract tables from Claude JSON response
 */
function extractTables(jsonData) {
  if (!jsonData.tables || jsonData.tables.length === 0) {
    return [];
  }

  return jsonData.tables.map(table => ({
    rows: table.rows || [],
    confidence: 0.85
  }));
}