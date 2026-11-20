'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePaintTerminalStore, PriceTier } from '@/store/usePaintTerminalStore';
import { Product, PaintBrand, ProductCategory } from '@/types/paint';
import AddCategoryModal from '@/components/AddCategoryModal';
import AddBrandModal from '@/components/AddBrandModal';
import AddContractorModal from '@/components/AddContractorModal';
import EditContractorModal from '@/components/EditContractorModal';
import AddProductModal from '@/components/AddProductModal';
import EditProductModal from '@/components/EditProductModal';
import ManageCategoriesBrandsModal from '@/components/ManageCategoriesBrandsModal';
import BulkUploadModal from '@/components/BulkUploadModal';
import {
  Search,
  ShoppingCart,
  Palette,
  UserCheck,
  Calculator,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  Package,
  Layers,
  Sparkles,
  LayoutGrid,
  List,
  Home,
  Sun,
  ShieldCheck,
  Wrench,
  Droplet,
  Droplets,
  Trees,
  CheckCircle2,
  AlertCircle,
  X,
  FolderPlus,
  Pencil,
  Phone,
  Upload,
} from 'lucide-react';

const BRANDS: (PaintBrand | 'ALL')[] = [
  'ALL',
  'Surfa Coats',
  'Arun & Tia',
  'Asian Paints',
  'Berger',
  'Dulux',
  'Birla Opus',
  'Other',
];

interface CategoryItem {
  id: string;
  name: string;
  iconName?: string;
  productCount?: number;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat_ext', name: 'Exterior Emulsion', iconName: 'Sun' },
  { id: 'cat_int', name: 'Interior Emulsion', iconName: 'Home' },
  { id: 'cat_prim', name: 'Wall Primer', iconName: 'Layers' },
  { id: 'cat_putty', name: 'Wall Putty', iconName: 'ShieldCheck' },
  { id: 'cat_enamel', name: 'Enamel & Gloss', iconName: 'Sparkles' },
  { id: 'cat_hard', name: 'Hardware & Tools', iconName: 'Wrench' },
  { id: 'cat_water', name: 'Waterproofing', iconName: 'Droplets' },
  { id: 'cat_wood', name: 'Wood Finish', iconName: 'Trees' },
  { id: 'cat_thin', name: 'Thinners & Solvents', iconName: 'Droplet' },
];

function getCategoryIcon(iconName?: string) {
  switch (iconName) {
    case 'Sun': return Sun;
    case 'Home': return Home;
    case 'Layers': return Layers;
    case 'ShieldCheck': return ShieldCheck;
    case 'Sparkles': return Sparkles;
    case 'Wrench': return Wrench;
    case 'Droplets': return Droplets;
    case 'Trees': return Trees;
    case 'Droplet': return Droplet;
    case 'Palette': return Palette;
    case 'Package': return Package;
    case 'Tag': return Tag;
    default: return Layers;
  }
}

