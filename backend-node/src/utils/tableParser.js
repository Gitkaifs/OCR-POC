/**
 * Convert table data to CSV format
 */
export const convertTableToCSV = (tableData) => {
  if (!tableData || !tableData.rows || tableData.rows.length === 0) {
    return '';
  }

  return tableData.rows
    .map(row => 
      row.map(cell => {
        // Escape quotes and wrap in quotes if needed
        const cleaned = String(cell).trim().replace(/"/g, '""');
        return cleaned.includes(',') || cleaned.includes('\n') 
          ? `"${cleaned}"` 
          : cleaned;
      }).join(',')
    )
    .join('\n');
};

/**
 * Convert multiple tables to CSV
 */
export const convertAllTablesToCSV = (tables) => {
  if (!tables || tables.length === 0) return '';
  
  return tables.map((table, idx) => {
    const csv = convertTableToCSV(table);
    return `Table ${idx + 1}\n${csv}`;
  }).join('\n\n');
};

/**
 * Clean and normalize cell data
 */
export const cleanCellData = (cell) => {
  let cleaned = String(cell).trim()
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .replace(/[""]/g, '"'); // Normalize quotes

  // Try to parse as number
  const num = parseFloat(cleaned);
  return isNaN(num) ? cleaned : num;
};

/**
 * Structure table with headers
 */
export const structureTableData = (table) => {
  if (!table.rows || table.rows.length === 0) return null;

  const headers = table.rows[0].map(h => String(h).trim());
  const dataRows = table.rows.slice(1);

  return dataRows.map(row => {
    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = cleanCellData(row[idx] || '');
    });
    return obj;
  });
};