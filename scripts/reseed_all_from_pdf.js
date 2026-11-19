const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'paint_store.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = OFF'); // Disable temporarily during table wipe

console.log('Opened database at:', dbPath);

// Categories
const categories = [
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

// Brands
const brands = [
  'Surfa Coats',
  'Arun & Tia',
  'JK Cement',
  'JK WhiteMaxX',
  'Surya Cem',
  'Udhayas Cem',
  'Pilot',
  'Butterfly Paints',
  'Ajax',
  'Duke Gold',
  '24CRT Gold',
  'Termiguard',
  'Asmaco',
  'General Hardware',
];

// Helper to calculate pricing from DL / Inward Cost Price
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

const productsToImport = [];

// =========================================================================
// 1. SURFA COATS PAINTS (from 9-Page Dealer Price List)
// =========================================================================

// Exteriors
productsToImport.push({
  id: 'surfa_ultra_shield_base',
  brand: 'Surfa Coats',
  name: 'Ultra Shield Base Coat',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 5221, '10 L': 2700, '4 L': 1144, '1 L': 317, '500 ml': 161 },
});
productsToImport.push({
  id: 'surfa_ultra_shield_top_white',
  brand: 'Surfa Coats',
  name: 'Ultra Shield Top Coat (White)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 8660, '10 L': 4348, '4 L': 1872, '1 L': 500, '500 ml': 257 },
});
productsToImport.push({
  id: 'surfa_ultra_shield_top_colours',
  brand: 'Surfa Coats',
  name: 'Ultra Shield Top Coat (Normal Colours)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 8820, '10 L': 4428, '4 L': 1903, '1 L': 507, '500 ml': 261 },
});
productsToImport.push({
  id: 'surfa_all_weather_defender',
  brand: 'Surfa Coats',
  name: 'All Weather Defender Exterior Emulsion ++ (Dazzling White)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 10450, '10 L': 5320, '4 L': 2152, '1 L': 551 },
});
productsToImport.push({
  id: 'surfa_surfex_rain_shield_white',
  brand: 'Surfa Coats',
  name: 'Surfex Rain Shield (White)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 8419, '10 L': 4300, '4 L': 1752, '1 L': 444, '500 ml': 225 },
});
productsToImport.push({
  id: 'surfa_surfex_rain_shield_colours',
  brand: 'Surfa Coats',
  name: 'Surfex Rain Shield (Colours)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 8854, '10 L': 4513, '4 L': 1835, '1 L': 467, '500 ml': 236 },
});
productsToImport.push({
  id: 'surfa_surfex_rain_shield_dark',
  brand: 'Surfa Coats',
  name: 'Surfex Rain Shield (Dark Colours)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 8940, '10 L': 4557, '4 L': 1852, '1 L': 471, '500 ml': 239 },
});
productsToImport.push({
  id: 'surfa_xtrema_white',
  brand: 'Surfa Coats',
  name: 'Xtrema Exterior Emulsion (White)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 7202, '10 L': 3679, '4 L': 1499, '1 L': 380 },
});
productsToImport.push({
  id: 'surfa_xtrema_dazzling',
  brand: 'Surfa Coats',
  name: 'Xtrema Exterior Emulsion (Dazzling White)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 7514, '10 L': 3835, '4 L': 1561, '1 L': 396 },
});
productsToImport.push({
  id: 'surfa_xtrema_colours',
  brand: 'Surfa Coats',
  name: 'Xtrema Exterior Emulsion (Normal Colours)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 7573, '10 L': 3861, '4 L': 1570, '1 L': 399 },
});
productsToImport.push({
  id: 'surfa_xtrema_dark',
  brand: 'Surfa Coats',
  name: 'Xtrema Exterior Emulsion (Dark Colours)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 7647, '10 L': 3898, '4 L': 1585, '1 L': 403 },
});
productsToImport.push({
  id: 'surfa_surfex_shyne_pristine',
  brand: 'Surfa Coats',
  name: 'Surfex Shyne Premium (Pristine White)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 5578, '10 L': 2872, '4 L': 1185, '1 L': 306, '500 ml': 158 },
});
productsToImport.push({
  id: 'surfa_surfex_shyne_dazzling',
  brand: 'Surfa Coats',
  name: 'Surfex Shyne Premium (Dazzling White)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 5707, '10 L': 2936, '4 L': 1210, '1 L': 313, '500 ml': 160 },
});
productsToImport.push({
  id: 'surfa_surfex_shyne_colours',
  brand: 'Surfa Coats',
  name: 'Surfex Shyne Premium (Colours)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 5764, '10 L': 2927, '4 L': 1205, '1 L': 313, '500 ml': 160 },
});
productsToImport.push({
  id: 'surfa_surfex_shyne_dark',
  brand: 'Surfa Coats',
  name: 'Surfex Shyne Premium (Dark Colours)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 5850, '10 L': 2971, '4 L': 1222, '1 L': 317, '500 ml': 162 },
});
productsToImport.push({
  id: 'surfa_surfex_prem_pristine',
  brand: 'Surfa Coats',
  name: 'Surfex Premium Exterior (Pristine White)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 5524, '10 L': 2845, '4 L': 1174, '1 L': 303, '500 ml': 156 },
});
productsToImport.push({
  id: 'surfa_surfex_prem_colours',
  brand: 'Surfa Coats',
  name: 'Surfex Premium Exterior (Colours)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 5710, '10 L': 2900, '4 L': 1194, '1 L': 310, '500 ml': 158 },
});
productsToImport.push({
  id: 'surfa_surfex_regular_white',
  brand: 'Surfa Coats',
  name: 'Surfex Exterior Emulsion (White)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 5017, '10 L': 2569, '4 L': 1056, '1 L': 271 },
});
productsToImport.push({
  id: 'surfa_surface_white',
  brand: 'Surfa Coats',
  name: 'Surface Exterior Emulsion (White)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 3273, '10 L': 1710, '4 L': 708, '1 L': 184, '500 ml': 99 },
});
productsToImport.push({
  id: 'surfa_surface_super_white',
  brand: 'Surfa Coats',
  name: 'Surface Exterior Emulsion (Super White)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 3489, '10 L': 1818, '4 L': 741, '1 L': 194, '500 ml': 103 },
});
productsToImport.push({
  id: 'surfa_surface_colours',
  brand: 'Surfa Coats',
  name: 'Surface Exterior Emulsion (Colours)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 3445, '10 L': 1779, '4 L': 720, '1 L': 189, '500 ml': 101 },
});
productsToImport.push({
  id: 'surfa_surface_dark',
  brand: 'Surfa Coats',
  name: 'Surface Exterior Emulsion (Dark Colours)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 3735, '10 L': 1938, '4 L': 788, '1 L': 206, '500 ml': 109 },
});
productsToImport.push({
  id: 'surfa_surface_signal_red',
  brand: 'Surfa Coats',
  name: 'Surface Exterior Special Dark (Signal Red / New Flame)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 3879, '10 L': 2010, '4 L': 817, '1 L': 213, '500 ml': 114 },
});
productsToImport.push({
  id: 'surfa_rhino_ext',
  brand: 'Surfa Coats',
  name: 'Rhino Acrylic Exterior Emulsion (White)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 3213, '10 L': 1683, '4 L': 698, '1 L': 180 },
});
productsToImport.push({
  id: 'surfa_inex_flash',
  brand: 'Surfa Coats',
  name: 'Inex Flash Ext. Emulsion (Light Colours)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 2547, '10 L': 1392, '4 L': 586, '1 L': 154 },
});
productsToImport.push({
  id: 'surfa_inex_flash_dark',
  brand: 'Surfa Coats',
  name: 'Inex Flash Ext. Emulsion (Dark Colours)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 2647, '10 L': 1442, '4 L': 606, '1 L': 159 },
});
productsToImport.push({
  id: 'surfa_surfacem_white',
  brand: 'Surfa Coats',
  name: 'Surfacem Cement Paint (White)',
  category: 'Exterior Emulsion',
  hsn: '3214',
  packs: { '25 kg': 985, '5 kg': 208, '25 X 1 kg': 1105, '10 X 1 kg': 454 },
});
productsToImport.push({
  id: 'surfa_surfacem_regular',
  brand: 'Surfa Coats',
  name: 'Surfacem Cement Paint (Regular Shades)',
  category: 'Exterior Emulsion',
  hsn: '3214',
  packs: { '25 kg': 1014, '5 kg': 215, '25 X 1 kg': 1134, '10 X 1 kg': 465 },
});
productsToImport.push({
  id: 'surfa_surfacem_special',
  brand: 'Surfa Coats',
  name: 'Surfacem Cement Paint (Special Shades: Brick Red, Spanish Gold)',
  category: 'Exterior Emulsion',
  hsn: '3214',
  packs: { '25 kg': 1165, '5 kg': 245, '25 X 1 kg': 1285, '10 X 1 kg': 521 },
});
productsToImport.push({
  id: 'surfa_surfatex_matt',
  brand: 'Surfa Coats',
  name: 'Surfatex Matt Exterior Finish',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 4567, '4 L': 931, '1 L': 246, '500 ml': 134 },
});
productsToImport.push({
  id: 'surfa_tile_guard_normal',
  brand: 'Surfa Coats',
  name: 'Surfa Tile Guard Roof & Tile (Normal Colours)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 5737, '10 L': 2990, '4 L': 1214, '1 L': 318, '500 ml': 166 },
});
productsToImport.push({
  id: 'surfa_tile_guard_special',
  brand: 'Surfa Coats',
  name: 'Surfa Tile Guard Roof & Tile (Special Colours)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 6259, '10 L': 3190, '4 L': 1331, '1 L': 342, '500 ml': 176 },
});
productsToImport.push({
  id: 'surfa_tile_guard_dark',
  brand: 'Surfa Coats',
  name: 'Surfa Tile Guard Roof & Tile (Dark Colours)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 6665, '10 L': 3424, '4 L': 1404, '1 L': 359, '500 ml': 184 },
});
productsToImport.push({
  id: 'surfa_pu_floor_regular',
  brand: 'Surfa Coats',
  name: 'Surfa PU-Acrylic Floor Coat (Regular Colours)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 7041, '10 L': 3561, '4 L': 1444, '1 L': 374, '500 ml': 195 },
});
productsToImport.push({
  id: 'surfa_pu_floor_special',
  brand: 'Surfa Coats',
  name: 'Surfa PU-Acrylic Floor Coat (Special Colours)',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 7622, '10 L': 3852, '4 L': 1560, '1 L': 403, '500 ml': 210 },
});
productsToImport.push({
  id: 'surfa_prokoat',
  brand: 'Surfa Coats',
  name: 'Prokoat Exterior Coating',
  category: 'Exterior Emulsion',
  hsn: '3209',
  packs: { '20 L': 4491, '10 L': 2267, '4 L': 928, '1 L': 242 },
});

