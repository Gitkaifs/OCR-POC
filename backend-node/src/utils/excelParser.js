import ExcelJS from 'exceljs';

/**
 * Convert table data to Excel format
 * @param {Array} tables - Array of table objects with rows
 * @param {string} outputPath - Path to save the Excel file
 * @returns {Promise<string>} - Path to the created Excel file
 */
export const convertTablesToExcel = async (tables, outputPath) => {
  const workbook = new ExcelJS.Workbook();

  if (!tables || tables.length === 0) {
    // Create empty sheet if no tables
    const sheet = workbook.addWorksheet('Sheet1');
    sheet.getCell('A1').value = 'No tables found';
    await workbook.xlsx.writeFile(outputPath);
    return outputPath;
  }

  // Create a sheet for each table
  tables.forEach((table, tableIndex) => {
    if (!table.rows || table.rows.length === 0) return;

    const sheetName = tables.length === 1 ? 'Data' : `Table ${tableIndex + 1}`;
    const sheet = workbook.addWorksheet(sheetName);

    // Add rows to sheet
    table.rows.forEach((row, rowIndex) => {
      const excelRow = sheet.addRow(row);
      
      // Style header row
      if (rowIndex === 0) {
        excelRow.font = { bold: true };
        excelRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
        excelRow.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });

    // Auto-fit columns
    sheet.columns.forEach((column, colIndex) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : '';
        maxLength = Math.max(maxLength, cellValue.length);
      });
      column.width = Math.min(Math.max(maxLength + 2, 10), 50);
    });

    // Add borders to all cells with data
    const lastRow = sheet.rowCount;
    const lastCol = table.rows[0]?.length || 1;
    
    for (let row = 1; row <= lastRow; row++) {
      for (let col = 1; col <= lastCol; col++) {
        const cell = sheet.getCell(row, col);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    }
  });

  await workbook.xlsx.writeFile(outputPath);
  return outputPath;
};

/**
 * Convert structured table data (with headers as keys) to Excel
 * @param {Array} structuredTables - Array of structured table data
 * @param {string} outputPath - Path to save the Excel file
 * @returns {Promise<string>} - Path to the created Excel file
 */
export const convertStructuredTablesToExcel = async (structuredTables, outputPath) => {
  const workbook = new ExcelJS.Workbook();

  if (!structuredTables || structuredTables.length === 0) {
    const sheet = workbook.addWorksheet('Sheet1');
    sheet.getCell('A1').value = 'No data found';
    await workbook.xlsx.writeFile(outputPath);
    return outputPath;
  }

  structuredTables.forEach((tableData, tableIndex) => {
    if (!tableData || tableData.length === 0) return;

    const sheetName = structuredTables.length === 1 ? 'Data' : `Table ${tableIndex + 1}`;
    const sheet = workbook.addWorksheet(sheetName);

    // Extract headers from first row
    const headers = Object.keys(tableData[0]);
    
    // Add header row
    const headerRow = sheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // Add data rows
    tableData.forEach(rowObj => {
      const rowValues = headers.map(header => rowObj[header] || '');
      sheet.addRow(rowValues);
    });

    // Auto-fit columns
    sheet.columns.forEach((column, colIndex) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : '';
        maxLength = Math.max(maxLength, cellValue.length);
      });
      column.width = Math.min(Math.max(maxLength + 2, 10), 50);
    });

    // Add borders
    const lastRow = sheet.rowCount;
    const lastCol = headers.length;
    
    for (let row = 1; row <= lastRow; row++) {
      for (let col = 1; col <= lastCol; col++) {
        const cell = sheet.getCell(row, col);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    }
  });

  await workbook.xlsx.writeFile(outputPath);
  return outputPath;
};