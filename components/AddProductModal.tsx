'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Package,
  Layers,
  Tag,
  Check,
  AlertCircle,
} from 'lucide-react';
import { PaintBrand } from '@/types/paint';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { id: string; name: string }[];
  brands?: string[];
  onProductCreated: () => void;
  onOpenAddCategory: () => void;
  onOpenAddBrand?: () => void;
}

const DEFAULT_BRANDS: PaintBrand[] = [
  'Surfa Coats',
  'Arun & Tia',
  'Asian Paints',
  'Berger',
  'Dulux',
  'Birla Opus',
  'Other',
];

interface PackSizeInput {
  packSize: string;
  retailPrice: number;
  contractorPrice: number;
  costPrice: number;
  mrp: number;
  stockQty: number;
}

export default function AddProductModal({
  isOpen,
  onClose,
  categories,
  brands = DEFAULT_BRANDS,
  onProductCreated,
  onOpenAddCategory,
  onOpenAddBrand,
}: AddProductModalProps) {
  const availableBrands = Array.from(new Set([...DEFAULT_BRANDS, ...(brands || [])])).filter((b) => b !== 'ALL');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState<string>('Surfa Coats');
  const [customBrand, setCustomBrand] = useState('');
  const [category, setCategory] = useState<string>(categories[0]?.name || 'Interior Emulsion');
  const [hsnCode, setHsnCode] = useState('3209');
  const [taxRate, setTaxRate] = useState(18);
  const [description, setDescription] = useState('');

  const [packSizes, setPackSizes] = useState<PackSizeInput[]>([
    { packSize: '1L', retailPrice: 0, contractorPrice: 0, costPrice: 0, mrp: 0, stockQty: 20 },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddPackSize = () => {
    setPackSizes([
      ...packSizes,
      { packSize: '4L', retailPrice: 0, contractorPrice: 0, costPrice: 0, mrp: 0, stockQty: 10 },
    ]);
  };

  const handleRemovePackSize = (index: number) => {
    if (packSizes.length <= 1) return;
    setPackSizes(packSizes.filter((_, i) => i !== index));
  };

  const handlePackChange = (index: number, field: keyof PackSizeInput, val: any) => {
    const updated = [...packSizes];
    updated[index] = { ...updated[index], [field]: val };
    setPackSizes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a product name');
      return;
    }

    const selectedBrandName = brand === 'Other' && customBrand.trim() ? customBrand.trim() : brand;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        brand: selectedBrandName,
        category: category,
        hsnCode: hsnCode.trim(),
        defaultTaxRate: Number(taxRate),
        description: description.trim(),
        packSizes: packSizes.map((ps) => ({
          packSize: ps.packSize,
          retailPrice: Number(ps.retailPrice) || 0,
          contractorPrice: Number(ps.contractorPrice) || Number(ps.retailPrice) || 0,
          costPrice: Number(ps.costPrice) || 0,
          mrp: Number(ps.mrp) || Number(ps.retailPrice) || 0,
          stockQty: Number(ps.stockQty) || 0,
        })),
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to add product');
      }

      onProductCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Add New Paint / Product</h3>
              <p className="text-[11px] text-slate-500 font-medium">Add product SKU, category and pack size pricing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Name & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Ultima Exterior Emulsion"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Brand</label>
                {onOpenAddBrand && (
                  <button
                    type="button"
                    onClick={onOpenAddBrand}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-800"
                  >
                    + New Brand
                  </button>
                )}
              </div>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {availableBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              {brand === 'Other' && (
                <input
                  type="text"
                  placeholder="Enter brand name"
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  className="mt-1.5 w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              )}
            </div>
          </div>

          {/* Row 2: Category & HSN/Tax */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Category</label>
                <button
                  type="button"
                  onClick={onOpenAddCategory}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                >
                  + New
                </button>
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c.id || c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">HSN Code</label>
              <input
                type="text"
                placeholder="3209"
                value={hsnCode}
                onChange={(e) => setHsnCode(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">GST Tax Rate %</label>
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={18}>18% (Standard Paints)</option>
                <option value={28}>28% (Solvents & Thinners)</option>
                <option value={12}>12% (Select Hardware)</option>
                <option value={5}>5% (Basic Putty)</option>
                <option value={0}>0% (Tax Exempt)</option>
              </select>
            </div>
          </div>

          {/* Packaging & Pricing Matrix */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Packaging Sizes & Multi-Tier Pricing
              </span>
              <button
                type="button"
                onClick={handleAddPackSize}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Size</span>
              </button>
            </div>

            <div className="space-y-2">
              {packSizes.map((ps, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-6 gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl items-center text-xs"
                >
                  <div className="col-span-1">
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Size / Unit</label>
                    <input
                      type="text"
                      placeholder="e.g. 1L, 4L, 1 Pc"
                      value={ps.packSize}
                      onChange={(e) => handlePackChange(idx, 'packSize', e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Retail Rate (₹)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="0"
                      value={ps.retailPrice || ''}
                      onChange={(e) => handlePackChange(idx, 'retailPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg font-bold text-indigo-600"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Contractor (₹)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="0"
                      value={ps.contractorPrice || ''}
                      onChange={(e) => handlePackChange(idx, 'contractorPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg font-bold text-amber-600"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Cost Price (₹)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="0"
                      value={ps.costPrice || ''}
                      onChange={(e) => handlePackChange(idx, 'costPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg font-mono text-slate-700"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Initial Stock</label>
                    <input
                      type="number"
                      placeholder="20"
                      value={ps.stockQty || ''}
                      onChange={(e) => handlePackChange(idx, 'stockQty', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg font-bold text-emerald-700"
                    />
                  </div>

                  <div className="col-span-1 flex items-end justify-center pb-0.5">
                    {packSizes.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => handleRemovePackSize(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold">Primary</span>
                    )}
                  </div>
                </div>
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
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition shadow-xs"
            >
              {loading ? (
                <span>Saving Product...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