// Interiors
productsToImport.push({
  id: 'surfa_galaxy_white',
  brand: 'Surfa Coats',
  name: 'Surfa Galaxy Interior Luxury Emulsion (White)',
  category: 'Interior Emulsion',
  hsn: '3209',
  packs: { '20 L': 9974, '10 L': 5029, '4 L': 2026, '1 L': 512 },
});
productsToImport.push({
  id: 'surfa_galaxy_colours',
  brand: 'Surfa Coats',
  name: 'Surfa Galaxy Interior Luxury Emulsion (Colours)',
  category: 'Interior Emulsion',
  hsn: '3209',
  packs: { '20 L': 9864, '10 L': 4957, '4 L': 2026, '1 L': 511 },
});
productsToImport.push({
  id: 'surfa_imperial_white',
  brand: 'Surfa Coats',
  name: 'Imperial Interior Luxury Emulsion (White)',
  category: 'Interior Emulsion',
  hsn: '3209',
  packs: { '20 L': 8281, '10 L': 4150, '4 L': 1673, '1 L': 424, '500 ml': 210 },
});
productsToImport.push({
  id: 'surfa_easy_wash_reg_white',
  brand: 'Surfa Coats',
  name: 'Surfa Easy Wash Acrylic Emulsion Regular (White)',
  category: 'Interior Emulsion',
  hsn: '3209',
  packs: { '20 L': 5699, '10 L': 2916, '4 L': 1186, '1 L': 304 },
});
productsToImport.push({
  id: 'surfa_easy_wash_reg_colours',
  brand: 'Surfa Coats',
  name: 'Surfa Easy Wash Acrylic Emulsion Regular (Colours)',
  category: 'Interior Emulsion',
  hsn: '3209',
  packs: { '20 L': 5783, '10 L': 2973, '4 L': 1205, '1 L': 312 },
});
productsToImport.push({
  id: 'surfa_easy_wash_matt_white',
  brand: 'Surfa Coats',
  name: 'Surfa Easy Wash Acrylic Emulsion Matt Finish (White)',
  category: 'Interior Emulsion',
  hsn: '3209',
  packs: { '20 L': 5484, '10 L': 2807, '4 L': 1141, '1 L': 294 },
});
productsToImport.push({
  id: 'surfa_super_shine_white',
  brand: 'Surfa Coats',
  name: 'Super Shine Acrylic Emulsion (White)',
  category: 'Interior Emulsion',
  hsn: '3209',
  packs: { '20 L': 3662, '10 L': 1896, '4 L': 794, '1 L': 206, '500 ml': 109 },
});
productsToImport.push({
  id: 'surfa_super_shine_brilliant',
  brand: 'Surfa Coats',
  name: 'Super Shine Acrylic Emulsion (Brilliant White)',
  category: 'Interior Emulsion',
  hsn: '3209',
  packs: { '20 L': 3742, '10 L': 1936, '4 L': 810, '1 L': 210, '500 ml': 111 },
});
productsToImport.push({
  id: 'surfa_supreme_plastic_white',
  brand: 'Surfa Coats',
  name: 'Supreme Plastic Emulsion (White)',
  category: 'Interior Emulsion',
  hsn: '3209',
  packs: { '20 L': 2800, '10 L': 1449, '4 L': 611, '1 L': 160 },
});
productsToImport.push({
  id: 'surfa_supreme_plastic_colours',
  brand: 'Surfa Coats',
  name: 'Supreme Plastic Emulsion (Colours)',
  category: 'Interior Emulsion',
  hsn: '3209',
  packs: { '20 L': 2894, '10 L': 1497, '4 L': 631, '1 L': 164 },
});
productsToImport.push({
  id: 'surfa_amaze_white',
  brand: 'Surfa Coats',
  name: 'Amaze Interior Emulsion (White)',
  category: 'Interior Emulsion',
  hsn: '3209',
  packs: { '20 L': 2615, '10 L': 1355, '4 L': 575, '1 L': 151 },
});
productsToImport.push({
  id: 'surfa_champ_white',
  brand: 'Surfa Coats',
  name: 'Surfa Champ Interior Emulsion (White)',
  category: 'Interior Emulsion',
  hsn: '3209',
  packs: { '20 L': 1835, '10 L': 955, '4 L': 407, '1 L': 108 },
});
productsToImport.push({
  id: 'surfa_champ_colours',
  brand: 'Surfa Coats',
  name: 'Surfa Champ Interior Emulsion (Colours)',
  category: 'Interior Emulsion',
  hsn: '3209',
  packs: { '20 L': 2214, '10 L': 1129, '4 L': 465, '1 L': 124 },
});
productsToImport.push({
  id: 'surfa_pearl_glow_silver',
  brand: 'Surfa Coats',
  name: 'Surfa Pearl Glow Acrylic Emulsion (G-1 Silver)',
  category: 'Interior Emulsion',
  hsn: '3209',
  packs: { '20 L': 7957, '10 L': 4002, '4 L': 1631, '1 L': 414, '500 ml': 226, '200 ml': 117, '100 ml': 74, '50 ml': 41 },
});
productsToImport.push({
  id: 'surfa_pearl_glow_gold',
  brand: 'Surfa Coats',
  name: 'Surfa Pearl Glow Acrylic Emulsion (G-4 Heritage Gold)',
  category: 'Interior Emulsion',
  hsn: '3209',
  packs: { '20 L': 9935, '10 L': 5066, '4 L': 2085, '1 L': 528, '500 ml': 300, '200 ml': 167, '100 ml': 108, '50 ml': 55 },
});
productsToImport.push({
  id: 'surfa_acrylic_distemper_white',
  brand: 'Surfa Coats',
  name: 'Surfa Acrylic Distemper (White)',
  category: 'Interior Emulsion',
  hsn: '3214',
  packs: { '20 kg': 1175, '10 kg': 622, '5 kg': 344, '2 kg': 144, '1 kg': 76 },
});
productsToImport.push({
  id: 'surfa_acrylic_distemper_pouch',
  brand: 'Surfa Coats',
  name: 'Surfa Acrylic Distemper WB (1kg Pouch)',
  category: 'Interior Emulsion',
  hsn: '3214',
  packs: { '1 kg': 43 },
});
productsToImport.push({
  id: 'surfa_crystal_distemper_white',
  brand: 'Surfa Coats',
  name: 'Crystal Distemper Budget Distemper (White)',
  category: 'Interior Emulsion',
  hsn: '3214',
  packs: { '20 kg': 935, '10 kg': 502, '5 kg': 273, '2 kg': 113, '1 kg': 62 },
});
productsToImport.push({
  id: 'surfa_bharat_one_latex',
  brand: 'Surfa Coats',
  name: 'Bharat One Latex Interior Paint (White)',
  category: 'Interior Emulsion',
  hsn: '3209',
  packs: { '20 kg': 990, '10 kg': 526, '5 kg': 268, '2 kg': 121, '1 kg': 66 },
});
productsToImport.push({
  id: 'surfa_inex_ceiling_white',
  brand: 'Surfa Coats',
  name: 'Inex Ceiling Paint (White)',
  category: 'Interior Emulsion',
  hsn: '3209',
  packs: { '20 L': 2912, '10 L': 1513, '4 L': 638, '1 L': 168, '500 ml': 91 },
});
productsToImport.push({
  id: 'surfa_ceiling_paint_brilliant',
  brand: 'Surfa Coats',
  name: 'Surfa Ceiling Paint (Brilliant White)',
  category: 'Interior Emulsion',
  hsn: '3209',
  packs: { '20 L': 2964, '10 L': 1536, '4 L': 646, '1 L': 169 },
});

