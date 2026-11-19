import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/sqlite';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const db = getDatabase();

    let query = `
      SELECT b.*,
        json_group_array(
          json_object(
            'id', bi.id,
            'productId', bi.product_id,
            'packSizeId', bi.pack_size_id,
            'brand', bi.brand,
            'productName', bi.product_name,
            'packSize', bi.pack_size,
            'shadeCode', bi.shade_code,
            'shadeName', bi.shade_name,
            'quantity', bi.quantity,
            'rate', bi.rate,
            'discountPercent', bi.discount_percent,
            'taxPercent', bi.tax_percent,
            'taxAmount', bi.tax_amount,
            'amount', bi.amount,
            'isTinted', bi.is_tinted,
            'dispenserFormula', bi.dispenser_formula
          )
        ) as items_json
      FROM bills b
      LEFT JOIN bill_items bi ON b.id = bi.bill_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search.trim()) {
      query += ` AND (b.invoice_number LIKE ? OR b.customer_name LIKE ? OR b.customer_phone LIKE ? OR b.contractor_name LIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
    }

    query += ` GROUP BY b.id ORDER BY b.created_at DESC LIMIT 100`;

    const rows: any[] = db.prepare(query).all(...params);

    const bills = rows.map((r) => ({
      id: r.id,
      invoiceNumber: r.invoice_number,
      customerId: r.customer_id,
      customerName: r.customer_name,
      customerPhone: r.customer_phone,
      customerGstin: r.customer_gstin,
      contractorId: r.contractor_id,
      contractorName: r.contractor_name,
      siteName: r.site_name,
      subtotal: r.subtotal,
      discountAmount: r.discount_amount,
      taxAmount: r.tax_amount,
      cgst: r.cgst,
      sgst: r.sgst,
      igst: r.igst,
      roundOff: r.round_off,
      grandTotal: r.grand_total,
      paidAmount: r.paid_amount,
      balanceDue: r.balance_due,
      paymentMode: r.payment_mode,
      paymentDetails: r.payment_details,
      status: r.status,
      createdAt: r.created_at,
      items: r.items_json ? JSON.parse(r.items_json).filter((it: any) => it.id !== null) : [],
    }));

    return NextResponse.json({ success: true, bills });
  } catch (error: any) {
    console.error('Error in GET /api/bills:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();

    const items = body.items || [];
    if (!items.length) {
      return NextResponse.json({ success: false, error: 'No items in bill' }, { status: 400 });
    }

    // 1. Generate sequential invoice number
    const countRow: any = db.prepare('SELECT count(*) as c FROM bills').get();
    const nextSeq = (countRow?.c || 0) + 143;
    const settings: any = db.prepare('SELECT invoice_prefix FROM shop_settings LIMIT 1').get();
    const prefix = settings?.invoice_prefix || 'PB/2026/';
    const invoiceNumber = `${prefix}${String(nextSeq).padStart(4, '0')}`;
    const billId = `bill_${Date.now()}`;

    // 2. Calculations
    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    const processedItems = items.map((item: any, idx: number) => {
      const qty = Number(item.quantity) || 1;
      const rate = Number(item.rate) || 0;
      const discPct = Number(item.discountPercent) || 0;
      const taxPct = Number(item.taxPercent) || 18;

      const rawAmount = qty * rate;
      const discAmount = rawAmount * (discPct / 100);
      const taxableAmount = rawAmount - discAmount;
      const taxAmt = taxableAmount * (taxPct / 100);
      const finalItemTotal = taxableAmount; // subtotal excluding tax

      subtotal += taxableAmount;
      totalDiscount += discAmount;
      totalTax += taxAmt;

      return {
        id: `bi_${Date.now()}_${idx}`,
        billId,
        productId: item.productId,
        packSizeId: item.packSizeId,
        brand: item.brand,
        productName: item.productName,
        packSize: item.packSize,
        shadeCode: item.shadeCode || '',
        shadeName: item.shadeName || '',
        quantity: qty,
        rate,
        discountPercent: discPct,
        taxPercent: taxPct,
        taxAmount: taxAmt,
        amount: taxableAmount,
        isTinted: item.isTinted ? 1 : 0,
        dispenserFormula: item.dispenserFormula || null,
      };
    });

    const isInterState = Boolean(body.isInterState);
    const cgst = isInterState ? 0 : totalTax / 2;
    const sgst = isInterState ? 0 : totalTax / 2;
    const igst = isInterState ? totalTax : 0;

    const rawGrandTotal = subtotal + totalTax;
    const roundedGrandTotal = Math.round(rawGrandTotal);
    const roundOff = Number((roundedGrandTotal - rawGrandTotal).toFixed(2));

    const grandTotal = roundedGrandTotal;
    const paidAmount = Number(body.paidAmount !== undefined ? body.paidAmount : grandTotal);
    const balanceDue = Math.max(0, grandTotal - paidAmount);

    let status = 'PAID';
    if (balanceDue > 0 && paidAmount > 0) status = 'PARTIAL';
    else if (balanceDue > 0 && paidAmount === 0) status = 'CREDIT';

    const insertBill = db.prepare(`
      INSERT INTO bills (
        id, invoice_number, customer_id, customer_name, customer_phone, customer_gstin,
        contractor_id, contractor_name, site_name, subtotal, discount_amount, tax_amount,
        cgst, sgst, igst, round_off, grand_total, paid_amount, balance_due, payment_mode,
        payment_details, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertItem = db.prepare(`
      INSERT INTO bill_items (
        id, bill_id, product_id, pack_size_id, brand, product_name, pack_size, shade_code, shade_name,
        quantity, rate, discount_percent, tax_percent, tax_amount, amount, is_tinted, dispenser_formula
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const updateStock = db.prepare(`
      UPDATE product_pack_sizes 
      SET stock_qty = stock_qty - ? 
      WHERE id = ?
    `);

    const transaction = db.transaction(() => {
      // Insert Bill
      insertBill.run(
        billId,
        invoiceNumber,
        body.customerId || null,
        body.customerName || 'Walk-in Customer',
        body.customerPhone || '',
        body.customerGstin || '',
        body.contractorId || null,
        body.contractorName || '',
        body.siteName || '',
        subtotal,
        totalDiscount,
        totalTax,
        cgst,
        sgst,
        igst,
        roundOff,
        grandTotal,
        paidAmount,
        balanceDue,
        body.paymentMode || 'CASH',
        body.paymentDetails || '',
        status
      );

      // Insert Items & Decrement Stock
      for (const item of processedItems) {
        insertItem.run(
          item.id,
          item.billId,
          item.productId,
          item.packSizeId,
          item.brand,
          item.productName,
          item.packSize,
          item.shadeCode,
          item.shadeName,
          item.quantity,
          item.rate,
          item.discountPercent,
          item.taxPercent,
          item.taxAmount,
          item.amount,
          item.isTinted,
          item.dispenserFormula
        );

        if (item.packSizeId) {
          updateStock.run(item.quantity, item.packSizeId);
        }
      }

      // If Contractor is tagged:
      if (body.contractorId) {
        const contractor: any = db.prepare('SELECT * FROM contractors WHERE id = ?').get(body.contractorId);
        if (contractor) {
          // If there is balance due, record in Contractor Ledger as DEBIT
          if (balanceDue > 0) {
            const newBal = contractor.current_balance + balanceDue;
            db.prepare('UPDATE contractors SET current_balance = ? WHERE id = ?').run(newBal, contractor.id);
            db.prepare(`
              INSERT INTO contractor_ledger (id, contractor_id, bill_id, type, amount, balance_after, notes)
              VALUES (?, ?, ?, 'DEBIT', ?, ?, ?)
            `).run(
              `cled_${Date.now()}`,
              contractor.id,
              billId,
              balanceDue,
              newBal,
              `Bill #${invoiceNumber} (Site: ${body.siteName || 'Direct'})`
            );
          }

          // Calculate Contractor Commission
          const commRate = contractor.commission_rate || 5.0;
          const commissionEarned = subtotal * (commRate / 100);
          db.prepare(`
            UPDATE contractors 
            SET total_commission_earned = total_commission_earned + ? 
            WHERE id = ?
          `).run(commissionEarned, contractor.id);
        }
      }
    });

    transaction();

    return NextResponse.json({
      success: true,
      billId,
      invoiceNumber,
      grandTotal,
      paidAmount,
      balanceDue,
    });
  } catch (error: any) {
    console.error('Error creating bill:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
