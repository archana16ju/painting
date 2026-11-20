const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'paint_store.db');
const db = new Database(dbPath);

console.log('Reading database from:', dbPath);

const rows = db.prepare(`
  SELECT 
    p.brand AS Brand,
    p.name AS ProductName,
    p.category AS Category,
    pk.pack_size AS PackSize,
    pk.cost_price AS CostPrice,
    pk.retail_price AS RetailPrice,
    pk.contractor_price AS ContractorPrice,
    pk.wholesale_price AS WholesalePrice,
    pk.mrp AS MRP,
    p.hsn_code AS HSNCode,
    p.default_tax_rate AS TaxRate,
    pk.stock_qty AS StockQty,
    pk.min_stock_alert AS MinStockAlert,
    pk.barcode AS Barcode,
    p.description AS Description
  FROM products p
  JOIN product_pack_sizes pk ON p.id = pk.product_id
  WHERE p.is_active = 1
  ORDER BY p.brand ASC, p.category ASC, p.name ASC, pk.cost_price ASC
`).all();

console.log(`Retrieved ${rows.length} product SKU rows.`);

const headers = [
  'Brand',
  'ProductName',
  'Category',
  'PackSize',
  'CostPrice',
  'RetailPrice',
  'ContractorPrice',
  'WholesalePrice',
  'MRP',
  'HSNCode',
  'TaxRate',
  'StockQty',
  'MinStockAlert',
  'Barcode',
  'Description'
];

function escapeCsvField(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

const csvLines = [];
csvLines.push(headers.join(','));

for (const row of rows) {
  const line = headers.map(h => escapeCsvField(row[h])).join(',');
  csvLines.push(line);
}

const csvContent = '\uFEFF' + csvLines.join('\r\n'); // Include UTF-8 BOM so Excel opens it with proper encoding

// 1. Save in project root
const rootCsvPath = path.join(__dirname, '..', 'SODA_POP_COLOURS_Product_Catalog.csv');
fs.writeFileSync(rootCsvPath, csvContent, 'utf8');
console.log('Saved to root:', rootCsvPath);

// 2. Save in public directory so it can be downloaded via browser link
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
const publicCsvPath = path.join(publicDir, 'SODA_POP_COLOURS_Product_Catalog.csv');
fs.writeFileSync(publicCsvPath, csvContent, 'utf8');
console.log('Saved to public directory:', publicCsvPath);

console.log('\n✅ Successfully generated CSV catalog with', rows.length, 'items!');
