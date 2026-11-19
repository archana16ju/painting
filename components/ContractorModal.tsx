'use client';

import React, { useState, useEffect } from 'react';
import { usePaintTerminalStore } from '@/store/usePaintTerminalStore';
import { Contractor } from '@/types/paint';
import { X, Search, Check, UserCheck, Phone, ShieldAlert, Plus, Pencil } from 'lucide-react';
import AddContractorModal from '@/components/AddContractorModal';
import EditContractorModal from '@/components/EditContractorModal';

export default function ContractorModal() {
  const { isContractorModalOpen, closeContractorModal, setSelectedContractor, selectedContractor, isEditMode } =
    usePaintTerminalStore();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    if (isContractorModalOpen) {
      fetchContractors();
    }
  }, [isContractorModalOpen]);

  const fetchContractors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contractors');
      const data = await res.json();
      if (data.success) {
        setContractors(data.contractors);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = contractors.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const handleSelect = (c: Contractor) => {
    setSelectedContractor({
      id: c.id,
      name: c.name,
      phone: c.phone,
      balance: c.currentBalance,
      limit: c.creditLimit,
    });
    closeContractorModal();
  };

  const handleClear = () => {
    setSelectedContractor(null);
    closeContractorModal();
  };

  if (!isContractorModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 px-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Select Contractor / Master Painter</h2>
              <p className="text-xs text-slate-400">Tag contractor for Khata credit ledger & 5% referral commission</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Add Contractor</span>
            </button>
            <button onClick={closeContractorModal} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by painter name or phone number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
          </div>
          {selectedContractor && (
            <button
              onClick={handleClear}
              className="px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition"
            >
              Remove Tagged Contractor
            </button>
          )}
        </div>

        {/* Contractors List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading contractors...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No contractor found.</div>
          ) : (
            filtered.map((c) => {
              const isSelected = selectedContractor?.id === c.id;
              const isNearLimit = c.currentBalance >= c.creditLimit * 0.9;
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  className={`cursor-pointer rounded-xl border p-4 flex items-center justify-between transition ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{c.name}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                        {c.commissionRate}% Commission
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {c.phone}
                      </span>
                      {c.address && <span>• {c.address}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right space-y-1">
                      <div className="text-xs text-slate-500">Current Khata Balance</div>
                      <div className={`text-sm font-bold font-mono ${c.currentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        ₹{c.currentBalance.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1">
                        {isNearLimit && <ShieldAlert className="w-3 h-3 text-amber-500" />}
                        Limit: ₹{c.creditLimit.toLocaleString('en-IN')}
                      </div>
                    </div>

                    {isEditMode && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingContractor(c);
                          setIsEditOpen(true);
                        }}
                        className="p-2 text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition cursor-pointer"
                        title="Edit Contractor Profile"
                      >
                        <Pencil className="w-4 h-4 text-amber-700" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Contractor Sub-Modal */}
      <AddContractorModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onContractorAdded={() => {
          fetchContractors();
        }}
      />

      {/* Edit Contractor Sub-Modal */}
      <EditContractorModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingContractor(null);
        }}
        contractor={editingContractor}
        onContractorUpdated={() => {
          fetchContractors();
        }}
      />
    </div>
  );
}
