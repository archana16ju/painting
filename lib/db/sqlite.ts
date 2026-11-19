import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (dbInstance) return dbInstance;

  // Store in a local data directory in the project or AppData
  const dataDir = process.env.DB_PATH 
    ? path.dirname(process.env.DB_PATH)
    : path.join(process.cwd(), 'data');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbFilePath = process.env.DB_PATH || path.join(dataDir, 'paint_store.db');
  
  dbInstance = new Database(dbFilePath);
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');

  initSchema(dbInstance);
  seedCategories(dbInstance);
  seedBrands(dbInstance);
  seedInitialData(dbInstance);

  return dbInstance;
}

function initSchema(db: Database.Database) {
  db.exec(`
    -- Shop Settings
    CREATE TABLE IF NOT EXISTS shop_settings (
      id TEXT PRIMARY KEY,
      shop_name TEXT NOT NULL,
      tagline TEXT,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      gstin TEXT NOT NULL,
      invoice_prefix TEXT NOT NULL DEFAULT 'PB/',
      thermal_paper_size TEXT NOT NULL DEFAULT '80mm',
      enable_whatsapp INTEGER NOT NULL DEFAULT 1,
      terms_conditions TEXT,
      bank_details TEXT,
      upi_id TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Categories Master
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      icon_name TEXT DEFAULT 'Layers',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Brands Master
    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Products Master
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      brand TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      hsn_code TEXT NOT NULL,
      default_tax_rate REAL NOT NULL DEFAULT 18.0,
      description TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Pack Sizes (SKU per packaging volume)
    CREATE TABLE IF NOT EXISTS product_pack_sizes (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      pack_size TEXT NOT NULL,
      barcode TEXT UNIQUE,
      mrp REAL NOT NULL,
      retail_price REAL NOT NULL,
      contractor_price REAL NOT NULL,
      wholesale_price REAL NOT NULL,
      cost_price REAL NOT NULL,
      stock_qty REAL NOT NULL DEFAULT 0,
      min_stock_alert REAL NOT NULL DEFAULT 2,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Paint Shades Catalog
    CREATE TABLE IF NOT EXISTS paint_shades (
      id TEXT PRIMARY KEY,
      brand TEXT NOT NULL,
      shade_code TEXT NOT NULL,
      shade_name TEXT NOT NULL,
      hex_color TEXT NOT NULL,
      base_type TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(brand, shade_code)
    );

    -- Customers
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT,
      gstin TEXT,
      customer_type TEXT NOT NULL DEFAULT 'RETAIL',
      credit_limit REAL NOT NULL DEFAULT 0,
      current_balance REAL NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Contractors & Painters
    CREATE TABLE IF NOT EXISTS contractors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT,
      commission_rate REAL NOT NULL DEFAULT 5.0,
      credit_limit REAL NOT NULL DEFAULT 50000,
      current_balance REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      total_commission_earned REAL NOT NULL DEFAULT 0,
      total_commission_paid REAL NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Contractor Khata Ledger
    CREATE TABLE IF NOT EXISTS contractor_ledger (
      id TEXT PRIMARY KEY,
      contractor_id TEXT NOT NULL,
      bill_id TEXT,
      type TEXT NOT NULL, -- 'DEBIT' (billed on credit) or 'CREDIT' (payment received)
      amount REAL NOT NULL,
      balance_after REAL NOT NULL,
      payment_mode TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contractor_id) REFERENCES contractors(id) ON DELETE CASCADE
    );

    -- Suppliers
    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      contact_person TEXT,
      phone TEXT NOT NULL,
      gstin TEXT,
      address TEXT,
      pending_balance REAL NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Inward Purchases
    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      supplier_id TEXT NOT NULL,
      invoice_number TEXT NOT NULL,
      invoice_date TEXT NOT NULL,
      subtotal REAL NOT NULL,
      tax_amount REAL NOT NULL,
      grand_total REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'COMPLETED',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    );

    -- Sales Bills / Invoices
    CREATE TABLE IF NOT EXISTS bills (
      id TEXT PRIMARY KEY,
      invoice_number TEXT NOT NULL UNIQUE,
      customer_id TEXT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      customer_gstin TEXT,
      contractor_id TEXT,
      contractor_name TEXT,
      site_name TEXT,
      subtotal REAL NOT NULL,
      discount_amount REAL NOT NULL DEFAULT 0,
      tax_amount REAL NOT NULL,
      cgst REAL NOT NULL,
      sgst REAL NOT NULL,
      igst REAL NOT NULL DEFAULT 0,
      round_off REAL NOT NULL DEFAULT 0,
      grand_total REAL NOT NULL,
      paid_amount REAL NOT NULL,
      balance_due REAL NOT NULL DEFAULT 0,
      payment_mode TEXT NOT NULL DEFAULT 'CASH',
      payment_details TEXT,
      status TEXT NOT NULL DEFAULT 'PAID',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Bill Line Items
    CREATE TABLE IF NOT EXISTS bill_items (
      id TEXT PRIMARY KEY,
      bill_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      pack_size_id TEXT NOT NULL,
      brand TEXT NOT NULL,
      product_name TEXT NOT NULL,
      pack_size TEXT NOT NULL,
      shade_code TEXT,
      shade_name TEXT,
      quantity REAL NOT NULL,
      rate REAL NOT NULL,
      discount_percent REAL NOT NULL DEFAULT 0,
      tax_percent REAL NOT NULL DEFAULT 18.0,
      tax_amount REAL NOT NULL,
      amount REAL NOT NULL,
      is_tinted INTEGER NOT NULL DEFAULT 0,
      dispenser_formula TEXT,
      FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
    );

    -- Paint Estimates / Quotations
    CREATE TABLE IF NOT EXISTS paint_estimates (
      id TEXT PRIMARY KEY,
      estimate_number TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      project_name TEXT,
      total_sqft REAL NOT NULL,
      surface_type TEXT NOT NULL,
      quality_tier TEXT NOT NULL,
      putty_kg REAL NOT NULL,
      primer_liters REAL NOT NULL,
      paint_liters REAL NOT NULL,
      estimated_total REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function seedCategories(db: Database.Database) {
  const row = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (row.count === 0) {
    const insertCat = db.prepare('INSERT OR IGNORE INTO categories (id, name, icon_name) VALUES (?, ?, ?)');
    const defaultCats = [
      { id: 'cat_ext', name: 'Exterior Emulsion', icon: 'Sun' },
      { id: 'cat_int', name: 'Interior Emulsion', icon: 'Home' },
      { id: 'cat_prim', name: 'Wall Primer', icon: 'Layers' },
      { id: 'cat_putty', name: 'Wall Putty', icon: 'ShieldCheck' },
      { id: 'cat_cement', name: 'White Cement & Lime', icon: 'Package' },
      { id: 'cat_enamel', name: 'Enamel & Gloss', icon: 'Sparkles' },
      { id: 'cat_water', name: 'Waterproofing', icon: 'Droplets' },
      { id: 'cat_wood', name: 'Wood Finish', icon: 'Trees' },
      { id: 'cat_thin', name: 'Thinners & Solvents', icon: 'Droplet' },
      { id: 'cat_spray', name: 'Spray Paints & Aerosols', icon: 'Flame' },
      { id: 'cat_abrasive', name: 'Abrasives & Sandpaper', icon: 'FileText' },
      { id: 'cat_hard', name: 'Hardware & Tools', icon: 'Wrench' },
    ];
    for (const c of defaultCats) {
      insertCat.run(c.id, c.name, c.icon);
    }
  }
}

function seedBrands(db: Database.Database) {
  const row = db.prepare('SELECT COUNT(*) as count FROM brands').get() as { count: number };
  if (row.count === 0) {
    const insertBrand = db.prepare('INSERT OR IGNORE INTO brands (id, name) VALUES (?, ?)');
    const defaultBrands = [
      'Surfa Coats',
      'Arun & Tia',
      'JK Cement',
      'JK WhiteMaxX',
      'Surya Cem',
      'Udhayas Cem',
      'Pilot',
      'Butterfly Paints',
      'Ajax',
      '24CRT Gold',
      'Termiguard',
      'General Hardware',
    ];
    for (const b of defaultBrands) {
      insertBrand.run(`brand_${b.toLowerCase().replace(/[^a-z0-9]/g, '_')}`, b);
    }
  }
}

function seedInitialData(db: Database.Database) {
  // Check if shop_settings already exists
  const existingSettings = db.prepare('SELECT id FROM shop_settings LIMIT 1').get();
  if (existingSettings) return;

  // Insert default shop settings
  db.prepare(`
    INSERT INTO shop_settings (id, shop_name, tagline, address, phone, email, gstin, invoice_prefix, thermal_paper_size, enable_whatsapp, terms_conditions, upi_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'shop_main',
    'SODA POP COLOURS',
    'Paints, Waterproofing, Hardware & Tinting Solutions',
    '52E/2/1, P&T Colony 4th Street, Milavittan, Thoothukudi, Tamil Nadu - 628008',
    '8220892239, 9944282627',
    'sodapopcolours@gmail.com',
    '33ASPPV1144D1ZS',
    'SPC/2026/',
    '80mm',
    1,
    '1. Goods once tinted cannot be exchanged or returned.\n2. Please inspect shades before application.\n3. Interest @ 18% p.a. charged on overdue Khata balances after 30 days.',
    '8220892239@upi'
  );

  // Insert Default Contractors
  const insertContractor = db.prepare(`
    INSERT INTO contractors (id, name, phone, address, commission_rate, credit_limit, current_balance, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertContractor.run('cont_1', 'Rajesh Verma (Master Painter)', '9876511223', 'Subhash Nagar, City', 5.0, 50000, 12500, 'ACTIVE');
  insertContractor.run('cont_2', 'Sunil Kumar (Contractor)', '9840123456', 'Anna Nagar, City', 6.0, 75000, 0, 'ACTIVE');
  insertContractor.run('cont_3', 'Praveen Builder Group', '9711223344', 'Industrial Estate, City', 3.0, 200000, 45000, 'ACTIVE');

  // Insert Contractor Ledger entries for opening balances
  const insertLedger = db.prepare(`
    INSERT INTO contractor_ledger (id, contractor_id, type, amount, balance_after, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertLedger.run('c_led_1', 'cont_1', 'DEBIT', 12500, 12500, 'Opening Balance / Site Green Villa');
  insertLedger.run('c_led_2', 'cont_3', 'DEBIT', 45000, 45000, 'Opening Balance / Commercial Block A');

  // Insert Suppliers
  const insertSupplier = db.prepare(`
    INSERT INTO suppliers (id, company_name, contact_person, phone, gstin, address, pending_balance)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertSupplier.run('sup_1', 'Asian Paints Regional Depot', 'Depot Manager', '044-2450001', '33AAACA1234F1Z8', 'SIPCOT Industrial Park', 140000);
  insertSupplier.run('sup_2', 'Berger Paints India Ltd', 'Sales Exec. Murugan', '9840001234', '33AABCB5678G1Z2', 'Ambattur Industrial Area', 85000);
  insertSupplier.run('sup_3', 'UltraTech / Birla White Dist.', 'Mahesh Distributors', '9888877665', '33AAACU9999K1Z4', 'Godown St, Wholesale Market', 25000);

  // Insert Shades
  const insertShade = db.prepare(`
    INSERT INTO paint_shades (id, brand, shade_code, shade_name, hex_color, base_type, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertShade.run('sh_1', 'Asian Paints', '0420', 'Morning Glory', '#F3EFE0', 'White Base', 'Warm soothing neutral cream');
  insertShade.run('sh_2', 'Asian Paints', 'L152', 'Royal Ivory', '#EFE8D8', 'Base 1', 'Classic luxury ivory shade');
  insertShade.run('sh_3', 'Asian Paints', '8245', 'Sunset Orange', '#E06D53', 'Accent Base', 'Vibrant warm accent wall tone');
  insertShade.run('sh_4', 'Asian Paints', '9432', 'Mint Breeze', '#D4ECD5', 'Base 2', 'Refreshing pastel green');
  insertShade.run('sh_5', 'Asian Paints', '7812', 'Imperial Blue', '#1F3A52', 'Deep Base', 'Rich royal navy blue');
  insertShade.run('sh_6', 'Asian Paints', '0911', 'Golden Glow', '#E4B84D', 'Yellow Base', 'Rich golden yellow');
  insertShade.run('sh_7', 'Berger', '7D0298', 'Whispering Breeze', '#F5E6CC', 'Base 1', 'Gentle beige off-white');
  insertShade.run('sh_8', 'Berger', '8B1713', 'Crimson Glory', '#8B1713', 'Deep Base', 'Deep dramatic burgundy red');
  insertShade.run('sh_9', 'Dulux', '50YY 83/029', 'Crisp Linen', '#EFEFE5', 'White Base', 'Modern minimalist bright white');
  insertShade.run('sh_10', 'Dulux', '30BB 16/031', 'Rich Navy', '#2B3842', 'Deep Base', 'Contemporary dark accent');

  // Insert Products & Pack Sizes
  const insertProd = db.prepare(`
    INSERT INTO products (id, brand, name, category, hsn_code, default_tax_rate, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertPack = db.prepare(`
    INSERT INTO product_pack_sizes (id, product_id, pack_size, barcode, mrp, retail_price, contractor_price, wholesale_price, cost_price, stock_qty, min_stock_alert)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Product 1: Asian Royale Luxury Emulsion
  insertProd.run('prod_1', 'Asian Paints', 'Royale Luxury Emulsion (Interior)', 'Interior Emulsion', '3209', 18.0, 'Ultra-sheen Teflon surface luxury interior emulsion');
  insertPack.run('pack_1_1', 'prod_1', '1L', '8901234000011', 540, 490, 450, 430, 390, 24, 5);
  insertPack.run('pack_1_4', 'prod_1', '4L', '8901234000014', 2100, 1890, 1750, 1680, 1500, 18, 4);
  insertPack.run('pack_1_10', 'prod_1', '10L', '8901234000010', 5100, 4550, 4200, 4000, 3600, 10, 2);
  insertPack.run('pack_1_20', 'prod_1', '20L', '8901234000020', 9800, 8750, 8100, 7800, 7000, 12, 3);

  // Product 2: Asian Apex Ultima Weatherproof
  insertProd.run('prod_2', 'Asian Paints', 'Apex Ultima Exterior Emulsion', 'Exterior Emulsion', '3209', 18.0, 'High-durability all-weather exterior emulsion with 7-yr warranty');
  insertPack.run('pack_2_1', 'prod_2', '1L', '8901234000021', 460, 410, 380, 360, 320, 15, 4);
  insertPack.run('pack_2_4', 'prod_2', '4L', '8901234000024', 1780, 1580, 1450, 1390, 1220, 16, 4);
  insertPack.run('pack_2_20', 'prod_2', '20L', '8901234000220', 8200, 7300, 6750, 6400, 5700, 8, 2);

  // Product 3: Decoprime Interior Wall Primer
  insertProd.run('prod_3', 'Asian Paints', 'Decoprime Wall Primer (Water Thinnable)', 'Wall Primer', '3208', 18.0, 'Superior adhesion base coat primer for interior walls');
  insertPack.run('pack_3_1', 'prod_3', '1L', '8901234000031', 180, 160, 145, 138, 120, 30, 6);
  insertPack.run('pack_3_4', 'prod_3', '4L', '8901234000034', 680, 590, 540, 510, 450, 25, 5);
  insertPack.run('pack_3_10', 'prod_3', '10L', '8901234000030', 1600, 1400, 1280, 1220, 1080, 14, 3);
  insertPack.run('pack_3_20', 'prod_3', '20L', '8901234000032', 2950, 2600, 2380, 2260, 2000, 20, 4);

  // Product 4: Birla White WallCare Putty
  insertProd.run('prod_4', 'Birla Opus', 'Birla White WallCare Putty', 'Wall Putty', '2520', 18.0, 'White cement based water-resistant putty for ultra-smooth wall finish');
  insertPack.run('pack_4_1', 'prod_4', '1kg', '8902234000041', 45, 40, 35, 32, 28, 50, 10);
  insertPack.run('pack_4_5', 'prod_4', '5kg', '8902234000045', 180, 160, 140, 130, 115, 40, 8);
  insertPack.run('pack_4_20', 'prod_4', '20kg', '8902234000420', 520, 470, 430, 410, 360, 35, 6);
  insertPack.run('pack_4_40', 'prod_4', '40kg', '8902234000440', 980, 890, 820, 780, 700, 45, 10);

  // Product 5: Roller Brush 9 Inch Heavy Duty
  insertProd.run('prod_5', 'Other', 'Professional 9" Wall Roller with Handle', 'Hardware & Tools', '9603', 18.0, 'High-density microfiber roller brush for seamless paint finishing');
  insertPack.run('pack_5_1', 'prod_5', '1 Pc', '8905544000051', 220, 180, 160, 150, 120, 60, 10);

  // Product 6: Asian Synthetic Enamel (Gloss Finish)
  insertProd.run('prod_6', 'Asian Paints', 'Apcolite Premium Gloss Enamel', 'Enamel & Gloss', '3208', 18.0, 'Mirror-like gloss enamel for wood and metal surfaces');
  insertPack.run('pack_6_500', 'prod_6', '500ml', '8901234000065', 175, 155, 140, 132, 115, 20, 5);
  insertPack.run('pack_6_1', 'prod_6', '1L', '8901234000061', 320, 285, 260, 245, 215, 22, 5);
  insertPack.run('pack_6_4', 'prod_6', '4L', '8901234000064', 1220, 1080, 990, 940, 820, 10, 2);

  // Product 7: Mineral Turpentine Oil / Thinner
  insertProd.run('prod_7', 'Other', 'Superior MTO Paint Thinner', 'Thinners & Solvents', '2710', 18.0, 'Pure solvent thinner for oil and enamel dilution and brush cleaning');
  insertPack.run('pack_7_1', 'prod_7', '1L', '8909988000071', 140, 120, 105, 98, 85, 50, 10);
  insertPack.run('pack_7_5', 'prod_7', '5L', '8909988000075', 650, 550, 490, 460, 390, 15, 4);

  // Insert a sample bill to demonstrate the ledger and reports immediately
  const insertBill = db.prepare(`
    INSERT INTO bills (
      id, invoice_number, customer_name, customer_phone, contractor_id, contractor_name, site_name,
      subtotal, discount_amount, tax_amount, cgst, sgst, igst, round_off, grand_total, paid_amount,
      balance_due, payment_mode, payment_details, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 hours'))
  `);
  insertBill.run(
    'bill_sample_1',
    'PB/2026/0142',
    'Mr. Rajesh Verma',
    '9876511223',
    'cont_1',
    'Rajesh Verma (Master Painter)',
    'Green Villa, Flat 4B',
    20642.00,
    840.00,
    3715.56,
    1857.78,
    1857.78,
    0,
    -0.56,
    24357.00,
    10000.00,
    14357.00,
    'SPLIT',
    'Paid: ₹10,000 via UPI (Ref: UPI/6321). Remaining ₹14,357 charged to Contractor Khata.',
    'PARTIAL'
  );

  const insertItem = db.prepare(`
    INSERT INTO bill_items (
      id, bill_id, product_id, pack_size_id, brand, product_name, pack_size, shade_code, shade_name,
      quantity, rate, discount_percent, tax_percent, tax_amount, amount, is_tinted, dispenser_formula
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertItem.run(
    'b_item_1', 'bill_sample_1', 'prod_1', 'pack_1_20', 'Asian Paints', 'Royale Luxury Emulsion (Interior)',
    '20L', '0420', 'Morning Glory', 2, 8100, 5, 18, 2769.30, 15390.00, 1, 'Formula: White Base 20L + 12ml YO + 4ml RO'
  );
  insertItem.run(
    'b_item_2', 'bill_sample_1', 'prod_3', 'pack_3_10', 'Asian Paints', 'Decoprime Wall Primer (Water Thinnable)',
    '10L', '', 'White Base', 1, 1280, 0, 18, 230.40, 1280.00, 0, null
  );
  insertItem.run(
    'b_item_3', 'bill_sample_1', 'prod_4', 'pack_4_40', 'Birla Opus', 'Birla White WallCare Putty',
    '40kg', '', '', 4, 820, 0, 18, 590.40, 3280.00, 0, null
  );
  insertItem.run(
    'b_item_4', 'bill_sample_1', 'prod_5', 'pack_5_1', 'Other', 'Professional 9" Wall Roller with Handle',
    '1 Pc', '', '', 3, 160, 0, 18, 86.40, 480.00, 0, null
  );
}
