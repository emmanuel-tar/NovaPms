/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRBAC } from '../../context/RBACContext';
import { CashierShift } from '../../types/rbac';
import {
  Coins,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Plus,
  Clock,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';

export const CashierReconciliationView: React.FC = () => {
  const {
    cashierShifts,
    openCashierShift,
    reconcileCashierShift,
    closeCashierShift,
  } = useRBAC();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState({ id: 'outlet-main', name: 'Azure Grand Restaurant (Main Dining)' });
  const [openingCash, setOpeningCash] = useState(50000);

  // Reconciliation Modal
  const [reconcilingShift, setReconcilingShift] = useState<CashierShift | null>(null);
  const [actualCash, setActualCash] = useState<number>(0);
  const [supervisorNotes, setSupervisorNotes] = useState('');

  const OUTLETS = [
    { id: 'outlet-main', name: 'Azure Grand Restaurant (Main Dining)' },
    { id: 'outlet-rooftop', name: 'Skyline Rooftop Lounge & Cocktail Bar' },
    { id: 'outlet-pool', name: 'Lagoon Poolside Bar & Grill' },
    { id: 'outlet-frontdesk', name: 'Front Desk Main Cashier Folio' },
  ];

  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    openCashierShift(selectedOutlet.id, selectedOutlet.name, Number(openingCash));
    setIsNewModalOpen(false);
  };

  const handleExecuteReconciliation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reconcilingShift) return;

    reconcileCashierShift(reconcilingShift.id, Number(actualCash), supervisorNotes);
    closeCashierShift(reconcilingShift.id);
    setReconcilingShift(null);
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-600" />
            <span>POS & Front Desk Cashier Shifts</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict opening float verification, continuous cash drawer accounting, and blind end-of-shift reconciliation.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Open Cashier Shift</span>
        </button>
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cashierShifts.map((shift) => {
          const isOpen = shift.status === 'open';

          return (
            <div
              key={shift.id}
              className={`p-5 rounded-2xl border transition-all ${
                isOpen
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                    {shift.shiftNumber}
                  </div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                    {shift.outletName}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Cashier: <strong className="text-slate-700 dark:text-slate-300">{shift.cashierName}</strong>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isOpen
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {shift.status}
                </span>
              </div>

              {/* Financial Metrics */}
              <div className="mt-4 space-y-1.5 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Opening Float:</span>
                  <span className="font-mono font-semibold">₦{shift.openingCash.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cash Sales:</span>
                  <span className="font-mono text-emerald-600 font-semibold">+₦{shift.cashSales.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Card / Transfers:</span>
                  <span className="font-mono text-blue-600">₦{shift.nonCashSales.toLocaleString()}</span>
                </div>
                {shift.refundsTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Refunds:</span>
                    <span className="font-mono text-rose-600">-₦{shift.refundsTotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-bold">Expected Drawer Cash:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    ₦{shift.expectedCash.toLocaleString()}
                  </span>
                </div>

                {shift.status === 'closed' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Actual Counted:</span>
                      <span className="font-mono font-bold">₦{(shift.actualCash || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Variance:</span>
                      <span
                        className={`font-mono font-bold ${
                          (shift.variance || 0) === 0
                            ? 'text-emerald-600'
                            : (shift.variance || 0) < 0
                            ? 'text-rose-600'
                            : 'text-blue-600'
                        }`}
                      >
                        {(shift.variance || 0) >= 0 ? '+' : ''}₦{(shift.variance || 0).toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Action Button */}
              {isOpen && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setReconcilingShift(shift);
                      setActualCash(shift.expectedCash);
                      setSupervisorNotes('');
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    Close Shift & Reconcile Cash
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Open Shift Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Open Cashier Station Shift
              </h3>
              <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOpenShift} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Outlet Station *</label>
                <select
                  value={selectedOutlet.id}
                  onChange={(e) => {
                    const found = OUTLETS.find((o) => o.id === e.target.value);
                    if (found) setSelectedOutlet(found);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                >
                  {OUTLETS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Verified Opening Cash Float (₦ NGN) *
                </label>
                <input
                  type="number"
                  required
                  step={1000}
                  value={openingCash}
                  onChange={(e) => setOpeningCash(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-emerald-600"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Physically counted float provided by Accounts/General Cashier.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Open Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* End of Shift Reconciliation Modal */}
      {reconcilingShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>Reconcile Shift #{reconcilingShift.shiftNumber}</span>
              </h3>
              <button onClick={() => setReconcilingShift(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteReconciliation} className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Expected Drawer Cash:</span>
                  <span className="font-mono font-bold text-emerald-600">
                    ₦{reconcilingShift.expectedCash.toLocaleString()}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  (Opening float ₦{reconcilingShift.openingCash.toLocaleString()} + Cash sales ₦{reconcilingShift.cashSales.toLocaleString()} - Refunds ₦{reconcilingShift.refundsTotal.toLocaleString()})
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Actual Physical Cash Counted (₦ NGN) *
                </label>
                <input
                  type="number"
                  required
                  step={100}
                  value={actualCash}
                  onChange={(e) => setActualCash(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Variance Display */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="font-semibold">Calculated Drawer Variance:</span>
                <span
                  className={`font-mono font-bold text-sm ${
                    actualCash - reconcilingShift.expectedCash === 0
                      ? 'text-emerald-600'
                      : actualCash - reconcilingShift.expectedCash < 0
                      ? 'text-rose-600'
                      : 'text-blue-600'
                  }`}
                >
                  {actualCash - reconcilingShift.expectedCash >= 0 ? '+' : ''}₦
                  {(actualCash - reconcilingShift.expectedCash).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Supervisor Endorsement / Variance Explanation
                </label>
                <textarea
                  rows={2}
                  value={supervisorNotes}
                  onChange={(e) => setSupervisorNotes(e.target.value)}
                  placeholder="e.g. Verified by Night Duty Manager. Safe drop bag #882."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReconcilingShift(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Finalize & Close Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
