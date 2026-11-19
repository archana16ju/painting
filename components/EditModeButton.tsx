'use client';

import React from 'react';
import { usePaintTerminalStore } from '@/store/usePaintTerminalStore';
import { Pencil, Check } from 'lucide-react';

export default function EditModeButton() {
  const { isEditMode, toggleEditMode } = usePaintTerminalStore();

  return (
    <button
      type="button"
      onClick={toggleEditMode}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer select-none ${
        isEditMode
          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 ring-2 ring-amber-300 ring-offset-1 ring-offset-slate-900 shadow-amber-500/20'
          : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:text-white'
      }`}
      title={
        isEditMode
          ? 'Edit Mode is ACTIVE: Click to hide edit icons'
          : 'Click to enable Edit Mode and show settings/edit icons for categories, brands, and products'
      }
    >
      <div className="flex items-center gap-1.5">
        <Pencil className={`w-3.5 h-3.5 ${isEditMode ? 'text-slate-950 stroke-[2.5]' : 'text-amber-400'}`} />
        <span>Edit Mode</span>
      </div>

      {/* Visual Switch Indicator */}
      <div
        className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors ${
          isEditMode ? 'bg-slate-950 justify-end' : 'bg-slate-700 justify-start'
        }`}
      >
        <div
          className={`w-3 h-3 rounded-full transition-transform ${
            isEditMode ? 'bg-amber-400 shadow-xs' : 'bg-slate-400'
          }`}
        />
      </div>

      {isEditMode && (
        <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950 text-amber-300 px-1.5 py-0.2 rounded">
          ON
        </span>
      )}
    </button>
  );
}
