const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'paint_store.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

console.log('Opened database at:', dbPath);

const insertProduct = db.prepare(`
  INSERT OR REPLACE INTO products (id, brand, name, category, hsn_code, default_tax_rate, description, is_active)
  VALUES (?, ?, ?, ?, ?, ?, ?, 1)
`);

const insertPack = db.prepare(`
  INSERT OR REPLACE INTO product_pack_sizes (
    id, product_id, pack_size, barcode, mrp, retail_price, contractor_price, wholesale_price, cost_price, stock_qty, min_stock_alert
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Helper to calculate pricing from DL Price
function makePack(prodId, size, dlPrice, barcode, stock = 20) {
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

// -------------------------------------------------------------
// 1. ARUN BRUSH & TIA ROLLERS
// -------------------------------------------------------------
const arunBrushes = [
  { id: 'arun_b_1', name: 'Arun Paint Brush 1"', dl: 48.15, size: '1"' },
  { id: 'arun_b_2', name: 'Arun Paint Brush 2"', dl: 97.27, size: '2"' },
  { id: 'arun_b_25', name: 'Arun Paint Brush 2.5"', dl: 116.25, size: '2.5"' },
  { id: 'arun_b_3', name: 'Arun Paint Brush 3"', dl: 134.40, size: '3"' },
  { id: 'arun_b_4', name: 'Arun Paint Brush 4"', dl: 199.83, size: '4"' },
];

const arunRollersWithHandle = [
  { id: 'tia_t0001', name: 'Tia T0001 Interior Roller with Handle', dl: 147.37, cat: 'Hardware & Tools' },
  { id: 'tia_t0001a', name: 'Tia T0001A Interior Roller with Handle', dl: 158.30, cat: 'Hardware & Tools' },
  { id: 'tia_t0007', name: 'Tia T0007 Exterior Roller with Handle', dl: 256.76, cat: 'Hardware & Tools' },
  { id: 'tia_t0007a', name: 'Tia T0007A Exterior Roller with Handle', dl: 174.98, cat: 'Hardware & Tools' },
  { id: 'tia_t0007a_tube', name: 'Tia T0007A Tube Exterior Roller', dl: 188.95, cat: 'Hardware & Tools' },
  { id: 'tia_t0007b', name: 'Tia T0007B Primer Only Roller', dl: 100.46, cat: 'Hardware & Tools' },
  { id: 'tia_t0008', name: 'Tia T0008 Interior Roller with Handle', dl: 238.10, cat: 'Hardware & Tools' },
  { id: 'tia_t0008a', name: 'Tia T0008A Interior Roller with Handle', dl: 169.52, cat: 'Hardware & Tools' },
  { id: 'tia_t0009', name: 'Tia T0009 Interior Roller with Handle', dl: 146.55, cat: 'Hardware & Tools' },
  { id: 'tia_t0009_tube', name: 'Tia T0009 Tube Interior Roller', dl: 169.52, cat: 'Hardware & Tools' },
  { id: 'tia_t0009a', name: 'Tia T0009A Interior Roller with Handle', dl: 138.30, cat: 'Hardware & Tools' },
  { id: 'tia_t0009b', name: 'Tia T0009B Primer Only Roller', dl: 100.46, cat: 'Hardware & Tools' },
  { id: 'tia_t0010', name: 'Tia T0010 Exterior Roller with Handle', dl: 167.11, cat: 'Hardware & Tools' },
  { id: 'tia_t0010b', name: 'Tia T0010B Exterior Roller with Handle', dl: 100.46, cat: 'Hardware & Tools' },
  { id: 'tia_t0015_2', name: 'Tia T0015 (2") Enamel Roller with Handle', dl: 45.44, cat: 'Hardware & Tools' },
  { id: 'tia_t0015_4', name: 'Tia T0015 (4") Enamel Roller with Handle', dl: 50.72, cat: 'Hardware & Tools' },
  { id: 'tia_t0021', name: 'Tia T0021 Interior/Exterior Roller', dl: 292.95, cat: 'Hardware & Tools' },
  { id: 'tia_t0091', name: 'Tia T0091 Premium Interior Roller', dl: 374.07, cat: 'Hardware & Tools' },
  { id: 'tia_t0092', name: 'Tia T0092 Premium Interior Roller', dl: 374.07, cat: 'Hardware & Tools' },
  { id: 'tia_t0093', name: 'Tia T0093 Premium Exterior Roller', dl: 391.39, cat: 'Hardware & Tools' },
  { id: 'tia_t0094', name: 'Tia T0094 Premium Exterior Roller', dl: 391.39, cat: 'Hardware & Tools' },
];

const arunSpecialEffect = [
  { id: 'tia_t0025', name: '4" Tia T0025 Topaz Combing Tool', dl: 85.91 },
  { id: 'tia_t0026', name: '4" Tia T0026 Topaz Spatula', dl: 89.39 },
  { id: 'tia_t0027', name: '4" Tia T0027 Topaz Creation 1 Ragging', dl: 482.46 },
  { id: 'tia_t0072', name: '9" Tia T0072 Topaz Flora Effect Roller', dl: 745.83 },
  { id: 'tia_t0073', name: '9" Tia T0073 Topaz Sky Effect Roller', dl: 745.83 },
  { id: 'tia_t0074', name: '9" Tia T0074 Topaz Vintage Effect Roller', dl: 745.83 },
  { id: 'tia_t0075', name: '4" Tia T0075 Topaz Brushing Effect Roller', dl: 386.13 },
];

const arunHandlesTrays = [
  { id: 'tia_h_2', name: '2" Mini Roller Handle - T0062A', dl: 15.71 },
  { id: 'tia_h_4', name: '4" Roller Handle - T0062A', dl: 23.46 },
  { id: 'tia_h_9', name: '9" Roller Handle - T0063', dl: 48.09 },
  { id: 'tia_h_long', name: 'Long Handle 4" - T0062', dl: 28.75 },
  { id: 'tia_tray_4', name: 'Tia T0024A (4") Roller Paint Tray', dl: 62.78 },
  { id: 'tia_tray_9', name: 'Tia T0024 (9") Roller Paint Tray', dl: 86.39 },
];

const arunPuttyKnives = [
  { id: 'tia_pk_6', name: 'Tia Heavy Duty Putty Knife 6" (150mm) Plastic Handle', dl: 47.69 },
  { id: 'tia_pk_8', name: 'Tia Heavy Duty Putty Knife 8" (200mm) Plastic Handle', dl: 63.39 },
  { id: 'tia_pk_10', name: 'Tia Heavy Duty Putty Knife 10" (250mm) Plastic Handle', dl: 79.24 },
  { id: 'tia_pk_12', name: 'Tia Heavy Duty Putty Knife 12" (300mm) Plastic Handle', dl: 95.23 },
];

const arunSticks = [
  { id: 'tia_stk_2m', name: 'Tia Telescopic Extension Stick T0064 - 2M', dl: 490.44 },
  { id: 'tia_stk_3m', name: 'Tia Telescopic Extension Stick T0064 - 3M', dl: 687.18 },
  { id: 'tia_stk_3m_eco', name: 'Tia Economy Extension Stick T0064 - 3M ECO', dl: 348.60 },
  { id: 'tia_stk_4m', name: 'Tia Telescopic Extension Stick T0064 - 4M', dl: 1011.18 },
  { id: 'tia_stk_5m', name: 'Tia Telescopic Extension Stick T0064 - 5M', dl: 1327.17 },
  { id: 'tia_stk_8m', name: 'Tia Telescopic Extension Stick T0064 - 8M', dl: 2213.09 },
  { id: 'tia_stk_3m_lock', name: 'Tia Telescopic Stick T0064 - 3M Press Lock', dl: 906.65 },
  { id: 'tia_stk_2m_eco', name: 'Tia Economy Extension Stick T0064 - 2M ECO', dl: 274.01 },
];

const arunSprayPaints = [
  { id: 'msp_black', name: 'MSP Aerosol Spray Paint - Black', dl: 129.93 },
  { id: 'msp_white', name: 'MSP Aerosol Spray Paint - Matt White', dl: 129.93 },
  { id: 'msp_clear', name: 'MSP Aerosol Spray Paint - Clear Lacquer', dl: 129.93 },
  { id: 'msp_red', name: 'MSP Aerosol Spray Paint - Red', dl: 129.93 },
  { id: 'msp_yellow', name: 'MSP Aerosol Spray Paint - Lemon Yellow', dl: 129.93 },
  { id: 'msp_blue', name: 'MSP Aerosol Spray Paint - Oxford Blue', dl: 129.93 },
  { id: 'msp_silver', name: 'MSP Aerosol Spray Paint - Silver', dl: 139.91 },
  { id: 'msp_gold', name: 'MSP Aerosol Spray Paint - Gold Metallic', dl: 139.91 },
  { id: 'msp_chrome', name: 'MSP Aerosol Spray Paint - Chrome Silver', dl: 170.58 },
  { id: 'asmaco_foam_330', name: 'Asmaco PU Expanding Foam 330ml', dl: 311.66 },
  { id: 'asmaco_foam_750', name: 'Asmaco PU Expanding Foam 750ml', dl: 171.33 },
];

// -------------------------------------------------------------
// 2. SURFA COATS PAINTS
// -------------------------------------------------------------
const surfaProducts = [
  // Exterior Emulsions
  {
    id: 'surfa_ultra_shield_base',
    name: 'Surfa Ultra Shield Base Coat (Exterior)',
    category: 'Exterior Emulsion',
    hsn: '3209',
    packs: { '20L': 5221, '10L': 2700, '4L': 1144, '1L': 317, '500ml': 161 },
  },
  {
    id: 'surfa_ultra_shield_top',
    name: 'Surfa Ultra Shield Top Coat (Exterior White)',
    category: 'Exterior Emulsion',
    hsn: '3209',
    packs: { '20L': 8660, '10L': 4348, '4L': 1872, '1L': 500, '500ml': 257 },
  },
  {
    id: 'surfa_all_weather_defender',
    name: 'Surfa All Weather Defender Exterior Emulsion ++',
    category: 'Exterior Emulsion',
    hsn: '3209',
    packs: { '20L': 10450, '10L': 5320, '4L': 2152, '1L': 551 },
  },
  {
    id: 'surfa_rain_shield',
    name: 'Surfa Surfex Rain Shield Exterior Emulsion',
    category: 'Exterior Emulsion',
    hsn: '3209',
    packs: { '20L': 8419, '10L': 4300, '4L': 1752, '1L': 444, '500ml': 225 },
  },
  {
    id: 'surfa_xtrema',
    name: 'Surfa Xtrema All Weather Exterior Emulsion',
    category: 'Exterior Emulsion',
    hsn: '3209',
    packs: { '20L': 7202, '10L': 3679, '4L': 1499, '1L': 380 },
  },
  {
    id: 'surfa_shyne_premium',
    name: 'Surfa Surfex Shyne Premium Exterior Emulsion',
    category: 'Exterior Emulsion',
    hsn: '3209',
    packs: { '20L': 5578, '10L': 2872, '4L': 1185, '1L': 306, '500ml': 158 },
  },
  {
    id: 'surfa_surfex_premium',
    name: 'Surfa Surfex Premium Exterior Emulsion',
    category: 'Exterior Emulsion',
    hsn: '3209',
    packs: { '20L': 5524, '10L': 2845, '4L': 1174, '1L': 303, '500ml': 156 },
  },
  {
    id: 'surfa_surfex_regular',
    name: 'Surfa Surfex Exterior Emulsion (White)',
    category: 'Exterior Emulsion',
    hsn: '3209',
    packs: { '20L': 5017, '10L': 2569, '4L': 1056, '1L': 271 },
  },
  {
    id: 'surfa_surface_ext',
    name: 'Surfa Surface Exterior Emulsion',
    category: 'Exterior Emulsion',
    hsn: '3209',
    packs: { '20L': 3273, '10L': 1710, '4L': 708, '1L': 184, '500ml': 99 },
  },
  {
    id: 'surfa_rhino_ext',
    name: 'Surfa Rhino Acrylic Exterior Emulsion',
    category: 'Exterior Emulsion',
    hsn: '3209',
    packs: { '20L': 3213, '10L': 1683, '4L': 698, '1L': 180 },
  },
  {
    id: 'surfa_tile_guard',
    name: 'Surfa Tile Guard Roof & Tile Paint',
    category: 'Exterior Emulsion',
    hsn: '3209',
    packs: { '20L': 5737, '10L': 2990, '4L': 1214, '1L': 318, '500ml': 166 },
  },
  {
    id: 'surfa_floor_coat',
    name: 'Surfa PU-Acrylic Floor Coat Paint',
    category: 'Exterior Emulsion',
    hsn: '3209',
    packs: { '20L': 7041, '10L': 3561, '4L': 1444, '1L': 374, '500ml': 195 },
  },

  // Interior Emulsions
  {
    id: 'surfa_galaxy_luxury',
    name: 'Surfa Galaxy Interior Luxury Emulsion',
    category: 'Interior Emulsion',
    hsn: '3209',
    packs: { '20L': 9974, '10L': 5029, '4L': 2026, '1L': 512 },
  },
  {
    id: 'surfa_imperial_luxury',
    name: 'Surfa Imperial Interior Luxury Emulsion',
    category: 'Interior Emulsion',
    hsn: '3209',
    packs: { '20L': 8281, '10L': 4150, '4L': 1673, '1L': 424, '500ml': 210 },
  },
  {
    id: 'surfa_easy_wash',
    name: 'Surfa Easy Wash Acrylic Emulsion Regular',
    category: 'Interior Emulsion',
    hsn: '3209',
    packs: { '20L': 5699, '10L': 2916, '4L': 1186, '1L': 304 },
  },
  {
    id: 'surfa_easy_wash_matt',
    name: 'Surfa Easy Wash Acrylic Emulsion Matt Finish',
    category: 'Interior Emulsion',
    hsn: '3209',
    packs: { '20L': 5484, '10L': 2807, '4L': 1141, '1L': 294 },
  },
  {
    id: 'surfa_super_shine',
    name: 'Surfa Super Shine Acrylic Interior Emulsion',
    category: 'Interior Emulsion',
    hsn: '3209',
    packs: { '20L': 3662, '10L': 1896, '4L': 794, '1L': 206, '500ml': 109 },
  },
  {
    id: 'surfa_supreme_plastic',
    name: 'Surfa Supreme Plastic Emulsion (Interior)',
    category: 'Interior Emulsion',
    hsn: '3209',
    packs: { '20L': 2800, '10L': 1449, '4L': 611, '1L': 160 },
  },
  {
    id: 'surfa_amaze_int',
    name: 'Surfa Amaze Interior Emulsion',
    category: 'Interior Emulsion',
    hsn: '3209',
    packs: { '20L': 2615, '10L': 1355, '4L': 575, '1L': 151 },
  },
  {
    id: 'surfa_champ_int',
    name: 'Surfa Champ Interior Economy Emulsion',
    category: 'Interior Emulsion',
    hsn: '3209',
    packs: { '20L': 1835, '10L': 955, '4L': 407, '1L': 108 },
  },
  {
    id: 'surfa_pearl_glow_silver',
    name: 'Surfa Pearl Glow Acrylic Emulsion - G1 Silver',
    category: 'Interior Emulsion',
    hsn: '3209',
    packs: { '20L': 7957, '10L': 4002, '4L': 1631, '1L': 414, '500ml': 226, '200ml': 117, '100ml': 74 },
  },
  {
    id: 'surfa_pearl_glow_gold',
    name: 'Surfa Pearl Glow Acrylic Emulsion - G4 Heritage Gold',
    category: 'Interior Emulsion',
    hsn: '3209',
    packs: { '20L': 9935, '10L': 5066, '4L': 2085, '1L': 528, '500ml': 300, '200ml': 167, '100ml': 108 },
  },

  // Wall Primers
  {
    id: 'surfa_inex_primer',
    name: 'Surfa Inex Primer (Interior & Exterior)',
    category: 'Wall Primer',
    hsn: '3208',
    packs: { '20L': 2630, '10L': 1348, '4L': 559, '1L': 144, '500ml': 77 },
  },
  {
    id: 'surfa_acrylic_ext_primer',
    name: 'Surfa Acrylic Exterior Cement Primer W/B',
    category: 'Wall Primer',
    hsn: '3208',
    packs: { '20L': 2851, '10L': 1455, '4L': 600, '1L': 156 },
  },
  {
    id: 'surfa_surfalac_int_primer',
    name: 'Surfa Surfalac Acrylic Interior Cement Primer (WB)',
    category: 'Wall Primer',
    hsn: '3208',
    packs: { '20L': 2580, '10L': 1319, '4L': 574, '1L': 150, '500ml': 81 },
  },
  {
    id: 'surfa_smart_primer_white',
    name: 'Surfa Smart Primer White (WB)',
    category: 'Wall Primer',
    hsn: '3208',
    packs: { '20L': 2209, '10L': 1131, '4L': 467, '1L': 125 },
  },
  {
    id: 'surfa_bright_primer_plus',
    name: 'Surfa Bright Primer Plus White',
    category: 'Wall Primer',
    hsn: '3208',
    packs: { '20L': 1786, '10L': 918, '4L': 382, '1L': 102, '500ml': 56 },
  },
  {
    id: 'surfa_alkali_resistant_primer',
    name: 'Surfa Alkali Resistant Interior Cement Primer (OB)',
    category: 'Wall Primer',
    hsn: '3208',
    packs: { '20L': 3698, '10L': 1906, '4L': 788, '1L': 205 },
  },
  {
    id: 'surfa_wood_primer_white',
    name: 'Surfa Wood Primer G-0 White',
    category: 'Wall Primer',
    hsn: '3208',
    packs: { '20L': 3788, '10L': 1941, '4L': 794, '1L': 205, '500ml': 108 },
  },
  {
    id: 'surfa_red_oxide_primer',
    name: 'Surfa Red Oxide Metal Primer (Oil Based)',
    category: 'Wall Primer',
    hsn: '3208',
    packs: { '20L': 3513, '10L': 1805, '4L': 742, '1L': 193, '500ml': 101 },
  },
  {
    id: 'surfa_zinc_chromate_primer',
    name: 'Surfa Zinc Chromate Metal Primer Yellow',
    category: 'Wall Primer',
    hsn: '3208',
    packs: { '20L': 3852, '10L': 2019, '4L': 814, '1L': 209, '500ml': 111 },
  },

  // Enamels & Gloss
  {
    id: 'surfa_emerald_gloss',
    name: 'Surfa Emerald High Gloss Premium Enamel (Oil Based)',
    category: 'Enamel & Gloss',
    hsn: '3208',
    packs: { '20L': 4709, '10L': 2415, '4L': 1012, '1L': 263, '500ml': 137, '200ml': 69, '100ml': 39 },
  },
  {
    id: 'surfa_coral_enamel',
    name: 'Surfa Coral Multi Purpose Synthetic Enamel',
    category: 'Enamel & Gloss',
    hsn: '3208',
    packs: { '20L': 3653, '10L': 1895, '4L': 780, '1L': 203, '500ml': 103, '200ml': 52 },
  },
  {
    id: 'surfa_satin_finish_enamel',
    name: 'Surfa Satin Finish Enamel OB White',
    category: 'Enamel & Gloss',
    hsn: '3208',
    packs: { '20L': 5608, '10L': 2849, '4L': 1155, '1L': 297, '500ml': 153 },
  },
  {
    id: 'surfa_matt_black_enamel',
    name: 'Surfa Matt Black Enamel (Oil Based)',
    category: 'Enamel & Gloss',
    hsn: '3208',
    packs: { '20L': 4581, '10L': 2334, '4L': 948, '1L': 243, '500ml': 130 },
  },
  {
    id: 'surfa_blackboard_paint',
    name: 'Surfa Black Board Paint Enamel OB',
    category: 'Enamel & Gloss',
    hsn: '3208',
    packs: { '20L': 5052, '10L': 2555, '4L': 1039, '1L': 267, '500ml': 139 },
  },

  // Wall Putty & Powders
  {
    id: 'surfa_wallcure_putty_white',
    name: 'Surfa Wallcure Putty White (Yellow PP Bags)',
    category: 'Wall Putty',
    hsn: '2520',
    packs: { '40kg': 843, '30kg': 643, '20kg': 538, '5kg': 149 },
  },
  {
    id: 'surfa_wall_putty_blue',
    name: 'Surfa Wall Putty in Dry Powder Form (Blue PP Bags)',
    category: 'Wall Putty',
    hsn: '2520',
    packs: { '40kg': 781 },
  },
  {
    id: 'surfa_shield_pro_waterproof_putty',
    name: 'Surfa Shield Pro Waterproof Putty',
    category: 'Wall Putty',
    hsn: '2520',
    packs: { '40kg': 1091, '20kg': 594, '5kg': 167, '1kg': 35 },
  },
  {
    id: 'surfa_acrylic_wall_putty_buckets',
    name: 'Surfa Acrylic Wall Putty (In Buckets)',
    category: 'Wall Putty',
    hsn: '3214',
    packs: { '20kg': 1237, '10kg': 653, '5kg': 344, '2kg': 141, '1kg': 73 },
  },
  {
    id: 'surfa_acrylic_wall_putty_pp',
    name: 'Surfa Acrylic Wall Putty (In PP Bags)',
    category: 'Wall Putty',
    hsn: '3214',
    packs: { '20kg': 1098, '10kg': 574, '5kg': 296, '1kg': 61 },
  },
  {
    id: 'surfa_3d_sealant_putty',
    name: 'Surfa 3D Sealant Putty',
    category: 'Wall Putty',
    hsn: '3214',
    packs: { '25kg': 1366, '20kg': 1123, '10kg': 571, '5kg': 308, '1kg': 72 },
  },
  {
    id: 'surfa_crack_fill_paste',
    name: 'Surfa Crack Fill Paste - Flexible Filler',
    category: 'Wall Putty',
    hsn: '3214',
    packs: { '5kg': 1213, '1kg': 257 },
  },

  // Waterproofing & Build Care
  {
    id: 'surfa_damp_shield_xtreme',
    name: 'Surfa Damp Shield Xtreme Waterproofing White',
    category: 'Waterproofing',
    hsn: '3209',
    packs: { '20L': 5081, '10L': 2637, '4L': 1084, '1L': 286, '500ml': 147 },
  },
  {
    id: 'surfa_damp_shield',
    name: 'Surfa Damp Shield Waterproofing White',
    category: 'Waterproofing',
    hsn: '3209',
    packs: { '20L': 4875, '10L': 2467, '4L': 1028, '1L': 273, '500ml': 138 },
  },
  {
    id: 'surfa_damp_seal_2k',
    name: 'Surfa Damp Seal 2K Flexible Cementitious Waterproofing',
    category: 'Waterproofing',
    hsn: '3824',
    packs: { '15kg': 1535, '6kg': 701, '3kg': 357 },
  },
  {
    id: 'surfa_build_care_lw',
    name: 'Surfa Build Care LW+ Integral Waterproofing Compound',
    category: 'Waterproofing',
    hsn: '3824',
    packs: { '20L': 1395, '10L': 773, '5L': 418, '1L': 91, '200ml': 26 },
  },
  {
    id: 'surfacrete_sbr',
    name: 'Surfacrete SBR Waterproofing & Repair Mortar',
    category: 'Waterproofing',
    hsn: '3824',
    packs: { '20L': 3488, '10L': 1846, '4L': 913, '1L': 210, '200ml': 55 },
  },
  {
    id: 'surfa_heat_shield',
    name: 'Surfa Heat Shield White (Floor Coating & Walkways)',
    category: 'Waterproofing',
    hsn: '3209',
    packs: { '20L': 5411, '10L': 2730, '4L': 1124, '1L': 290 },
  },

  // Wood Care & Industrial
  {
    id: 'wood_rich_sanding_sealer',
    name: 'Wood Rich NC Sanding Sealer',
    category: 'Wood Finish',
    hsn: '3208',
    packs: { '20L': 4322, '10L': 2214, '4L': 892, '1L': 232, '500ml': 128 },
  },
  {
    id: 'sayerlack_wood_stain_teak',
    name: 'Sayerlack Wood Stain - Burma Teak',
    category: 'Wood Finish',
    hsn: '3208',
    packs: { '20L': 13161, '10L': 6581, '4L': 2632, '1L': 658, '500ml': 330 },
  },
  {
    id: 'sayerlack_wood_stain_walnut',
    name: 'Sayerlack Wood Stain - Walnut',
    category: 'Wood Finish',
    hsn: '3208',
    packs: { '20L': 13161, '10L': 6581, '4L': 2632, '1L': 658, '500ml': 330 },
  },
  {
    id: 'surfa_aluminum_paint',
    name: 'Surfa Aluminum Industrial Paint',
    category: 'Enamel & Gloss',
    hsn: '3208',
    packs: { '20L': 5632, '10L': 2889, '4L': 1182, '1L': 310, '500ml': 162 },
  },
];

console.log('Beginning transaction to import products...');

const transaction = db.transaction(() => {
  // 1. Insert Arun & Tia Brushes
  for (const b of arunBrushes) {
    insertProduct.run(
      b.id,
      'Arun & Tia',
      b.name,
      'Hardware & Tools',
      '9603',
      18.0,
      'High-quality bristle paint brush for smooth edge and trim application'
    );
    const p = makePack(b.id, b.size, b.dl, null, 30);
    insertPack.run(p.id, p.productId, p.packSize, p.barcode, p.mrp, p.retailPrice, p.contractorPrice, p.wholesalePrice, p.costPrice, p.stockQty, p.minStockAlert);
  }

  // 2. Insert Arun Rollers with handle
  for (const r of arunRollersWithHandle) {
    insertProduct.run(
      r.id,
      'Arun & Tia',
      r.name,
      'Hardware & Tools',
      '9603',
      18.0,
      'Professional microfiber roller with ergonomic handle for interior & exterior painting'
    );
    const p = makePack(r.id, '1 Pc', r.dl, null, 25);
    insertPack.run(p.id, p.productId, p.packSize, p.barcode, p.mrp, p.retailPrice, p.contractorPrice, p.wholesalePrice, p.costPrice, p.stockQty, p.minStockAlert);
  }

  // 3. Special Effect Rollers
  for (const s of arunSpecialEffect) {
    insertProduct.run(
      s.id,
      'Arun & Tia',
      s.name,
      'Hardware & Tools',
      '9603',
      18.0,
      'Special designer effect roller / spatula for royal texture wall creation'
    );
    const p = makePack(s.id, '1 Pc', s.dl, null, 15);
    insertPack.run(p.id, p.productId, p.packSize, p.barcode, p.mrp, p.retailPrice, p.contractorPrice, p.wholesalePrice, p.costPrice, p.stockQty, p.minStockAlert);
  }

  // 4. Handles & Trays
  for (const h of arunHandlesTrays) {
    insertProduct.run(
      h.id,
      'Arun & Tia',
      h.name,
      'Hardware & Tools',
      '3926',
      18.0,
      'Sturdy heavy-duty plastic handle / paint tray'
    );
    const p = makePack(h.id, '1 Pc', h.dl, null, 40);
    insertPack.run(p.id, p.productId, p.packSize, p.barcode, p.mrp, p.retailPrice, p.contractorPrice, p.wholesalePrice, p.costPrice, p.stockQty, p.minStockAlert);
  }

  // 5. Putty Knives
  for (const pk of arunPuttyKnives) {
    insertProduct.run(
      pk.id,
      'Arun & Tia',
      pk.name,
      'Hardware & Tools',
      '8205',
      18.0,
      'Flexible stainless steel blade putty knife with ergonomic plastic handle'
    );
    const p = makePack(pk.id, '1 Pc', pk.dl, null, 35);
    insertPack.run(p.id, p.productId, p.packSize, p.barcode, p.mrp, p.retailPrice, p.contractorPrice, p.wholesalePrice, p.costPrice, p.stockQty, p.minStockAlert);
  }

  // 6. Telescopic Sticks
  for (const st of arunSticks) {
    insertProduct.run(
      st.id,
      'Arun & Tia',
      st.name,
      'Hardware & Tools',
      '7616',
      18.0,
      'High-grade aluminum telescopic extension pole for high wall and ceiling painting'
    );
    const p = makePack(st.id, '1 Pc', st.dl, null, 20);
    insertPack.run(p.id, p.productId, p.packSize, p.barcode, p.mrp, p.retailPrice, p.contractorPrice, p.wholesalePrice, p.costPrice, p.stockQty, p.minStockAlert);
  }

  // 7. Spray Paints & PU Foam
  for (const sp of arunSprayPaints) {
    insertProduct.run(
      sp.id,
      'Arun & Tia',
      sp.name,
      'Thinners & Solvents',
      '3208',
      18.0,
      'Quick-drying multi-surface aerosol spray paint / expanding foam'
    );
    const p = makePack(sp.id, '400ml', sp.dl, null, 30);
    insertPack.run(p.id, p.productId, p.packSize, p.barcode, p.mrp, p.retailPrice, p.contractorPrice, p.wholesalePrice, p.costPrice, p.stockQty, p.minStockAlert);
  }

  // 8. Surfa Coats Paints Catalog
  for (const sp of surfaProducts) {
    insertProduct.run(
      sp.id,
      'Surfa Coats',
      sp.name,
      sp.category,
      sp.hsn || '3209',
      18.0,
      'Premium architectural coating from Surfa Coats Paints Dealer Price List'
    );

    for (const [size, dlPrice] of Object.entries(sp.packs)) {
      const p = makePack(sp.id, size, dlPrice, null, 20);
      insertPack.run(p.id, p.productId, p.packSize, p.barcode, p.mrp, p.retailPrice, p.contractorPrice, p.wholesalePrice, p.costPrice, p.stockQty, p.minStockAlert);
    }
  }
});

transaction();

const totalProducts = db.prepare('SELECT count(*) as c FROM products').get().c;
const totalPacks = db.prepare('SELECT count(*) as c FROM product_pack_sizes').get().c;

console.log(`Successfully imported! Total products in DB: ${totalProducts}, Total pack sizes: ${totalPacks}`);
