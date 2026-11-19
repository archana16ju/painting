'use client';

import React, { useState } from 'react';
import { usePaintTerminalStore } from '@/store/usePaintTerminalStore';
import { X, UserPlus, Check, AlertCircle, Phone, MapPin, Percent, CreditCard } from 'lucide-react';

interface AddContractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContractorAdded?: (contractor: { id: string; name: string; phone: string; balance: number; limit: number }) => void;
}

export default function AddContractorModal({
  isOpen,
  onClose,
  onContractorAdded,
}: AddContractorModalProps) {
  const { setSelectedContractor, setPriceTier } = usePaintTerminalStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [commissionRate, setCommissionRate] = useState(5.0);
  const [creditLimit, setCreditLimit] = useState(50000);
  const [openingBalance, setOpeningBalance] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setError('Contractor name is required');
      return;
    }
    if (!trimmedPhone) {
      setError('Phone number is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: trimmedName,
        phone: trimmedPhone,
        address: address.trim(),
        commissionRate: Number(commissionRate) || 5.0,
        creditLimit: Number(creditLimit) || 50000,
        currentBalance: Number(openingBalance) || 0,
        status: 'ACTIVE',
      };

      const res = await fetch('/api/contractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to add contractor');
      }

      const newContractor = {
        id: data.id,
        name: trimmedName,
        phone: trimmedPhone,
        balance: Number(openingBalance) || 0,
        limit: Number(creditLimit) || 50000,
      };

      // Auto-tag contractor in active terminal cart
      setSelectedContractor(newContractor);
      setPriceTier('CONTRACTOR');

      if (onContractorAdded) {
        onContractorAdded(newContractor);
      }

      // Reset and close
      setName('');
      setPhone('');
      setAddress('');
      setOpeningBalance(0);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error saving contractor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Add New Contractor / Master Painter</h3>
              <p className="text-[11px] text-slate-500 font-medium">Create a painter profile for trade pricing & Khata</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contractor / Painter Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Rajesh Verma (Painter)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Address / Site Area</label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Gandhi Nagar, Main Road"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Commission, Credit Limit & Opening Balance */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Commission %</label>
              <div className="relative">
                <Percent className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-2 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Khata Credit Limit (₹)</label>
              <input
                type="number"
                step="1000"
                value={creditLimit}
                onChange={(e) => setCreditLimit(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-indigo-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Opening Due (₹)</label>
              <input
                type="number"
                step="500"
                value={openingBalance || ''}
                placeholder="0"
                onChange={(e) => setOpeningBalance(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-rose-700"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !phone.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition shadow-xs cursor-pointer"
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Save & Tag in Cart</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
