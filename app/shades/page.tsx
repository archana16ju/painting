'use client';

import React, { useState, useEffect } from 'react';
import { PaintShade } from '@/types/paint';
import { Palette, Search, Plus, Filter, Check } from 'lucide-react';

export default function ShadesPage() {
  const [shades, setShades] = useState<PaintShade[]>([]);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  // Add Shade Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newBrand, setNewBrand] = useState('Asian Paints');
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newHex, setNewHex] = useState('#F0ECE1');
  const [newBase, setNewBase] = useState('White Base');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchShades();
  }, [brandFilter]);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchShades();
  };

  const handleCreateShade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/shades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: newBrand,
          shadeCode: newCode,
          shadeName: newName,
          hexColor: newHex,
          baseType: newBase,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddOpen(false);
        setNewCode('');
        setNewName('');
        fetchShades();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 px-6 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-500" /> Shade Card & Color Management
          </h1>
          <p className="text-xs text-slate-500">
            Search brand color codes, base requirements, and dispense recipes
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add Custom Shade
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 px-6 bg-slate-100 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search shade code (0420, L152) or color name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'Asian Paints', 'Berger', 'Dulux'].map((brand) => (
            <button
              key={brand}
              type="button"
              onClick={() => setBrandFilter(brand)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition ${
                brandFilter === brand
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Shades Grid */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">Loading shade cards...</div>
        ) : shades.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">No shades found.</div>
        ) : (
          shades.map((shade) => (
            <div
              key={shade.id}
              className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex flex-col gap-2 hover:shadow-md transition group"
            >
              {/* Color Swatch */}
              <div
                className="w-full h-24 rounded-xl border border-black/10 shadow-inner flex items-end justify-between p-2"
                style={{ backgroundColor: shade.hexColor }}
              >
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/80 backdrop-blur-xs text-slate-800 font-bold shadow-2xs">
                  {shade.hexColor}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-slate-900">{shade.shadeCode}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {shade.baseType}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-800 truncate mt-0.5">{shade.shadeName}</div>
                <div className="text-[10px] text-slate-400">{shade.brand}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Custom Shade Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="p-4 px-6 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Add New Shade / Color Recipe</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateShade} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Brand</label>
                <select
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Asian Paints">Asian Paints</option>
                  <option value="Berger">Berger</option>
                  <option value="Dulux">Dulux</option>
                  <option value="Birla Opus">Birla Opus</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Shade Code</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="e.g. 0420, L152"
                    className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Base Type</label>
                  <select
                    value={newBase}
                    onChange={(e) => setNewBase(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="White Base">White Base</option>
                    <option value="Base 1">Base 1</option>
                    <option value="Base 2">Base 2</option>
                    <option value="Base 3">Base 3</option>
                    <option value="Yellow Base">Yellow Base</option>
                    <option value="Deep Base">Deep Base</option>
                    <option value="Accent Base">Accent Base</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Shade Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Morning Glory, Royal Beige"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Color Swatch (Hex)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newHex}
                    onChange={(e) => setNewHex(e.target.value)}
                    className="w-10 h-9 p-0.5 border border-slate-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newHex}
                    onChange={(e) => setNewHex(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow transition"
                >
                  {submitting ? 'Saving...' : 'Save Shade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
