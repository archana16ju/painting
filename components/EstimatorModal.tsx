'use client';

import React, { useState } from 'react';
import { usePaintTerminalStore } from '@/store/usePaintTerminalStore';
import { X, Calculator, ArrowRight, Sparkles, Building, Layers } from 'lucide-react';

export default function EstimatorModal() {
  const { isEstimatorModalOpen, closeEstimatorModal } = usePaintTerminalStore();

  const [carpetArea, setCarpetArea] = useState<number>(1000);
  const [wallHeight, setWallHeight] = useState<number>(10);
  const [surfaceType, setSurfaceType] = useState<'FRESH_PLASTER' | 'REPAINTING'>('FRESH_PLASTER');
  const [qualityTier, setQualityTier] = useState<'ECONOMY' | 'PREMIUM' | 'LUXURY'>('PREMIUM');
  const [projectName, setProjectName] = useState('3BHK Flat');

  if (!isEstimatorModalOpen) return null;

  // Estimation Formulas:
  // Paintable Wall Area = Carpet Area * 3.5 (standard thumb rule accounting for 4 walls & ceiling minus doors/windows)
  const totalWallArea = Math.round(carpetArea * 3.5 * (wallHeight / 10));

  // Putty Coverage: 1 kg covers approx 16 sq.ft for 2 coats on fresh plaster; for repainting, touch-up putty approx 40 sq.ft/kg
  const puttyKg = surfaceType === 'FRESH_PLASTER' ? Math.round(totalWallArea / 16) : Math.round(totalWallArea / 40);

  // Primer Coverage: 1 Liter covers approx 110 sq.ft for 1 coat
  const primerLiters = Math.round(totalWallArea / 110);

  // Paint (Emulsion) Coverage: 1 Liter covers approx 60 sq.ft for 2 coats
  const paintLiters = Math.round(totalWallArea / 60);

  // Cost Approximations per Liter based on Tier
  const ratePerLiter = qualityTier === 'LUXURY' ? 490 : qualityTier === 'PREMIUM' ? 320 : 180;
  const estimatedPaintCost = paintLiters * ratePerLiter;
  const estimatedPrimerCost = primerLiters * 145;
  const estimatedPuttyCost = puttyKg * 22;
  const estimatedToolsCost = 1500; // Rollers, brushes, sandpaper
  const totalEstimate = Math.round(estimatedPaintCost + estimatedPrimerCost + estimatedPuttyCost + estimatedToolsCost);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 px-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Square-Foot Area & Paint Estimator</h2>
              <p className="text-xs text-slate-400">Calculate Putty (kg), Primer (L), and Emulsion (L) required</p>
            </div>
          </div>
          <button onClick={closeEstimatorModal} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs & Parameters */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Carpet Area (Sq.Ft)
              </label>
              <input
                type="number"
                value={carpetArea}
                onChange={(e) => setCarpetArea(Math.max(10, Number(e.target.value)))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ceiling Height (Feet)
              </label>
              <input
                type="number"
                value={wallHeight}
                onChange={(e) => setWallHeight(Math.max(7, Number(e.target.value)))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Project / Site Label
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Surface Condition</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSurfaceType('FRESH_PLASTER')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    surfaceType === 'FRESH_PLASTER'
                      ? 'border-violet-600 bg-violet-50 text-violet-700 ring-2 ring-violet-500'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-4 h-4" /> Fresh Plaster
                </button>
                <button
                  type="button"
                  onClick={() => setSurfaceType('REPAINTING')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    surfaceType === 'REPAINTING'
                      ? 'border-violet-600 bg-violet-50 text-violet-700 ring-2 ring-violet-500'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Layers className="w-4 h-4" /> Repainting Walls
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Paint Quality Tier</label>
              <div className="grid grid-cols-3 gap-2">
                {(['ECONOMY', 'PREMIUM', 'LUXURY'] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setQualityTier(tier)}
                    className={`p-3 rounded-xl border text-xs font-bold text-center transition ${
                      qualityTier === tier
                        ? 'border-violet-600 bg-violet-50 text-violet-700 ring-2 ring-violet-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Summary Cards */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Estimated Paintable Wall Area</span>
              <span className="text-sm font-bold font-mono text-slate-800">{totalWallArea.toLocaleString()} Sq.Ft</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-semibold text-slate-500">Wall Putty (2 Coats)</div>
                <div className="text-lg font-bold font-mono text-indigo-600 mt-1">{puttyKg} kg</div>
                <div className="text-[10px] text-slate-400">≈ {Math.ceil(puttyKg / 40)} bags (40kg)</div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-semibold text-slate-500">Wall Primer (1 Coat)</div>
                <div className="text-lg font-bold font-mono text-emerald-600 mt-1">{primerLiters} Liters</div>
                <div className="text-[10px] text-slate-400">≈ {Math.ceil(primerLiters / 20)} can (20L)</div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-semibold text-slate-500">Topcoat Paint (2 Coats)</div>
                <div className="text-lg font-bold font-mono text-amber-600 mt-1">{paintLiters} Liters</div>
                <div className="text-[10px] text-slate-400">≈ {Math.ceil(paintLiters / 20)} can (20L)</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Estimated Total Material Cost</div>
                <div className="text-xl font-bold font-mono text-slate-900">₹{totalEstimate.toLocaleString('en-IN')}</div>
              </div>
              <button
                type="button"
                onClick={closeEstimatorModal}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                Done <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
