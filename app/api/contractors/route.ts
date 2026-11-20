import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/sqlite';

export async function GET() {
  try {
    const db = getDatabase();
    const rows: any[] = db.prepare(`
      SELECT * FROM contractors ORDER BY name ASC
    `).all();

    const contractors = rows.map((r) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      address: r.address,
      commissionRate: r.commission_rate,
      creditLimit: r.credit_limit,
      currentBalance: r.current_balance,
      status: r.status,
      totalCommissionEarned: r.total_commission_earned,
      totalCommissionPaid: r.total_commission_paid,
    }));

    return NextResponse.json({ success: true, contractors });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();

    const id = body.id || `cont_${Date.now()}`;
    db.prepare(`
      INSERT INTO contractors (id, name, phone, address, commission_rate, credit_limit, current_balance, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      body.name,
      body.phone,
      body.address || '',
      body.commissionRate || 5.0,
      body.creditLimit || 50000,
      body.currentBalance || 0,
      body.status || 'ACTIVE'
    );

    if (body.currentBalance && Number(body.currentBalance) > 0) {
      db.prepare(`
        INSERT INTO contractor_ledger (id, contractor_id, type, amount, balance_after, notes)
        VALUES (?, ?, 'DEBIT', ?, ?, 'Opening Credit Balance')
      `).run(`cled_${Date.now()}`, id, body.currentBalance, body.currentBalance);
    }

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, phone, address, commissionRate, creditLimit, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Contractor ID is required' }, { status: 400 });
    }

    const db = getDatabase();
    db.prepare(`
      UPDATE contractors 
      SET 
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        commission_rate = COALESCE(?, commission_rate),
        credit_limit = COALESCE(?, credit_limit),
        status = COALESCE(?, status)
      WHERE id = ?
    `).run(
      name || null,
      phone || null,
      address != null ? address : null,
      commissionRate != null ? Number(commissionRate) : null,
      creditLimit != null ? Number(creditLimit) : null,
      status || null,
      id
    );

    return NextResponse.json({ success: true, message: 'Contractor updated successfully' });
  } catch (error: any) {
    console.error('Error updating contractor:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Contractor ID is required' }, { status: 400 });
    }

    const db = getDatabase();
    db.prepare('DELETE FROM contractors WHERE id = ?').run(id);

    return NextResponse.json({ success: true, message: 'Contractor deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting contractor:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


