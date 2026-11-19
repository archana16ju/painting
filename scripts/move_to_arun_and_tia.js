const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'paint_store.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

console.log('Opened database at:', dbPath);

// Ensure brand 'Arun & Tia' is in brands
const existingBrand = db.prepare('SELECT * FROM brands WHERE LOWER(name) = LOWER(?)').get('Arun & Tia');
if (!existingBrand) {
  db.prepare('INSERT INTO brands (id, name) VALUES (?, ?)').run('brand_arun_tia', 'Arun & Tia');
  console.log('Created brand Arun & Tia');
} else {
  console.log('Brand Arun & Tia already exists:', existingBrand);
}

// Move existing Duke Gold & Asmaco products to Arun & Tia
const moveStmt = db.prepare("UPDATE products SET brand = 'Arun & Tia' WHERE brand IN ('Duke Gold', 'Asmaco')");
const moveResult = moveStmt.run();
console.log(`Updated ${moveResult.changes} products to brand 'Arun & Tia'`);

// Delete Duke Gold and Asmaco from brands table
db.prepare("DELETE FROM brands WHERE name IN ('Duke Gold', 'Asmaco')").run();
console.log('Removed Duke Gold and Asmaco from brands table');

// Helper to calculate pricing
function makePack(prodId, size, dlPrice, barcode, stock = 25) {
  const cost = Number(dlPrice);
  const contractor = Math.round(cost * 1.10);
  const retail = Math.round(cost * 1.22);
  const wholesale = Math.round(cost * 1.06);
  const mrp = Math.round(cost * 1.35);

  return {
    id: `pk_${prodId}_${size.replace(/[^a-zA-Z0-9]/g, '_')}`,
    productId: prodId,
    packSize: size,
    barcode: barcode || `89088${Math.floor(10000000 + Math.random() * 90000000)}`,
    mrp,
    retailPrice: retail,
    contractorPrice: contractor,
    wholesalePrice: wholesale,
    costPrice: cost,
    stockQty: stock,
    minStockAlert: 3,
  };
}

const insertProduct = db.prepare(`
  INSERT OR REPLACE INTO products (id, brand, name, category, hsn_code, default_tax_rate, description, is_active)
  VALUES (?, 'Arun & Tia', ?, ?, ?, 18.0, ?, 1)
`);

