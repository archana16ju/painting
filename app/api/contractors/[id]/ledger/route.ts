import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/sqlite';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDatabase();

    const contractor: any = db.prepare('SELECT * FROM contractors WHERE id = ?').get(id);
    if (!contractor) {
      return NextResponse.json({ success: false, error: 'Contractor not found' }, { status: 404 });
    }

    const ledger: any[] = db.prepare(`
      SELECT * FROM contractor_ledger 
      WHERE contractor_id = ? 
      ORDER BY created_at DESC
    `).all(id);

    return NextResponse.json({
      success: true,
      contractor: {
        id: contractor.id,
        name: contractor.name,
        phone: contractor.phone,
        creditLimit: contractor.credit_limit,
        currentBalance: contractor.current_balance,
        commissionRate: contractor.commission_rate,
      },
      ledger: ledger.map((l) => ({
        id: l.id,
        contractorId: l.contractor_id,
        billId: l.bill_id,
        type: l.type,
        amount: l.amount,
        balanceAfter: l.balance_after,
        paymentMode: l.payment_mode,
        notes: l.notes,
        createdAt: l.created_at,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const db = getDatabase();

    const amount = Number(body.amount);
    const paymentMode = body.paymentMode || 'CASH';
    const notes = body.notes || 'Payment Received';

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid payment amount' }, { status: 400 });
    }

    const contractor: any = db.prepare('SELECT * FROM contractors WHERE id = ?').get(id);
    if (!contractor) {
      return NextResponse.json({ success: false, error: 'Contractor not found' }, { status: 404 });
    }

    const newBalance = Math.max(0, contractor.current_balance - amount);
    const ledgerId = `cled_${Date.now()}`;

    const transaction = db.transaction(() => {
      db.prepare(`
        UPDATE contractors 
        SET current_balance = ? 
        WHERE id = ?
      `).run(newBalance, id);

      db.prepare(`
        INSERT INTO contractor_ledger (id, contractor_id, type, amount, balance_after, payment_mode, notes)
        VALUES (?, ?, 'CREDIT', ?, ?, ?, ?)
      `).run(ledgerId, id, amount, newBalance, paymentMode, notes);
    });

    transaction();

    return NextResponse.json({
      success: true,
      newBalance,
      ledgerId,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
