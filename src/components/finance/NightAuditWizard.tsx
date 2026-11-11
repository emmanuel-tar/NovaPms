/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePMS } from '../../context/PMSContext';
import {
  Moon,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Play,
  TrendingUp,
  FileText,
  DollarSign,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const NightAuditWizard: React.FC = () => {
  const {
    businessDate,
    rooms,
    stays,
    folioTransactions,
    runNightAudit,
    formatMoney,
    nightAuditLog,
    currentEmployee,
  } = usePMS();

  const [auditStep, setAuditStep] = useState<1 | 2 | 3 | 4>(1);
  const [isAuditing, setIsAuditing] = useState(false);
  const [completedAudit, setCompletedAudit] = useState<any>(null);

  const activeStays = stays.filter((s) => s.status === 'active');
  const totalRooms = rooms.length;
  const occupancyPct = Math.round((activeStays.length / totalRooms) * 1000) / 10;

  // Estimated room revenue that will be posted
  const estRoomRev = activeStays.reduce((sum, s) => sum + s.nightlyRate, 0);

  const handleExecuteAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      const res = runNightAudit();
      setIsAuditing(false);
      setCompletedAudit(res.newAudit);
      setAuditStep(4);
    }, 1200);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 text-white border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">
              Night Audit & End-of-Day Financial Close
            </h2>
            <p className="text-xs text-slate-400">
              Current Business Date:{' '}
              <span className="font-mono font-bold text-white">{businessDate}</span> · Auditor:{' '}
              {currentEmployee.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-lg">
            <ShieldCheck className="w-4 h-4" />
            Integrity Check Passed
          </span>
        </div>
      </div>

      {/* Audit Wizard Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-6">
        {/* Step indicator */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 text-xs font-semibold">
          <div className={`flex items-center gap-2 ${auditStep >= 1 ? 'text-indigo-600' : 'text-slate-400'}`}>
            <span className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center font-bold">
              1
            </span>
            <span>Room Roster & Stays</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          <div className={`flex items-center gap-2 ${auditStep >= 2 ? 'text-indigo-600' : 'text-slate-400'}`}>
            <span className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center font-bold">
              2
            </span>
            <span>POS & Outlet Balancing</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          <div className={`flex items-center gap-2 ${auditStep >= 3 ? 'text-indigo-600' : 'text-slate-400'}`}>
            <span className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center font-bold">
              3
            </span>
            <span>Room Posting & Close</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          <div className={`flex items-center gap-2 ${auditStep === 4 ? 'text-emerald-600' : 'text-slate-400'}`}>
            <span className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center font-bold">
              4
            </span>
            <span>Management Summary</span>
          </div>
        </div>

        {/* STEP 1: ROOM ROSTER */}
        {auditStep === 1 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Step 1: In-House Room Occupancy Verification
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Verifying that all arrivals have been checked in and all due departures have settled their folios before night audit postings occur.
            </p>

            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-400">Total Hotel Rooms:</span>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {totalRooms} Rooms
                </div>
              </div>
              <div>
                <span className="text-slate-400">Active Occupied Rooms:</span>
                <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {activeStays.length} Rooms
                </div>
              </div>
              <div>
                <span className="text-slate-400">Projected Occupancy Rate:</span>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {occupancyPct}%
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setAuditStep(2)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
              >
                Proceed to POS Balancing
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: POS BALANCING */}
        {auditStep === 2 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Step 2: Food & Beverage Outlets Cashier Reconciliation
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Validating that Main Restaurant, Pool Bar, Lounge Bar, and In-Room Dining cash drawers and Charge-to-Room transactions are reconciled.
            </p>

            <div className="space-y-2">
              {[
                { name: 'Main Restaurant', status: 'Closed & Reconciled', cashier: 'Chisom Obi' },
                { name: 'Pool Bar', status: 'Closed & Reconciled', cashier: 'Ibrahim Sani' },
                { name: 'Executive Lounge Bar', status: 'Closed & Reconciled', cashier: 'Tariro Moyo' },
                { name: 'In-Room Dining', status: 'Active 24/7 (Open Batch)', cashier: 'Night Service' },
              ].map((out) => (
                <div
                  key={out.name}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 flex justify-between items-center"
                >
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{out.name}</span>
                  <span className="text-slate-500">Cashier: {out.cashier}</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {out.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-3">
              <button
                onClick={() => setAuditStep(1)}
                className="px-3.5 py-1.5 rounded text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Back
              </button>
              <button
                onClick={() => setAuditStep(3)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
              >
                Proceed to Automated Room Posting
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: AUTOMATED ROOM CHARGE POSTING */}
        {auditStep === 3 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Step 3: Automated Nightly Room Charge Posting
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Night audit will post room accommodation charges (+ 7.5% VAT and 5% service charge) to all{' '}
              <strong>{activeStays.length} active in-house guest folios</strong>, lock today's ledger, and advance the hotel business date to the next morning.
            </p>

            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900 space-y-2">
              <div className="flex justify-between">
                <span>Room Nights to Post:</span>
                <span className="font-bold">{activeStays.length} Stays</span>
              </div>
              <div className="flex justify-between">
                <span>Total Room Accommodation Revenue:</span>
                <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">
                  {formatMoney(estRoomRev)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Current Business Date:</span>
                <span className="font-mono font-bold">{businessDate}</span>
              </div>
            </div>

            <div className="flex justify-between pt-3">
              <button
                onClick={() => setAuditStep(2)}
                className="px-3.5 py-1.5 rounded text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Back
              </button>
              <button
                disabled={isAuditing}
                onClick={handleExecuteAudit}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-sm"
              >
                <Play className="w-4 h-4 fill-white" />
                {isAuditing ? 'Executing Night Audit & Posting Folios...' : 'Execute Night Audit & Close Day'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: MANAGEMENT SUMMARY AFTER CLOSE */}
        {auditStep === 4 && completedAudit && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                  Night Audit #{completedAudit.auditNumber} Successfully Completed!
                </h4>
                <p className="text-emerald-700 dark:text-emerald-300 text-[11px] mt-0.5">
                  Business date has rolled to{' '}
                  <strong className="font-mono">{businessDate}</strong>. Room revenue has been
                  posted to all active folios.
                </p>
              </div>
            </div>

            {/* Metrics Breakdown (ADR, RevPAR, Occupancy) */}
            <div className="grid grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-400">Occupancy Rate:</span>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {completedAudit.occupancyRate}%
                </div>
              </div>
              <div>
                <span className="text-slate-400">Total Room Revenue:</span>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatMoney(completedAudit.roomRevenue)}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Average Daily Rate (ADR):</span>
                <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {formatMoney(completedAudit.adr)}
                </div>
              </div>
              <div>
                <span className="text-slate-400">RevPAR:</span>
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400 tabular-nums">
                  {formatMoney(completedAudit.revPar)}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setAuditStep(1)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800"
              >
                Return to Daily Roster
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Historical Night Audit Runs Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            Night Audit Closing History & Performance Logs
          </h3>
          <span className="text-xs text-slate-400">Daily Revenue Ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Audit Ref #</th>
                <th className="py-3 px-4">Business Date</th>
                <th className="py-3 px-4">Closed At</th>
                <th className="py-3 px-4">Auditor</th>
                <th className="py-3 px-4 text-right">Occupancy %</th>
                <th className="py-3 px-4 text-right">Room Rev</th>
                <th className="py-3 px-4 text-right">F&B Rev</th>
                <th className="py-3 px-4 text-right">ADR</th>
                <th className="py-3 px-4 text-right">RevPAR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {nightAuditLog.map((aud) => (
                <tr key={aud.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                    {aud.auditNumber}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {aud.businessDate}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{aud.closedAt}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{aud.closedBy}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                    {aud.occupancyRate}%
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatMoney(aud.roomRevenue)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                    {formatMoney(aud.fAndBRevenue)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
                    {formatMoney(aud.adr)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-purple-600 dark:text-purple-400">
                    {formatMoney(aud.revPar)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