const insertPack = db.prepare(`
  INSERT OR REPLACE INTO product_pack_sizes (
    id, product_id, pack_size, barcode, mrp, retail_price, contractor_price, wholesale_price, cost_price, stock_qty, min_stock_alert
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// All 140 numbered items from the Arun Brush & Tia Rollers PDF:
const allArunTiaItems = [
  // Page 1: Brushes
  { id: 'arun_b_1', name: 'Brush Arun 1"', cat: 'Hardware & Tools', hsn: '9603', size: '1"', dl: 48.15 },
  { id: 'arun_b_2', name: 'Brush Arun 2"', cat: 'Hardware & Tools', hsn: '9603', size: '2"', dl: 97.27 },
  { id: 'arun_b_25', name: 'Brush Arun 2.5"', cat: 'Hardware & Tools', hsn: '9603', size: '2.5"', dl: 116.25 },
  { id: 'arun_b_3', name: 'Brush Arun 3"', cat: 'Hardware & Tools', hsn: '9603', size: '3"', dl: 134.40 },
  { id: 'arun_b_4', name: 'Brush Arun 4"', cat: 'Hardware & Tools', hsn: '9603', size: '4"', dl: 199.83 },

  // Page 1: Rollers with Handle
  { id: 'tia_t0001', name: 'Roller Tia T0001 (Interior Roller)', cat: 'Hardware & Tools', hsn: '9603', size: '1 Pc', dl: 147.37 },
  { id: 'tia_t0001a', name: 'Roller Tia T0001A (Interior Roller)', cat: 'Hardware & Tools', hsn: '9603', size: '1 Pc', dl: 158.30 },
  { id: 'tia_t0007', name: 'Roller Tia T0007 (Exterior Roller)', cat: 'Hardware & Tools', hsn: '9603', size: '1 Pc', dl: 256.76 },
  { id: 'tia_t0007a', name: 'Roller Tia T0007A (Exterior Roller)', cat: 'Hardware & Tools', hsn: '9603', size: '1 Pc', dl: 174.98 },
  { id: 'tia_t0007a_tube', name: 'Roller Tia T0007A Tube (Exterior Roller)', cat: 'Hardware & Tools', hsn: '9603', size: '1 Pc', dl: 188.95 },
  { id: 'tia_t0007b', name: 'Roller Tia T0007B (Primer Only)', cat: 'Hardware & Tools', hsn: '9603', size: '1 Pc', dl: 100.46 },
  { id: 'tia_t0008', name: 'Roller Tia T0008 (Interior Roller)', cat: 'Hardware & Tools', hsn: '9603', size: '1 Pc', dl: 238.10 },
  { id: 'tia_t0008a', name: 'Roller Tia T0008A (Interior Roller)', cat: 'Hardware & Tools', hsn: '9603', size: '1 Pc', dl: 169.52 },
  { id: 'tia_t0009', name: 'Roller Tia T0009 (Interior Roller)', cat: 'Hardware & Tools', hsn: '9603', size: '1 Pc', dl: 146.55 },
  { id: 'tia_t0009_tube', name: 'Roller Tia T0009 Tube (Interior Roller)', cat: 'Hardware & Tools', hsn: '9603', size: '1 Pc', dl: 169.52 },
  { id: 'tia_t0009a', name: 'Roller Tia T0009A (Interior Roller)', cat: 'Hardware & Tools', hsn: '9603', size: '1 Pc', dl: 138.30 },
  { id: 'tia_t0009b', name: 'Roller Tia T0009B (Primer Only)', cat: 'Hardware & Tools', hsn: '9603', size: '1 Pc', dl: 100.46 },
  { id: 'tia_t0010', name: 'Roller Tia T0010 (Exterior Roller)', cat: 'Hardware & Tools', hsn: '9603', size: '1 Pc', dl: 167.11 },
  { id: 'tia_t0010b', name: 'Roller Tia T0010B (Exterior Roller)', cat: 'Hardware & Tools', hsn: '9603', size: '1 Pc', dl: 100.46 },
  { id: 'tia_t0015_2', name: 'Roller Tia T0015(2") (Enamel Roller)', cat: 'Hardware & Tools', hsn: '9603', size: '2"', dl: 45.44 },
  { id: 'tia_t0015_4', name: 'Roller Tia T0015(4") (Enamel Roller)', cat: 'Hardware & Tools', hsn: '9603', size: '4"', dl: 50.72 },
  { id: 'tia_t0021', name: 'Roller Tia T0021 (Interior/Exterior Roller)', cat: 'Hardware & Tools', hsn: '9603', size: '1 Pc', dl: 292.95 },

  // Page 1: Premium Rollers
  { id: 'tia_t0091', name: 'Roller Tia T0091 (Interior Roller)', cat: 'Hardware & Tools', hsn: '9603', size: '1 Pc', dl: 374.07 },
  { id: 'tia_t0092', name: 'Roller Tia T0092 (Interior Roller)', cat: 'Hardware & Tools', hsn: '9603', size: '1 Pc', dl: 374.07 },
  { id: 'tia_t0093', name: 'Roller Tia T0093 (Exterior Roller)', cat: 'Hardware & Tools', hsn: '9603', size: '1 Pc', dl: 391.39 },
  { id: 'tia_t0094', name: 'Roller Tia T0094 (Exterior Roller)', cat: 'Hardware & Tools', hsn: '9603', size: '1 Pc', dl: 391.39 },

  // Page 2: Combo Rollers
  { id: 'tia_combo_18a_25', name: 'Roller Tia T0018A(2.5") - 3Combo (Enamel Roller)', cat: 'Hardware & Tools', hsn: '9603', size: '1 Pack', dl: 52.50 },
  { id: 'tia_combo_18a_4', name: 'Roller Tia T0018A(4") - 3Combo (Enamel Roller)', cat: 'Hardware & Tools', hsn: '9603', size: '1 Pack', dl: 86.58 },
  { id: 'tia_combo_71_4', name: 'Roller Tia T0071(4") - 3Combo (Enamel Roller)', cat: 'Hardware & Tools', hsn: '9603', size: '1 Pack', dl: 81.98 },
  { id: 'tia_combo_71c', name: 'Roller Tia T0071C - 3Combo (Enamel Roller)', cat: 'Hardware & Tools', hsn: '9603', size: '1 Pack', dl: 72.28 },

  // Page 2: W/O Handle Rollers
  { id: 'tia_wo_15_2_steel', name: 'Roller Tia T0015(2") W/O 1Pc (Enamel) - Steel', cat: 'Hardware & Tools', hsn: '9603', size: '2"', dl: 30.90 },
  { id: 'tia_wo_15_4_steel', name: 'Roller Tia T0015(4") W/O 1Pc (Enamel) - Steel', cat: 'Hardware & Tools', hsn: '9603', size: '4"', dl: 31.56 },
  { id: 'tia_wo_15_6_steel', name: 'Roller Tia T0015(6") W/O 1Pc (Enamel) - Steel', cat: 'Hardware & Tools', hsn: '9603', size: '6"', dl: 35.19 },
  { id: 'tia_wo_18a_2_wood', name: 'Roller Tia T0018A(2") W/O 1Pc (Enamel) - Wood', cat: 'Hardware & Tools', hsn: '9603', size: '2"', dl: 18.53 },
  { id: 'tia_wo_18a_4_wood', name: 'Roller Tia T0018A(4") W/O 1Pc (Enamel) - Wood', cat: 'Hardware & Tools', hsn: '9603', size: '4"', dl: 23.60 },
  { id: 'tia_wo_71_4_surface', name: 'Roller Tia T0071(4") W/O 1Pc (Emulsion) - Surface', cat: 'Hardware & Tools', hsn: '9603', size: '4"', dl: 22.15 },
  { id: 'tia_wo_71c_4_surface', name: 'Roller Tia T0071C(4") W/O 1Pc (Emulsion) - Surface', cat: 'Hardware & Tools', hsn: '9603', size: '4"', dl: 17.43 },

  // Page 2: Roller with Handle
  { id: 'tia_h_71_4', name: 'Roller Tia T0071(4") with Handle', cat: 'Hardware & Tools', hsn: '9603', size: '4"', dl: 50.43 },
  { id: 'tia_h_71_6', name: 'Roller Tia T0071(6") with Handle', cat: 'Hardware & Tools', hsn: '9603', size: '6"', dl: 87.90 },
  { id: 'tia_h_18a_4', name: 'Roller Tia T0018A(4") with Handle', cat: 'Hardware & Tools', hsn: '9603', size: '4"', dl: 42.91 },
  { id: 'tia_h_18a_2', name: 'Roller Tia T0018A(2") with Handle', cat: 'Hardware & Tools', hsn: '9603', size: '2"', dl: 41.31 },
  { id: 'tia_h_18a_6', name: 'Roller Tia T0018A(6") with Handle', cat: 'Hardware & Tools', hsn: '9603', size: '6"', dl: 93.43 },

  // Page 2: W/O Handle Roller Jar Packing
  { id: 'tia_jar_71_4', name: 'Roller Tia T0071(4") - Jar Packing', cat: 'Hardware & Tools', hsn: '9603', size: '1 Jar', dl: 664.37 },
  { id: 'tia_jar_71_6', name: 'Roller Tia T0071(6") - Jar Packing', cat: 'Hardware & Tools', hsn: '9603', size: '1 Jar', dl: 869.09 },
  { id: 'tia_jar_18a_4', name: 'Roller Tia T0018A(4") - Jar Packing', cat: 'Hardware & Tools', hsn: '9603', size: '1 Jar', dl: 743.08 },
  { id: 'tia_jar_18a_2', name: 'Roller Tia T0018A(2") - Jar Packing', cat: 'Hardware & Tools', hsn: '9603', size: '1 Jar', dl: 428.34 },

  // Page 2: Special Effect Rollers
  { id: 'tia_t0025', name: '4" Tia T0025 Topaz Combing Tool', cat: 'Hardware & Tools', hsn: '9603', size: '4"', dl: 85.91 },
  { id: 'tia_t0026', name: '4" Tia T0026 Topaz Spatula', cat: 'Hardware & Tools', hsn: '9603', size: '4"', dl: 89.39 },
  { id: 'tia_t0027', name: '4" Tia T0027 Topaz Creation 1 Ragging', cat: 'Hardware & Tools', hsn: '9603', size: '4"', dl: 482.46 },
  { id: 'tia_t0072', name: '9" Tia T0072 Topaz Flora Effect', cat: 'Hardware & Tools', hsn: '9603', size: '9"', dl: 745.83 },
  { id: 'tia_t0073', name: '9" Tia T0073 Topaz Sky Effect', cat: 'Hardware & Tools', hsn: '9603', size: '9"', dl: 745.83 },
  { id: 'tia_t0074', name: '9" Tia T0074 Topaz Vintage Effect', cat: 'Hardware & Tools', hsn: '9603', size: '9"', dl: 745.83 },
  { id: 'tia_t0075', name: '4" Tia T0075 Topaz Brushing Effect', cat: 'Hardware & Tools', hsn: '9603', size: '4"', dl: 386.13 },

  // Page 3: Handles & Trays
  { id: 'tia_handle_2', name: '2" Mini Roller Handle - T0062A 2"', cat: 'Hardware & Tools', hsn: '3926', size: '2"', dl: 15.71 },
  { id: 'tia_handle_4', name: '4" Roller Handle - T0062A 4"', cat: 'Hardware & Tools', hsn: '3926', size: '4"', dl: 23.46 },
  { id: 'tia_handle_9', name: '9" Roller Handle - T0063 9"', cat: 'Hardware & Tools', hsn: '3926', size: '9"', dl: 48.09 },
  { id: 'tia_handle_long', name: 'Long Handle 4" - T0062', cat: 'Hardware & Tools', hsn: '3926', size: '4"', dl: 28.75 },
  { id: 'tia_tray_4', name: 'Tia T0024A (4") Roller Paint Tray', cat: 'Hardware & Tools', hsn: '3926', size: '4"', dl: 62.78 },
  { id: 'tia_tray_9', name: 'Tia T0024 (9") Roller Paint Tray', cat: 'Hardware & Tools', hsn: '3926', size: '9"', dl: 86.39 },

  // Page 3: Double Brushes
  { id: 'arun_royal_1', name: 'A025DW Royal Double Brush 1"', cat: 'Hardware & Tools', hsn: '9603', size: '1"', dl: 74.94 },
  { id: 'arun_royal_2', name: 'A050DW Royal Double Brush 2"', cat: 'Hardware & Tools', hsn: '9603', size: '2"', dl: 143.64 },
  { id: 'arun_royal_25', name: 'A063DW Royal Double Brush 2.5"', cat: 'Hardware & Tools', hsn: '9603', size: '2.5"', dl: 162.36 },
  { id: 'arun_royal_3', name: 'A075DW Royal Double Brush 3"', cat: 'Hardware & Tools', hsn: '9603', size: '3"', dl: 187.35 },
  { id: 'arun_royal_4', name: 'RLW Double Berth Royal 4"', cat: 'Hardware & Tools', hsn: '9603', size: '4"', dl: 346.25 },
  { id: 'arun_royal_4_spec', name: 'RLW Double Berth Royal 4" Special', cat: 'Hardware & Tools', hsn: '9603', size: '4"', dl: 310.00 },

  // Page 3: Flat Brushes
  { id: 'tia_flat_0', name: 'Tia Flat Brush Flat 0 (20 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '20 Pcs', dl: 385.51 },
  { id: 'tia_flat_1', name: 'Tia Flat Brush Flat 1 (20 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '20 Pcs', dl: 385.51 },
  { id: 'tia_flat_2', name: 'Tia Flat Brush Flat 2 (20 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '20 Pcs', dl: 385.51 },
  { id: 'tia_flat_3', name: 'Tia Flat Brush Flat 3 (20 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '20 Pcs', dl: 385.51 },
  { id: 'tia_flat_4', name: 'Tia Flat Brush Flat 4 (20 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '20 Pcs', dl: 385.51 },
  { id: 'tia_flat_5', name: 'Tia Flat Brush Flat 5 (20 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '20 Pcs', dl: 385.51 },
  { id: 'tia_flat_6', name: 'Tia Flat Brush Flat 6 (20 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '20 Pcs', dl: 385.51 },
  { id: 'tia_flat_7', name: 'Tia Flat Brush Flat 7 (10 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '10 Pcs', dl: 334.82 },
  { id: 'tia_flat_8', name: 'Tia Flat Brush Flat 8 (10 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '10 Pcs', dl: 334.82 },
  { id: 'tia_flat_9', name: 'Tia Flat Brush Flat 9 (10 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '10 Pcs', dl: 334.82 },
  { id: 'tia_flat_10', name: 'Tia Flat Brush Flat 10 (10 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '10 Pcs', dl: 334.82 },
  { id: 'tia_flat_12', name: 'Tia Flat Brush Flat 12 (10 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '10 Pcs', dl: 334.82 },
  { id: 'tia_flat_14', name: 'Tia Flat Brush Flat 14 (10 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '10 Pcs', dl: 404.07 },
  { id: 'tia_flat_16', name: 'Tia Flat Brush Flat 16 (10 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '10 Pcs', dl: 460.89 },
  { id: 'tia_flat_18', name: 'Tia Flat Brush Flat 18 (10 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '10 Pcs', dl: 518.43 },
  { id: 'tia_flat_20', name: 'Tia Flat Brush Flat 20 (10 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '10 Pcs', dl: 576.12 },

  // Page 4: Round Brushes
  { id: 'tia_m_round_1', name: 'Tia M Round 1 Brush (30 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '30 Pcs', dl: 385.51 },
  { id: 'tia_m_round_2', name: 'Tia M Round 2 Brush (30 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '30 Pcs', dl: 385.51 },
  { id: 'tia_m_round_3', name: 'Tia M Round 3 Brush (30 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '30 Pcs', dl: 385.51 },
  { id: 'tia_m_round_4', name: 'Tia M Round 4 Brush (30 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '30 Pcs', dl: 385.51 },
  { id: 'tia_m_round_5', name: 'Tia M Round 5 Brush (30 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '30 Pcs', dl: 385.51 },
  { id: 'tia_m_round_6', name: 'Tia M Round 6 Brush (30 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '30 Pcs', dl: 385.51 },
  { id: 'tia_m_round_7', name: 'Tia M Round 7 Brush (20 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '20 Pcs', dl: 385.51 },
  { id: 'tia_m_round_8', name: 'Tia M Round 8 Brush (20 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '20 Pcs', dl: 385.51 },
  { id: 'tia_m_round_9', name: 'Tia M Round 9 Brush (20 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '20 Pcs', dl: 385.51 },
  { id: 'tia_m_round_10', name: 'Tia M Round 10 Brush (20 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '20 Pcs', dl: 385.51 },
  { id: 'tia_m_round_11', name: 'Tia M Round 11 Brush (20 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '20 Pcs', dl: 385.51 },
  { id: 'tia_m_round_12', name: 'Tia M Round 12 Brush (20 Pcs Pack)', cat: 'Hardware & Tools', hsn: '9603', size: '20 Pcs', dl: 385.51 },

  // Page 4: Polish & Mercury Brushes
  { id: 'tia_poli_50', name: 'Tia M Poli 50 (2") Polish Brush', cat: 'Hardware & Tools', hsn: '9603', size: '2"', dl: 62.97 },
  { id: 'tia_poli_63', name: 'Tia M Poli 63 (2.5") Polish Brush', cat: 'Hardware & Tools', hsn: '9603', size: '2.5"', dl: 78.69 },
  { id: 'tia_poli_75', name: 'Tia M Poli 75 (3") Polish Brush', cat: 'Hardware & Tools', hsn: '9603', size: '3"', dl: 94.43 },
  { id: 'tia_mercury_50', name: 'Tia MFB M050 (2") Mercury Brush', cat: 'Hardware & Tools', hsn: '9603', size: '2"', dl: 43.97 },
  { id: 'tia_mercury_63', name: 'Tia MFB M063 (2.5") Mercury Brush', cat: 'Hardware & Tools', hsn: '9603', size: '2.5"', dl: 54.54 },
  { id: 'tia_mercury_75', name: 'Tia MFB M075 (3") Mercury Brush', cat: 'Hardware & Tools', hsn: '9603', size: '3"', dl: 66.02 },

  // Page 4: Putty Knives
  { id: 'tia_pk_150', name: 'Tia Putty HD 150mm (6") Plastic Handle', cat: 'Hardware & Tools', hsn: '8205', size: '6"', dl: 47.69 },
  { id: 'tia_pk_200', name: 'Tia Putty HD 200mm (8") Plastic Handle', cat: 'Hardware & Tools', hsn: '8205', size: '8"', dl: 63.39 },
  { id: 'tia_pk_250', name: 'Tia Putty HD 250mm (10") Plastic Handle', cat: 'Hardware & Tools', hsn: '8205', size: '10"', dl: 79.24 },
  { id: 'tia_pk_300', name: 'Tia Putty HD 300mm (12") Plastic Handle', cat: 'Hardware & Tools', hsn: '8205', size: '12"', dl: 95.23 },

  // Page 4 & 5: Telescopic Extension Sticks
  { id: 'tia_stick_2m', name: 'Stick Tia T0064 - 2M Telescopic', cat: 'Hardware & Tools', hsn: '7616', size: '2M', dl: 490.44 },
  { id: 'tia_stick_3m', name: 'Stick Tia T0064 - 3M Telescopic', cat: 'Hardware & Tools', hsn: '7616', size: '3M', dl: 687.18 },
  { id: 'tia_stick_3m_eco', name: 'Economy Stick T0064 - 3M ECO', cat: 'Hardware & Tools', hsn: '7616', size: '3M', dl: 348.60 },
  { id: 'tia_stick_5m', name: 'Stick Tia T0064 - 5M Telescopic', cat: 'Hardware & Tools', hsn: '7616', size: '5M', dl: 1327.17 },
  { id: 'tia_stick_8m', name: 'Stick Tia T0064 - 8M Telescopic', cat: 'Hardware & Tools', hsn: '7616', size: '8M', dl: 2213.09 },
  { id: 'tia_stick_4m', name: 'Stick Tia T0064 - 4M Telescopic', cat: 'Hardware & Tools', hsn: '7616', size: '4M', dl: 1011.18 },
  { id: 'tia_stick_3m_lock', name: 'Stick Tia T0064 - 3M Press Lock Type', cat: 'Hardware & Tools', hsn: '7616', size: '3M', dl: 906.65 },
  { id: 'tia_stick_2m_eco', name: 'Economy Stick T0064 - 2M ECO', cat: 'Hardware & Tools', hsn: '7616', size: '2M', dl: 274.01 },

  // Page 5: MSP Spray Paints (All Colors)
  { id: 'msp_black', name: 'MSP Spray Paint - Black', cat: 'Spray Paints & Aerosols', hsn: '3208', size: '400 ml', dl: 129.93 },
  { id: 'msp_brown', name: 'MSP Spray Paint - Brown', cat: 'Spray Paints & Aerosols', hsn: '3208', size: '400 ml', dl: 129.93 },
  { id: 'msp_clear_lacquer', name: 'MSP Spray Paint - Clear Lacquer', cat: 'Spray Paints & Aerosols', hsn: '3208', size: '400 ml', dl: 129.93 },
  { id: 'msp_dark_green', name: 'MSP Spray Paint - Dark Green', cat: 'Spray Paints & Aerosols', hsn: '3208', size: '400 ml', dl: 129.93 },
  { id: 'msp_gentain_blue', name: 'MSP Spray Paint - Gentain Blue', cat: 'Spray Paints & Aerosols', hsn: '3208', size: '400 ml', dl: 129.93 },
  { id: 'msp_iron_grey', name: 'MSP Spray Paint - Iron Grey', cat: 'Spray Paints & Aerosols', hsn: '3208', size: '400 ml', dl: 129.93 },
  { id: 'msp_lemon_yellow', name: 'MSP Spray Paint - Lemon Yellow', cat: 'Spray Paints & Aerosols', hsn: '3208', size: '400 ml', dl: 129.93 },
  { id: 'msp_medium_grey', name: 'MSP Spray Paint - Medium Grey', cat: 'Spray Paints & Aerosols', hsn: '3208', size: '400 ml', dl: 129.93 },
  { id: 'msp_oxford_blue', name: 'MSP Spray Paint - Oxford Blue', cat: 'Spray Paints & Aerosols', hsn: '3208', size: '400 ml', dl: 129.93 },
  { id: 'msp_pebble_grey', name: 'MSP Spray Paint - Pebble Grey', cat: 'Spray Paints & Aerosols', hsn: '3208', size: '400 ml', dl: 129.93 },
  { id: 'msp_phiroza_blue', name: 'MSP Spray Paint - Phiroza Blue', cat: 'Spray Paints & Aerosols', hsn: '3208', size: '400 ml', dl: 129.93 },
  { id: 'msp_red', name: 'MSP Spray Paint - Red', cat: 'Spray Paints & Aerosols', hsn: '3208', size: '400 ml', dl: 129.93 },
  { id: 'msp_yellow', name: 'MSP Spray Paint - Yellow', cat: 'Spray Paints & Aerosols', hsn: '3208', size: '400 ml', dl: 129.93 },
  { id: 'msp_ivory', name: 'MSP Spray Paint - Ivory', cat: 'Spray Paints & Aerosols', hsn: '3208', size: '400 ml', dl: 129.93 },
  { id: 'msp_matt_black', name: 'MSP Spray Paint - Matt Black', cat: 'Spray Paints & Aerosols', hsn: '3208', size: '400 ml', dl: 129.93 },
  { id: 'msp_matt_white', name: 'MSP Spray Paint - Matt White', cat: 'Spray Paints & Aerosols', hsn: '3208', size: '400 ml', dl: 129.93 },
  { id: 'msp_silver', name: 'MSP Spray Paint - Silver', cat: 'Spray Paints & Aerosols', hsn: '3208', size: '400 ml', dl: 139.91 },
  { id: 'msp_gold', name: 'MSP Spray Paint - Gold', cat: 'Spray Paints & Aerosols', hsn: '3208', size: '400 ml', dl: 139.91 },
  { id: 'msp_flo_green', name: 'MSP Spray Paint - Flo Green', cat: 'Spray Paints & Aerosols', hsn: '3208', size: '400 ml', dl: 165.58 },
  { id: 'msp_flo_orange', name: 'MSP Spray Paint - Flo Orange', cat: 'Spray Paints & Aerosols', hsn: '3208', size: '400 ml', dl: 165.58 },
  { id: 'msp_bright_gold', name: 'MSP Spray Paint - Bright Gold', cat: 'Spray Paints & Aerosols', hsn: '3208', size: '400 ml', dl: 170.58 },
  { id: 'msp_crome_silver', name: 'MSP Spray Paint - Chrome Silver', cat: 'Spray Paints & Aerosols', hsn: '3208', size: '400 ml', dl: 170.58 },

  // Page 5: Duke Gold
  { id: 'duke_gold_dpmg_50', name: 'Duke Gold DPMG 50ml (Box of 12)', cat: 'Spray Paints & Aerosols', hsn: '3208', size: '50 ml', dl: 66.82 },
  { id: 'duke_gold_dpmg_100', name: 'Duke Gold DPMG 100ml (Box of 12)', cat: 'Spray Paints & Aerosols', hsn: '3208', size: '100 ml', dl: 126.21 },
  { id: 'duke_gold_dpmg_200', name: 'Duke Gold DPMG 200ml (Box of 12)', cat: 'Spray Paints & Aerosols', hsn: '3208', size: '200 ml', dl: 235.73 },
  { id: 'duke_gold_dpmg_500', name: 'Duke Gold DPMG 500ml (Box of 12)', cat: 'Spray Paints & Aerosols', hsn: '3208', size: '500 ml', dl: 245.00 },
  { id: 'duke_gold_dpmg_1000', name: 'Duke Gold DPMG 1000ml (Box of 12)', cat: 'Spray Paints & Aerosols', hsn: '3208', size: '1000 ml', dl: 453.82 },

  // Page 6: Asmaco PU Foam
  { id: 'asmaco_pu_foam_330', name: 'Asmaco PU Foam 330ml (Box of 12)', cat: 'Hardware & Tools', hsn: '3214', size: '330 ml', dl: 311.66 },
  { id: 'asmaco_pu_foam_750', name: 'Asmaco PU Foam 750ml (Box of 12)', cat: 'Hardware & Tools', hsn: '3214', size: '750 ml', dl: 171.33 },
];

console.log('Inserting / updating all 140 products under brand Arun & Tia...');

const tx = db.transaction(() => {
  for (const item of allArunTiaItems) {
    insertProduct.run(
      item.id,
      item.name,
      item.cat,
      item.hsn,
      `Authorized product from Arun Brush & Tia Rollers catalog (${item.size})`
    );

    const pk = makePack(item.id, item.size, item.dl, null, 30);
    insertPack.run(
      pk.id,
      pk.productId,
      pk.packSize,
      pk.barcode,
      pk.mrp,
      pk.retailPrice,
      pk.contractorPrice,
      pk.wholesalePrice,
      pk.costPrice,
      pk.stockQty,
      pk.minStockAlert
    );
  }
});

tx();

const arunCount = db.prepare("SELECT count(*) as c FROM products WHERE brand = 'Arun & Tia'").get().c;
const totalProducts = db.prepare("SELECT count(*) as c FROM products").get().c;
const totalPacks = db.prepare("SELECT count(*) as c FROM product_pack_sizes").get().c;
const allBrands = db.prepare("SELECT name FROM brands").all();

console.log(`\nDone! Total products under 'Arun & Tia': ${arunCount}`);
console.log(`Total products in database: ${totalProducts}`);
console.log(`Total pack sizes in database: ${totalPacks}`);
console.log('Active brands:', allBrands.map(b => b.name).join(', '));
