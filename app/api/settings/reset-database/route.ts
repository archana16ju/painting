import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/sqlite';

// Default admin reset password
const DEFAULT_PASSWORD = 'admin123';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required to reset database.' },
        { status: 400 }
      );
    }

    const trimmedPassword = String(password).trim();
    // Accept default password admin123 or admin
    if (trimmedPassword !== DEFAULT_PASSWORD && trimmedPassword !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Incorrect password! Default password is: admin123' },
        { status: 401 }
      );
    }

    const db = getDatabase();

    // Disable foreign keys temporarily during wipe to avoid constraint blocks
    db.pragma('foreign_keys = OFF');

    const wipeTransaction = db.transaction(() => {
      // Wipe sales & billing
      db.prepare('DELETE FROM bill_items').run();
      db.prepare('DELETE FROM bills').run();
      db.prepare('DELETE FROM paint_estimates').run();

      // Wipe contractors & khata ledger
      db.prepare('DELETE FROM contractor_ledger').run();
      db.prepare('DELETE FROM contractors').run();

      // Wipe customers & suppliers
      db.prepare('DELETE FROM customers').run();
      db.prepare('DELETE FROM purchases').run();

      // Wipe catalog & stock
      db.prepare('DELETE FROM product_pack_sizes').run();
      db.prepare('DELETE FROM products').run();
      db.prepare('DELETE FROM paint_shades').run();
      db.prepare('DELETE FROM categories').run();
      db.prepare('DELETE FROM brands').run();
    });

    wipeTransaction();

    // Re-enable foreign keys
    db.pragma('foreign_keys = ON');

    // Run vacuum to reclaim space and reset internal SQLite structures
    try {
      db.exec('VACUUM;');
    } catch {
      // Vacuum is non-critical
    }

    return NextResponse.json({
      success: true,
      message: 'Database reset successfully! All products, pack sizes, bills, and categories have been wiped to 0. Ready for new bulk CSV upload.',
    });
  } catch (error: any) {
    console.error('Reset database error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reset database' },
      { status: 500 }
    );
  }
}
