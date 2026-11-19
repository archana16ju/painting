'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Pencil,
  Tag,
  Layers,
  Save,
  RotateCcw,
} from 'lucide-react';

interface ManageCategoriesBrandsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'categories' | 'brands';
  onUpdated: () => void;
}

interface CategoryItem {
  id: string;
  name: string;
  iconName?: string;
  productCount?: number;
}

interface BrandItem {
  name: string;
  productCount: number;
}

export default function ManageCategoriesBrandsModal({
  isOpen,
  onClose,
  initialTab = 'categories',
  onUpdated,
}: ManageCategoriesBrandsModalProps) {
  const [activeTab, setActiveTab] = useState<'categories' | 'brands'>(initialTab);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Editing state for categories
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catEditName, setCatEditName] = useState('');
  const [newCatInput, setNewCatInput] = useState('');

  // Editing state for brands
  const [editingBrandName, setEditingBrandName] = useState<string | null>(null);
  const [brandEditNewName, setBrandEditNewName] = useState('');
  const [newBrandInput, setNewBrandInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      fetchData();
    }
  }, [isOpen, initialTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, brandRes] = await Promise.all([
        fetch('/api/categories').then((r) => r.json()),
        fetch('/api/brands').then((r) => r.json()),
      ]);

      if (catRes.success) setCategories(catRes.categories || []);
      if (brandRes.success) setBrands(brandRes.brands || []);
    } catch (err: any) {
      setError('Failed to load categories or brands');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Handle saving renamed Category
  const handleSaveCategory = async (cat: CategoryItem) => {
    const trimmed = catEditName.trim();
    if (!trimmed) {
      setError('Category name cannot be empty');
      return;
    }
    if (trimmed.toLowerCase() === cat.name.toLowerCase()) {
      setEditingCatId(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cat.id,
          oldName: cat.name,
          newName: trimmed,
          iconName: cat.iconName,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setSuccessMsg(`Category "${cat.name}" renamed to "${trimmed}". All linked products updated!`);
      setEditingCatId(null);
      await fetchData();
      onUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting Category
  const handleDeleteCategory = async (cat: CategoryItem) => {
    if (cat.productCount && cat.productCount > 0) {
      if (!window.confirm(`Category "${cat.name}" has ${cat.productCount} products. Deleting it will remove the category tag from the sidebar. Continue?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/categories?id=${cat.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setSuccessMsg(`Category "${cat.name}" deleted.`);
      await fetchData();
      onUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  // Handle saving renamed Brand
  const handleSaveBrand = async (oldName: string) => {
    const trimmed = brandEditNewName.trim();
    if (!trimmed) {
      setError('Brand name cannot be empty');
      return;
    }
    if (trimmed.toLowerCase() === oldName.toLowerCase()) {
      setEditingBrandName(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/brands', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldName: oldName,
          newName: trimmed,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setSuccessMsg(data.message || `Brand renamed to "${trimmed}" across all products!`);
      setEditingBrandName(null);
      await fetchData();
      onUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to rename brand');
    } finally {
      setLoading(false);
    }
  };

  // Handle creating new Brand
  const handleCreateBrand = async () => {
    const trimmed = newBrandInput.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setSuccessMsg(`Brand "${trimmed}" created successfully!`);
      setNewBrandInput('');
      await fetchData();
      onUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to create brand');
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting Brand
  const handleDeleteBrand = async (brandName: string) => {
    if (!window.confirm(`Delete brand "${brandName}"?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/brands?name=${encodeURIComponent(brandName)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setSuccessMsg(`Brand "${brandName}" deleted.`);
      await fetchData();
      onUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to delete brand');
    } finally {
      setLoading(false);
    }
  };

  // Handle creating new Category from inline box
  const handleCreateCategory = async () => {
    const trimmed = newCatInput.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, iconName: 'Layers' }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setSuccessMsg(`Category "${trimmed}" created successfully!`);
      setNewCatInput('');
      await fetchData();
      onUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Manage Categories & Brands</h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Rename existing categories and brand names across all products
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 px-5 pt-2 bg-slate-50/40 gap-4 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('categories');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`pb-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'categories'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('brands');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`pb-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'brands'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Brands ({brands.length})</span>
          </button>
        </div>

        {/* Alerts */}
        <div className="px-5 pt-3 shrink-0">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Tab 1: Categories List */}
        {activeTab === 'categories' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {/* Quick Add Category Card */}
            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
              <span className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-wider block">
                + Create New Category
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Spray Paints, Rollers & Brushes, Epoxy..."
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateCategory();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs font-bold bg-white border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={loading || !newCatInput.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-2xs whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Category</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-medium">
              Renaming a category here updates the category name on every linked product automatically.
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              {categories.map((cat) => {
                const isEditing = editingCatId === cat.id;

                return (
                  <div
                    key={cat.id}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition"
                  >
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={catEditName}
                          onChange={(e) => setCatEditName(e.target.value)}
                          autoFocus
                          className="flex-1 px-3 py-1.5 text-xs font-bold bg-white border border-indigo-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveCategory(cat)}
                          disabled={loading}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCatId(null)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                          <span className="text-xs font-bold text-slate-800 truncate">{cat.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">
                            {cat.productCount ?? 0} products
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCatId(cat.id);
                              setCatEditName(cat.name);
                              setError(null);
                              setSuccessMsg(null);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Rename Category"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Rename</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Brands List */}
        {activeTab === 'brands' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {/* Quick Add Brand Card */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider block">
                + Create New Brand / Manufacturer
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Nippon Paint, Kansai Nerolac, Indigo, JSW..."
                  value={newBrandInput}
                  onChange={(e) => setNewBrandInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateBrand();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs font-bold bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleCreateBrand}
                  disabled={loading || !newBrandInput.trim()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg shadow-2xs whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Brand</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-medium">
              Renaming a brand here updates the brand label across all associated products in your store.
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              {brands.map((b) => {
                const isEditing = editingBrandName === b.name;

                return (
                  <div
                    key={b.name}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition"
                  >
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={brandEditNewName}
                          onChange={(e) => setBrandEditNewName(e.target.value)}
                          autoFocus
                          className="flex-1 px-3 py-1.5 text-xs font-bold bg-white border border-indigo-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveBrand(b.name)}
                          disabled={loading}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingBrandName(null)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          <span className="text-xs font-bold text-slate-800 truncate">{b.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">
                            {b.productCount} products
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBrandName(b.name);
                              setBrandEditNewName(b.name);
                              setError(null);
                              setSuccessMsg(null);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Rename Brand across all products"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Rename</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBrand(b.name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Brand"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
