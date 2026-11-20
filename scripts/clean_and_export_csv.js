const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const srcPath = 'C:/Users/ADMIN/.gemini/antigravity/brain/3edbe145-7eeb-411b-adfa-b6d5919942ba/.user_uploaded/media_1795159246749_e9be18e9.csv';
const content = fs.readFileSync(srcPath, 'utf8');

// Robust RFC-4180 CSV parser
function parseCSV(text) {
  const rows = [];
  let row = [''];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (c === '"' && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        row[row.length - 1] += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push('');
      } else if (c === '\r' || c === '\n') {
        if (c === '\r' && next === '\n') i++;
        if (row.length > 1 || row[0] !== '') rows.push(row);
        row = [''];
      } else {
        row[row.length - 1] += c;
      }
    }
  }
  if (row.length > 1 || row[0] !== '') rows.push(row);
  return rows;
}

const parsed = parseCSV(content);
const rawHeaders = parsed[0];
const headers = rawHeaders.map(h => h.replace(/^\uFEFF/, '').trim());
console.log('Headers:', headers);
console.log('Total rows parsed:', parsed.length - 1);

function cleanText(str) {
  if (!str) return '';
  return str
    .replace(/(\d+(?:\.\d+)?)\s*""/g, '$1 Inch')
    .replace(/(\d+(?:\.\d+)?)\s*"/g, '$1 Inch')
    .replace(/(\d+\/\d+)\s*""/g, '$1 Inch')
    .replace(/(\d+\/\d+)\s*"/g, '$1 Inch')
    .replace(/""/g, '')
    .replace(/"/g, '')
    .trim();
}

function escapeCsvField(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

const brandCol = headers.indexOf('Brand');
const nameCol = headers.indexOf('ProductName');
const catCol = headers.indexOf('Category');
const packCol = headers.indexOf('PackSize');
const descCol = headers.indexOf('Description');

const cleanedRows = [];
for (let i = 1; i < parsed.length; i++) {
  const row = parsed[i];
  const cleaned = [...row];
  cleaned[nameCol] = cleanText(row[nameCol]);
  cleaned[packCol] = cleanText(row[packCol]);
  cleaned[descCol] = cleanText(row[descCol]);
  cleanedRows.push(cleaned);
}

// Build standard CSV
const csvLines = [];
csvLines.push(headers.join(','));
for (const row of cleanedRows) {
  csvLines.push(row.map(val => escapeCsvField(val)).join(','));
}

const finalCsvContent = csvLines.join('\r\n');

// Save to paths:
const rootCsv = path.join(__dirname, '..', 'all_products_bulk_upload.csv');
const publicCsv = path.join(__dirname, '..', 'public', 'all_products_bulk_upload.csv');
const catalogCsv = path.join(__dirname, '..', 'SODA_POP_COLOURS_Product_Catalog.csv');
const brainCsv = 'C:/Users/ADMIN/.gemini/antigravity/brain/3edbe145-7eeb-411b-adfa-b6d5919942ba/all_products_bulk_upload.csv';

fs.writeFileSync(rootCsv, finalCsvContent, 'utf8');
fs.writeFileSync(publicCsv, finalCsvContent, 'utf8');
fs.writeFileSync(catalogCsv, finalCsvContent, 'utf8');
fs.writeFileSync(brainCsv, finalCsvContent, 'utf8');

console.log('Saved clean CSV to:');
console.log(' -', rootCsv);
console.log(' -', publicCsv);
console.log(' -', catalogCsv);
console.log(' -', brainCsv);

// Now also insert into SQLite DB using robust ON CONFLICT
const dbPath = path.join(__dirname, '..', 'data', 'paint_store.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Clean wipe so DB has exactly the 785 items
db.prepare('DELETE FROM product_pack_sizes').run();
db.prepare('DELETE FROM products').run();

const insertBrand = db.prepare(`
  INSERT INTO brands (id, name) VALUES (?, ?)
  ON CONFLICT(id) DO NOTHING
`);

const insertCat = db.prepare(`
  INSERT INTO categories (id, name, icon_name) VALUES (?, ?, 'Folder')
  ON CONFLICT(id) DO NOTHING
`);

const insertProd = db.prepare(`
  INSERT INTO products (id, brand, name, category, hsn_code, default_tax_rate, description, is_active)
  VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  ON CONFLICT(id) DO UPDATE SET
    brand = excluded.brand,
    name = excluded.name,
    category = excluded.category,
    hsn_code = excluded.hsn_code,
    default_tax_rate = excluded.default_tax_rate,
    description = excluded.description
`);

const insertPack = db.prepare(`
  INSERT INTO product_pack_sizes (
    id, product_id, pack_size, barcode, mrp, retail_price, contractor_price, wholesale_price, cost_price, stock_qty, min_stock_alert
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    pack_size = excluded.pack_size,
    barcode = excluded.barcode,
    mrp = excluded.mrp,
    retail_price = excluded.retail_price,
    contractor_price = excluded.contractor_price,
    wholesale_price = excluded.wholesale_price,
    cost_price = excluded.cost_price,
    stock_qty = excluded.stock_qty,
    min_stock_alert = excluded.min_stock_alert
`);

let insertedProds = 0;
let insertedPacks = 0;

const tx = db.transaction(() => {
  for (const row of cleanedRows) {
    const rowObj = {};
    headers.forEach((h, idx) => {
      rowObj[h] = row[idx];
    });

    const brand = (rowObj.Brand || 'Generic').trim();
    const name = (rowObj.ProductName || '').trim();
    const category = (rowObj.Category || 'Hardware & Tools').trim();
    const hsn = (rowObj.HSNCode || '3209').trim();
    const taxRate = parseFloat(rowObj.TaxRate || '18') || 18;
    const description = (rowObj.Description || '').trim();

    if (!name) continue;

    const brandId = `brand_${brand.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    insertBrand.run(brandId, brand);

    const catId = `cat_${category.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    insertCat.run(catId, category);

    const prodId = `prod_${brand.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    insertProd.run(prodId, brand, name, category, hsn, taxRate, description);
    insertedProds++;

    const packSize = (rowObj.PackSize || '1 Pc').trim();
    const costPrice = parseFloat(rowObj.CostPrice || '0') || 0;
    const retailPrice = parseFloat(rowObj.RetailPrice || '0') || Math.round(costPrice * 1.22);
    const contractorPrice = parseFloat(rowObj.ContractorPrice || '0') || Math.round(costPrice * 1.10);
    const wholesalePrice = parseFloat(rowObj.WholesalePrice || '0') || Math.round(costPrice * 1.06);
    const mrp = parseFloat(rowObj.MRP || '0') || Math.round(costPrice * 1.35);
    const barcode = (rowObj.Barcode || '').trim() || `89088${Math.floor(10000000 + Math.random() * 90000000)}`;
    const stockQty = parseFloat(rowObj.StockQty || '20') || 20;
    const minAlert = parseFloat(rowObj.MinStockAlert || '3') || 3;

    const packId = `pk_${prodId}_${packSize.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    insertPack.run(
      packId,
      prodId,
      packSize,
      barcode,
      mrp,
      retailPrice,
      contractorPrice,
      wholesalePrice,
      costPrice,
      stockQty,
      minAlert
    );
    insertedPacks++;
  }
});

tx();

console.log(`\n✅ Database populated with ${insertedProds} products and ${insertedPacks} pack rows!`);

const dbProdCount = db.prepare('SELECT count(*) as c FROM products').get().c;
const dbPackCount = db.prepare('SELECT count(*) as c FROM product_pack_sizes').get().c;
console.log(`Current DB totals: ${dbProdCount} unique products, ${dbPackCount} unique pack sizes.`);
