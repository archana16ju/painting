import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/sqlite';

export async function GET() {
  try {
    const db = getDatabase();
    const estimates = db.prepare('SELECT * FROM paint_estimates ORDER BY created_at DESC LIMIT 50').all();
    return NextResponse.json({ success: true, estimates });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();

    const id = `est_${Date.now()}`;
    const countRow: any = db.prepare('SELECT count(*) as c FROM paint_estimates').get();
    const estimateNumber = `EST/${new Date().getFullYear()}/${String((countRow?.c || 0) + 1).padStart(4, '0')}`;

    db.prepare(`
      INSERT INTO paint_estimates (
        id, estimate_number, customer_name, customer_phone, project_name,
        total_sqft, surface_type, quality_tier, putty_kg, primer_liters, paint_liters, estimated_total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      estimateNumber,
      body.customerName || 'Customer',
      body.customerPhone || '',
      body.projectName || 'Residential Interior',
      body.totalSqFt || 0,
      body.surfaceType || 'FRESH_PLASTER',
      body.qualityTier || 'PREMIUM',
      body.puttyKg || 0,
      body.primerLiters || 0,
      body.paintLiters || 0,
      body.estimatedTotal || 0
    );

    return NextResponse.json({ success: true, id, estimateNumber });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