// Enamels
productsToImport.push({
  id: 'surfa_emerald_gloss_white',
  brand: 'Surfa Coats',
  name: 'Surfa Emerald High Gloss Enamel (Super White)',
  category: 'Enamel & Gloss',
  hsn: '3208',
  packs: { '20 L': 4709, '10 L': 2415, '4 L': 1012, '1 L': 263, '500 ml': 137, '200 ml': 69, '100 ml': 39, '50 ml': 24 },
});
productsToImport.push({
  id: 'surfa_emerald_deep_pool',
  brand: 'Surfa Coats',
  name: 'Surfa Emerald High Gloss Enamel (Deep Pool)',
  category: 'Enamel & Gloss',
  hsn: '3208',
  packs: { '20 L': 5186, '10 L': 2640, '4 L': 1082, '1 L': 279, '500 ml': 145, '200 ml': 67, '100 ml': 37, '50 ml': 22 },
});
productsToImport.push({
  id: 'surfa_emerald_metallics',
  brand: 'Surfa Coats',
  name: 'Surfa Emerald High Gloss Enamel (Metallics)',
  category: 'Enamel & Gloss',
  hsn: '3208',
  packs: { '20 L': 14251, '10 L': 7195, '4 L': 2881, '1 L': 730, '500 ml': 371, '200 ml': 163, '100 ml': 84, '50 ml': 45 },
});
productsToImport.push({
  id: 'surfa_coral_enamel_g1',
  brand: 'Surfa Coats',
  name: 'Coral Multi Purpose Synthetic Enamel (G-1)',
  category: 'Enamel & Gloss',
  hsn: '3208',
  packs: { '20 L': 3653, '10 L': 1895, '4 L': 780, '1 L': 203, '500 ml': 103, '200 ml': 52 },
});
productsToImport.push({
  id: 'surfa_coral_enamel_g2',
  brand: 'Surfa Coats',
  name: 'Coral Multi Purpose Synthetic Enamel (G-2)',
  category: 'Enamel & Gloss',
  hsn: '3208',
  packs: { '20 L': 3827, '10 L': 1942, '4 L': 812, '1 L': 212, '500 ml': 106, '200 ml': 56 },
});
productsToImport.push({
  id: 'surfa_satin_finish_white',
  brand: 'Surfa Coats',
  name: 'Surfa Satin Finish Enamel OB (White)',
  category: 'Enamel & Gloss',
  hsn: '3208',
  packs: { '20 L': 5608, '10 L': 2849, '4 L': 1155, '1 L': 297, '500 ml': 153, '200 ml': 63 },
});
productsToImport.push({
  id: 'surfa_matt_black_enamel',
  brand: 'Surfa Coats',
  name: 'Surfa Matt Black Enamel (Oil Based)',
  category: 'Enamel & Gloss',
  hsn: '3208',
  packs: { '20 L': 4581, '10 L': 2334, '4 L': 948, '1 L': 243, '500 ml': 130, '200 ml': 57 },
});
productsToImport.push({
  id: 'surfa_blackboard_paint',
  brand: 'Surfa Coats',
  name: 'Surfa Black Board Paint Enamel OB',
  category: 'Enamel & Gloss',
  hsn: '3208',
  packs: { '20 L': 5052, '10 L': 2555, '4 L': 1039, '1 L': 267, '500 ml': 139, '200 ml': 62 },
});
productsToImport.push({
  id: 'surfa_floor_coat_enamel_red',
  brand: 'Surfa Coats',
  name: 'Surfa Floor Coat Enamel (Red & Pop Red)',
  category: 'Enamel & Gloss',
  hsn: '3208',
  packs: { '20 L': 3974, '10 L': 2001, '4 L': 821, '1 L': 209, '500 ml': 111, '200 ml': 47 },
});
productsToImport.push({
  id: 'surfa_floor_coat_enamel_yellow',
  brand: 'Surfa Coats',
  name: 'Surfa Floor Coat Enamel (Golden Yellow)',
  category: 'Enamel & Gloss',
  hsn: '3208',
  packs: { '20 L': 4083, '10 L': 2056, '4 L': 843, '1 L': 213, '500 ml': 114, '200 ml': 48 },
});

