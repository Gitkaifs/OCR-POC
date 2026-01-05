import ExcelJS from 'exceljs';

/**
 * Convert table data to Excel format
 * @param {Array} tables - Array of tables to convert to Excel
 * @returns {Promise<Buffer>} - Excel file as buffer
 */
export const convertTablesToExcel = async (tables) => {
  console.log('Starting Excel conversion...');
  console.log('Received tables:', JSON.stringify(tables, null, 2));
  
  if (!tables || tables.length === 0) {
    console.warn('No tables provided for Excel generation');
    return null;
  }

  // Filter out empty tables
  const validTables = tables.filter(table => {
    const isValid = table && table.rows && Array.isArray(table.rows) && table.rows.length > 0;
    if (!isValid) {
      console.warn('Invalid table filtered out:', table);
    }
    return isValid;
  });

  console.log(`Valid tables after filtering: ${validTables.length}`);

  if (validTables.length === 0) {
    console.warn('No valid table data provided for Excel generation after filtering');
    return null;
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'OCR-POC';
  workbook.created = new Date();

  // Create a worksheet for each table
  validTables.forEach((table, index) => {
    try {
      console.log(`\n--- Creating worksheet for Table ${index + 1} ---`);
      console.log(`Table has ${table.rows.length} rows`);
      
      const worksheet = workbook.addWorksheet(`Table ${index + 1}`);
      
      if (table.rows && table.rows.length > 0) {
        // Add header row with bold style
        if (table.rows[0] && Array.isArray(table.rows[0])) {
          console.log('Adding header row:', table.rows[0]);
          const headerRow = worksheet.addRow(table.rows[0]);
          headerRow.font = { bold: true };
          headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
          };
          
          // Add data rows
          const dataRows = table.rows.slice(1);
          console.log(`Adding ${dataRows.length} data rows`);
          
          dataRows.forEach((rowData, rowIndex) => {
            if (rowData && Array.isArray(rowData) && rowData.length > 0) {
              console.log(`Adding row ${rowIndex + 1}:`, rowData);
              worksheet.addRow(rowData);
            } else {
              console.warn(`Skipping invalid row ${rowIndex + 1}:`, rowData);
            }
          });

          // Auto-fit columns
          worksheet.columns.forEach((column, colIndex) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, cell => {
              const value = cell.value ? cell.value.toString() : '';
              const columnLength = value.length;
              if (columnLength > maxLength) {
                maxLength = columnLength;
              }
            });
            const width = Math.min(Math.max(maxLength + 2, 10), 50);
            column.width = width;
            console.log(`Column ${colIndex + 1} width set to: ${width}`);
          });

          // Add borders to all cells
          worksheet.eachRow({ includeEmpty: false }, (row) => {
            row.eachCell({ includeEmpty: false }, (cell) => {
              cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              };
            });
          });

          console.log(`Worksheet "${worksheet.name}" created successfully with ${worksheet.rowCount} rows`);
        } else {
          console.warn(`Table ${index + 1} has invalid header row:`, table.rows[0]);
        }
      } else {
        console.warn(`Table ${index + 1} has no rows`);
      }
    } catch (error) {
      console.error(`Error processing table ${index + 1} for Excel:`, error);
      console.error('Error stack:', error.stack);
    }
  });

  // If no valid worksheets were created, return null
  if (workbook.worksheets.length === 0) {
    console.warn('No valid worksheets were created');
    return null;
  }

  console.log(`\nTotal worksheets created: ${workbook.worksheets.length}`);

  try {
    // Generate Excel file buffer
    console.log('Generating Excel buffer...');
    const buffer = await workbook.xlsx.writeBuffer();
    console.log(`Excel buffer generated successfully. Size: ${buffer.length} bytes`);
    return buffer;
  } catch (error) {
    console.error('Error generating Excel buffer:', error);
    console.error('Error stack:', error.stack);
    return null;
  }
};

/**
 * Save Excel buffer to file
 * @param {Buffer} excelBuffer - Excel file buffer
 * @param {string} filePath - Path to save the Excel file
 */
export const saveExcelToFile = async (excelBuffer, filePath) => {
  if (!excelBuffer) {
    console.warn('No Excel buffer provided, skipping file save');
    return;
  }

  try {
    const fs = await import('fs/promises');
    await fs.writeFile(filePath, excelBuffer);
    console.log(`Excel file saved successfully to ${filePath}`);
  } catch (error) {
    console.error('Error saving Excel file:', error);
    throw error;
  }
};