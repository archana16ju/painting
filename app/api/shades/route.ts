import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/sqlite';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const brand = searchParams.get('brand') || '';

    const db = getDatabase();

    let query = 'SELECT * FROM paint_shades WHERE 1=1';
    const params: any[] = [];

    if (brand && brand !== 'ALL') {
      query += ' AND brand = ?';
      params.push(brand);
    }

    if (search.trim()) {
      query += ' AND (shade_code LIKE ? OR shade_name LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    query += ' ORDER BY brand, shade_name LIMIT 100';

    const rows: any[] = db.prepare(query).all(...params);

    const shades = rows.map((r) => ({
      id: r.id,
      brand: r.brand,
      shadeCode: r.shade_code,
      shadeName: r.shade_name,
      hexColor: r.hex_color,
      baseType: r.base_type,
      description: r.description,
    }));

    return NextResponse.json({ success: true, shades });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();

    const id = body.id || `sh_${Date.now()}`;
    db.prepare(`
      INSERT INTO paint_shades (id, brand, shade_code, shade_name, hex_color, base_type, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      body.brand,
      body.shadeCode,
      body.shadeName,
      body.hexColor || '#EFEFEF',
      body.baseType || 'Base White',
      body.description || ''
    );

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