// Primers
productsToImport.push({
  id: 'surfa_inex_primer',
  brand: 'Surfa Coats',
  name: 'Surfa Inex Primer (Water Based)',
  category: 'Wall Primer',
  hsn: '3208',
  packs: { '20 L': 2630, '10 L': 1348, '4 L': 559, '1 L': 144, '500 ml': 77 },
});
productsToImport.push({
  id: 'surfa_acrylic_ext_primer',
  brand: 'Surfa Coats',
  name: 'Surfa Acrylic Exterior Cement Primer (W/B)',
  category: 'Wall Primer',
  hsn: '3208',
  packs: { '20 L': 2851, '10 L': 1455, '4 L': 600, '1 L': 156 },
});
productsToImport.push({
  id: 'surfa_surfalac_int_primer',
  brand: 'Surfa Coats',
  name: 'Surfalac Acrylic Interior Cement Primer (WB)',
  category: 'Wall Primer',
  hsn: '3208',
  packs: { '20 L': 2580, '10 L': 1319, '4 L': 574, '1 L': 150, '500 ml': 81 },
});
productsToImport.push({
  id: 'surfa_smart_primer_white',
  brand: 'Surfa Coats',
  name: 'Smart Primer White (WB)',
  category: 'Wall Primer',
  hsn: '3208',
  packs: { '20 L': 2209, '10 L': 1131, '4 L': 467, '1 L': 125 },
});
productsToImport.push({
  id: 'surfa_bright_primer_plus',
  brand: 'Surfa Coats',
  name: 'Surfa Bright Primer Plus White',
  category: 'Wall Primer',
  hsn: '3208',
  packs: { '20 L': 1786, '10 L': 918, '4 L': 382, '1 L': 102, '500 ml': 56 },
});
productsToImport.push({
  id: 'surfa_alkali_resistant_primer',
  brand: 'Surfa Coats',
  name: 'Alkali Resistant Interior Cement Primer (OB)',
  category: 'Wall Primer',
  hsn: '3208',
  packs: { '20 L': 3698, '10 L': 1906, '4 L': 788, '1 L': 205 },
});
productsToImport.push({
  id: 'surfa_coral_inex_primer',
  brand: 'Surfa Coats',
  name: 'Coral INEX Primer Combo (Water Based)',
  category: 'Wall Primer',
  hsn: '3208',
  packs: { '20 L': 2241, '10 L': 1168, '4 L': 496, '1 L': 126, '500 ml': 73 },
});
productsToImport.push({
  id: 'surfa_coral_ext_primer',
  brand: 'Surfa Coats',
  name: 'Coral Exterior Cement Primer (Water Based)',
  category: 'Wall Primer',
  hsn: '3208',
  packs: { '20 L': 2180, '10 L': 1140, '4 L': 486, '1 L': 124, '500 ml': 73 },
});
productsToImport.push({
  id: 'surfa_coral_int_primer',
  brand: 'Surfa Coats',
  name: 'Coral Interior Cement Primer (Water Based)',
  category: 'Wall Primer',
  hsn: '3208',
  packs: { '20 L': 1904, '10 L': 986, '4 L': 422, '1 L': 114, '500 ml': 60 },
});
productsToImport.push({
  id: 'surfa_wood_primer_white',
  brand: 'Surfa Coats',
  name: 'Surfa Wood Primer (G-0 White)',
  category: 'Wall Primer',
  hsn: '3208',
  packs: { '20 L': 3788, '10 L': 1941, '4 L': 794, '1 L': 205, '500 ml': 108, '200 ml': 37 },
});
productsToImport.push({
  id: 'surfa_wood_primer_pink',
  brand: 'Surfa Coats',
  name: 'Surfa Wood Primer (G-1 Pink)',
  category: 'Wall Primer',
  hsn: '3208',
  packs: { '20 L': 3622, '10 L': 1854, '4 L': 765, '1 L': 198, '500 ml': 103 },
});
productsToImport.push({
  id: 'surfa_aqua_wood_primer',
  brand: 'Surfa Coats',
  name: 'Surfa Aqua Wood Primer (WB)',
  category: 'Wall Primer',
  hsn: '3208',
  packs: { '20 L': 4040, '10 L': 2032, '4 L': 822, '1 L': 213 },
});
productsToImport.push({
  id: 'surfa_white_int_universal_primer',
  brand: 'Surfa Coats',
  name: 'Surfa White Interior Universal Primer (Oil Based)',
  category: 'Wall Primer',
  hsn: '3208',
  packs: { '20 L': 3672, '10 L': 1899, '4 L': 788, '1 L': 207, '500 ml': 108 },
});
productsToImport.push({
  id: 'surfa_red_oxide_metal_primer',
  brand: 'Surfa Coats',
  name: 'Surfa Red Oxide Metal Primer',
  category: 'Wall Primer',
  hsn: '3208',
  packs: { '20 L': 3513, '10 L': 1805, '4 L': 742, '1 L': 193, '500 ml': 101, '200 ml': 52 },
});
productsToImport.push({
  id: 'surfa_zinc_chromate_primer',
  brand: 'Surfa Coats',
  name: 'Zinc Chromate Metal Primer (Yellow)',
  category: 'Wall Primer',
  hsn: '3208',
  packs: { '20 L': 3852, '10 L': 2019, '4 L': 814, '1 L': 209, '500 ml': 111, '200 ml': 48 },
});
productsToImport.push({
  id: 'surfa_zinc_phosphate_grey_primer',
  brand: 'Surfa Coats',
  name: 'Zinc Phosphate Grey Primer (OB)',
  category: 'Wall Primer',
  hsn: '3208',
  packs: { '20 L': 5207, '10 L': 2652, '4 L': 1077, '1 L': 276, '500 ml': 143, '200 ml': 63 },
});
productsToImport.push({
  id: 'surfa_syn_clear_varnish',
  brand: 'Surfa Coats',
  name: 'Surfa Synthetic Clear Varnish',
  category: 'Wood Finish',
  hsn: '3208',
  packs: { '20 L': 5382, '10 L': 2732, '4 L': 1102, '1 L': 284, '500 ml': 146, '200 ml': 65 },
});

// Putty & Texture
productsToImport.push({
  id: 'surfa_walltek_primer_plaster',
  brand: 'Surfa Coats',
  name: 'Surfa Walltek Primer Plaster Putty',
  category: 'Wall Putty',
  hsn: '3214',
  packs: { '25 kg': 455, '5 kg': 166, '1 kg': 40 },
});
productsToImport.push({
  id: 'surfa_nova_texture_regular',
  brand: 'Surfa Coats',
  name: 'Surfa Nova Designer Texture Finish Regular 1.5mm',
  category: 'Wall Putty',
  hsn: '3214',
  packs: { '25 kg': 852, '5 kg': 181 },
});
productsToImport.push({
  id: 'surfa_nova_texture_smooth',
  brand: 'Surfa Coats',
  name: 'Surfa Nova Designer Texture Finish Smooth',
  category: 'Wall Putty',
  hsn: '3214',
  packs: { '25 kg': 883 },
});
productsToImport.push({
  id: 'surfa_acrylic_wall_putty_buckets',
  brand: 'Surfa Coats',
  name: 'Surfa Acrylic Wall Putty (In Buckets)',
  category: 'Wall Putty',
  hsn: '3214',
  packs: { '20 kg': 1237, '10 kg': 653, '5 kg': 344, '2 kg': 141, '1 kg': 73 },
});
productsToImport.push({
  id: 'surfa_acrylic_wall_putty_pp',
  brand: 'Surfa Coats',
  name: 'Surfa Acrylic Wall Putty (In PP Bags)',
  category: 'Wall Putty',
  hsn: '3214',
  packs: { '20 kg': 1098, '10 kg': 574, '5 kg': 296, '1 kg': 61 },
});
productsToImport.push({
  id: 'surfa_wallcure_putty_white',
  brand: 'Surfa Coats',
  name: 'Surfa Wallcure Putty White (Yellow PP Bags)',
  category: 'Wall Putty',
  hsn: '2520',
  packs: { '40 kg': 843, '30 kg': 643, '20 kg': 538, '5 kg': 149 },
});
productsToImport.push({
  id: 'surfa_wall_putty_blue',
  brand: 'Surfa Coats',
  name: 'Surfa Wall Putty (Blue PP Bags)',
  category: 'Wall Putty',
  hsn: '2520',
  packs: { '40 kg': 781 },
});
productsToImport.push({
  id: 'surfa_shield_pro_putty',
  brand: 'Surfa Coats',
  name: 'Surfa Shield Pro Waterproof Putty',
  category: 'Wall Putty',
  hsn: '2520',
  packs: { '40 kg': 1091, '20 kg': 594, '20 X 1 kg': 691, '5 kg': 167, '1 kg': 35 },
});
productsToImport.push({
  id: 'surfa_3d_sealant_putty',
  brand: 'Surfa Coats',
  name: 'Surfa 3D Sealant Putty',
  category: 'Wall Putty',
  hsn: '3214',
  packs: { '25 kg': 1366, '20 kg': 1123, '10 kg': 571, '5 kg': 308, '1 kg': 72 },
});
productsToImport.push({
  id: 'surfa_unicoat_kpf_white',
  brand: 'Surfa Coats',
  name: 'Surfa Unicoat KPF (White)',
  category: 'Wall Putty',
  hsn: '3214',
  packs: { '20 kg': 2462, '10 kg': 1265, '5 kg': 648, '2 kg': 270, '1 kg': 137, '50 gm': 75 },
});
productsToImport.push({
  id: 'surfa_unicoat_kpf_grey',
  brand: 'Surfa Coats',
  name: 'Surfa Unicoat KPF (Grey)',
  category: 'Wall Putty',
  hsn: '3214',
  packs: { '20 kg': 2603, '10 kg': 1345, '5 kg': 694, '2 kg': 285, '1 kg': 146, '50 gm': 79 },
});

