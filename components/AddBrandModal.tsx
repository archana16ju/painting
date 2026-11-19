'use client';

import React, { useState } from 'react';
import { X, Plus, Tag, Check, AlertCircle } from 'lucide-react';

interface AddBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBrandCreated: (brand: { id: string; name: string }) => void;
}

const BRAND_SUGGESTIONS = [
  'Nippon Paint',
  'Kansai Nerolac',
  'Indigo Paints',
  'JSW Paints',
  'MRF Vapocure',
  'Dr. Fixit / Pidilite',
  'Shalimar Paints',
  'Dulux ICI',
  'Birla White',
  'Roff / Tile Adhesives',
  'Sirca Wood Coatings',
  'Tata Agrico / Tools',
];

export default function AddBrandModal({
  isOpen,
  onClose,
  onBrandCreated,
}: AddBrandModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a brand name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create brand');
      }

      onBrandCreated(data.brand);
      setName('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Add New Brand / Manufacturer</h3>
              <p className="text-[11px] text-slate-500 font-medium">Create a new brand to classify products</p>
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Brand Name Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Brand Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Kansai Nerolac, Nippon Paint..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-slate-800"
            />
          </div>

          {/* Popular Suggestions Pills */}
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Popular Paint & Hardware Brands
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
              {BRAND_SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setName(sug)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 border border-transparent transition"
                >
                  + {sug}
                </button>
              ))}
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
              disabled={loading || !name.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-xl transition shadow-xs"
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Create Brand</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
