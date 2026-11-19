'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Receipt,
  Wallet,
  AlertTriangle,
  Users,
  PieChart,
  FileText,
} from 'lucide-react';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-400 text-sm">
        Loading reports & business intelligence...
      </div>
    );
  }

  const summary = data?.summary || {};
  const paymentBreakdown = data?.paymentBreakdown || [];
  const brandSales = data?.brandSales || [];
  const contractorOutstanding = data?.contractorOutstanding || [];
  const lowStock = data?.lowStock || [];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" /> Business Analytics & GST Reports
        </h1>
        <p className="text-xs text-slate-500">Sales performance, cash collections, and tax summaries</p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Sales Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-2">
            ₹{Number(summary.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{summary.totalBills || 0} Invoices generated</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Cash & UPI Collected</span>
            <Wallet className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600 mt-2">
            ₹{Number(summary.totalCollected || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Liquid collections</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Khata Outstanding</span>
            <Users className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-600 mt-2">
            ₹{Number(summary.totalOutstanding || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Pending contractor credit</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total GST Collected</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-600 mt-2">
            ₹{Number(summary.totalTaxCollected || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">CGST + SGST (GSTR-1)</div>
        </div>
      </div>

      {/* Middle Section: Brand Performance & Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand Sales Share */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-600" /> Brand-Wise Sales Performance
          </h3>
          <div className="space-y-3">
            {brandSales.length === 0 ? (
              <div className="text-xs text-slate-400 py-6 text-center">No brand sales data yet.</div>
            ) : (
              brandSales.map((b: any) => (
                <div key={b.brand} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{b.brand}</span>
                    <span className="font-mono font-bold text-slate-900">
                      ₹{Number(b.totalAmount).toLocaleString('en-IN')} ({b.itemCount} items)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (Number(b.totalAmount) / Math.max(1, Number(summary.totalRevenue))) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Warnings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" /> Low Stock Can Size Alerts
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {lowStock.length === 0 ? (
              <div className="text-xs text-slate-400 py-6 text-center">All inventory levels healthy!</div>
            ) : (
              lowStock.map((ls: any, i: number) => (
                <div key={i} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{ls.name}</span>
                    <div className="text-[10px] text-slate-400">{ls.brand}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-rose-600">
                      {ls.stock_qty} left ({ls.pack_size})
                    </span>
                    <div className="text-[10px] text-slate-400">Min alert: {ls.min_stock_alert}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Top Contractor Outstanding Dues */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-rose-600" /> Outstanding Contractor Khata Recovery List
        </h3>
        <table className="w-full text-left border-collapse text-xs font-sans">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 font-semibold uppercase text-[10px]">
              <th className="py-2 px-3">Contractor / Painter</th>
              <th className="py-2 px-3">Phone</th>
              <th className="py-2 px-3 text-right">Credit Limit</th>
              <th className="py-2 px-3 text-right">Total Commission Earned</th>
              <th className="py-2 px-3 text-right">Pending Balance Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {contractorOutstanding.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">
                  No overdue contractor balances.
                </td>
              </tr>
            ) : (
              contractorOutstanding.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 font-bold text-slate-900 font-sans">{c.name}</td>
                  <td className="py-2.5 px-3 text-slate-500">{c.phone}</td>
                  <td className="py-2.5 px-3 text-right text-slate-600">₹{c.credit_limit.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3 text-right text-indigo-600">
                    ₹{c.total_commission_earned.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-600">
                    ₹{c.current_balance.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