// Build Care & Waterproofing
productsToImport.push({
  id: 'surfa_aear_sealer',
  brand: 'Surfa Coats',
  name: 'Aear Sealer',
  category: 'Waterproofing',
  hsn: '3209',
  packs: { '20 L': 3658, '10 L': 1898, '4 L': 774, '1 L': 206 },
});
productsToImport.push({
  id: 'surfa_crack_fill_paste',
  brand: 'Surfa Coats',
  name: 'Surfa Crack Fill - Paste',
  category: 'Waterproofing',
  hsn: '3214',
  packs: { '5 kg': 1213, '1 kg': 257, '500 gm': 141 },
});
productsToImport.push({
  id: 'surfa_damp_shield_xtreme_white',
  brand: 'Surfa Coats',
  name: 'Damp Shield Xtreme (White)',
  category: 'Waterproofing',
  hsn: '3209',
  packs: { '20 L': 5081, '10 L': 2637, '4 L': 1084, '1 L': 286, '500 ml': 147 },
});
productsToImport.push({
  id: 'surfa_damp_shield_xtreme_terra',
  brand: 'Surfa Coats',
  name: 'Damp Shield Xtreme (Terracotta)',
  category: 'Waterproofing',
  hsn: '3209',
  packs: { '20 L': 5867, '10 L': 3037, '4 L': 1235, '1 L': 309, '500 ml': 159 },
});
productsToImport.push({
  id: 'surfa_damp_shield_white',
  brand: 'Surfa Coats',
  name: 'Surfa Damp Shield (White)',
  category: 'Waterproofing',
  hsn: '3209',
  packs: { '20 L': 4875, '10 L': 2467, '4 L': 1028, '1 L': 273, '500 ml': 138 },
});
productsToImport.push({
  id: 'surfa_damp_shield_terra',
  brand: 'Surfa Coats',
  name: 'Surfa Damp Shield (Terracotta)',
  category: 'Waterproofing',
  hsn: '3209',
  packs: { '20 L': 5246, '10 L': 2708, '4 L': 1095, '1 L': 280, '500 ml': 143 },
});
productsToImport.push({
  id: 'surfa_damp_seal_2k',
  brand: 'Surfa Coats',
  name: 'Damp Seal 2K - Flexible Cementitious Waterproof Coating',
  category: 'Waterproofing',
  hsn: '3824',
  packs: { '15 kg': 1535, '6 kg': 701, '3 kg': 357 },
});
productsToImport.push({
  id: 'surfa_damp_prime',
  brand: 'Surfa Coats',
  name: 'Surfa Damp Prime - Waterproofing Mastic Coating',
  category: 'Waterproofing',
  hsn: '3209',
  packs: { '20 L': 3361, '10 L': 1729, '4 L': 743, '1 L': 206, '500 ml': 98 },
});
productsToImport.push({
  id: 'surfa_heat_shield_white',
  brand: 'Surfa Coats',
  name: 'Surfa Heat Shield - White',
  category: 'Waterproofing',
  hsn: '3209',
  packs: { '20 L': 5411, '10 L': 2730, '4 L': 1124, '1 L': 290 },
});
productsToImport.push({
  id: 'surfa_build_care_lw',
  brand: 'Surfa Coats',
  name: 'Build Care LW + Integral Liquid Waterproofing Compound',
  category: 'Waterproofing',
  hsn: '3824',
  packs: { '20 L': 1395, '10 L': 773, '5 L': 418, '1 L': 91, '200 ml': 26 },
});
productsToImport.push({
  id: 'surfa_surfacrete_sbr',
  brand: 'Surfa Coats',
  name: 'Surfacrete SBR - Waterproofing and Repair Mortar',
  category: 'Waterproofing',
  hsn: '3824',
  packs: { '20 L': 3488, '10 L': 1846, '4 L': 913, '1 L': 210, '200 ml': 55 },
});

// Industrial & Wood
productsToImport.push({
  id: 'surfa_aluminum_paint',
  brand: 'Surfa Coats',
  name: 'Surfa Aluminum Paint',
  category: 'Enamel & Gloss',
  hsn: '3208',
  packs: { '20 L': 5632, '10 L': 2889, '4 L': 1182, '1 L': 310, '500 ml': 162, '200 ml': 72, '100 ml': 42 },
});
productsToImport.push({
  id: 'wood_rich_nc_sealer',
  brand: 'Surfa Coats',
  name: 'Wood Rich NC Sanding Sealer',
  category: 'Wood Finish',
  hsn: '3208',
  packs: { '20 L': 4322, '10 L': 2214, '4 L': 892, '1 L': 232, '500 ml': 128 },
});
productsToImport.push({
  id: 'wood_rich_pu_sealer_int',
  brand: 'Surfa Coats',
  name: 'Wood Rich 2 Pack PU Sealer Interior',
  category: 'Wood Finish',
  hsn: '3208',
  packs: { '20 L': 12604, '4 L': 2606, '1 L': 668 },
});
productsToImport.push({
  id: 'wood_rich_pu_sealer_ext',
  brand: 'Surfa Coats',
  name: 'Wood Rich 2 Pack PU Sealer Exterior',
  category: 'Wood Finish',
  hsn: '3208',
  packs: { '20 L': 13355, '4 L': 2771, '1 L': 710 },
});
productsToImport.push({
  id: 'wood_rich_pu_int_glossy',
  brand: 'Surfa Coats',
  name: 'Wood Rich 2 Pack PU Interior - Glossy',
  category: 'Wood Finish',
  hsn: '3208',
  packs: { '20 L': 12458, '4 L': 2577, '1 L': 660 },
});
productsToImport.push({
  id: 'wood_rich_pu_int_matt',
  brand: 'Surfa Coats',
  name: 'Wood Rich 2 Pack PU Interior - Matt',
  category: 'Wood Finish',
  hsn: '3208',
  packs: { '20 L': 12752, '4 L': 2635, '1 L': 674 },
});
productsToImport.push({
  id: 'wood_rich_pu_ext_glossy',
  brand: 'Surfa Coats',
  name: 'Wood Rich 2 Pack PU Exterior - Glossy',
  category: 'Wood Finish',
  hsn: '3208',
  packs: { '20 L': 14388, '4 L': 2983, '1 L': 763 },
});
productsToImport.push({
  id: 'wood_rich_pu_ext_matt',
  brand: 'Surfa Coats',
  name: 'Wood Rich 2 Pack PU Exterior - Matt',
  category: 'Wood Finish',
  hsn: '3208',
  packs: { '20 L': 14068, '4 L': 2909, '1 L': 746 },
});
productsToImport.push({
  id: 'sayerlack_stain_teak',
  brand: 'Surfa Coats',
  name: 'Sayerlack Wood Stain - Burma Teak',
  category: 'Wood Finish',
  hsn: '3208',
  packs: { '20 L': 13161, '10 L': 6581, '4 L': 2632, '1 L': 658, '500 ml': 330 },
});
productsToImport.push({
  id: 'sayerlack_stain_walnut',
  brand: 'Surfa Coats',
  name: 'Sayerlack Wood Stain - Walnut',
  category: 'Wood Finish',
  hsn: '3208',
  packs: { '20 L': 13161, '10 L': 6581, '4 L': 2632, '1 L': 658, '500 ml': 330 },
});
productsToImport.push({
  id: 'sayerlack_wb_top_matt',
  brand: 'Surfa Coats',
  name: 'Sayerlack Water Base Interior - Top Coat Matt',
  category: 'Wood Finish',
  hsn: '3208',
  packs: { '20 L': 21186, '10 L': 10593, '4 L': 4237, '1 L': 1059, '500 ml': 530 },
});

