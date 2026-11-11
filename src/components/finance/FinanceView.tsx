/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePMS } from '../../context/PMSContext';
import { Stay } from '../../types/pms';
import { GuestFolioModal } from '../frontdesk/GuestFolioModal';
import {
  Receipt,
  Building,
  DollarSign,
  TrendingUp,
  CreditCard,
  FileSpreadsheet,
  PieChart,
} from 'lucide-react';

export const FinanceView: React.FC = () => {
  const {
    folioTransactions,
    folioPayments,
    corporateAccounts,
    stays,
    rooms,
    formatMoney,
    businessDate,
  } = usePMS();

  const [selectedStayForFolio, setSelectedStayForFolio] = useState<Stay | null>(null);

  // Financial aggregates
  const totalBilled = folioTransactions
    .filter((t) => t.status === 'posted')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const totalCollected = folioPayments.reduce((sum, p) => sum + p.amount, 0);

  const totalTaxVat = folioTransactions
    .filter((t) => t.status === 'posted')
    .reduce((sum, t) => sum + (t.totalAmount - t.taxAmount) * t.vatRate, 0);

  const totalServiceCharge = folioTransactions
    .filter((t) => t.status === 'posted')
    .reduce((sum, t) => sum + (t.totalAmount - t.taxAmount) * t.serviceChargeRate, 0);

  // Revenue by department
  const departmentRevenue = folioTransactions
    .filter((t) => t.status === 'posted')
    .reduce((acc, t) => {
      acc[t.department] = (acc[t.department] || 0) + t.totalAmount;
      return acc;
    }, {} as Record<string, number>);

  const activeStays = stays.filter((s) => s.status === 'active');

  return (
    <div className="space-y-5">
      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Total Billed Charges</div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
            {formatMoney(totalBilled)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across all departments</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Payments & Deposits Collected</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            {formatMoney(totalCollected)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Cash, POS, Transfers & Credit</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500">VAT Collected (7.5%)</div>
          <div className="text-xl font-bold text-slate-700 dark:text-slate-300 mt-1 tabular-nums">
            {formatMoney(totalTaxVat)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">FIRS statutory remit</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Service Charge (5%)</div>
          <div className="text-xl font-bold text-slate-700 dark:text-slate-300 mt-1 tabular-nums">
            {formatMoney(totalServiceCharge)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Staff hospitality pool</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 6 Cols: Department Revenue Breakdown */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              Consolidated Department Revenue
            </h3>
            <span className="text-xs text-slate-400 font-mono">Ledger Central</span>
          </div>

          <div className="space-y-3">
            {Object.entries(departmentRevenue).map(([dept, amount]) => {
              const pct = totalBilled > 0 ? Math.round((amount / totalBilled) * 100) : 0;
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{dept}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-[11px]">{pct}%</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                        {formatMoney(amount)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 6 Cols: Corporate Credit Accounts */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              Approved Corporate Accounts & Credit Limits
            </h3>
            <span className="text-xs text-slate-400 font-mono">B2B Master Accounts</span>
          </div>

          <div className="space-y-3">
            {corporateAccounts.map((corp) => {
              const utilizedPct = Math.round((corp.currentBalance / corp.creditLimit) * 100);
              return (
                <div
                  key={corp.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-1.5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {corp.companyName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {corp.rcNumber} · Contact: {corp.contactPerson}
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded uppercase">
                      {corp.status}
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] pt-1">
                    <span>
                      Credit Limit: <strong>{formatMoney(corp.creditLimit)}</strong> ({corp.creditPeriodDays} days)
                    </span>
                    <span className="font-bold tabular-nums text-slate-900 dark:text-slate-100">
                      Balance Due: {formatMoney(corp.currentBalance)} ({utilizedPct}%)
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        utilizedPct > 80 ? 'bg-rose-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${utilizedPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Guest Ledgers Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-600" />
            Active Guest Folio Accounts & Balances
          </h3>
          <span className="text-xs text-slate-500">
            {activeStays.length} In-House Guest Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Room #</th>
                <th className="py-3 px-4">Guest Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Stay Duration</th>
                <th className="py-3 px-4 text-right">Total Charges</th>
                <th className="py-3 px-4 text-right">Deposits Paid</th>
                <th className="py-3 px-4 text-right">Net Balance Due</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeStays.map((stay) => {
                const charges = folioTransactions
                  .filter((t) => t.stayId === stay.id && t.status === 'posted')
                  .reduce((sum, t) => sum + t.totalAmount, 0);
                const payments = folioPayments
                  .filter((p) => p.stayId === stay.id)
                  .reduce((sum, p) => sum + p.amount, 0);
                const balance = charges - payments;

                return (
                  <tr key={stay.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {stay.roomNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {stay.guestName}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {stay.roomCategory}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                      {stay.checkInDate} &rarr; {stay.checkOutDate}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {formatMoney(charges)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {formatMoney(payments)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-bold tabular-nums ${
                        balance > 100
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {balance <= 100 ? '₦0 (Settled)' : formatMoney(balance)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedStayForFolio(stay)}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors"
                      >
                        Open Folio
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStayForFolio && (
        <GuestFolioModal
          stay={selectedStayForFolio}
          onClose={() => setSelectedStayForFolio(null)}
        />
      )}
    </div>
  );
};
