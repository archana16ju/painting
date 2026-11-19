import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/sqlite';

export async function GET() {
  try {
    const db = getDatabase();
    const products: any[] = db.prepare(`
      SELECT p.*, 
        json_group_array(
          json_object(
            'id', ps.id,
            'packSize', ps.pack_size,
            'barcode', ps.barcode,
            'mrp', ps.mrp,
            'retailPrice', ps.retail_price,
            'contractorPrice', ps.contractor_price,
            'wholesalePrice', ps.wholesale_price,
            'costPrice', ps.cost_price,
            'stockQty', ps.stock_qty,
            'minStockAlert', ps.min_stock_alert
          )
        ) as pack_sizes_json
      FROM products p
      LEFT JOIN product_pack_sizes ps ON p.id = ps.product_id
      WHERE p.is_active = 1
      GROUP BY p.id
      ORDER BY p.brand, p.name
    `).all();

    const formatted = products.map((p) => ({
      id: p.id,
      brand: p.brand,
      name: p.name,
      category: p.category,
      hsnCode: p.hsn_code,
      defaultTaxRate: p.default_tax_rate,
      description: p.description,
      isActive: Boolean(p.is_active),
      packSizes: p.pack_sizes_json ? JSON.parse(p.pack_sizes_json).filter((pk: any) => pk.id !== null) : [],
    }));

    return NextResponse.json({ success: true, products: formatted });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();

    const productId = body.id || `prod_${Date.now()}`;

    const insertProduct = db.prepare(`
      INSERT INTO products (id, brand, name, category, hsn_code, default_tax_rate, description, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const insertPackSize = db.prepare(`
      INSERT INTO product_pack_sizes (
        id, product_id, pack_size, barcode, mrp, retail_price, contractor_price, wholesale_price, cost_price, stock_qty, min_stock_alert
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      insertProduct.run(
        productId,
        body.brand,
        body.name,
        body.category,
        body.hsnCode || '3209',
        body.defaultTaxRate || 18,
        body.description || ''
      );

      if (Array.isArray(body.packSizes)) {
        for (const pack of body.packSizes) {
          insertPackSize.run(
            pack.id || `pack_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            productId,
            pack.packSize,
            pack.barcode || null,
            pack.mrp || 0,
            pack.retailPrice || 0,
            pack.contractorPrice || 0,
            pack.wholesalePrice || 0,
            pack.costPrice || 0,
            pack.stockQty || 0,
            pack.minStockAlert || 2
          );
        }
      }
    });

    transaction();

    return NextResponse.json({ success: true, productId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();

    const { id, brand, name, category, hsnCode, defaultTaxRate, description, packSizes } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const updateProduct = db.prepare(`
      UPDATE products 
      SET brand = ?, name = ?, category = ?, hsn_code = ?, default_tax_rate = ?, description = ?
      WHERE id = ?
    `);

    const updatePackSize = db.prepare(`
      UPDATE product_pack_sizes 
      SET pack_size = ?, mrp = ?, retail_price = ?, contractor_price = ?, wholesale_price = ?, cost_price = ?, stock_qty = ?
      WHERE id = ? AND product_id = ?
    `);

    const insertPackSize = db.prepare(`
      INSERT INTO product_pack_sizes (
        id, product_id, pack_size, barcode, mrp, retail_price, contractor_price, wholesale_price, cost_price, stock_qty, min_stock_alert
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      updateProduct.run(
        brand,
        name,
        category,
        hsnCode || '3209',
        defaultTaxRate || 18,
        description || '',
        id
      );

      if (Array.isArray(packSizes)) {
        for (const pack of packSizes) {
          if (pack.id && !pack.id.startsWith('new_')) {
            updatePackSize.run(
              pack.packSize,
              pack.mrp || pack.retailPrice || 0,
              pack.retailPrice || 0,
              pack.contractorPrice || 0,
              pack.wholesalePrice || 0,
              pack.costPrice || 0,
              pack.stockQty || 0,
              pack.id,
              id
            );
          } else {
            insertPackSize.run(
              `pack_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              id,
              pack.packSize,
              pack.barcode || null,
              pack.mrp || pack.retailPrice || 0,
              pack.retailPrice || 0,
              pack.contractorPrice || 0,
              pack.wholesalePrice || 0,
              pack.costPrice || 0,
              pack.stockQty || 0,
              pack.minStockAlert || 2
            );
          }
        }
      }
    });

    transaction();

    return NextResponse.json({ success: true, message: 'Product updated successfully' });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    const db = getDatabase();
    db.prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(id);
    return NextResponse.json({ success: true, message: 'Product deleted/archived successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