// =========================================================================
// 2. ARUN BRUSH & TIA ROLLERS (from 6-Page Price List)
// =========================================================================

// Arun Brushes
const arunBrushes = [
  { id: 'arun_brush_1', name: 'Brush Arun 1"', dl: 48.15, size: '1"' },
  { id: 'arun_brush_2', name: 'Brush Arun 2"', dl: 97.27, size: '2"' },
  { id: 'arun_brush_25', name: 'Brush Arun 2.5"', dl: 116.25, size: '2.5"' },
  { id: 'arun_brush_3', name: 'Brush Arun 3"', dl: 134.40, size: '3"' },
  { id: 'arun_brush_4', name: 'Brush Arun 4"', dl: 199.83, size: '4"' },
  { id: 'arun_royal_1', name: 'A025DW Royal Double Brush 1"', dl: 74.94, size: '1"' },
  { id: 'arun_royal_2', name: 'A050DW Royal Double Brush 2"', dl: 143.64, size: '2"' },
  { id: 'arun_royal_25', name: 'A063DW Royal Double Brush 2.5"', dl: 162.36, size: '2.5"' },
  { id: 'arun_royal_3', name: 'A075DW Royal Double Brush 3"', dl: 187.35, size: '3"' },
  { id: 'arun_royal_4', name: 'RLW Double Berth Royal 4"', dl: 346.25, size: '4"' },
  { id: 'arun_royal_4_spec', name: 'RLW Double Berth Royal 4" Special', dl: 310.00, size: '4"' },
  { id: 'tia_poli_50', name: 'Tia M Poli 50 (2") Polish Brush', dl: 62.97, size: '2"' },
  { id: 'tia_poli_63', name: 'Tia M Poli 63 (2.5") Polish Brush', dl: 78.69, size: '2.5"' },
  { id: 'tia_poli_75', name: 'Tia M Poli 75 (3") Polish Brush', dl: 94.43, size: '3"' },
  { id: 'tia_mercury_50', name: 'Tia MFB M050 (2") Mercury Brush', dl: 43.97, size: '2"' },
  { id: 'tia_mercury_63', name: 'Tia MFB M063 (2.5") Mercury Brush', dl: 54.54, size: '2.5"' },
  { id: 'tia_mercury_75', name: 'Tia MFB M075 (3") Mercury Brush', dl: 66.02, size: '3"' },
];

for (const b of arunBrushes) {
  productsToImport.push({
    id: b.id,
    brand: 'Arun & Tia',
    name: b.name,
    category: 'Hardware & Tools',
    hsn: '9603',
    packs: { [b.size]: b.dl },
  });
}

// Tia Rollers with Handle
const arunRollers = [
  { id: 'tia_t0001', name: 'Roller Tia T0001 (Interior Roller with Handle)', dl: 147.37 },
  { id: 'tia_t0001a', name: 'Roller Tia T0001A (Interior Roller with Handle)', dl: 158.30 },
  { id: 'tia_t0007', name: 'Roller Tia T0007 (Exterior Roller with Handle)', dl: 256.76 },
  { id: 'tia_t0007a', name: 'Roller Tia T0007A (Exterior Roller with Handle)', dl: 174.98 },
  { id: 'tia_t0007a_tube', name: 'Roller Tia T0007A Tube (Exterior Roller)', dl: 188.95 },
  { id: 'tia_t0007b', name: 'Roller Tia T0007B (Primer Only Roller)', dl: 100.46 },
  { id: 'tia_t0008', name: 'Roller Tia T0008 (Interior Roller with Handle)', dl: 238.10 },
  { id: 'tia_t0008a', name: 'Roller Tia T0008A (Interior Roller with Handle)', dl: 169.52 },
  { id: 'tia_t0009', name: 'Roller Tia T0009 (Interior Roller with Handle)', dl: 146.55 },
  { id: 'tia_t0009_tube', name: 'Roller Tia T0009 Tube (Interior Roller)', dl: 169.52 },
  { id: 'tia_t0009a', name: 'Roller Tia T0009A (Interior Roller with Handle)', dl: 138.30 },
  { id: 'tia_t0009b', name: 'Roller Tia T0009B (Primer Only Roller)', dl: 100.46 },
  { id: 'tia_t0010', name: 'Roller Tia T0010 (Exterior Roller with Handle)', dl: 167.11 },
  { id: 'tia_t0010b', name: 'Roller Tia T0010B (Exterior Roller with Handle)', dl: 100.46 },
  { id: 'tia_t0015_2', name: 'Roller Tia T0015 (2") Enamel Roller', dl: 45.44 },
  { id: 'tia_t0015_4', name: 'Roller Tia T0015 (4") Enamel Roller', dl: 50.72 },
  { id: 'tia_t0021', name: 'Roller Tia T0021 (Interior/Exterior Roller)', dl: 292.95 },
  { id: 'tia_t0091', name: 'Roller Tia T0091 Premium Interior Roller', dl: 374.07 },
  { id: 'tia_t0092', name: 'Roller Tia T0092 Premium Interior Roller', dl: 374.07 },
  { id: 'tia_t0093', name: 'Roller Tia T0093 Premium Exterior Roller', dl: 391.39 },
  { id: 'tia_t0094', name: 'Roller Tia T0094 Premium Exterior Roller', dl: 391.39 },
  { id: 'tia_t0071_4', name: 'Roller Tia T0071 (4") with Handle', dl: 50.43 },
  { id: 'tia_t0071_6', name: 'Roller Tia T0071 (6") with Handle', dl: 87.90 },
  { id: 'tia_t0018a_4', name: 'Roller Tia T0018A (4") with Handle', dl: 42.91 },
  { id: 'tia_t0018a_2', name: 'Roller Tia T0018A (2") with Handle', dl: 41.31 },
  { id: 'tia_t0018a_6', name: 'Roller Tia T0018A (6") with Handle', dl: 93.43 },
];

for (const r of arunRollers) {
  productsToImport.push({
    id: r.id,
    brand: 'Arun & Tia',
    name: r.name,
    category: 'Hardware & Tools',
    hsn: '9603',
    packs: { '1 Pc': r.dl },
  });
}

// Special Effect Tools
const arunSpecialEffect = [
  { id: 'tia_topaz_combing', name: '4" Tia T0025 Topaz Combing Tool', dl: 85.91 },
  { id: 'tia_topaz_spatula', name: '4" Tia T0026 Topaz Spatula', dl: 89.39 },
  { id: 'tia_topaz_ragging', name: '4" Tia T0027 Topaz Creation 1 Ragging', dl: 482.46 },
  { id: 'tia_topaz_flora', name: '9" Tia T0072 Topaz Flora Effect Roller', dl: 745.83 },
  { id: 'tia_topaz_sky', name: '9" Tia T0073 Topaz Sky Effect Roller', dl: 745.83 },
  { id: 'tia_topaz_vintage', name: '9" Tia T0074 Topaz Vintage Effect Roller', dl: 745.83 },
  { id: 'tia_topaz_brushing', name: '4" Tia T0075 Topaz Brushing Effect', dl: 386.13 },
];

for (const s of arunSpecialEffect) {
  productsToImport.push({
    id: s.id,
    brand: 'Arun & Tia',
    name: s.name,
    category: 'Hardware & Tools',
    hsn: '9603',
    packs: { '1 Pc': s.dl },
  });
}

