import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/sqlite';

export async function GET() {
  try {
    const db = getDatabase();

    // Summary totals
    const salesSummary: any = db.prepare(`
      SELECT 
        COUNT(*) as totalBills,
        COALESCE(SUM(grand_total), 0) as totalRevenue,
        COALESCE(SUM(paid_amount), 0) as totalCollected,
        COALESCE(SUM(balance_due), 0) as totalOutstanding,
        COALESCE(SUM(tax_amount), 0) as totalTaxCollected
      FROM bills
    `).get();

    // Payment mode breakdown
    const paymentBreakdown: any[] = db.prepare(`
      SELECT payment_mode, COUNT(*) as count, COALESCE(SUM(paid_amount), 0) as total
      FROM bills
      GROUP BY payment_mode
    `).all();

    // Brand-wise sales share
    const brandSales: any[] = db.prepare(`
      SELECT brand, COUNT(*) as itemCount, COALESCE(SUM(amount), 0) as totalAmount
      FROM bill_items
      GROUP BY brand
      ORDER BY totalAmount DESC
    `).all();

    // Contractor outstanding summary
    const contractorOutstanding: any[] = db.prepare(`
      SELECT id, name, phone, current_balance, credit_limit, total_commission_earned
      FROM contractors
      WHERE current_balance > 0
      ORDER BY current_balance DESC
    `).all();

    // Low stock alerts
    const lowStock: any[] = db.prepare(`
      SELECT p.brand, p.name, ps.pack_size, ps.stock_qty, ps.min_stock_alert
      FROM product_pack_sizes ps
      JOIN products p ON ps.product_id = p.id
      WHERE ps.stock_qty <= ps.min_stock_alert
      ORDER BY ps.stock_qty ASC
    `).all();

    return NextResponse.json({
      success: true,
      summary: salesSummary,
      paymentBreakdown,
      brandSales,
      contractorOutstanding,
      lowStock,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
