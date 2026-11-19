'use client';

import React, { useState } from 'react';
import { usePaintTerminalStore } from '@/store/usePaintTerminalStore';
import { PaymentMethod } from '@/types/paint';
import { X, Check, Wallet, QrCode, CreditCard, Landmark, BookOpen, AlertCircle } from 'lucide-react';

export default function PaymentModal() {
  const {
    isPaymentModalOpen,
    closePaymentModal,
    cart,
    selectedContractor,
    customerName,
    customerPhone,
    customerGstin,
    siteName,
    getGrandTotal,
    getSubtotal,
    getTotalTax,
    openInvoiceModal,
    clearCart,
  } = usePaintTerminalStore();

  const grandTotal = getGrandTotal();
  const [paymentMode, setPaymentMode] = useState<PaymentMethod>('CASH');
  const [cashTendered, setCashTendered] = useState<number>(grandTotal);
  const [upiAmount, setUpiAmount] = useState<number>(0);
  const [creditAmount, setCreditAmount] = useState<number>(0);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isPaymentModalOpen) return null;

  const changeDue = Math.max(0, cashTendered - grandTotal);
  const totalPaid = paymentMode === 'SPLIT' 
    ? (Number(cashTendered) || 0) + (Number(upiAmount) || 0) 
    : paymentMode === 'CREDIT' 
    ? 0 
    : grandTotal;
  const balanceDue = Math.max(0, grandTotal - totalPaid);

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    setErrorMsg('');

    // If Credit or Balance Due exists, ensure Contractor or Customer is tagged
    if (balanceDue > 0 && !selectedContractor && !customerName.trim()) {
      setErrorMsg('Please specify a Contractor or Customer Name to record outstanding balance/Khata.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName: customerName || (selectedContractor ? selectedContractor.name : 'Walk-in Customer'),
        customerPhone,
        customerGstin,
        contractorId: selectedContractor?.id || null,
        contractorName: selectedContractor?.name || null,
        siteName,
        paymentMode,
        paidAmount: totalPaid,
        balanceDue,
        paymentDetails:
          paymentMode === 'SPLIT'
            ? `Cash: ₹${cashTendered}, UPI: ₹${upiAmount}. ${paymentNotes}`
            : paymentNotes,
        items: cart,
      };

      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        closePaymentModal();
        clearCart();
        openInvoiceModal(data.billId);
      } else {
        setErrorMsg(data.error || 'Failed to complete sale');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with server');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 px-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Checkout & Payment</h2>
              <p className="text-xs text-slate-400">Total Payable: ₹{grandTotal.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <button onClick={closePaymentModal} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Payment Mode</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                { id: 'CASH', label: 'Cash', icon: Wallet },
                { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                { id: 'CARD', label: 'Card Swipe', icon: CreditCard },
                { id: 'SPLIT', label: 'Split Pay', icon: Landmark },
                { id: 'CREDIT', label: 'Khata Credit', icon: BookOpen },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setPaymentMode(m.id as PaymentMethod);
                      if (m.id === 'CASH') setCashTendered(grandTotal);
                      if (m.id === 'SPLIT') {
                        setCashTendered(Math.round(grandTotal / 2));
                        setUpiAmount(Math.round(grandTotal / 2));
                      }
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-bold ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode-Specific Input Fields */}
          {paymentMode === 'CASH' && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Cash Received from Customer (₹)</span>
                <input
                  type="number"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(Number(e.target.value))}
                  className="w-36 px-3 py-1.5 text-right font-mono font-bold text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                <span className="text-slate-500">Change Due to Customer</span>
                <span className="font-mono font-bold text-sm text-emerald-600">₹{changeDue.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          {paymentMode === 'SPLIT' && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Part 1: Cash Amount (₹)</span>
                <input
                  type="number"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(Number(e.target.value))}
                  className="w-36 px-3 py-1.5 text-right font-mono font-bold text-sm bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Part 2: UPI Amount (₹)</span>
                <input
                  type="number"
                  value={upiAmount}
                  onChange={(e) => setUpiAmount(Number(e.target.value))}
                  className="w-36 px-3 py-1.5 text-right font-mono font-bold text-sm bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                <span className="text-slate-500">Remaining Balance (Added to Khata)</span>
                <span className="font-mono font-bold text-sm text-amber-600">₹{balanceDue.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          {paymentMode === 'CREDIT' && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
              <div className="font-bold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" /> Full Amount Charged to Khata Ledger
              </div>
              <div>
                Full bill amount of <strong>₹{grandTotal.toLocaleString('en-IN')}</strong> will be debited to{' '}
                <strong>{selectedContractor ? selectedContractor.name : customerName || 'Contractor'}</strong>.
              </div>
              {selectedContractor && (
                <div className="text-[11px] text-amber-700">
                  Current Balance: ₹{selectedContractor.balance.toLocaleString('en-IN')} | Limit: ₹{selectedContractor.limit.toLocaleString('en-IN')}
                </div>
              )}
            </div>
          )}

          {/* Payment Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Optional Reference / Notes</label>
            <input
              type="text"
              placeholder="e.g. UPI Ref #, Cheque #, or Site remarks..."
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Breakdown summary */}
          <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Total Billed</div>
              <div className="text-lg font-bold font-mono text-emerald-400">₹{grandTotal.toLocaleString('en-IN')}</div>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={handleCompleteSale}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold rounded-xl transition flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {submitting ? 'Generating Invoice...' : (
                <>
                  <Check className="w-5 h-5" /> Complete Sale & Print [F12]
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