// Handles, Trays, Knives, Sticks
const arunAccessories = [
  { id: 'tia_handle_2', name: '2" Mini Roller Handle - T0062A', dl: 15.71 },
  { id: 'tia_handle_4', name: '4" Roller Handle - T0062A', dl: 23.46 },
  { id: 'tia_handle_9', name: '9" Roller Handle - T0063', dl: 48.09 },
  { id: 'tia_handle_long_4', name: 'Long Handle 4" - T0062', dl: 28.75 },
  { id: 'tia_tray_4', name: 'Tia T0024A (4") Roller Paint Tray', dl: 62.78 },
  { id: 'tia_tray_9', name: 'Tia T0024 (9") Roller Paint Tray', dl: 86.39 },
  { id: 'tia_putty_knife_6', name: 'Tia Putty Knife HD 150mm (6") Plastic Handle', dl: 47.69 },
  { id: 'tia_putty_knife_8', name: 'Tia Putty Knife HD 200mm (8") Plastic Handle', dl: 63.39 },
  { id: 'tia_putty_knife_10', name: 'Tia Putty Knife HD 250mm (10") Plastic Handle', dl: 79.24 },
  { id: 'tia_putty_knife_12', name: 'Tia Putty Knife HD 300mm (12") Plastic Handle', dl: 95.23 },
  { id: 'tia_stick_2m', name: 'Stick Tia T0064 - 2M Telescopic', dl: 490.44 },
  { id: 'tia_stick_3m', name: 'Stick Tia T0064 - 3M Telescopic', dl: 687.18 },
  { id: 'tia_stick_3m_eco', name: 'Economy Stick T0064 - 3M ECO', dl: 348.60 },
  { id: 'tia_stick_4m', name: 'Stick Tia T0064 - 4M Telescopic', dl: 1011.18 },
  { id: 'tia_stick_5m', name: 'Stick Tia T0064 - 5M Telescopic', dl: 1327.17 },
  { id: 'tia_stick_8m', name: 'Stick Tia T0064 - 8M Telescopic', dl: 2213.09 },
  { id: 'tia_stick_3m_lock', name: 'Stick Tia T0064 - 3M Press Lock Type', dl: 906.65 },
  { id: 'tia_stick_2m_eco', name: 'Economy Stick T0064 - 2M ECO', dl: 274.01 },
];

for (const a of arunAccessories) {
  productsToImport.push({
    id: a.id,
    brand: 'Arun & Tia',
    name: a.name,
    category: 'Hardware & Tools',
    hsn: '8205',
    packs: { '1 Pc': a.dl },
  });
}

// Spray Paints (MSP)
const mspSprays = [
  { id: 'msp_black', name: 'MSP Spray Paint - Black', dl: 129.93 },
  { id: 'msp_brown', name: 'MSP Spray Paint - Brown', dl: 129.93 },
  { id: 'msp_clear', name: 'MSP Spray Paint - Clear Lacquer', dl: 129.93 },
  { id: 'msp_red', name: 'MSP Spray Paint - Red', dl: 129.93 },
  { id: 'msp_lemon_yellow', name: 'MSP Spray Paint - Lemon Yellow', dl: 129.93 },
  { id: 'msp_oxford_blue', name: 'MSP Spray Paint - Oxford Blue', dl: 129.93 },
  { id: 'msp_matt_black', name: 'MSP Spray Paint - Matt Black', dl: 129.93 },
  { id: 'msp_matt_white', name: 'MSP Spray Paint - Matt White', dl: 129.93 },
  { id: 'msp_silver', name: 'MSP Spray Paint - Silver', dl: 139.91 },
  { id: 'msp_gold', name: 'MSP Spray Paint - Gold', dl: 139.91 },
  { id: 'msp_flo_green', name: 'MSP Spray Paint - Flo Green', dl: 165.58 },
  { id: 'msp_flo_orange', name: 'MSP Spray Paint - Flo Orange', dl: 165.58 },
  { id: 'msp_bright_gold', name: 'MSP Spray Paint - Bright Gold', dl: 170.58 },
  { id: 'msp_chrome_silver', name: 'MSP Spray Paint - Chrome Silver', dl: 170.58 },
];

for (const sp of mspSprays) {
  productsToImport.push({
    id: sp.id,
    brand: 'Arun & Tia',
    name: sp.name,
    category: 'Spray Paints & Aerosols',
    hsn: '3208',
    packs: { '400 ml': sp.dl },
  });
}

// Duke Gold
productsToImport.push({
  id: 'duke_gold_dpmg',
  brand: 'Duke Gold',
  name: 'Duke Gold DPMG Pure Gold Finish',
  category: 'Spray Paints & Aerosols',
  hsn: '3208',
  packs: { '50 ml': 66.82, '100 ml': 126.21, '200 ml': 235.73, '500 ml': 245.00, '1000 ml': 453.82 },
});

// Asmaco PU Foam
productsToImport.push({
  id: 'asmaco_pu_foam',
  brand: 'Asmaco',
  name: 'Asmaco PU Foam Expanding Insulation',
  category: 'Hardware & Tools',
  hsn: '3214',
  packs: { '330 ml': 311.66, '750 ml': 171.33 },
});

// =========================================================================
// 3. INWARD PURCHASE BILL PRODUCTS (November 2026 Invoices)
// =========================================================================

// Pon Thangam Traders: JK Cement & JK WhiteMaxX
productsToImport.push({
  id: 'jk_whitemaxx_50kg',
  brand: 'JK WhiteMaxX',
  name: 'JK WhiteMaxX Premium White Cement',
  category: 'White Cement & Lime',
  hsn: '25232100',
  packs: { '50 kg Bag': 974.58, '1 kg': 25.42 },
});
productsToImport.push({
  id: 'jk_wallmaxx_putty',
  brand: 'JK Cement',
  name: 'JK Cement WallMaxX Putty',
  category: 'Wall Putty',
  hsn: '32141000',
  packs: { '1 kg': 29.66, '5 kg': 152.54 },
});

// Annai Stones: Surya Cem Lime Powder
productsToImport.push({
  id: 'surya_cem_lime_powder',
  brand: 'Surya Cem',
  name: 'Surya Cem Brand Lime Powder',
  category: 'White Cement & Lime',
  hsn: '25222000',
  packs: { '5 kg Bag': 109.52, '10 kg Bag': 214.28, '25 kg Bag': 476.19 },
});

// Annai Minerals: Udhayas Cem 40kg
productsToImport.push({
  id: 'udhayas_cem_40kg',
  brand: 'Udhayas Cem',
  name: 'Udhayas Cem White Cement / Lime',
  category: 'White Cement & Lime',
  hsn: '2522',
  packs: { '40 kg Bag': 504.76 },
});

// Butterfly Paints: Pilot MTO, Thinners, Black Japan, Chalk Powder
productsToImport.push({
  id: 'pilot_mto',
  brand: 'Pilot',
  name: 'Pilot Mineral Turpentine Oil (MTO)',
  category: 'Thinners & Solvents',
  hsn: '2710',
  packs: { '1 L': 90.00, '500 ml': 46.00, '5 L': 450.00 },
});
productsToImport.push({
  id: 'butterfly_nc_thinner',
  brand: 'Butterfly Paints',
  name: 'Butterfly NC Thinner High Quality',
  category: 'Thinners & Solvents',
  hsn: '3814',
  packs: { '1 L': 110.00, '500 ml': 55.00 },
});
productsToImport.push({
  id: 'butterfly_black_japan',
  brand: 'Butterfly Paints',
  name: 'Butterfly Black Japan Protective Paint',
  category: 'Enamel & Gloss',
  hsn: '3208',
  packs: { '1 L': 95.00, '500 ml': 48.00 },
});
productsToImport.push({
  id: 'butterfly_chalk_powder',
  brand: 'Butterfly Paints',
  name: 'Superior White Chalk Powder',
  category: 'Wall Putty',
  hsn: '2509',
  packs: { '1 kg': 20.00 },
});

