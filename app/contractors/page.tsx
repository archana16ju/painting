'use client';

import React, { useState, useEffect } from 'react';
import { Contractor, ContractorLedgerEntry } from '@/types/paint';
import {
  Users,
  Search,
  Plus,
  Phone,
  BookOpen,
  ArrowDownLeft,
  ArrowUpRight,
  Share2,
  Check,
  ShieldAlert,
  Wallet,
} from 'lucide-react';

export default function ContractorsPage() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [ledger, setLedger] = useState<ContractorLedgerEntry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  // Payment Collection Modal State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMode, setPayMode] = useState('CASH');
  const [payNotes, setPayNotes] = useState('Payment Received');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  useEffect(() => {
    fetchContractors();
  }, []);

  const fetchContractors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contractors');
      const data = await res.json();
      if (data.success) {
        setContractors(data.contractors);
        if (data.contractors.length > 0 && !selectedContractor) {
          fetchLedger(data.contractors[0].id);
          setSelectedContractor(data.contractors[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLedger = async (id: string) => {
    setLedgerLoading(true);
    try {
      const res = await fetch(`/api/contractors/${id}/ledger`);
      const data = await res.json();
      if (data.success) {
        setLedger(data.ledger);
        if (data.contractor) {
          setSelectedContractor(data.contractor);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLedgerLoading(false);
    }
  };

  const handleSelectContractor = (c: Contractor) => {
    setSelectedContractor(c);
    fetchLedger(c.id);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractor || payAmount <= 0) return;

    setSubmittingPayment(true);
    try {
      const res = await fetch(`/api/contractors/${selectedContractor.id}/ledger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: payAmount,
          paymentMode: payMode,
          notes: payNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsPaymentOpen(false);
        setPayAmount(0);
        fetchContractors();
        fetchLedger(selectedContractor.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleSendWhatsAppStatement = () => {
    if (!selectedContractor) return;
    const phone = selectedContractor.phone.replace(/\D/g, '');
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;

    const message = encodeURIComponent(
      `*Khata Statement — ROYAL PAINT STORE*\n` +
      `Contractor: *${selectedContractor.name}*\n` +
      `Current Outstanding Balance: *₹${selectedContractor.currentBalance.toLocaleString('en-IN')}*\n` +
      `Credit Limit: ₹${selectedContractor.creditLimit.toLocaleString('en-IN')}\n\n` +
      `Please clear the pending balance via UPI: royalpaints@upi\n` +
      `Thank you!`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const filtered = contractors.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left List of Contractors */}
      <div className="w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" /> Contractors & Khata
            </h2>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search painter name / phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading contractors...</div>
          ) : filtered.map((c) => {
            const isSelected = selectedContractor?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => handleSelectContractor(c)}
                className={`p-3.5 cursor-pointer transition flex items-center justify-between ${
                  isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-slate-900">{c.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" /> {c.phone}
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-mono font-bold text-xs ${c.currentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    ₹{c.currentBalance.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-400">{c.commissionRate}% comm.</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Details & Ledger Passbook */}
      <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden">
        {selectedContractor ? (
          <>
            {/* Contractor Summary Bar */}
            <div className="p-5 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-lg font-bold text-slate-900">{selectedContractor.name}</h1>
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                  <span>Phone: <strong className="font-mono text-slate-700">{selectedContractor.phone}</strong></span>
                  <span>Credit Limit: <strong className="font-mono text-slate-700">₹{selectedContractor.creditLimit.toLocaleString('en-IN')}</strong></span>
                  <span>Commission: <strong className="text-indigo-600">{selectedContractor.commissionRate}%</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-slate-400 uppercase font-semibold">Total Outstanding Dues</div>
                  <div className="text-xl font-black font-mono text-rose-600">
                    ₹{selectedContractor.currentBalance.toLocaleString('en-IN')}
                  </div>
                </div>

                <button
                  onClick={handleSendWhatsAppStatement}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Share2 className="w-4 h-4" /> Send WhatsApp Statement
                </button>

                <button
                  onClick={() => setIsPaymentOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Wallet className="w-4 h-4" /> Receive Payment
                </button>
              </div>
            </div>

            {/* Ledger Transactions Table */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" /> Khata Passbook & Transaction Ledger
                  </h3>
                  <span className="text-xs text-slate-400">{ledger.length} Transactions</span>
                </div>

                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/60 font-semibold uppercase text-[10px]">
                      <th className="py-2.5 px-4">Date & Time</th>
                      <th className="py-2.5 px-4">Type</th>
                      <th className="py-2.5 px-4">Description / Reference</th>
                      <th className="py-2.5 px-4 text-right">Debit (+)</th>
                      <th className="py-2.5 px-4 text-right">Credit (-)</th>
                      <th className="py-2.5 px-4 text-right">Balance After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {ledgerLoading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">Loading ledger...</td>
                      </tr>
                    ) : ledger.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">No transactions recorded yet.</td>
                      </tr>
                    ) : (
                      ledger.map((row) => {
                        const isDebit = row.type === 'DEBIT';
                        return (
                          <tr key={row.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-4 text-slate-600 font-sans">
                              {new Date(row.createdAt).toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isDebit ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                                }`}
                              >
                                {isDebit ? (
                                  <>
                                    <ArrowUpRight className="w-3 h-3" /> Sale on Credit
                                  </>
                                ) : (
                                  <>
                                    <ArrowDownLeft className="w-3 h-3" /> Payment Received
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-sans text-slate-800">{row.notes || '—'}</td>
                            <td className="py-3 px-4 text-right font-bold text-rose-600">
                              {isDebit ? `+₹${row.amount.toLocaleString('en-IN')}` : '—'}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-emerald-600">
                              {!isDebit ? `-₹${row.amount.toLocaleString('en-IN')}` : '—'}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-slate-900">
                              ₹{row.balanceAfter.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            Select a contractor from the left to view their Khata ledger.
          </div>
        )}
      </div>

      {/* Payment Collection Dialog */}
      {isPaymentOpen && selectedContractor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="p-4 px-6 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Receive Payment from {selectedContractor.name}</h3>
              <button onClick={() => setIsPaymentOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  max={selectedContractor.currentBalance || 999999}
                  value={payAmount || ''}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  placeholder={`Max pending: ₹${selectedContractor.currentBalance}`}
                  className="w-full px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Mode</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="BANK_TRANSFER">Bank NEFT/RTGS</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notes / Transaction Ref</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Received via GPay, Ref: 9812..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow transition"
                >
                  {submittingPayment ? 'Saving...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
