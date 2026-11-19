'use client';

import React, { useState, useEffect } from 'react';
import { usePaintTerminalStore } from '@/store/usePaintTerminalStore';
import { X, Printer, Share2, Download, CheckCircle2 } from 'lucide-react';

export default function InvoiceModal() {
  const { isInvoiceModalOpen, closeInvoiceModal, lastBillId } = usePaintTerminalStore();
  const [billData, setBillData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [printFormat, setPrintFormat] = useState<'A4' | '80mm'>('A4');

  useEffect(() => {
    if (isInvoiceModalOpen && lastBillId) {
      fetchBillDetails(lastBillId);
    }
  }, [isInvoiceModalOpen, lastBillId]);

  const fetchBillDetails = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bills/${id}`);
      const data = await res.json();
      if (data.success) {
        setBillData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    if (!billData) return;
    const { bill, settings } = billData;
    const phone = bill.customerPhone ? bill.customerPhone.replace(/\D/g, '') : '';
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;

    const message = encodeURIComponent(
      `*${settings?.shop_name || 'ROYAL PAINT STORE'}*\n` +
      `Tax Invoice: *${bill.invoiceNumber}*\n` +
      `Date: ${new Date(bill.createdAt).toLocaleDateString('en-IN')}\n` +
      `Customer: ${bill.customerName}\n` +
      `Total: *₹${bill.grandTotal.toLocaleString('en-IN')}*\n` +
      `Paid: ₹${bill.paidAmount.toLocaleString('en-IN')}\n` +
      (bill.balanceDue > 0 ? `*Balance Due (Khata): ₹${bill.balanceDue.toLocaleString('en-IN')}*\n` : '') +
      `Thank you for your business!`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  if (!isInvoiceModalOpen) return null;

  const bill = billData?.bill;
  const settings = billData?.settings;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header Actions */}
        <div className="p-4 px-6 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold">Tax Invoice #{bill?.invoiceNumber || '...'}</h2>
              <p className="text-xs text-slate-400">Sale completed successfully</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex text-xs">
              <button
                type="button"
                onClick={() => setPrintFormat('A4')}
                className={`px-3 py-1.5 rounded-md font-semibold transition ${
                  printFormat === 'A4' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                A4 Tax Invoice
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('80mm')}
                className={`px-3 py-1.5 rounded-md font-semibold transition ${
                  printFormat === '80mm' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                80mm Thermal
              </button>
            </div>

            <button
              onClick={handleWhatsAppShare}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow"
            >
              <Share2 className="w-4 h-4" /> WhatsApp
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow"
            >
              <Printer className="w-4 h-4" /> Print
            </button>

            <button onClick={closeInvoiceModal} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Viewport */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center">
          {loading || !bill ? (
            <div className="py-20 text-center text-slate-400 text-sm">Loading invoice...</div>
          ) : printFormat === 'A4' ? (
            /* Full A4 GST Tax Invoice Format */
            <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 w-full max-w-[800px] text-slate-900 text-xs font-sans">
              {/* Store Header */}
              <div className="text-center border-b pb-4 mb-4">
                <h1 className="text-xl font-black tracking-wide text-slate-900 uppercase">
                  {settings?.shop_name || 'ROYAL PAINT & HARDWARE STORE'}
                </h1>
                {settings?.tagline && <p className="text-xs text-slate-500 font-medium">{settings.tagline}</p>}
                <p className="text-xs text-slate-600 mt-1">{settings?.address}</p>
                <div className="flex items-center justify-center gap-4 text-[11px] text-slate-600 mt-1">
                  <span>Phone: {settings?.phone}</span>
                  <span className="font-bold">GSTIN: {settings?.gstin}</span>
                </div>
                <div className="mt-2 inline-block px-3 py-0.5 bg-slate-100 border border-slate-300 font-bold text-[11px] uppercase tracking-wider rounded">
                  TAX INVOICE
                </div>
              </div>

              {/* Invoice Meta */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b text-xs">
                <div className="space-y-1">
                  <div>
                    <span className="text-slate-500">Invoice No:</span> <strong className="font-mono">{bill.invoiceNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Date:</span> <strong>{new Date(bill.createdAt).toLocaleString('en-IN')}</strong>
                  </div>
                  {bill.siteName && (
                    <div>
                      <span className="text-slate-500">Project / Site:</span> <strong>{bill.siteName}</strong>
                    </div>
                  )}
                </div>

                <div className="space-y-1 text-right">
                  <div>
                    <span className="text-slate-500">Customer:</span> <strong>{bill.customerName}</strong>
                  </div>
                  {bill.customerPhone && (
                    <div>
                      <span className="text-slate-500">Phone:</span> <strong className="font-mono">{bill.customerPhone}</strong>
                    </div>
                  )}
                  {bill.contractorName && (
                    <div>
                      <span className="text-slate-500">Contractor Tagged:</span> <strong className="text-indigo-600">{bill.contractorName}</strong>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500">Payment Mode:</span> <strong className="uppercase">{bill.paymentMode}</strong>
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <table className="w-full text-left my-4 border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-800 text-[11px] uppercase tracking-wider text-slate-700 bg-slate-50">
                    <th className="py-2 px-1">#</th>
                    <th className="py-2 px-2">Brand & Product Name</th>
                    <th className="py-2 px-2">Shade / Code</th>
                    <th className="py-2 px-2 text-center">Can Size</th>
                    <th className="py-2 px-2 text-right">Qty</th>
                    <th className="py-2 px-2 text-right">Rate</th>
                    <th className="py-2 px-2 text-right">Disc</th>
                    <th className="py-2 px-2 text-right">Tax%</th>
                    <th className="py-2 px-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {bill.items.map((item: any, idx: number) => (
                    <tr key={item.id} className="text-[11px]">
                      <td className="py-2 px-1 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-2">
                        <div className="font-bold text-slate-900">{item.productName}</div>
                        <div className="text-[10px] text-slate-500">{item.brand}</div>
                        {item.dispenserFormula && (
                          <div className="text-[9px] font-mono text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded mt-0.5 inline-block">
                            {item.dispenserFormula}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-2">
                        {item.shadeCode ? (
                          <div className="font-semibold text-slate-800">
                            {item.shadeCode} - {item.shadeName}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-center font-mono font-medium">{item.packSize}</td>
                      <td className="py-2 px-2 text-right font-mono font-bold">{item.quantity}</td>
                      <td className="py-2 px-2 text-right font-mono">₹{item.rate.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-500">
                        {item.discountPercent > 0 ? `${item.discountPercent}%` : '0%'}
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-slate-500">{item.taxPercent}%</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals & Tax Breakdown */}
              <div className="grid grid-cols-2 gap-4 border-t-2 border-slate-800 pt-3 text-xs">
                <div className="space-y-1 text-[11px] text-slate-600">
                  <div className="font-bold text-slate-800">Tax Breakdown:</div>
                  <div>CGST (9%): ₹{bill.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  <div>SGST (9%): ₹{bill.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  <div>Total Tax: ₹{bill.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  {settings?.bank_details && (
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <strong>Bank Details:</strong> {settings.bank_details} | UPI: {settings?.upi_id}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-right font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal (Excl. Tax):</span>
                    <span>₹{bill.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {bill.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Total Discount:</span>
                      <span>-₹{bill.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Total GST:</span>
                    <span>+₹{bill.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {bill.roundOff !== 0 && (
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Round Off:</span>
                      <span>₹{bill.roundOff.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
                    <span>GRAND TOTAL:</span>
                    <span>₹{bill.grandTotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-slate-700">
                    <span>Paid Now ({bill.paymentMode}):</span>
                    <span>₹{bill.paidAmount.toLocaleString('en-IN')}</span>
                  </div>

                  {bill.balanceDue > 0 && (
                    <div className="flex justify-between text-sm font-bold text-rose-600 bg-rose-50 p-1.5 rounded">
                      <span>BALANCE DUE (Added to Khata):</span>
                      <span>₹{bill.balanceDue.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Terms & Footer */}
              <div className="mt-6 pt-3 border-t border-slate-200 text-[10px] text-slate-500 text-center space-y-1">
                <p>Terms: Goods once tinted cannot be exchanged or returned. Please inspect shades before application.</p>
                <p className="font-semibold text-slate-700">Thank you for your business!</p>
              </div>
            </div>
          ) : (
            /* 80mm Thermal Receipt Format */
            <div className="bg-white p-4 rounded-xl shadow border border-slate-200 w-[300px] text-slate-900 font-mono text-[11px]">
              <div className="text-center pb-2 border-b border-dashed border-slate-400">
                <div className="font-bold text-xs uppercase">{settings?.shop_name || 'ROYAL PAINT STORE'}</div>
                <div>{settings?.address}</div>
                <div>Phone: {settings?.phone}</div>
                <div>GSTIN: {settings?.gstin}</div>
              </div>

              <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
                <div>Inv: #{bill.invoiceNumber}</div>
                <div>Date: {new Date(bill.createdAt).toLocaleDateString('en-IN')}</div>
                <div>Cust: {bill.customerName}</div>
                {bill.siteName && <div>Site: {bill.siteName}</div>}
              </div>

              <div className="py-2 border-b border-dashed border-slate-400 space-y-1">
                {bill.items.map((item: any) => (
                  <div key={item.id}>
                    <div className="font-bold">{item.productName} ({item.packSize})</div>
                    {item.shadeCode && <div className="text-[10px] text-slate-600">Shade: {item.shadeCode} {item.shadeName}</div>}
                    <div className="flex justify-between text-[10px]">
                      <span>{item.quantity} x ₹{item.rate}</span>
                      <span>₹{item.amount}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-right">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{bill.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST Total:</span>
                  <span>₹{bill.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-300">
                  <span>GRAND TOTAL:</span>
                  <span>₹{bill.grandTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paid:</span>
                  <span>₹{bill.paidAmount}</span>
                </div>
                {bill.balanceDue > 0 && (
                  <div className="flex justify-between font-bold text-rose-600">
                    <span>Khata Due:</span>
                    <span>₹{bill.balanceDue}</span>
                  </div>
                )}
              </div>

              <div className="text-center pt-2 text-[9px] text-slate-500">
                Goods once tinted cannot be returned. Thank you!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
