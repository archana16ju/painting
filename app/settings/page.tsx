'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Settings, Save, CheckCircle2, Store, Printer, QrCode, Upload, FileSpreadsheet, AlertCircle, RefreshCw, AlertTriangle, Trash2, KeyRound, Lock, X, ShieldAlert } from 'lucide-react';

export default function SettingsPage() {
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

  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
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
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setResetError(err.message || 'Error resetting database');
    } finally {
      setResetLoading(false);
    }
  };

  // Robust RFC-4180 CSV parser Helper
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
    } catch (err: any) {
      setUploadResult({
        success: false,
        message: err.message || 'Error uploading file',
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-sm">Loading settings...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex justify-center">
      <div className="w-full max-w-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-6 h-6 text-indigo-600" /> Store Profile & Invoicing Setup
            </h1>
            <p className="text-xs text-slate-500">Configure your paint shop header, GSTIN, invoice prefix, and UPI details</p>
          </div>

          <button
            type="button"
            onClick={() => {
              setResetError(null);
              setResetPassword('');
              setIsResetModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 border border-red-300 rounded-xl transition shadow-2xs whitespace-nowrap self-start sm:self-auto cursor-pointer"
            title="Wipe database to zero data before new CSV upload"
          >
            <Trash2 className="w-4 h-4 text-red-600" /> Reset Database (0 Data)
          </button>
        </div>

        {savedSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
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
                <label className="block font-bold text-slate-700 uppercase mb-1">Tagline / Dealership</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="e.g. Authorized Asian Paints & Berger Dealer"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Shop GSTIN Number</label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  className="w-full px-3 py-2 font-mono font-bold border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 uppercase mb-1">Store Address</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>
            </div>
          </div>

          {/* Invoicing & Printer */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2 flex items-center gap-2">
              <Printer className="w-4 h-4 text-indigo-600" /> Invoice Numbering & Thermal Setup
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Invoice Prefix</label>
                <input
                  type="text"
                  value={formData.invoicePrefix}
                  onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                  className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Default Thermal Paper Size</label>
                <select
                  value={formData.thermalPaperSize}
                  onChange={(e) => setFormData({ ...formData, thermalPaperSize: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="80mm">80mm (3-inch Thermal Roll)</option>
                  <option value="58mm">58mm (2-inch Thermal Roll)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 uppercase mb-1">Invoice Terms & Conditions</label>
                <textarea
                  rows={3}
                  value={formData.termsConditions}
                  onChange={(e) => setFormData({ ...formData, termsConditions: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Payment & UPI */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-indigo-600" /> Bank & UPI Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Shop UPI ID</label>
                <input
                  type="text"
                  value={formData.upiId}
                  onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                  placeholder="e.g. royalpaint@upi"
                  className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Bank Account Info</label>
                <input
                  type="text"
                  value={formData.bankDetails}
                  onChange={(e) => setFormData({ ...formData, bankDetails: e.target.value })}
                  placeholder="HDFC Bank A/c 5020..., IFSC: HDFC000123"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>

        {/* ============================================================== */}
        {/* Bulk Product Upload (CSV) Section                               */}
        {/* ============================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" /> Bulk Product Upload (CSV)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Import single or multiple paint products, pack sizes, stock quantities, and 3-tier prices via Excel / CSV.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setResetError(null);
                  setResetPassword('');
                  setIsResetModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition cursor-pointer"
                title="Wipe old database before new upload"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" /> Reset to 0 Data
              </button>
            </div>
          </div>

          {/* Required CSV Columns Guide */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>Required & Supported Columns in CSV:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'Brand', req: true },
                { name: 'ProductName', req: true },
                { name: 'Category', req: true },
                { name: 'PackSize', req: true },
                { name: 'CostPrice', req: true },
                { name: 'RetailPrice', req: false },
                { name: 'ContractorPrice', req: false },
                { name: 'WholesalePrice', req: false },
                { name: 'MRP', req: false },
                { name: 'HSNCode', req: false },
                { name: 'TaxRate', req: false },
                { name: 'StockQty', req: false },
                { name: 'MinStockAlert', req: false },
                { name: 'Barcode', req: false },
                { name: 'Description', req: false },
              ].map((col) => (
                <span
                  key={col.name}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold border ${
                    col.req
                      ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  {col.name}
                  {col.req && <span className="text-red-500 font-bold ml-0.5">*</span>}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 italic mt-1">
              * Note: If RetailPrice, ContractorPrice, WholesalePrice, or MRP are left blank, they are auto-calculated from CostPrice using standard paint store margins.
            </p>
          </div>

          {/* Upload Drop Zone / Input */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-indigo-400 transition bg-slate-50/50">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-file-upload"
            />
            <label
              htmlFor="csv-file-upload"
              className="cursor-pointer flex flex-col items-center justify-center space-y-2"
            >
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                {csvFile ? csvFile.name : 'Click to browse or drop your .csv file here'}
              </span>
              <span className="text-[11px] text-slate-400">
                {csvFile ? `${(csvFile.size / 1024).toFixed(1)} KB — ${parsedRows.length} rows parsed` : 'Only CSV files supported'}
              </span>
            </label>
          </div>

          {/* Results / Status Notification */}
          {uploadResult && (
            <div
              className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                uploadResult.success
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-red-50 text-red-800 border-red-300'
              }`}
            >
              {uploadResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{uploadResult.message}</span>
            </div>
          )}

          {/* Preview Parsed Rows */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Preview ({parsedRows.length} rows ready to import):
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setParsedRows([]);
                    setCsvFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-[11px] text-red-600 hover:underline"
                >
                  Clear File
                </button>
              </div>

              <div className="overflow-x-auto max-h-56 border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 sticky top-0 font-bold border-b text-[11px]">
                    <tr>
                      <th className="p-2">Brand</th>
                      <th className="p-2">Product Name</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">Pack</th>
                      <th className="p-2">Cost (₹)</th>
                      <th className="p-2">Retail (₹)</th>
                      <th className="p-2">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {parsedRows.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 font-medium">{row.Brand || row.brand || '-'}</td>
                        <td className="p-2 font-bold text-slate-900">{row.ProductName || row.product_name || row.name || '-'}</td>
                        <td className="p-2 text-slate-600">{row.Category || row.category || '-'}</td>
                        <td className="p-2 font-mono">{row.PackSize || row.pack_size || '-'}</td>
                        <td className="p-2 font-mono">₹{row.CostPrice || row.cost_price || '0'}</td>
                        <td className="p-2 font-mono text-emerald-700 font-bold">₹{row.RetailPrice || row.retail_price || 'Auto'}</td>
                        <td className="p-2">{row.StockQty || row.stock_qty || '20'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 10 && (
                <div className="text-[10px] text-slate-400 text-center">
                  + {parsedRows.length - 10} more rows in file
                </div>
              )}

              {/* Upload Confirm Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleBulkUpload}
                  disabled={uploading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Importing {parsedRows.length} products...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" /> Import {parsedRows.length} Products to Catalog
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* Danger Zone: Reset Database to Zero Data                       */}
        {/* ============================================================== */}
        <div className="bg-red-50/60 rounded-2xl border-2 border-red-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-100 text-red-700 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-base font-extrabold text-red-950">
                  Danger Zone: Reset Database (Zero Data)
                </h2>
              </div>
              <p className="text-xs text-red-800 leading-relaxed max-w-2xl">
                Wipes all existing products, inventory pack sizes, sales invoices, contractors, and categories so the database restarts with <strong>zero (0) data</strong>. Use this before uploading a fresh bulk CSV file.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setResetError(null);
                setResetPassword('');
                setIsResetModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 rounded-xl transition shadow-xs whitespace-nowrap self-start sm:self-auto cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Reset Database to 0 Data
            </button>
          </div>

          {resetSuccessMessage && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{resetSuccessMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Reset Database Password Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-red-200 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-red-100 bg-red-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-red-950">Confirm Database Reset</h3>
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
