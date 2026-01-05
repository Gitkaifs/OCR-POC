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
  if (cell === null || cell === undefined) return '';
  
  let cleaned = String(cell).trim()
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .replace(/[""]/g, '"'); // Normalize quotes

  // Try to parse as number
  const num = parseFloat(cleaned);
  return isNaN(num) ? cleaned : num;
};

/**
 * Structure table data - returns array format for Excel
 */
export const structureTableData = (table) => {
  if (!table || !table.rows || table.rows.length === 0) {
    console.warn('Invalid table data provided to structureTableData');
    return { rows: [] };
  }

  // Clean and return rows as arrays (preserving original structure for Excel)
  const cleanedRows = table.rows.map(row => {
    if (!Array.isArray(row)) {
      console.warn('Row is not an array:', row);
      return [];
    }
    return row.map(cell => cleanCellData(cell));
  });

  console.log(`Structured table with ${cleanedRows.length} rows`);
  
  return {
    rows: cleanedRows
  };
};

/**
 * Structure table as objects with headers (for JSON output)
 */
export const structureTableDataAsObjects = (table) => {
  if (!table || !table.rows || table.rows.length === 0) {
    return [];
  }

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