import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/sqlite';

export async function GET() {
  try {
    const db = getDatabase();

    // Ensure categories table exists & seeded
    const categories: any[] = db.prepare(`
      SELECT 
        c.id, 
        c.name, 
        c.icon_name as iconName,
        COUNT(p.id) as productCount
      FROM categories c
      LEFT JOIN products p ON LOWER(c.name) = LOWER(p.category) AND p.is_active = 1
      GROUP BY c.id
      ORDER BY c.name ASC
    `).all();

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = (body.name || '').trim();
    const iconName = body.iconName || 'Layers';

    if (!name) {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
    }

    const db = getDatabase();

    // Check if category already exists
    const existing = db.prepare('SELECT id, name, icon_name as iconName FROM categories WHERE LOWER(name) = LOWER(?)').get(name) as any;
    if (existing) {
      return NextResponse.json({ success: true, category: existing, message: 'Category already exists' });
    }

    const id = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    db.prepare('INSERT INTO categories (id, name, icon_name) VALUES (?, ?, ?)').run(id, name, iconName);

    return NextResponse.json({
      success: true,
      category: { id, name, iconName, productCount: 0 },
      message: 'Category created successfully'
    });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, oldName, newName, iconName } = body;
    if (!id || !newName?.trim()) {
      return NextResponse.json({ success: false, error: 'Category ID and new name are required' }, { status: 400 });
    }

    const db = getDatabase();
    const transaction = db.transaction(() => {
      db.prepare('UPDATE categories SET name = ?, icon_name = COALESCE(?, icon_name) WHERE id = ?').run(
        newName.trim(),
        iconName || null,
        id
      );
      if (oldName && oldName.trim().toLowerCase() !== newName.trim().toLowerCase()) {
        db.prepare('UPDATE products SET category = ? WHERE LOWER(category) = LOWER(?)').run(
          newName.trim(),
          oldName.trim()
        );
      }
    });

    transaction();
    return NextResponse.json({ success: true, message: 'Category updated successfully' });
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Category ID required' }, { status: 400 });
    }

    const db = getDatabase();
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
