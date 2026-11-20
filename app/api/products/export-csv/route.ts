import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/sqlite';

export async function GET() {
  try {
    const db = getDatabase();

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
    `).all() as any[];

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
      'Description',
    ];

    function escapeCsvField(val: any) {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }

    const csvLines: string[] = [];
    csvLines.push(headers.join(','));

    for (const row of rows) {
      const line = headers.map((h) => escapeCsvField(row[h])).join(',');
      csvLines.push(line);
    }

    const csvContent = '\uFEFF' + csvLines.join('\r\n');

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="all_products_bulk_upload.csv"',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Error exporting CSV:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