// J.K Agency: Ajax Abrasives & Metal Paste
productsToImport.push({
  id: 'ajax_water_emery_paper',
  brand: 'Ajax',
  name: 'Ajax Waterproof Silicon Carbide Emery Paper',
  category: 'Abrasives & Sandpaper',
  hsn: '6805',
  packs: {
    'Grit 80': 21.00,
    'Grit 100': 18.50,
    'Grit 120': 19.00,
    'Grit 150': 16.00,
    'Grit 180': 15.50,
    'Grit 220': 15.00,
    'Grit 320': 15.00,
  },
});
productsToImport.push({
  id: 'ajax_metal_paste',
  brand: 'Ajax',
  name: 'Metal Paste Filler (White)',
  category: 'Hardware & Tools',
  hsn: '3214',
  packs: { '300 gm': 52.00, '900 gm': 140.00 },
});

// Shree Kalyan Traders: Putti Plates, Scrapper, Masking Tapes, 24CRT, Termiguard, Roll Grit
productsToImport.push({
  id: 'iron_putti_plate',
  brand: 'General Hardware',
  name: 'Standard Iron Putti Plate',
  category: 'Hardware & Tools',
  hsn: '82059090',
  packs: { '2"': 4.50, '3"': 6.50, '4"': 8.50, '5"': 11.00, '6"': 13.00 },
});
productsToImport.push({
  id: 'pvc_putti_plate',
  brand: 'General Hardware',
  name: 'Flexible PVC Putti Plate',
  category: 'Hardware & Tools',
  hsn: '82059090',
  packs: { '6"': 58.00, '8"': 76.00, '10"': 95.00, '12"': 115.00 },
});
productsToImport.push({
  id: 'wood_handle_putti_plate',
  brand: 'General Hardware',
  name: 'Wooden Handle Putti Plate Blade',
  category: 'Hardware & Tools',
  hsn: '82059090',
  packs: { '6"': 53.00, '8"': 72.00, '10"': 88.00, '12"': 105.00 },
});
productsToImport.push({
  id: 'hardware_scrapper',
  brand: 'General Hardware',
  name: 'Heavy Duty Paint & Wall Scrapper',
  category: 'Hardware & Tools',
  hsn: '8205',
  packs: { '1 Pc': 34.00 },
});
productsToImport.push({
  id: 'oswal_patta',
  brand: 'General Hardware',
  name: 'Oswal Patta Sanding Paper Roll',
  category: 'Abrasives & Sandpaper',
  hsn: '82059090',
  packs: { '25mm': 30.00, '38mm': 32.00 },
});
productsToImport.push({
  id: 'green_silver_masking_tape',
  brand: 'General Hardware',
  name: 'Green Silver Painter Masking Tape',
  category: 'Hardware & Tools',
  hsn: '48114100',
  packs: { '3/4"': 125.00, '1"': 125.00, '2"': 125.00 },
});
productsToImport.push({
  id: 'cotton_cutting_waste',
  brand: 'General Hardware',
  name: 'Cotton Cutting Waste Rags for Cleaning',
  category: 'Hardware & Tools',
  hsn: '52021000',
  packs: { 'Color': 65.00, 'White': 140.00 },
});
productsToImport.push({
  id: 'roll_grit_80',
  brand: 'Ajax',
  name: 'Roll Grit 80 Heavy Duty Sanding Roll',
  category: 'Abrasives & Sandpaper',
  hsn: '68051010',
  packs: { '1 Roll': 1750.00 },
});
productsToImport.push({
  id: 'crt_gold_paint',
  brand: '24CRT Gold',
  name: '24CRT Gold Metallic Lustre Finish',
  category: 'Spray Paints & Aerosols',
  hsn: '32082010',
  packs: { '50 ml': 105.00, '100 ml': 190.00, '200 ml': 350.00, 'Gola': 775.00 },
});
productsToImport.push({
  id: 'silver_metallic_paint',
  brand: 'General Hardware',
  name: 'Bright Silver Metallic Finish Paint',
  category: 'Spray Paints & Aerosols',
  hsn: '32082010',
  packs: { '50 ml': 50.00, '100 ml': 80.00, '200 ml': 150.00, '500 ml': 250.00 },
});
productsToImport.push({
  id: 'metallic_colour_paint',
  brand: 'General Hardware',
  name: 'Multi-Color Metallic Paint (Bronze / Copper)',
  category: 'Spray Paints & Aerosols',
  hsn: '32091010',
  packs: { '50 ml': 65.00, '100 ml': 120.00, '200 ml': 230.00, '500 ml': 525.00 },
});
productsToImport.push({
  id: 'termiguard_solution',
  brand: 'Termiguard',
  name: 'Termiguard Anti-Termite Wood Solution',
  category: 'Wood Finish',
  hsn: '38089990',
  packs: { '250 ml': 95.00, '500 ml': 175.00, '1 L': 320.00 },
});
productsToImport.push({
  id: 'tg_termite_spray',
  brand: 'Termiguard',
  name: 'T.G. Termite Aerosol & Trigger Spray',
  category: 'Wood Finish',
  hsn: '38089990',
  packs: { '320 ml Aerosol': 155.00, '500 ml Trigger': 235.00 },
});

// =========================================================================
// RUN MIGRATION & REPLACEMENT TRANSACTION
// =========================================================================

console.log('Starting full replacement of Categories, Brands, Products, and Pack Sizes...');

const runMigration = db.transaction(() => {
  // 1. Clear old data from products, pack sizes, brands, categories
  db.prepare('DELETE FROM product_pack_sizes').run();
  db.prepare('DELETE FROM products').run();
  db.prepare('DELETE FROM brands').run();
  db.prepare('DELETE FROM categories').run();

  // Also remove old sample bills referencing old deleted products so foreign keys & UI are spotless
  db.prepare('DELETE FROM bill_items').run();
  db.prepare('DELETE FROM bills').run();

  // 2. Update Shop Settings with GST Registration Certificate Data (Soda Pop Colours)
  db.prepare(`
    INSERT OR REPLACE INTO shop_settings (
      id, shop_name, tagline, address, phone, email, gstin, invoice_prefix, thermal_paper_size, enable_whatsapp, terms_conditions, upi_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

  // 3. Insert Categories
  const insertCat = db.prepare('INSERT INTO categories (id, name, icon_name) VALUES (?, ?, ?)');
  for (const c of categories) {
    insertCat.run(c.id, c.name, c.icon);
  }

  // 4. Insert Brands
  const insertBrand = db.prepare('INSERT INTO brands (id, name) VALUES (?, ?)');
  for (const b of brands) {
    insertBrand.run(`brand_${b.toLowerCase().replace(/[^a-z0-9]/g, '_')}`, b);
  }

  // 5. Insert Products & Pack Sizes
  const insertProdStmt = db.prepare(`
    INSERT INTO products (id, brand, name, category, hsn_code, default_tax_rate, description, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `);

  const insertPackStmt = db.prepare(`
    INSERT INTO product_pack_sizes (
      id, product_id, pack_size, barcode, mrp, retail_price, contractor_price, wholesale_price, cost_price, stock_qty, min_stock_alert
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of productsToImport) {
    insertProdStmt.run(
      p.id,
      p.brand,
      p.name,
      p.category,
      p.hsn || '3209',
      18.0,
      `Authorized inventory product imported from dealer catalogs & purchase invoices for ${p.brand}`
    );

    for (const [size, cost] of Object.entries(p.packs)) {
      const pk = makePack(p.id, size, cost, null, 25);
      insertPackStmt.run(
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
  }
});

runMigration();

// Re-enable foreign keys
db.pragma('foreign_keys = ON');

const brandCount = db.prepare('SELECT count(*) as c FROM brands').get().c;
const catCount = db.prepare('SELECT count(*) as c FROM categories').get().c;
const prodCount = db.prepare('SELECT count(*) as c FROM products').get().c;
const packCount = db.prepare('SELECT count(*) as c FROM product_pack_sizes').get().c;

console.log(`\n🎉 MIGRATION COMPLETE!`);
console.log(`Brands imported: ${brandCount}`);
console.log(`Categories imported: ${catCount}`);
console.log(`Products imported: ${prodCount}`);
console.log(`Pack sizes imported: ${packCount}`);
