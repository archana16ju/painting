'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BulkUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: BulkUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  // Download complete bulk upload CSV with all 785 products from PDF
  const downloadAllProductsCsv = () => {
    window.location.href = '/api/products/export-csv';
  };

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
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setUploadResult({
        success: false,
        message: err.message || 'Error uploading file',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              Bulk Product Upload (CSV)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add single or multiple paint products, pack sizes, stock quantities, and 3-tier prices at once.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Action Row: Full Catalog Download & Template */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl">
            <div>
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                Complete Bulk Upload CSV with All PDF Products
              </span>
              <p className="text-[11px] text-indigo-700 mt-0.5">
                Contains all 785 SKUs from your PDFs (Surfa Coats, Arun & Tia, JK Cement, Thinners, etc.) ready for clients or re-upload.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadAllProductsCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs whitespace-nowrap self-start sm:self-auto cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Download Full CSV (785 Items)
            </button>
          </div>

          {/* Columns Chips */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700">CSV Column Structure:</span>
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
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                    col.req
                      ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {col.name}
                  {col.req && <span className="text-red-500 font-bold ml-0.5">*</span>}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 italic">
              * Note: If RetailPrice, ContractorPrice, WholesalePrice, or MRP are left blank, they are auto-calculated from CostPrice using standard margins.
            </p>
          </div>

          {/* File Dropzone */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:border-indigo-400 transition bg-slate-50/50">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
              id="modal-csv-upload"
            />
            <label
              htmlFor="modal-csv-upload"
              className="cursor-pointer flex flex-col items-center justify-center space-y-1.5"
            >
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-full">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                {csvFile ? csvFile.name : 'Select or drop your CSV file here'}
              </span>
              <span className="text-[11px] text-slate-400">
                {csvFile
                  ? `${(csvFile.size / 1024).toFixed(1)} KB — ${parsedRows.length} rows detected`
                  : 'Click to choose file (.csv)'}
              </span>
            </label>
          </div>

          {/* Status Message */}
          {uploadResult && (
            <div
              className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 border ${
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

          {/* Table Preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Preview ({parsedRows.length} rows):</span>
                <button
                  type="button"
                  onClick={() => {
                    setParsedRows([]);
                    setCsvFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-[11px] text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>

              <div className="overflow-x-auto max-h-48 border border-slate-200 rounded-xl">
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
                        <td className="p-2 font-bold text-slate-900">
                          {row.ProductName || row.product_name || row.name || '-'}
                        </td>
                        <td className="p-2 text-slate-600">{row.Category || row.category || '-'}</td>
                        <td className="p-2 font-mono">{row.PackSize || row.pack_size || '-'}</td>
                        <td className="p-2 font-mono">₹{row.CostPrice || row.cost_price || '0'}</td>
                        <td className="p-2 font-mono text-emerald-700 font-bold">
                          ₹{row.RetailPrice || row.retail_price || 'Auto'}
                        </td>
                        <td className="p-2">{row.StockQty || row.stock_qty || '20'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 10 && (
                <div className="text-[10px] text-slate-400 text-center">
                  + {parsedRows.length - 10} more rows
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleBulkUpload}
            disabled={uploading || parsedRows.length === 0}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            {uploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Importing {parsedRows.length} items...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" /> Import {parsedRows.length || 0} Products Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