export default function TerminalPage() {
  const {
    cart,
    selectedBrand,
    setSelectedBrand,
    priceTier,
    setPriceTier,
    selectedContractor,
    setSelectedContractor,
    customerName,
    customerPhone,
    siteName,
    setCustomerInfo,
    setSiteName,
    addToCart,
    updateQuantity,
    updateDiscount,
    removeFromCart,
    clearCart,
    openShadeModal,
    openContractorModal,
    openEstimatorModal,
    openPaymentModal,
    getSubtotal,
    getTotalTax,
    getGrandTotal,
    isEditMode,
  } = usePaintTerminalStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [brands, setBrands] = useState<string[]>([
    'ALL',
    'Surfa Coats',
    'Arun & Tia',
    'JK Cement',
    'JK WhiteMaxX',
    'Surya Cem',
    'Udhayas Cem',
    'Pilot',
    'Butterfly Paints',
    'Ajax',
    'General Hardware',
  ]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [loading, setLoading] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  const [isAddContractorOpen, setIsAddContractorOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [manageModalTab, setManageModalTab] = useState<'categories' | 'brands'>('categories');
  const [contractors, setContractors] = useState<any[]>([]);
  const [isEditContractorOpen, setIsEditContractorOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState<any>(null);
  const [showPhoneDropdown, setShowPhoneDropdown] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsEditProductOpen(true);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
    fetchContractors();
  }, []);

  const fetchContractors = async () => {
    try {
      const res = await fetch('/api/contractors');
      const data = await res.json();
      if (data.success && Array.isArray(data.contractors)) {
        setContractors(data.contractors);
      }
    } catch (err) {
      console.error('Failed to load contractors:', err);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await fetch('/api/brands');
      const data = await res.json();
      if (data.success && Array.isArray(data.brands) && data.brands.length > 0) {
        setBrands(['ALL', ...data.brands.map((b: any) => b.name)]);
      }
    } catch (err) {
      console.error('Failed to load brands:', err);
    }
  };

  // Global hotkeys listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        openShadeModal();
      } else if (e.key === 'F2') {
        e.preventDefault();
        openContractorModal();
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (cart.length > 0) openPaymentModal();
      } else if (e.altKey && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        openEstimatorModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart.length]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryCreated = (newCat: { id: string; name: string; iconName: string }) => {
    setCategories((prev) => {
      if (prev.some((c) => c.name.toLowerCase() === newCat.name.toLowerCase())) return prev;
      return [...prev, newCat];
    });
    setSelectedCategory(newCat.name);
  };

  // Filter products by brand, category, and search text
  const filteredProducts = products.filter((p) => {
    const matchesBrand = selectedBrand === 'ALL' || p.brand === selectedBrand;
    const matchesCategory =
      selectedCategory === 'ALL' ||
      (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase())) ||
      (p.packSizes && p.packSizes.some((ps) => ps.barcode?.includes(search)));
    return matchesBrand && matchesCategory && matchesSearch;
  });

  // Calculate live counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    counts['ALL'] = products.filter(
      (p) => selectedBrand === 'ALL' || p.brand === selectedBrand
    ).length;

    for (const cat of categories) {
      counts[cat.name] = products.filter(
        (p) =>
          p.category &&
          p.category.toLowerCase() === cat.name.toLowerCase() &&
          (selectedBrand === 'ALL' || p.brand === selectedBrand)
      ).length;
    }
    return counts;
  }, [products, selectedBrand, categories]);

  // Match contractors by phone or name for quick phone-search in cart
  const matchingContractors = useMemo(() => {
    const q = (customerPhone || '').trim().toLowerCase();
    if (q.length < 2) return [];
    return contractors.filter(
      (c) =>
        (c.phone && c.phone.includes(q)) ||
        (c.name && c.name.toLowerCase().includes(q))
    );
  }, [customerPhone, contractors]);

  const subtotal = getSubtotal();
  const totalTax = getTotalTax();
  const grandTotal = getGrandTotal();

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-slate-100">
      {/* ============================================================== */}
      {/* 1. LEFT COLUMN: Category Navigation Panel                      */}
      {/* ============================================================== */}
      <div className="hidden md:flex flex-col w-56 xl:w-60 bg-white border-r border-slate-200 shrink-0">
        <div className="p-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Departments</span>
            <span className="text-xs font-extrabold text-slate-900">Categories</span>
          </div>
          <div className="flex items-center gap-1">
            {isEditMode && (
              <button
                type="button"
                onClick={() => {
                  setManageModalTab('categories');
                  setIsManageModalOpen(true);
                }}
                className="p-1 text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition animate-in fade-in"
                title="Manage & Rename Categories"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsAddCategoryOpen(true)}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition shadow-2xs"
              title="Add New Product Category"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Category List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* All Products shortcut */}
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition text-left ${
              selectedCategory === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <LayoutGrid className={`w-4 h-4 shrink-0 ${selectedCategory === 'ALL' ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">All Products</span>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                selectedCategory === 'ALL' ? 'bg-indigo-500 text-white font-bold' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {categoryCounts['ALL'] || 0}
            </span>
          </button>

          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.iconName);
            const isSelected = selectedCategory === cat.name;
            const count = categoryCounts[cat.name] || 0;

            return (
              <button
                key={cat.id || cat.name}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{cat.name}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-indigo-500 text-white font-bold' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                  {isEditMode && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setManageModalTab('categories');
                        setIsManageModalOpen(true);
                      }}
                      className={`p-0.5 rounded transition ${
                        isSelected ? 'hover:bg-indigo-700 text-white' : 'hover:bg-amber-100 text-amber-700 bg-amber-50 border border-amber-200'
                      }`}
                      title="Rename category"
                    >
                      <Pencil className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Quick Tools */}
        <div className="p-2.5 border-t border-slate-200 space-y-1.5 bg-slate-50/80">
          <button
            onClick={() => openShadeModal()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition shadow-2xs"
          >
            <Palette className="w-4 h-4 text-amber-600 shrink-0" />
            <span>[F1] Shade Card</span>
          </button>
          <button
            onClick={openEstimatorModal}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-violet-900 bg-violet-50 hover:bg-violet-100 border border-violet-200 transition shadow-2xs"
          >
            <Calculator className="w-4 h-4 text-violet-600 shrink-0" />
            <span>[Alt+E] Estimator</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. CENTER COLUMN: Product Catalog (Center Full-Width)           */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Filter Bar: Search, Brand Pills & View Switcher */}
        <div className="p-3 bg-white border-b border-slate-200 shadow-2xs space-y-2.5 shrink-0">
          {/* Row 1: Search Input, Add Product & View Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Scan barcode or search product name / pack size... (Press F1 for shade)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Add Product Button */}
            <button
              type="button"
              onClick={() => setIsAddProductOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs whitespace-nowrap active:scale-98"
              title="Add New Paint / Product"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Product</span>
            </button>

            {/* Bulk CSV Upload Button */}
            <button
              type="button"
              onClick={() => setIsBulkUploadOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition shadow-2xs whitespace-nowrap active:scale-98"
              title="Bulk Import Products via CSV"
            >
              <Upload className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Bulk CSV</span>
            </button>

            {/* View Switcher: Grid vs Table */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid Tiles View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden md:inline text-[11px]">Tiles</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                  viewMode === 'table'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Rapid Table View"
              >
                <List className="w-4 h-4" />
                <span className="hidden md:inline text-[11px]">List</span>
              </button>
            </div>
          </div>

          {/* Row 2: Brand Pills */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Brands:</span>
              {brands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => setSelectedBrand(brand as any)}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedBrand === brand
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {brand}
                </button>
              ))}

              {/* Add Brand Button */}
              <button
                type="button"
                onClick={() => setIsAddBrandOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-amber-950 bg-amber-300 hover:bg-amber-400 border border-amber-400 transition whitespace-nowrap shadow-2xs cursor-pointer active:scale-95"
                title="Create New Brand / Manufacturer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Brand</span>
              </button>

              {/* Rename Brands (Only in Edit Mode) */}
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => {
                    setManageModalTab('brands');
                    setIsManageModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition whitespace-nowrap animate-in fade-in cursor-pointer"
                  title="Rename or Manage Brands"
                >
                  <Pencil className="w-3 h-3 text-amber-600" />
                  <span>Rename Brands</span>
                </button>
              )}
            </div>

            <span className="text-[11px] text-slate-400 font-semibold whitespace-nowrap hidden sm:inline">
              Showing {filteredProducts.length} products
            </span>
          </div>
        </div>

        {/* Center Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex justify-center">
          <div className="w-full max-w-5xl space-y-4">
            {/* Edit Mode Banner */}
            {isEditMode && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-center justify-between text-xs font-bold text-amber-900 shadow-2xs animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>EDIT MODE IS ON: Settings and edit pencil icons are enabled near Categories, Brands, and Products.</span>
                </div>
                <span className="text-[10px] bg-amber-200/90 text-amber-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin Active
                </span>
              </div>
            )}
            {loading ? (
              <div className="py-24 text-center text-slate-400 text-sm">Loading paint catalog...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-24 text-center text-slate-400 text-sm space-y-2 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
                <Package className="w-12 h-12 mx-auto text-slate-300" />
                <p className="font-bold text-slate-700">No products found matching your search.</p>
                <p className="text-xs text-slate-500">Try selecting "ALL" brands or clearing the search text.</p>
              </div>
            ) : viewMode === 'grid' ? (
              /* Modern Full-Width Product Cards with Clean Size Rows */
              <div className="space-y-4">
                {filteredProducts.map((product) => {
                  const brandColors: Record<string, { badge: string; border: string }> = {
                    'Surfa Coats': { badge: 'bg-rose-100 text-rose-900 border-rose-300', border: 'border-l-4 border-l-rose-600' },
                    'Arun & Tia': { badge: 'bg-emerald-100 text-emerald-900 border-emerald-300', border: 'border-l-4 border-l-emerald-600' },
                    'Asian Paints': { badge: 'bg-amber-100 text-amber-900 border-amber-300', border: 'border-l-4 border-l-amber-500' },
                    'Berger': { badge: 'bg-blue-100 text-blue-900 border-blue-300', border: 'border-l-4 border-l-blue-600' },
                    'Dulux': { badge: 'bg-sky-100 text-sky-900 border-sky-300', border: 'border-l-4 border-l-sky-500' },
                    'Birla Opus': { badge: 'bg-indigo-100 text-indigo-900 border-indigo-300', border: 'border-l-4 border-l-indigo-600' },
                  };
                  const brandStyle = brandColors[product.brand] || { badge: 'bg-slate-100 text-slate-800 border-slate-300', border: 'border-l-4 border-l-slate-400' };

                  return (
                    <div
                      key={product.id}
                      className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden w-full ${brandStyle.border}`}
                    >
                      {/* Card Header: Product Info & Meta */}
                      <div className="p-4 sm:p-5 pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${brandStyle.badge}`}>
                              {product.brand}
                            </span>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                              {product.category}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2.5">
                            <span>HSN: <strong className="text-slate-600">{product.hsnCode}</strong></span>
                            <span>•</span>
                            <span>GST: <strong className="text-slate-600">{product.defaultTaxRate}%</strong></span>
                            {isEditMode && (
                              <button
                                type="button"
                                onClick={() => handleEditProduct(product)}
                                className="inline-flex items-center gap-1 ml-1 px-2 py-0.5 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition animate-in fade-in"
                                title="Edit product details, brand, category & prices"
                              >
                                <Pencil className="w-3 h-3 text-amber-600" />
                                <span>Edit</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{product.description}</p>
                        )}
                      </div>

                      {/* Packaging Sizes: Spacious, Uncramped Responsive Grid */}
                      <div className="p-4 bg-slate-50/80 border-t border-slate-100 space-y-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                          Available Packaging & Can Sizes:
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                          {product.packSizes?.map((pack) => {
                            let activePrice = pack.retailPrice;
                            if (priceTier === 'CONTRACTOR') activePrice = pack.contractorPrice;
                            if (priceTier === 'WHOLESALE') activePrice = pack.wholesalePrice;

                            const isLowStock = pack.stockQty <= pack.minStockAlert;
                            const isOutOfStock = pack.stockQty <= 0;

                            return (
                              <div
                                key={pack.id}
                                className="p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition flex flex-col justify-between gap-2 shadow-2xs"
                              >
                                {/* Top line: Size on top, Stock directly UNDER it without green dot */}
                                <div>
                                  <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200 inline-block">
                                    {pack.packSize}
                                  </span>

                                  <div
                                    className={`text-[10px] font-medium mt-1 ${
                                      isOutOfStock
                                        ? 'text-rose-600 font-bold'
                                        : isLowStock
                                        ? 'text-amber-600 font-semibold'
                                        : 'text-slate-500'
                                    }`}
                                  >
                                    {isOutOfStock ? '0 in stock' : `${pack.stockQty} in stock`}
                                  </div>
                                </div>

                                {/* Bottom line: Price + [+] Button Only */}
                                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                                  <div>
                                    <span className="text-[10px] text-slate-400 block -mb-0.5 font-medium">Rate</span>
                                    <span className="font-mono font-black text-sm sm:text-base text-indigo-700 whitespace-nowrap">
                                      ₹{activePrice.toLocaleString('en-IN')}
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => addToCart(product, pack)}
                                    className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-90 text-white font-black text-sm flex items-center justify-center transition shadow-2xs hover:shadow-sm shrink-0"
                                    title="Add to cart"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* High-Speed Table / List View: Every Pack Size has its OWN row with uniform height */
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-4">Product Name & Line</th>
                      {selectedCategory === 'ALL' && (
                        <>
                          <th className="py-2.5 px-3">Brand</th>
                          <th className="py-2.5 px-3">Category</th>
                        </>
                      )}
                      <th className="py-2.5 px-3 text-center">Pack Size</th>
                      <th className="py-2.5 px-3 text-right">Rate</th>
                      <th className="py-2.5 px-4 text-right">Add</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.flatMap((product) =>
                      (product.packSizes && product.packSizes.length > 0
                        ? product.packSizes.map((pack) => ({ product, pack }))
                        : [{ product, pack: { id: 'single', productId: product.id, packSize: '1 Pc', barcode: '', mrp: 0, retailPrice: 0, contractorPrice: 0, wholesalePrice: 0, costPrice: 0, stockQty: 0, minStockAlert: 0 } }]
                      )
                    ).map(({ product, pack }) => {
                      let activePrice = pack.retailPrice;
                      if (priceTier === 'CONTRACTOR') activePrice = pack.contractorPrice;
                      if (priceTier === 'WHOLESALE') activePrice = pack.wholesalePrice;
                      const isOutOfStock = pack.stockQty <= 0;
                      const isLowStock = pack.stockQty <= pack.minStockAlert;

                      return (
                        <tr key={`${product.id}_${pack.id}`} className="hover:bg-slate-50/80 transition">
                          <td className="py-2 px-4">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900">{product.name}</span>
                                  {selectedCategory !== 'ALL' && product.brand && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                      {product.brand}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">HSN: {product.hsnCode}</div>
                              </div>
                              {isEditMode && (
                                <button
                                  type="button"
                                  onClick={() => handleEditProduct(product)}
                                  className="p-1 text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-md transition animate-in fade-in"
                                  title="Edit Product"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-amber-600" />
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Brand & Category only shown in All Products menu */}
                          {selectedCategory === 'ALL' && (
                            <>
                              <td className="py-2 px-3 font-semibold text-slate-700">{product.brand}</td>
                              <td className="py-2 px-3 text-slate-500">{product.category}</td>
                            </>
                          )}

                          {/* Pack Size with Stock count directly under it */}
                          <td className="py-2 px-3 text-center font-mono">
                            <span className="bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 font-bold text-slate-800 whitespace-nowrap inline-block text-xs">
                              {pack.packSize}
                            </span>
                            <div
                              className={`text-[10px] font-medium mt-0.5 whitespace-nowrap ${
                                isOutOfStock
                                  ? 'text-rose-600 font-bold'
                                  : isLowStock
                                  ? 'text-amber-600 font-semibold'
                                  : 'text-slate-500'
                              }`}
                            >
                              {isOutOfStock ? '0 in stock' : `${pack.stockQty} in stock`}
                            </div>
                          </td>

                          <td className="py-2 px-3 text-right font-mono font-extrabold text-xs sm:text-sm text-indigo-700 whitespace-nowrap">
                            ₹{activePrice.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => addToCart(product, pack)}
                              className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-90 text-white font-black text-xs flex items-center justify-center transition shadow-2xs ml-auto"
                              title="Add to cart"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. RIGHT COLUMN: Active Cart & Checkout Panel                   */}
      {/* ============================================================== */}
      <div className="w-full lg:w-[440px] xl:w-[470px] bg-white flex flex-col h-full shrink-0 border-l border-slate-200 shadow-lg">
        {/* Customer & Contractor Header */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
          {/* Price Tier Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price Tier</span>
            <div className="flex gap-1 bg-slate-200 p-0.5 rounded-lg text-xs">
              {(['RETAIL', 'CONTRACTOR', 'WHOLESALE'] as PriceTier[]).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setPriceTier(tier)}
                  className={`px-2.5 py-1 rounded-md font-bold transition text-[11px] ${
                    priceTier === tier ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Contractor or Customer Banner */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={openContractorModal}
              className={`flex-1 p-2 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                selectedContractor
                  ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950'
                  : 'border-slate-300 hover:border-slate-400 bg-white text-slate-600'
              }`}
              title="Click to select tagged contractor [F2]"
            >
              <div className="flex items-center gap-2 truncate">
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <div className="text-xs font-bold truncate">
                    {selectedContractor ? selectedContractor.name : 'Select Contractor [F2]'}
                  </div>
                  {selectedContractor && (
                    <div className="text-[10px] text-emerald-700 font-mono">
                      Due: ₹{selectedContractor.balance.toLocaleString('en-IN')} | Limit: ₹{selectedContractor.limit.toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
              </div>
              {selectedContractor && (
                <span className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 ml-1">
                  Change
                </span>
              )}
            </button>

            {/* Edit Contractor (Only in Edit Mode) */}
            {isEditMode && selectedContractor && (
              <button
                type="button"
                onClick={() => {
                  const fullCont = contractors.find((c) => c.id === selectedContractor.id);
                  setEditingContractor(fullCont || selectedContractor);
                  setIsEditContractorOpen(true);
                }}
                className="p-2 text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition cursor-pointer shadow-2xs"
                title="Edit Tagged Contractor Profile"
              >
                <Pencil className="w-3.5 h-3.5 text-amber-700" />
              </button>
            )}

            {/* [+ Add] Contractor Button */}
            <button
              type="button"
              onClick={() => setIsAddContractorOpen(true)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition shadow-2xs whitespace-nowrap cursor-pointer active:scale-95"
              title="Add New Contractor"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add</span>
            </button>

            <button
              onClick={clearCart}
              title="Clear Cart"
              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 border border-slate-200 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Customer Phone Search with Contractor Autocomplete & Quick Details */}
          <div className="space-y-1.5">
            {/* Phone Number Input with Autocomplete */}
            <div className="relative">
              <div className="relative flex items-center">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Customer / Painter Phone (Search)..."
                  value={customerPhone}
                  onFocus={() => setShowPhoneDropdown(true)}
                  onChange={(e) => {
                    setCustomerInfo({ name: customerName, phone: e.target.value });
                    setShowPhoneDropdown(true);
                  }}
                  className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-indigo-500"
                />
                {customerPhone && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerInfo({ name: customerName, phone: '' });
                      setShowPhoneDropdown(false);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {showPhoneDropdown && customerPhone.trim().length >= 2 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto p-1 divide-y divide-slate-100">
                  {matchingContractors.length > 0 ? (
                    matchingContractors.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedContractor({
                            id: c.id,
                            name: c.name,
                            phone: c.phone,
                            balance: c.currentBalance,
                            limit: c.creditLimit,
                          });
                          setCustomerInfo({ name: c.name, phone: c.phone });
                          setShowPhoneDropdown(false);
                        }}
                        className="p-2 hover:bg-emerald-50 rounded-lg cursor-pointer transition flex items-center justify-between group"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-950 truncate">
                              {c.name}
                            </span>
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded">
                              Painter ({c.commissionRate}% Comm)
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                            {c.phone} {c.currentBalance > 0 && `• Due: ₹${c.currentBalance.toLocaleString('en-IN')}`}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-bold border border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white transition">
                            Tag Contractor
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-2.5 text-center text-xs text-slate-500">
                      <div>No contractor found with "{customerPhone}".</div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPhoneDropdown(false);
                          setIsAddContractorOpen(true);
                        }}
                        className="mt-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                      >
                        + Add "{customerPhone}" as new Contractor?
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Customer Name & Site Inputs */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                placeholder="Customer / Buyer Name..."
                value={customerName}
                onChange={(e) => setCustomerInfo({ name: e.target.value, phone: customerPhone })}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Site / Project (e.g. Flat 4B)..."
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="py-24 text-center text-slate-400 space-y-2">
              <ShoppingCart className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-medium">Cart is empty. Select paint pack sizes from the catalog.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.tempId}
                className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-2 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{item.brand}</span>
                    <h4 className="font-bold text-xs text-slate-900 leading-tight">{item.productName}</h4>
                    <span className="inline-block font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 mt-1">
                      {item.packSize}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.tempId)}
                    className="text-slate-300 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Shade / Tint details */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  {item.isTinted && item.shadeCode ? (
                    <div className="flex items-center gap-1.5 text-slate-800">
                      <span className="w-3 h-3 rounded-full bg-amber-400 border border-black/20 shrink-0"></span>
                      <span className="font-mono font-bold text-[11px]">{item.shadeCode}</span>
                      <span className="text-[11px] text-slate-600 truncate">{item.shadeName}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openShadeModal(item.tempId)}
                      className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 hover:bg-amber-100 flex items-center gap-1"
                    >
                      <Palette className="w-3 h-3" /> + Add Shade Code
                    </button>
                  )}

                  <div className="font-mono font-bold text-xs text-slate-900">
                    ₹{item.rate.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Quantity & Item Subtotal */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item.tempId, -1)}
                      className="p-1 hover:bg-slate-200 text-slate-600"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2.5 font-mono font-bold text-xs text-slate-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.tempId, 1)}
                      className="p-1 hover:bg-slate-200 text-slate-600"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Item Discount % */}
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <span>Disc:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discountPercent}
                        onChange={(e) => updateDiscount(item.tempId, Number(e.target.value))}
                        className="w-12 px-1 py-0.5 text-center font-mono text-xs border border-slate-300 rounded"
                      />
                      <span>%</span>
                    </div>

                    <div className="font-mono font-bold text-sm text-indigo-700">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Totals & Checkout Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal (Excl. Tax):</span>
              <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated GST (18%):</span>
              <span>₹{totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-300">
              <span>GRAND TOTAL:</span>
              <span className="text-emerald-700">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={cart.length === 0}
            onClick={openPaymentModal}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Proceed to Payment [F4]</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onCategoryCreated={handleCategoryCreated}
      />

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        categories={categories}
        brands={brands}
        onProductCreated={() => {
          fetchProducts();
          fetchBrands();
        }}
        onOpenAddCategory={() => {
          setIsAddProductOpen(false);
          setIsAddCategoryOpen(true);
        }}
        onOpenAddBrand={() => {
          setIsAddProductOpen(false);
          setIsAddBrandOpen(true);
        }}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditProductOpen}
        onClose={() => {
          setIsEditProductOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        categories={categories}
        brands={brands}
        onProductUpdated={() => {
          fetchProducts();
          fetchCategories();
          fetchBrands();
        }}
        onOpenAddCategory={() => {
          setIsEditProductOpen(false);
          setIsAddCategoryOpen(true);
        }}
        onOpenAddBrand={() => {
          setIsEditProductOpen(false);
          setIsAddBrandOpen(true);
        }}
      />

      {/* Add Brand Modal */}
      <AddBrandModal
        isOpen={isAddBrandOpen}
        onClose={() => setIsAddBrandOpen(false)}
        onBrandCreated={(newBrand) => {
          fetchBrands();
          setSelectedBrand(newBrand.name as any);
        }}
      />

      {/* Manage Categories & Brands Modal */}
      <ManageCategoriesBrandsModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        initialTab={manageModalTab}
        onUpdated={() => {
          fetchCategories();
          fetchBrands();
          fetchProducts();
        }}
      />

      {/* Add Contractor Modal */}
      <AddContractorModal
        isOpen={isAddContractorOpen}
        onClose={() => setIsAddContractorOpen(false)}
        onContractorAdded={() => {
          fetchContractors();
        }}
      />

      {/* Edit Contractor Modal */}
      <EditContractorModal
        isOpen={isEditContractorOpen}
        onClose={() => {
          setIsEditContractorOpen(false);
          setEditingContractor(null);
        }}
        contractor={editingContractor}
        onContractorUpdated={() => {
          fetchContractors();
        }}
      />

      {/* Bulk Product Upload Modal */}
      <BulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onSuccess={() => {
          fetchProducts();
          fetchCategories();
          fetchBrands();
        }}
      />
    </div>
  );
}
