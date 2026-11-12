/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useUITemplate, UI_TEMPLATES, UITemplateId } from '../../context/UITemplateContext';
import {
  Palette,
  X,
  CheckCircle2,
  Sparkles,
  LayoutGrid,
  Laptop,
  Smartphone,
  Check,
  Zap,
  Shield,
  Eye,
} from 'lucide-react';

export const UITemplateModal: React.FC = () => {
  const { currentTemplate, setTemplate, isTemplateModalOpen, closeTemplateModal } = useUITemplate();

  if (!isTemplateModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Hotel PMS UI Template Selector</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Live Skin Engine
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Switch operational UI template to tailor layout density, color accents, and typography for specific hotel workstations.
              </p>
            </div>
          </div>
          <button
            onClick={closeTemplateModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {UI_TEMPLATES.map((tmpl) => {
              const isSelected = currentTemplate === tmpl.id;

              return (
                <div
                  key={tmpl.id}
                  onClick={() => setTemplate(tmpl.id)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative flex flex-col justify-between text-left ${
                    isSelected
                      ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/90 hover:shadow-xs'
                  }`}
                >
                  {/* Top Bar with Accent & Badge */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: tmpl.accentColor }}
                        />
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {tmpl.name}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {tmpl.badge}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                      {tmpl.tagline}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      {tmpl.description}
                    </p>
                  </div>

                  {/* Operational Best For & Mini Visual Preview */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                    <div className="text-[11px] text-slate-500 flex items-start gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>
                        <strong>Best for:</strong> {tmpl.bestFor}
                      </span>
                    </div>

                    {/* Miniature Theme Style Simulation Bar */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-100/70 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-lg">
                      <span>Density: <strong className="text-slate-700 dark:text-slate-300 capitalize">{tmpl.density}</strong></span>
                      <span>Typography: <strong className="text-slate-700 dark:text-slate-300">{tmpl.fontStyle}</strong></span>
                      {isSelected ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 hover:text-slate-700">Click to Apply</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-400" />
              <span>Your template preference is automatically saved locally for this workstation.</span>
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Active: {UI_TEMPLATES.find((t) => t.id === currentTemplate)?.name}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <span className="text-xs text-slate-500">
            Hotel terminal standard: Grand Vista On-Premise LAN & Cloud
          </span>
          <button
            onClick={closeTemplateModal}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
