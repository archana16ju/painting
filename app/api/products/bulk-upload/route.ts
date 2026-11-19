import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/sqlite';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No product rows provided' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    const insertBrand = db.prepare(`
      INSERT OR IGNORE INTO brands (id, name)
      VALUES (?, ?)
    `);

    const insertCat = db.prepare(`
      INSERT OR IGNORE INTO categories (id, name, icon_name)
      VALUES (?, ?, 'Folder')
    `);

    const insertProd = db.prepare(`
      INSERT OR REPLACE INTO products (id, brand, name, category, hsn_code, default_tax_rate, description, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const insertPack = db.prepare(`
      INSERT OR REPLACE INTO product_pack_sizes (
        id, product_id, pack_size, barcode, mrp, retail_price, contractor_price, wholesale_price, cost_price, stock_qty, min_stock_alert
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let importedCount = 0;
    let packCount = 0;

    const tx = db.transaction(() => {
      for (const row of products) {
        const brand = (row.brand || row.Brand || 'Generic').trim();
        const name = (row.product_name || row.name || row.ProductName || row['Product Name'] || '').trim();
        const category = (row.category || row.Category || 'Hardware & Tools').trim();
        const hsn = (row.hsn_code || row.hsn || row.HSNCode || row['HSN Code'] || '3209').trim();
        const taxRate = parseFloat(row.default_tax_rate || row.tax_rate || row.TaxRate || row['Tax Rate'] || '18') || 18;
        const description = (row.description || row.Description || '').trim();

        if (!name) continue;

        // Auto insert brand & category if new
        const brandId = `brand_${brand.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        insertBrand.run(brandId, brand);

        const catId = `cat_${category.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        insertCat.run(catId, category);

        // Product ID
        const prodId = `prod_${brand.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        insertProd.run(prodId, brand, name, category, hsn, taxRate, description);
        importedCount++;

        // Pack size details
        const packSize = (row.pack_size || row.packSize || row.PackSize || row['Pack Size'] || '1 Pc').trim();
        const costPrice = parseFloat(row.cost_price || row.cost || row.CostPrice || row['Cost Price'] || '0') || 0;
        
        let retailPrice = parseFloat(row.retail_price || row.retail || row.RetailPrice || row['Retail Price'] || '0') || 0;
        let contractorPrice = parseFloat(row.contractor_price || row.contractor || row.ContractorPrice || row['Contractor Price'] || '0') || 0;
        let wholesalePrice = parseFloat(row.wholesale_price || row.wholesale || row.WholesalePrice || row['Wholesale Price'] || '0') || 0;
        let mrp = parseFloat(row.mrp || row.MRP || '0') || 0;

        // Auto compute default margins if blank
        if (costPrice > 0) {
          if (retailPrice <= 0) retailPrice = Math.round(costPrice * 1.22);
          if (contractorPrice <= 0) contractorPrice = Math.round(costPrice * 1.10);
          if (wholesalePrice <= 0) wholesalePrice = Math.round(costPrice * 1.06);
          if (mrp <= 0) mrp = Math.round(costPrice * 1.35);
        } else if (retailPrice > 0) {
          if (contractorPrice <= 0) contractorPrice = Math.round(retailPrice * 0.90);
          if (wholesalePrice <= 0) wholesalePrice = Math.round(retailPrice * 0.85);
          if (mrp <= 0) mrp = Math.round(retailPrice * 1.10);
        }

        const barcode = (row.barcode || row.Barcode || '').trim() || `89088${Math.floor(10000000 + Math.random() * 90000000)}`;
        const stockQty = parseFloat(row.stock_qty || row.stock || row.StockQty || row['Stock Qty'] || '20') || 20;
        const minAlert = parseFloat(row.min_stock_alert || row.minStockAlert || row.MinStockAlert || row['Min Stock Alert'] || '3') || 3;

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
        packCount++;
      }
    });

    tx();

    return NextResponse.json({
      success: true,
      importedCount,
      packCount,
      message: `Successfully imported ${importedCount} products (${packCount} pack sizes).`,
    });
  } catch (error: any) {
    console.error('Error in bulk upload:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
