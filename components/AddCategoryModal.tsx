'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Layers,
  Home,
  Sun,
  ShieldCheck,
  Sparkles,
  Wrench,
  Droplets,
  Trees,
  Droplet,
  Palette,
  Package,
  Tag,
  Box,
  Check,
} from 'lucide-react';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryCreated: (category: { id: string; name: string; iconName: string }) => void;
}

const AVAILABLE_ICONS = [
  { name: 'Layers', label: 'Layers / Base', icon: Layers },
  { name: 'Sun', label: 'Exterior / Weather', icon: Sun },
  { name: 'Home', label: 'Interior / Living', icon: Home },
  { name: 'ShieldCheck', label: 'Putty / Primer', icon: ShieldCheck },
  { name: 'Sparkles', label: 'Gloss / Finish', icon: Sparkles },
  { name: 'Wrench', label: 'Tools / Hardware', icon: Wrench },
  { name: 'Droplets', label: 'Waterproofing', icon: Droplets },
  { name: 'Trees', label: 'Wood / Timber', icon: Trees },
  { name: 'Droplet', label: 'Solvent / Thinner', icon: Droplet },
  { name: 'Palette', label: 'Color / Tint', icon: Palette },
  { name: 'Package', label: 'Bulk / Box', icon: Package },
  { name: 'Tag', label: 'Specialty / Misc', icon: Tag },
];

const POPULAR_SUGGESTIONS = [
  'Spray Paints',
  'Roller & Brushes',
  'Epoxy & Flooring',
  'Automotive Finishes',
  'Sealants & Adhesives',
  'Abrasives & Sanding',
  'Wood Polish',
  'Distemper',
];

export default function AddCategoryModal({
  isOpen,
  onClose,
  onCategoryCreated,
}: AddCategoryModalProps) {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Layers');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a category name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, iconName: selectedIcon }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create category');
      }

      onCategoryCreated(data.category);
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
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Add New Category</h3>
              <p className="text-[11px] text-slate-500 font-medium">Create a new department for your catalog</p>
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
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* Category Name Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Spray Paints, Rollers & Brushes..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800"
            />
          </div>

          {/* Popular Suggestions Pills */}
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Suggestions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setName(sug)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 text-slate-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-transparent transition"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Choose Icon</label>
            <div className="grid grid-cols-4 gap-2">
              {AVAILABLE_ICONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = selectedIcon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setSelectedIcon(item.name)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 mb-1 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
                    <span className="text-[10px] font-semibold leading-tight line-clamp-1">{item.name}</span>
                  </button>
                );
              })}
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
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition shadow-xs"
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Create Category</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
