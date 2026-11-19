import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/sqlite';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDatabase();

    const bill: any = db.prepare('SELECT * FROM bills WHERE id = ? OR invoice_number = ?').get(id, id);
    if (!bill) {
      return NextResponse.json({ success: false, error: 'Bill not found' }, { status: 404 });
    }

    const items: any[] = db.prepare('SELECT * FROM bill_items WHERE bill_id = ?').all(bill.id);
    const settings: any = db.prepare('SELECT * FROM shop_settings LIMIT 1').get();

    return NextResponse.json({
      success: true,
      bill: {
        id: bill.id,
        invoiceNumber: bill.invoice_number,
        customerId: bill.customer_id,
        customerName: bill.customer_name,
        customerPhone: bill.customer_phone,
        customerGstin: bill.customer_gstin,
        contractorId: bill.contractor_id,
        contractorName: bill.contractor_name,
        siteName: bill.site_name,
        subtotal: bill.subtotal,
        discountAmount: bill.discount_amount,
        taxAmount: bill.tax_amount,
        cgst: bill.cgst,
        sgst: bill.sgst,
        igst: bill.igst,
        roundOff: bill.round_off,
        grandTotal: bill.grand_total,
        paidAmount: bill.paid_amount,
        balanceDue: bill.balance_due,
        paymentMode: bill.payment_mode,
        paymentDetails: bill.payment_details,
        status: bill.status,
        createdAt: bill.created_at,
        items: items.map((i) => ({
          id: i.id,
          productId: i.product_id,
          packSizeId: i.pack_size_id,
          brand: i.brand,
          productName: i.product_name,
          packSize: i.pack_size,
          shadeCode: i.shade_code,
          shadeName: i.shade_name,
          quantity: i.quantity,
          rate: i.rate,
          discountPercent: i.discount_percent,
          taxPercent: i.tax_percent,
          taxAmount: i.tax_amount,
          amount: i.amount,
          isTinted: Boolean(i.is_tinted),
          dispenserFormula: i.dispenser_formula,
        })),
      },
      settings: settings || {},
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
