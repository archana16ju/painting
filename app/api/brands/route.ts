import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/sqlite';

export async function GET() {
  try {
    const db = getDatabase();

    // Query from brands master joined with products
    const brands: any[] = db.prepare(`
      SELECT 
        b.id,
        b.name, 
        COUNT(p.id) as productCount 
      FROM brands b
      LEFT JOIN products p ON LOWER(b.name) = LOWER(p.brand) AND p.is_active = 1
      GROUP BY b.id
      ORDER BY b.name ASC
    `).all();

    return NextResponse.json({ success: true, brands });
  } catch (error: any) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = (body.name || '').trim();

    if (!name) {
      return NextResponse.json({ success: false, error: 'Brand name is required' }, { status: 400 });
    }

    const db = getDatabase();

    // Check if brand already exists
    const existing = db.prepare('SELECT id, name FROM brands WHERE LOWER(name) = LOWER(?)').get(name) as any;
    if (existing) {
      return NextResponse.json({ success: true, brand: existing, message: 'Brand already exists' });
    }

    const id = `brand_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    db.prepare('INSERT INTO brands (id, name) VALUES (?, ?)').run(id, name);

    return NextResponse.json({
      success: true,
      brand: { id, name, productCount: 0 },
      message: 'Brand created successfully',
    });
  } catch (error: any) {
    console.error('Error creating brand:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const oldName = (body.oldName || '').trim();
    const newName = (body.newName || '').trim();

    if (!oldName || !newName) {
      return NextResponse.json({ success: false, error: 'Both old and new brand names are required' }, { status: 400 });
    }

    const db = getDatabase();

    const transaction = db.transaction(() => {
      db.prepare('UPDATE brands SET name = ? WHERE LOWER(name) = LOWER(?)').run(newName, oldName);
      db.prepare('UPDATE products SET brand = ? WHERE LOWER(brand) = LOWER(?)').run(newName, oldName);
    });

    transaction();

    return NextResponse.json({
      success: true,
      message: `Brand renamed from "${oldName}" to "${newName}" across products`,
    });
  } catch (error: any) {
    console.error('Error updating brand:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const name = searchParams.get('name');

    if (!id && !name) {
      return NextResponse.json({ success: false, error: 'Brand ID or name is required' }, { status: 400 });
    }

    const db = getDatabase();

    if (id) {
      db.prepare('DELETE FROM brands WHERE id = ?').run(id);
    } else if (name) {
      db.prepare('DELETE FROM brands WHERE LOWER(name) = LOWER(?)').run(name);
    }

    return NextResponse.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting brand:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
