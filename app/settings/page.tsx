'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  Store,
  Printer,
  QrCode,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  RefreshCw,
  AlertTriangle,
  Trash2,
  Lock,
  X,
  Package,
  Layers,
  Palette,
  Users,
  Plus,
  Pencil,
  Search,
  Filter,
  Check,
  ChevronRight,
  Phone,
  CreditCard,
  MapPin,
  Tag,
  Home,
  Sun,
  ShieldCheck,
  Sparkles,
  Wrench,
  Droplets,
  Trees,
  Droplet,
  Box,
} from 'lucide-react';
import { Product, Contractor } from '@/types/paint';
import AddProductModal from '@/components/AddProductModal';
import EditProductModal from '@/components/EditProductModal';
import AddCategoryModal from '@/components/AddCategoryModal';
import AddBrandModal from '@/components/AddBrandModal';
import AddContractorModal from '@/components/AddContractorModal';
import EditContractorModal from '@/components/EditContractorModal';

type SettingsTab = 'store' | 'products' | 'categories' | 'brands' | 'contractors';

const ICON_MAP: Record<string, React.ElementType> = {
  Layers,
  Sun,
  Home,
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
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('store');

  // --- Store Profile State ---
  const [formData, setFormData] = useState({
    shopName: '',
    tagline: '',
    address: '',
    phone: '',
    email: '',
    gstin: '',
    invoicePrefix: 'PB/2026/',
    thermalPaperSize: '80mm',
    termsConditions: '',
    bankDetails: '',
    upiId: '',
  });

  const [settingsLoading, setSettingsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Bulk Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null);

  // Reset Database State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // --- Products State ---
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('ALL');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);

  // --- Categories State ---
  const [categories, setCategories] = useState<{ id: string; name: string; iconName?: string; productCount?: number }[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingCategoryIcon, setEditingCategoryIcon] = useState('Layers');

  // --- Brands State ---
  const [brands, setBrands] = useState<{ id: string; name: string; productCount: number }[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  const [editingBrandName, setEditingBrandName] = useState<string | null>(null);
  const [editingBrandNewName, setEditingBrandNewName] = useState('');

  // --- Contractors State ---
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [contractorsLoading, setContractorsLoading] = useState(false);
  const [contractorSearch, setContractorSearch] = useState('');
  const [isAddContractorOpen, setIsAddContractorOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null);
  const [isEditContractorOpen, setIsEditContractorOpen] = useState(false);

  // Action status message
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // --- Initial Data Load ---
  useEffect(() => {
    fetchSettings();
    fetchProducts();
    fetchCategories();
    fetchBrands();
    fetchContractors();
  }, []);

  const fetchSettings = () => {
    setSettingsLoading(true);
    fetch('/api/settings')
      .then((res) => res.json())
      .then((d) => {
        if (d.success && d.settings) {
          const s = d.settings;
          setFormData({
            shopName: s.shop_name || '',
            tagline: s.tagline || '',
            address: s.address || '',
            phone: s.phone || '',
            email: s.email || '',
            gstin: s.gstin || '',
            invoicePrefix: s.invoice_prefix || 'PB/2026/',
            thermalPaperSize: s.thermal_paper_size || '80mm',
            termsConditions: s.terms_conditions || '',
            bankDetails: s.bank_details || '',
            upiId: s.upi_id || '',
          });
        }
      })
      .catch(console.error)
      .finally(() => setSettingsLoading(false));
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await fetch('/api/products');
      const d = await res.json();
      if (d.success && Array.isArray(d.products)) {
        setProducts(d.products);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch('/api/categories');
      const d = await res.json();
      if (d.success && Array.isArray(d.categories)) {
        setCategories(d.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchBrands = async () => {
    setBrandsLoading(true);
    try {
      const res = await fetch('/api/brands');
      const d = await res.json();
      if (d.success && Array.isArray(d.brands)) {
        setBrands(d.brands);
      }
    } catch (err) {
      console.error('Error fetching brands:', err);
    } finally {
      setBrandsLoading(false);
    }
  };

  const fetchContractors = async () => {
    setContractorsLoading(true);
    try {
      const res = await fetch('/api/contractors');
      const d = await res.json();
      if (d.success && Array.isArray(d.contractors)) {
        setContractors(d.contractors);
      }
    } catch (err) {
      console.error('Error fetching contractors:', err);
    } finally {
      setContractorsLoading(false);
    }
  };

  // --- Handlers: Store Settings ---
  const handleSubmitSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError(null);

    try {
      const res = await fetch('/api/settings/reset-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: resetPassword }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to reset database');
      }

      setIsResetModalOpen(false);
      setResetPassword('');
      setParsedRows([]);
      setCsvFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setResetSuccessMessage(data.message || 'Database reset successfully with zero data.');
      setTimeout(() => setResetSuccessMessage(null), 10000);
      // Refresh all masters
      fetchProducts();
      fetchCategories();
      fetchBrands();
      fetchContractors();
    } catch (err: any) {
      setResetError(err.message || 'Error resetting database');
    } finally {
      setResetLoading(false);
    }
  };

  // --- RFC-4180 CSV parser Helper ---
  const parseCsvText = (text: string) => {
    const cleanContent = text.replace(/^\uFEFF/, '');
    const rows: string[][] = [];
    let row: string[] = [''];
    let inQuotes = false;

    for (let i = 0; i < cleanContent.length; i++) {
      const c = cleanContent[i];
      const next = cleanContent[i + 1];

      if (inQuotes) {
        if (c === '"' && next === '"') {
          row[row.length - 1] += '"';
          i++;
        } else if (c === '"') {
          inQuotes = false;
        } else {
          row[row.length - 1] += c;
        }
      } else {
        if (c === '"') {
          inQuotes = true;
        } else if (c === ',') {
          row.push('');
        } else if (c === '\r' || c === '\n') {
          if (c === '\r' && next === '\n') i++;
          if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) {
            rows.push(row.map((v) => v.trim()));
          }
          row = [''];
        } else {
          row[row.length - 1] += c;
        }
      }
    }
    if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) {
      rows.push(row.map((v) => v.trim()));
    }

    if (rows.length < 2) return [];

    const headers = rows[0].map((h) => h.replace(/["']/g, '').trim());
    const parsed: any[] = [];

    for (let i = 1; i < rows.length; i++) {
      const values = rows[i];
      if (values.length === 0 || (values.length === 1 && !values[0])) continue;

      const rowObj: any = {};
      headers.forEach((h, index) => {
        rowObj[h] = values[index] !== undefined ? values[index] : '';
      });
      parsed.push(rowObj);
    }

    return parsed;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const rows = parseCsvText(content);
      setParsedRows(rows);
    };
    reader.readAsText(file);
  };

  const handleBulkUpload = async () => {
    if (parsedRows.length === 0) return;
    setUploading(true);
    setUploadResult(null);

    try {
      const batchSize = 150;
      let totalImported = 0;
      let totalPacks = 0;

      for (let i = 0; i < parsedRows.length; i += batchSize) {
        const batch = parsedRows.slice(i, i + batchSize);
        const batchNum = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(parsedRows.length / batchSize);

        const res = await fetch('/api/products/bulk-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: batch }),
        });

        const resText = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(resText);
        } catch {
          throw new Error(`Server returned unexpected response (status ${res.status}): ${resText.slice(0, 150) || 'Empty response'}`);
        }

        if (!res.ok || !data.success) {
          throw new Error(data.error || `Failed uploading batch ${batchNum} of ${totalBatches}`);
        }

        totalImported += data.importedCount || batch.length;
        totalPacks += data.packCount || batch.length;
      }

      setUploadResult({
        success: true,
        message: `Successfully imported ${totalImported} products (${totalPacks} pack sizes)!`,
      });
      setCsvFile(null);
      setParsedRows([]);
      if (fileInputRef.current) fileInputRef.current.value = '';

      fetchProducts();
      fetchCategories();
      fetchBrands();
    } catch (err: any) {
      setUploadResult({
        success: false,
        message: err.message || 'Error uploading file',
      });
    } finally {
      setUploading(false);
    }
  };

  // --- Handlers: Products ---
  const handleDeleteProduct = async (prod: Product) => {
    if (!window.confirm(`Are you sure you want to delete product "${prod.name}"?`)) return;

    try {
      const res = await fetch(`/api/products?id=${prod.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification(`Product "${prod.name}" deleted successfully.`);
        fetchProducts();
        fetchBrands();
        fetchCategories();
      } else {
        showNotification(data.error || 'Failed to delete product', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Error deleting product', 'error');
    }
  };

  // --- Handlers: Categories ---
  const handleSaveCategory = async (cat: { id: string; name: string; iconName?: string }) => {
    const trimmed = editingCategoryName.trim();
    if (!trimmed) {
      showNotification('Category name cannot be empty', 'error');
      return;
    }

    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cat.id,
          oldName: cat.name,
          newName: trimmed,
          iconName: editingCategoryIcon,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      showNotification(`Category renamed to "${trimmed}". All linked products updated!`);
      setEditingCategoryId(null);
      fetchCategories();
      fetchProducts();
    } catch (err: any) {
      showNotification(err.message || 'Failed to update category', 'error');
    }
  };

  const handleDeleteCategory = async (cat: { id: string; name: string; productCount?: number }) => {
    const promptMsg =
      cat.productCount && cat.productCount > 0
        ? `Category "${cat.name}" has ${cat.productCount} products. Delete this category?`
        : `Delete category "${cat.name}"?`;

    if (!window.confirm(promptMsg)) return;

    try {
      const res = await fetch(`/api/categories?id=${cat.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      showNotification(`Category "${cat.name}" deleted.`);
      fetchCategories();
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete category', 'error');
    }
  };

  // --- Handlers: Brands ---
  const handleSaveBrand = async (oldName: string) => {
    const trimmed = editingBrandNewName.trim();
    if (!trimmed) {
      showNotification('Brand name cannot be empty', 'error');
      return;
    }
    if (trimmed.toLowerCase() === oldName.toLowerCase()) {
      setEditingBrandName(null);
      return;
    }

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

      showNotification(data.message || `Brand renamed to "${trimmed}" across all products!`);
      setEditingBrandName(null);
      fetchBrands();
      fetchProducts();
    } catch (err: any) {
      showNotification(err.message || 'Failed to rename brand', 'error');
    }
  };

  const handleDeleteBrand = async (brand: { id: string; name: string; productCount?: number }) => {
    const promptMsg =
      brand.productCount && brand.productCount > 0
        ? `Brand "${brand.name}" has ${brand.productCount} products. Delete this brand from catalog?`
        : `Delete brand "${brand.name}"?`;

    if (!window.confirm(promptMsg)) return;

    try {
      const res = await fetch(`/api/brands?id=${brand.id}&name=${encodeURIComponent(brand.name)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      showNotification(`Brand "${brand.name}" deleted.`);
      fetchBrands();
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete brand', 'error');
    }
  };

  // --- Handlers: Contractors ---
  const handleDeleteContractor = async (c: Contractor) => {
    if (!window.confirm(`Delete contractor "${c.name}"?`)) return;

    try {
      const res = await fetch(`/api/contractors?id=${c.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      showNotification(`Contractor "${c.name}" deleted.`);
      fetchContractors();
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete contractor', 'error');
    }
  };

  // Filtered Lists
  const filteredProducts = products.filter((p) => {
    const q = productSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.hsnCode && p.hsnCode.toLowerCase().includes(q));

    const matchesCategory = selectedCategoryFilter === 'ALL' || p.category === selectedCategoryFilter;
    const matchesBrand = selectedBrandFilter === 'ALL' || p.brand.toLowerCase() === selectedBrandFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesBrand;
  });

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase().trim())
  );

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase().trim())
  );

  const filteredContractors = contractors.filter((c) => {
    const q = contractorSearch.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q))
    );
  });

  // Extract brand names list for dropdowns and product modals
  const brandNamesList = brands.map((b) => b.name);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-slate-50">
      {/* ============================================================== */}
      {/* LEFT NAVIGATION MENU BAR                                       */}
      {/* ============================================================== */}
      <aside className="w-full md:w-64 bg-slate-900 text-white shrink-0 flex flex-col border-r border-slate-800">
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-xs">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-white uppercase">Store Settings</h2>
            <p className="text-[11px] text-slate-400">Master & Invoicing Center</p>
          </div>
        </div>

        {/* Sidebar Nav Buttons */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {/* Store Profile */}
          <button
            type="button"
            onClick={() => setActiveTab('store')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
              activeTab === 'store'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Store className="w-4 h-4 text-amber-400" />
              <span>Store Profile</span>
            </div>
            <ChevronRight className={`w-4 h-4 transition ${activeTab === 'store' ? 'text-white' : 'text-slate-500'}`} />
          </button>

          {/* Products */}
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
              activeTab === 'products'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-emerald-400" />
              <span>Products</span>
            </div>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === 'products' ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {products.length}
            </span>
          </button>

          {/* Categories */}
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Categories</span>
            </div>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === 'categories' ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {categories.length}
            </span>
          </button>

          {/* Brands */}
          <button
            type="button"
            onClick={() => setActiveTab('brands')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
              activeTab === 'brands'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Palette className="w-4 h-4 text-rose-400" />
              <span>Brands</span>
            </div>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === 'brands' ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {brands.length}
            </span>
          </button>

          {/* Contractors */}
          <button
            type="button"
            onClick={() => setActiveTab('contractors')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
              activeTab === 'contractors'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Contractors</span>
            </div>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === 'contractors' ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {contractors.length}
            </span>
          </button>
        </nav>

        {/* Database Zero Reset action button at bottom of sidebar */}
        <div className="p-3 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              setResetError(null);
              setResetPassword('');
              setIsResetModalOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-300 hover:text-white bg-red-950/40 hover:bg-red-900 border border-red-800/60 rounded-xl transition cursor-pointer"
            title="Wipe database to zero data before new CSV upload"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>Reset Database (0 Data)</span>
          </button>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* RIGHT MAIN CONTENT AREA                                        */}
      {/* ============================================================== */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        {/* Top Action Notification Toast */}
        {actionMessage && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs border ${
              actionMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
          >
            <span>{actionMessage.text}</span>
            <button onClick={() => setActionMessage(null)} className="p-1 hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Global Reset Success Alert */}
        {resetSuccessMessage && (
          <div className="mx-6 mt-4 p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{resetSuccessMessage}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 1: STORE PROFILE                                           */}
        {/* ============================================================== */}
        {activeTab === 'store' && (
          <div className="flex-1 overflow-y-auto p-6 flex justify-center">
            <div className="w-full max-w-3xl space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Store className="w-6 h-6 text-indigo-600" /> Store Profile & Invoicing Setup
                  </h1>
                  <p className="text-xs text-slate-500">Configure your paint shop header, GSTIN, invoice prefix, and UPI details</p>
                </div>
              </div>

              {savedSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Settings saved successfully!
                </div>
              )}

              <form onSubmit={handleSubmitSettings} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
                {/* Shop Profile */}
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 border-b pb-2 flex items-center gap-2">
                    <Store className="w-4 h-4 text-indigo-600" /> Shop Identification
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Store Name</label>
                      <input
                        type="text"
                        value={formData.shopName}
                        onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Tagline / Subtitle</label>
                      <input
                        type="text"
                        value={formData.tagline}
                        onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 uppercase mb-1">Store Address</label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* GST & Printing */}
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 border-b pb-2 flex items-center gap-2">
                    <Printer className="w-4 h-4 text-indigo-600" /> Invoicing & Tax Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">GSTIN (15 Digits)</label>
                      <input
                        type="text"
                        value={formData.gstin}
                        onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold tracking-wider uppercase"
                        maxLength={15}
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Invoice Prefix</label>
                      <input
                        type="text"
                        value={formData.invoicePrefix}
                        onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Thermal Receipt Width</label>
                      <select
                        value={formData.thermalPaperSize}
                        onChange={(e) => setFormData({ ...formData, thermalPaperSize: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="80mm">80mm (Standard POS Thermal)</option>
                        <option value="58mm">58mm (Compact Thermal)</option>
                        <option value="A4">A4 Full Page Laser/Inkjet</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">UPI ID for QR Code Payment</label>
                      <input
                        type="text"
                        value={formData.upiId}
                        onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                        placeholder="e.g. yourshop@icici"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 uppercase mb-1">Bank Account Details (Printed on Invoices)</label>
                      <textarea
                        value={formData.bankDetails}
                        onChange={(e) => setFormData({ ...formData, bankDetails: e.target.value })}
                        placeholder="Bank Name, A/C Number, IFSC Code..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none font-mono text-[11px]"
                        rows={2}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 uppercase mb-1">Terms & Conditions (Printed at bottom)</label>
                      <textarea
                        value={formData.termsConditions}
                        onChange={(e) => setFormData({ ...formData, termsConditions: e.target.value })}
                        placeholder="1. Goods once tinted cannot be exchanged. 2. Interest @ 18% p.a. charged after 30 days..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none text-[11px]"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl transition shadow-md cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving Changes...' : 'Save Store Profile'}</span>
                  </button>
                </div>
              </form>

              {/* Bulk Product CSV Upload Box */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Bulk Product Catalog Import (CSV)</h3>
                      <p className="text-[11px] text-slate-500">Upload or replace products with pack sizes, MRP, and prices</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-3">
                  <Upload className="w-8 h-8 text-indigo-500 mx-auto" />
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleFileChange}
                      className="hidden"
                      id="bulk-csv-upload-input"
                    />
                    <label
                      htmlFor="bulk-csv-upload-input"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-xs"
                    >
                      <span>Choose CSV File</span>
                    </label>
                  </div>
                  {csvFile ? (
                    <div className="text-xs font-bold text-slate-800">
                      Selected: <span className="font-mono text-indigo-700">{csvFile.name}</span> ({parsedRows.length} valid rows found)
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500">Supports comma-separated files with brand, name, category, pack_size, mrp, retail_price</p>
                  )}
                </div>

                {uploadResult && (
                  <div
                    className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      uploadResult.success
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border border-rose-200 text-rose-800'
                    }`}
                  >
                    {uploadResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{uploadResult.message}</span>
                  </div>
                )}

                {parsedRows.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Preview ({parsedRows.length} items to import):</span>
                      <button
                        type="button"
                        onClick={handleBulkUpload}
                        disabled={uploading}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
                      >
                        {uploading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading in Batches...
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" /> Start Bulk Import
                          </>
                        )}
                      </button>
                    </div>

                    <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl text-[11px]">
                      <table className="w-full text-left">
                        <thead className="bg-slate-100 border-b font-bold text-slate-700 sticky top-0">
                          <tr>
                            <th className="p-2">Brand</th>
                            <th className="p-2">Product Name</th>
                            <th className="p-2">Category</th>
                            <th className="p-2">Pack</th>
                            <th className="p-2 text-right">MRP</th>
                            <th className="p-2 text-right">Rate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parsedRows.slice(0, 50).map((r, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="p-2 font-bold text-slate-800">{r.brand || r.Brand || '—'}</td>
                              <td className="p-2">{r.name || r.product_name || r.Product || '—'}</td>
                              <td className="p-2 text-slate-500">{r.category || r.Category || '—'}</td>
                              <td className="p-2 font-mono">{r.pack_size || r.PackSize || '—'}</td>
                              <td className="p-2 text-right font-mono text-slate-500">₹{r.mrp || r.MRP || '0'}</td>
                              <td className="p-2 text-right font-mono font-bold text-indigo-600">₹{r.retail_price || r.RetailPrice || '0'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: PRODUCTS MASTER LIST                                    */}
        {/* ============================================================== */}
        {activeTab === 'products' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header with Top Right Add Button */}
            <div className="p-4 px-6 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div>
                <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" /> Products Master Catalog
                </h1>
                <p className="text-xs text-slate-500">
                  Manage all {products.length} products, pack sizes, stock levels, GST tax rates, and prices
                </p>
              </div>

              {/* Top-Right Add Product Button */}
              <button
                type="button"
                onClick={() => setIsAddProductOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition shadow-xs cursor-pointer shrink-0 self-start sm:self-auto"
                title="Add a new paint or hardware product"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Add Product</span>
              </button>
            </div>

            {/* Filters Bar */}
            <div className="p-3 px-6 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products by name, brand, category, HSN..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
                {productSearch && (
                  <button onClick={() => setProductSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedBrandFilter}
                  onChange={(e) => setSelectedBrandFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-bold"
                >
                  <option value="ALL">All Brands ({brands.length})</option>
                  {brands.map((b) => (
                    <option key={b.id || b.name} value={b.name}>
                      {b.name} ({b.productCount || 0})
                    </option>
                  ))}
                </select>

                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-bold"
                >
                  <option value="ALL">All Categories ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Table Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {productsLoading ? (
                <div className="py-24 text-center text-slate-400 text-sm">Loading products catalog...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-24 text-center text-slate-400 text-sm space-y-2 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
                  <Package className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="font-bold text-slate-700">No products match your search or filter.</p>
                  <p className="text-xs text-slate-500">Try clearing filters or click "+ Add Product" to create one.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-100/80 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-3 pl-4">Product Name & Info</th>
                          <th className="p-3">Brand</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">HSN & Tax</th>
                          <th className="p-3">Pack Sizes & Rates</th>
                          <th className="p-3 pr-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50 transition">
                            <td className="p-3 pl-4">
                              <div className="font-bold text-slate-900">{p.name}</div>
                              {p.description && <div className="text-[11px] text-slate-400 line-clamp-1">{p.description}</div>}
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-[10px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wide">
                                {p.brand}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                                {p.category}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-[11px] text-slate-500">
                              <div>HSN: {p.hsnCode || '3209'}</div>
                              <div className="text-[10px] text-slate-400">GST: {p.defaultTaxRate}%</div>
                            </td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-1 max-w-sm">
                                {p.packSizes && p.packSizes.length > 0 ? (
                                  p.packSizes.map((pk) => (
                                    <span
                                      key={pk.id}
                                      className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-700"
                                      title={`Stock: ${pk.stockQty || 0} | MRP: ₹${pk.mrp}`}
                                    >
                                      <strong>{pk.packSize}</strong>:
                                      <span className="text-emerald-700 font-bold">₹{pk.retailPrice}</span>
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-slate-400 text-[11px]">No pack sizes</span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 pr-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Default Edit Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingProduct(p);
                                    setIsEditProductOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition cursor-pointer"
                                  title="Edit Product, prices and pack sizes"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Edit</span>
                                </button>
                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(p)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: CATEGORIES MASTER LIST                                  */}
        {/* ============================================================== */}
        {activeTab === 'categories' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header with Top Right Add Button */}
            <div className="p-4 px-6 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div>
                <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" /> Categories Master
                </h1>
                <p className="text-xs text-slate-500">
                  Manage department categories, icons, and product groupings
                </p>
              </div>

              {/* Top-Right Add Category Button */}
              <button
                type="button"
                onClick={() => setIsAddCategoryOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition shadow-xs cursor-pointer shrink-0 self-start sm:self-auto"
                title="Create a new Category"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Add Category</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-3 px-6 bg-slate-50 border-b border-slate-200 shrink-0">
              <div className="relative max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Categories List Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {categoriesLoading ? (
                <div className="py-24 text-center text-slate-400 text-sm">Loading categories...</div>
              ) : filteredCategories.length === 0 ? (
                <div className="py-24 text-center text-slate-400 text-sm space-y-2 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
                  <Layers className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="font-bold text-slate-700">No categories found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCategories.map((c) => {
                    const IconComp = ICON_MAP[c.iconName || 'Layers'] || Layers;
                    const isEditing = editingCategoryId === c.id;

                    return (
                      <div
                        key={c.id}
                        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                              <IconComp className="w-5 h-5" />
                            </div>
                            <div>
                              {isEditing ? (
                                <div className="space-y-1.5">
                                  <input
                                    type="text"
                                    value={editingCategoryName}
                                    onChange={(e) => setEditingCategoryName(e.target.value)}
                                    className="px-2 py-1 text-xs font-bold border border-indigo-400 rounded-lg w-full focus:ring-2 focus:ring-indigo-500"
                                    autoFocus
                                  />
                                  <select
                                    value={editingCategoryIcon}
                                    onChange={(e) => setEditingCategoryIcon(e.target.value)}
                                    className="px-2 py-1 text-[11px] border border-slate-200 rounded-md bg-white text-slate-700 w-full"
                                  >
                                    {Object.keys(ICON_MAP).map((iconKey) => (
                                      <option key={iconKey} value={iconKey}>
                                        {iconKey}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ) : (
                                <>
                                  <h3 className="font-bold text-sm text-slate-900">{c.name}</h3>
                                  <p className="text-[11px] text-slate-400 font-mono">
                                    {c.productCount || 0} linked products
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons on category */}
                        <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-slate-100">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setEditingCategoryId(null)}
                                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 bg-slate-100 rounded-lg font-bold"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveCategory(c)}
                                className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                              >
                                <Check className="w-3.5 h-3.5" /> Save
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Default Edit Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCategoryId(c.id);
                                  setEditingCategoryName(c.name);
                                  setEditingCategoryIcon(c.iconName || 'Layers');
                                }}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition cursor-pointer"
                                title="Edit category name & icon"
                              >
                                <Pencil className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(c)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="Delete category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: BRANDS MASTER LIST                                      */}
        {/* ============================================================== */}
        {activeTab === 'brands' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header with Top Right Add Button */}
            <div className="p-4 px-6 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div>
                <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-indigo-600" /> Brands Master
                </h1>
                <p className="text-xs text-slate-500">
                  Manage paint manufacturers and brands catalog
                </p>
              </div>

              {/* Top-Right Add Brand Button */}
              <button
                type="button"
                onClick={() => setIsAddBrandOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition shadow-xs cursor-pointer shrink-0 self-start sm:self-auto"
                title="Create a new Brand"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Add Brand</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-3 px-6 bg-slate-50 border-b border-slate-200 shrink-0">
              <div className="relative max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search brands..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Brands List Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {brandsLoading ? (
                <div className="py-24 text-center text-slate-400 text-sm">Loading brands...</div>
              ) : filteredBrands.length === 0 ? (
                <div className="py-24 text-center text-slate-400 text-sm space-y-2 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
                  <Palette className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="font-bold text-slate-700">No brands found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBrands.map((b) => {
                    const isEditing = editingBrandName === b.name;

                    return (
                      <div
                        key={b.id || b.name}
                        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 font-extrabold text-xs uppercase">
                              {b.name.substring(0, 2)}
                            </div>
                            <div>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingBrandNewName}
                                  onChange={(e) => setEditingBrandNewName(e.target.value)}
                                  className="px-2 py-1 text-xs font-bold border border-indigo-400 rounded-lg w-full focus:ring-2 focus:ring-indigo-500"
                                  autoFocus
                                />
                              ) : (
                                <>
                                  <h3 className="font-bold text-sm text-slate-900">{b.name}</h3>
                                  <p className="text-[11px] text-slate-400 font-mono">
                                    {b.productCount || 0} linked products
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons on brand */}
                        <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-slate-100">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setEditingBrandName(null)}
                                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 bg-slate-100 rounded-lg font-bold"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveBrand(b.name)}
                                className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                              >
                                <Check className="w-3.5 h-3.5" /> Save
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Default Edit Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingBrandName(b.name);
                                  setEditingBrandNewName(b.name);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition cursor-pointer"
                                title="Rename brand across all products"
                              >
                                <Pencil className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBrand(b)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="Delete brand"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: CONTRACTORS MASTER LIST                                 */}
        {/* ============================================================== */}
        {activeTab === 'contractors' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header with Top Right Add Button */}
            <div className="p-4 px-6 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div>
                <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" /> Contractors & Master Painters
                </h1>
                <p className="text-xs text-slate-500">
                  Manage contractor accounts, commission rates, credit limits, and balances
                </p>
              </div>

              {/* Top-Right Add Contractor Button */}
              <button
                type="button"
                onClick={() => setIsAddContractorOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition shadow-xs cursor-pointer shrink-0 self-start sm:self-auto"
                title="Create a new Contractor Profile"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Add Contractor</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-3 px-6 bg-slate-50 border-b border-slate-200 shrink-0">
              <div className="relative max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search contractors by name, phone, address..."
                  value={contractorSearch}
                  onChange={(e) => setContractorSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Contractors List Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {contractorsLoading ? (
                <div className="py-24 text-center text-slate-400 text-sm">Loading contractors...</div>
              ) : filteredContractors.length === 0 ? (
                <div className="py-24 text-center text-slate-400 text-sm space-y-2 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
                  <Users className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="font-bold text-slate-700">No contractors found.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-100/80 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-3 pl-4">Contractor Name</th>
                          <th className="p-3">Phone</th>
                          <th className="p-3">Address</th>
                          <th className="p-3">Commission %</th>
                          <th className="p-3">Credit Limit</th>
                          <th className="p-3">Current Balance</th>
                          <th className="p-3 pr-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {filteredContractors.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50 transition">
                            <td className="p-3 pl-4">
                              <div className="font-bold text-slate-900">{c.name}</div>
                            </td>
                            <td className="p-3 font-mono text-slate-600">
                              <span className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-slate-400" /> {c.phone}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500">
                              {c.address ? (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {c.address}
                                </span>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="p-3 font-mono">
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {c.commissionRate || 5}%
                              </span>
                            </td>
                            <td className="p-3 font-mono text-slate-600">
                              ₹{(c.creditLimit || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="p-3 font-mono">
                              <span
                                className={`font-bold ${
                                  (c.currentBalance || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'
                                }`}
                              >
                                ₹{(c.currentBalance || 0).toLocaleString('en-IN')}
                              </span>
                            </td>
                            <td className="p-3 pr-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Default Edit Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingContractor(c);
                                    setIsEditContractorOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition cursor-pointer"
                                  title="Edit Contractor details"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Edit</span>
                                </button>
                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteContractor(c)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                  title="Delete Contractor"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* GLOBAL MODALS WIRED TO STORE SETTINGS                           */}
      {/* ============================================================== */}

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        categories={categories}
        brands={brandNamesList}
        onProductCreated={() => {
          setIsAddProductOpen(false);
          fetchProducts();
          fetchBrands();
          fetchCategories();
          showNotification('Product created successfully!');
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
        brands={brandNamesList}
        onProductUpdated={() => {
          setIsEditProductOpen(false);
          setEditingProduct(null);
          fetchProducts();
          fetchCategories();
          fetchBrands();
          showNotification('Product updated successfully!');
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

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onCategoryCreated={(newCat) => {
          setIsAddCategoryOpen(false);
          fetchCategories();
          showNotification(`Category "${newCat.name}" added successfully!`);
        }}
      />

      {/* Add Brand Modal */}
      <AddBrandModal
        isOpen={isAddBrandOpen}
        onClose={() => setIsAddBrandOpen(false)}
        onBrandCreated={(newBrand) => {
          setIsAddBrandOpen(false);
          fetchBrands();
          showNotification(`Brand "${newBrand.name}" added successfully!`);
        }}
      />

      {/* Add Contractor Modal */}
      <AddContractorModal
        isOpen={isAddContractorOpen}
        onClose={() => setIsAddContractorOpen(false)}
        onContractorAdded={() => {
          setIsAddContractorOpen(false);
          fetchContractors();
          showNotification('Contractor added successfully!');
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
          setIsEditContractorOpen(false);
          setEditingContractor(null);
          fetchContractors();
          showNotification('Contractor updated successfully!');
        }}
      />

      {/* Reset Database Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-red-200">
            {/* Modal Header */}
            <div className="p-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-900">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <h3 className="font-bold text-sm">Reset Database Confirmation</h3>
                  <p className="text-[11px] text-red-700">Wipe all products and restart with zero data</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-red-100/50 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleResetDatabase} className="p-5 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Warning: Permanent Deletion</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  This will permanently delete all products, pack sizes, sales invoices, contractors, and stock. The database will restart with 0 items so you can upload your new bulk CSV file.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Enter Admin Password to Confirm
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Enter default password..."
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 font-mono"
                    autoFocus
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Default password: <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">admin123</span>
                </p>
              </div>

              {resetError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading || !resetPassword}
                  className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 rounded-xl transition shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {resetLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Wiping Database...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" /> Confirm & Reset Everything to 0
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
