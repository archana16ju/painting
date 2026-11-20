import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Paintbrush, ShoppingCart, Users, Palette, BarChart3, Settings } from 'lucide-react';
import ShadeModal from '@/components/ShadeModal';
import ContractorModal from '@/components/ContractorModal';
import EstimatorModal from '@/components/EstimatorModal';
import PaymentModal from '@/components/PaymentModal';
import InvoiceModal from '@/components/InvoiceModal';

export const metadata: Metadata = {
  title: 'Paint Billing ERP & POS',
  description: 'Paint Shop POS & Management System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <body className="bg-slate-100 text-slate-900 h-screen w-screen overflow-hidden flex flex-col font-sans antialiased">
        {/* Top App Header */}
        <header className="bg-slate-900 text-white border-b border-slate-800 shrink-0 no-print z-20">
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-md">
                <Paintbrush className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold tracking-tight text-base">PAINT BILLING <span className="text-amber-400">ERP</span></span>
                <span className="text-[10px] block text-slate-400 -mt-0.5 font-medium">Retail & Wholesale POS</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 text-slate-200 transition"
              >
                <ShoppingCart className="w-4 h-4 text-emerald-400" /> POS Terminal
              </Link>
              <Link
                href="/contractors"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 text-slate-200 transition"
              >
                <Users className="w-4 h-4 text-blue-400" /> Contractors & Khata
              </Link>
              <Link
                href="/shades"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 text-slate-200 transition"
              >
                <Palette className="w-4 h-4 text-amber-400" /> Shades & Tinting
              </Link>
              <Link
                href="/reports"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 text-slate-200 transition"
              >
                <BarChart3 className="w-4 h-4 text-indigo-400" /> Reports & GST
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 text-slate-200 transition"
              >
                <Settings className="w-4 h-4 text-slate-400" /> Store Settings
              </Link>
            </nav>

            {/* Quick Status */}
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Offline Ready
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 min-h-0 w-full overflow-hidden flex flex-col">{children}</main>

        {/* Global Modals */}
        <ShadeModal />
        <ContractorModal />
        <EstimatorModal />
        <PaymentModal />
        <InvoiceModal />
      </body>
    </html>
  );
}
