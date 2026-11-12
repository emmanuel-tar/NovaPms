/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePMS } from '../../context/PMSContext';
import {
  Clock,
  DollarSign,
  FileText,
  UserCheck,
  CheckCircle2,
  X,
  Printer,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface ShiftHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShiftHandoverModal: React.FC<ShiftHandoverModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    currentEmployee,
    employees,
    businessDate,
    folioPayments,
    formatMoney,
    currency,
    showToast,
  } = usePMS();

  const [shiftType, setShiftType] = useState<'morning' | 'afternoon' | 'night'>('morning');
  const [openingFloat, setOpeningFloat] = useState<number>(100000);
  const [actualCashCounted, setActualCashCounted] = useState<number>(100000);
  const [incomingEmployeeId, setIncomingEmployeeId] = useState<string>(
    employees.find((e) => e.id !== currentEmployee.id)?.id || ''
  );
  const [masterKeysCount, setMasterKeysCount] = useState<number>(4);
  const [handoverNotes, setHandoverNotes] = useState<string>(
    'All active room keys accounted for. Suite 402 requested 6:00 AM wake-up call and airport shuttle. 2 VIP arrivals expected on afternoon shift.'
  );
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Compute shift cash & card collections
  const todayCashPayments = folioPayments
    .filter((p) => p.paymentMethod === 'cash')
    .reduce((sum, p) => sum + p.amount, 0);

  const todayCardPayments = folioPayments
    .filter((p) => p.paymentMethod === 'pos_card')
    .reduce((sum, p) => sum + p.amount, 0);

  const expectedCashInDrawer = openingFloat + todayCashPayments;
  const variance = actualCashCounted - expectedCashInDrawer;

  if (!isOpen) return null;

  const handleCompleteHandover = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCompleted(true);
    showToast('Shift handover logged and verified with incoming receptionist!', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Front Desk Shift Handover & Cash Float Drawer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official cashier turnover, cash float reconciliation, and operational handover
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Shift & Staff Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Completed Shift *
              </label>
              <select
                value={shiftType}
                onChange={(e) => setShiftType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
              >
                <option value="morning">Morning (07:00 – 15:00)</option>
                <option value="afternoon">Afternoon / Evening (15:00 – 23:00)</option>
                <option value="night">Night Audit (23:00 – 07:00)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Outgoing Cashier / Agent
              </label>
              <div className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 font-semibold text-slate-800 dark:text-slate-200 truncate">
                {currentEmployee.name} ({currentEmployee.title})
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Incoming Cashier / Agent *
              </label>
              <select
                value={incomingEmployeeId}
                onChange={(e) => setIncomingEmployeeId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.title})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cash Drawer & Reconciliation Cards */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-950/40 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Cash Drawer Float & Payment Reconciliation
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Opening Float</span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {formatMoney(openingFloat)}
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Cash Received</span>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  +{formatMoney(todayCashPayments)}
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">POS Card Total</span>
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {formatMoney(todayCardPayments)}
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Expected Cash</span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {formatMoney(expectedCashInDrawer)}
                </p>
              </div>
            </div>

            {/* Actual count input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Physical Cash Counted in Drawer ({currency}) *
                </label>
                <input
                  type="number"
                  step="500"
                  value={actualCashCounted}
                  onChange={(e) => setActualCashCounted(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cash Balance Discrepancy / Variance
                </label>
                <div
                  className={`px-3 py-2 text-xs font-bold rounded-lg border flex items-center justify-between ${
                    variance === 0
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800'
                      : variance > 0
                      ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800'
                      : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800'
                  }`}
                >
                  <span>{variance === 0 ? 'PERFECT BALANCE (0.00)' : variance > 0 ? 'OVERAGE' : 'SHORTAGE'}</span>
                  <span className="tabular-nums">{formatMoney(variance)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key inventory & physical assets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Master RFID Keycards Handed Over
              </label>
              <input
                type="number"
                min="0"
                value={masterKeysCount}
                onChange={(e) => setMasterKeysCount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Emergency Safe Keys & POS Card Terminals
              </label>
              <div className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Safe Keybox: Locked & Sealed</span>
                <span className="font-bold text-emerald-600">2 POS Wireless Terminals Online</span>
              </div>
            </div>
          </div>

          {/* Operational handover notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Important Shift Briefing & Guest Follow-Up Notes *
            </label>
            <textarea
              rows={3}
              value={handoverNotes}
              onChange={(e) => setHandoverNotes(e.target.value)}
              placeholder="Record any guest requests, early wake-up calls, airport shuttles, or maintenance issues..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 leading-relaxed outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {isCompleted && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-emerald-900 dark:text-emerald-200">
                  Shift Handover Verified & Digitally Countersigned
                </span>
                <p className="text-emerald-700 dark:text-emerald-300 mt-0.5">
                  Logged on {businessDate} by {currentEmployee.name} to{' '}
                  {employees.find((e) => e.id === incomingEmployeeId)?.name}.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={handlePrint}
            className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Print Handover Sheet
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Close
            </button>
            {!isCompleted ? (
              <button
                onClick={handleCompleteHandover}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Sign & Finalize Handover
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold bg-slate-800 text-white rounded-lg"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
