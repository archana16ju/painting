'use client';

import React, { useState, useEffect } from 'react';
import { usePaintTerminalStore } from '@/store/usePaintTerminalStore';
import { PaintShade } from '@/types/paint';
import { X, Search, Check, Palette } from 'lucide-react';

export default function ShadeModal() {
  const { isShadeModalOpen, closeShadeModal, activeShadeItemTempId, attachShadeToItem } = usePaintTerminalStore();
  const [shades, setShades] = useState<PaintShade[]>([]);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [selectedShade, setSelectedShade] = useState<PaintShade | null>(null);
  const [formula, setFormula] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isShadeModalOpen) {
      fetchShades();
    }
  }, [isShadeModalOpen, brandFilter]);

  const fetchShades = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/shades?brand=${brandFilter}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setShades(data.shades);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchShades();
  };

  const handleApplyShade = () => {
    if (!selectedShade || !activeShadeItemTempId) return;
    attachShadeToItem(activeShadeItemTempId, selectedShade, formula);
    setSelectedShade(null);
    setFormula('');
  };

  if (!isShadeModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 px-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Select Paint Shade & Tint Formula</h2>
              <p className="text-xs text-slate-400">Search shade codes (e.g. 0420, L152) or shade name</p>
            </div>
          </div>
          <button onClick={closeShadeModal} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Brand Filter */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by code (0420) or color name (Morning Glory)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </form>

          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'Asian Paints', 'Berger', 'Dulux'].map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => setBrandFilter(brand)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition ${
                  brandFilter === brand
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Shades Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {loading ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-sm">Loading shade card catalog...</div>
          ) : shades.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-sm">No shades found. Try another search.</div>
          ) : (
            shades.map((shade) => {
              const isSelected = selectedShade?.id === shade.id;
              return (
                <div
                  key={shade.id}
                  onClick={() => setSelectedShade(shade)}
                  className={`cursor-pointer rounded-xl border p-3 flex flex-col gap-2 transition relative ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs bg-white'
                  }`}
                >
                  {/* Swatch */}
                  <div
                    className="w-full h-16 rounded-lg shadow-inner border border-black/10 flex items-end justify-end p-1.5"
                    style={{ backgroundColor: shade.hexColor }}
                  >
                    {isSelected && (
                      <div className="bg-indigo-600 text-white rounded-full p-1 shadow">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-mono font-bold text-slate-800">{shade.shadeCode}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {shade.baseType}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 truncate mt-0.5">{shade.shadeName}</div>
                    <div className="text-[10px] text-slate-400">{shade.brand}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Shade & Formula Footer */}
        {selectedShade && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg shadow border border-black/10 shrink-0"
                style={{ backgroundColor: selectedShade.hexColor }}
              />
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {selectedShade.shadeCode} - {selectedShade.shadeName}
                </div>
                <div className="text-xs text-indigo-600 font-medium">Required Base: {selectedShade.baseType}</div>
              </div>
            </div>

            <div className="flex-1 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Optional dispenser formula (e.g. 12ml YO, 4ml RO)..."
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              type="button"
              onClick={handleApplyShade}
              className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Apply Shade to Item
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
