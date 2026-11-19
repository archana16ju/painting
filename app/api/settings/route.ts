import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/sqlite';

export async function GET() {
  try {
    const db = getDatabase();
    const settings = db.prepare('SELECT * FROM shop_settings LIMIT 1').get();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();

    db.prepare(`
      UPDATE shop_settings SET
        shop_name = ?,
        tagline = ?,
        address = ?,
        phone = ?,
        email = ?,
        gstin = ?,
        invoice_prefix = ?,
        thermal_paper_size = ?,
        terms_conditions = ?,
        bank_details = ?,
        upi_id = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 'shop_main'
    `).run(
      body.shopName,
      body.tagline || '',
      body.address,
      body.phone,
      body.email || '',
      body.gstin,
      body.invoicePrefix || 'PB/2026/',
      body.thermalPaperSize || '80mm',
      body.termsConditions || '',
      body.bankDetails || '',
      body.upiId || ''
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
