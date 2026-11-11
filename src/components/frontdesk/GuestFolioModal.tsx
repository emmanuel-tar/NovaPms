/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePMS } from '../../context/PMSContext';
import { Stay, FolioTransaction } from '../../types/pms';
import {
  X,
  Printer,
  CreditCard,
  PlusCircle,
  LogOut,
  Building,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Receipt,
} from 'lucide-react';

interface GuestFolioModalProps {
  stay: Stay;
  onClose: () => void;
}

export const GuestFolioModal: React.FC<GuestFolioModalProps> = ({ stay, onClose }) => {
  const {
    folioTransactions,
    folioPayments,
    formatMoney,
    addPaymentToFolio,
    checkOutGuest,
    postChargeToRoom,
    currentUser,
    corporateAccounts,
    showToast,
  } = usePMS();

  const [activeTab, setActiveTab] = useState<'charges' | 'payments' | 'print'>('charges');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'pos_card' | 'bank_transfer' | 'corporate_credit'>('pos_card');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [selectedCorpId, setSelectedCorpId] = useState<string>(corporateAccounts[0]?.id || '');

  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const [adjDesc, setAdjDesc] = useState('');
  const [adjDept, setAdjDept] = useState<'Front Desk' | 'Main Restaurant' | 'Laundry' | 'Minibar'>('Front Desk');
  const [adjAmount, setAdjAmount] = useState<number>(0);

  // Filter transactions for this stay
  const transactions = folioTransactions.filter(
    (t) => t.stayId === stay.id && t.status === 'posted'
  );
  const payments = folioPayments.filter((p) => p.stayId === stay.id);

  const totalCharges = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalTax = transactions.reduce((sum, t) => sum + t.taxAmount, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const balanceOutstanding = totalCharges - totalPaid;

  // Breakdown by department (matches prompt table!)
  const departmentBreakdown = transactions.reduce((acc, t) => {
    acc[t.department] = (acc[t.department] || 0) + t.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) {
      showToast('Please enter a valid payment amount', 'error');
      return;
    }
    addPaymentToFolio(stay.id, paymentAmount, paymentMethod, paymentRef, paymentMethod === 'corporate_credit' ? selectedCorpId : undefined);
    setShowPaymentForm(false);
    setPaymentAmount(0);
    setPaymentRef('');
  };

  const handlePostAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (adjAmount <= 0 || !adjDesc) {
      showToast('Please provide a description and amount', 'error');
      return;
    }
    postChargeToRoom(stay.id, adjDept, `Manual Adjustment: ${adjDesc}`, 1, adjAmount, 0);
    setShowAdjustmentForm(false);
    setAdjDesc('');
    setAdjAmount(0);
  };

  const handleCheckoutClick = () => {
    if (balanceOutstanding > 100) {
      showToast(`Please settle outstanding balance of ${formatMoney(balanceOutstanding)} first.`, 'warning');
      setPaymentAmount(balanceOutstanding);
      setShowPaymentForm(true);
      return;
    }
    checkOutGuest(stay.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                Room {stay.roomNumber}
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Consolidated Guest Folio — {stay.guestName}
              </h2>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-x-3">
              <span>Category: <strong>{stay.roomCategory}</strong></span>
              <span>·</span>
              <span>Stay: <strong>{stay.checkInDate} to {stay.checkOutDate}</strong></span>
              <span>·</span>
              <span>Phone: <strong>{stay.guestPhone}</strong></span>
              <span>·</span>
              <span>Folio ID: <strong className="font-mono">{stay.id}</strong></span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial KPI Summary Bar */}
        <div className="grid grid-cols-4 gap-4 px-6 py-3.5 bg-slate-100/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <div className="text-slate-500 dark:text-slate-400 font-medium">Department Charges</div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {formatMoney(totalCharges)}
            </div>
          </div>
          <div>
            <div className="text-slate-500 dark:text-slate-400 font-medium">Included Taxes (VAT+SC)</div>
            <div className="text-base font-bold text-slate-600 dark:text-slate-300 tabular-nums">
              {formatMoney(totalTax)}
            </div>
          </div>
          <div>
            <div className="text-slate-500 dark:text-slate-400 font-medium">Deposits & Payments</div>
            <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatMoney(totalPaid)}
            </div>
          </div>
          <div>
            <div className="text-slate-500 dark:text-slate-400 font-medium">Outstanding Balance</div>
            <div
              className={`text-base font-bold tabular-nums ${
                balanceOutstanding > 100
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {balanceOutstanding <= 100 ? '₦0 (Settled)' : formatMoney(balanceOutstanding)}
            </div>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center justify-between px-6 pt-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('charges')}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'charges'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Itemized Charges ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'payments'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Payments & Deposits ({payments.length})
            </button>
            <button
              onClick={() => setActiveTab('print')}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'print'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Official Folio Statement (Print)
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <button
              onClick={() => setShowAdjustmentForm(true)}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 transition-colors flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Post Charge / Adjust
            </button>
            <button
              onClick={() => {
                setPaymentAmount(balanceOutstanding > 0 ? balanceOutstanding : 50000);
                setShowPaymentForm(true);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Settle Payment
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Post Payment Form Modal overlay */}
          {showPaymentForm && (
            <div className="mb-6 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  Record Folio Payment / Settlement
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>
              <form onSubmit={handleProcessPayment} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="pos_card">POS Terminal Card</option>
                    <option value="cash">Cash Tender</option>
                    <option value="bank_transfer">Instant Bank Transfer</option>
                    <option value="corporate_credit">Corporate Account Credit</option>
                  </select>
                </div>

                {paymentMethod === 'corporate_credit' && (
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">Corporate Account</label>
                    <select
                      value={selectedCorpId}
                      onChange={(e) => setSelectedCorpId(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      {corporateAccounts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.companyName} (Limit: {formatMoney(c.creditLimit)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Amount (₦)</label>
                  <input
                    type="number"
                    min="1"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Transaction Ref / Slip #</label>
                  <input
                    type="text"
                    placeholder="e.g. STANBIC-POS-9812"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-1.5 px-3 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700 transition-colors"
                  >
                    Post Payment ({formatMoney(paymentAmount)})
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Post Adjustment Form */}
          {showAdjustmentForm && (
            <div className="mb-6 p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-blue-600" />
                  Post Manual Department Charge or Adjustment
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAdjustmentForm(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>
              <form onSubmit={handlePostAdjustment} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Department</label>
                  <select
                    value={adjDept}
                    onChange={(e: any) => setAdjDept(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Front Desk">Front Desk</option>
                    <option value="Main Restaurant">Main Restaurant</option>
                    <option value="Laundry">Laundry</option>
                    <option value="Minibar">Minibar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Description / Reason</label>
                  <input
                    type="text"
                    placeholder="e.g. Extra Bed Charge / Late checkout fee"
                    value={adjDesc}
                    onChange={(e) => setAdjDesc(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Amount (₦)</label>
                  <input
                    type="number"
                    min="1"
                    value={adjAmount}
                    onChange={(e) => setAdjAmount(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-1.5 px-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-colors"
                  >
                    Confirm Charge
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 1: CHARGES TABLE */}
          {activeTab === 'charges' && (
            <div className="space-y-6">
              {/* Department breakdown pills */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Department Consolidated Summary
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {Object.entries(departmentBreakdown).map(([dept, amount]) => (
                    <div
                      key={dept}
                      className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between items-center"
                    >
                      <span className="text-slate-600 dark:text-slate-300 font-medium truncate">{dept}</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                        {formatMoney(amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Date/Time</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-right">Tax (12.5%)</th>
                      <th className="py-2.5 px-3 text-right">Net Total</th>
                      <th className="py-2.5 px-3">Posted By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400">
                          No charges recorded on this folio yet.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-mono text-slate-500 tabular-nums whitespace-nowrap">
                            {t.createdAt}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {t.department}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 max-w-xs truncate text-slate-700 dark:text-slate-300">
                            {t.description}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-500 tabular-nums whitespace-nowrap">
                            {formatMoney(t.taxAmount)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap">
                            {formatMoney(t.totalAmount)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px] truncate">{t.postedBy}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: PAYMENTS TABLE */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Date / Time</th>
                      <th className="py-2.5 px-3">Payment Method</th>
                      <th className="py-2.5 px-3">Reference / Slip</th>
                      <th className="py-2.5 px-3 text-right">Amount Paid</th>
                      <th className="py-2.5 px-3">Cashier / Staff</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400">
                          No payments or deposits recorded yet.
                        </td>
                      </tr>
                    ) : (
                      payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-mono text-slate-500 tabular-nums whitespace-nowrap">
                            {p.createdAt}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200 uppercase">
                            {p.paymentMethod.replace('_', ' ')}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                            {p.reference || '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                            {formatMoney(p.amount)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px]">{p.receivedBy}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PRINTABLE FOLIO STATEMENT (Official Invoice) */}
          {activeTab === 'print' && (
            <div className="bg-white text-slate-900 p-6 rounded-lg border border-slate-300 shadow-sm font-sans text-xs">
              {/* Hotel Header */}
              <div className="flex justify-between items-start border-b border-slate-300 pb-4 mb-4">
                <div>
                  <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                    GRAND VISTA HOTEL & SUITES
                  </h1>
                  <p className="text-slate-500 text-[11px]">Plot 1402, Victoria Island Boulevard, Lagos, Nigeria</p>
                  <p className="text-slate-500 text-[11px]">TIN: 10492810-0001 · Phone: +234 1 280 4400</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-800">TAX INVOICE / GUEST FOLIO</div>
                  <div className="font-mono text-slate-500">INV-GV-{stay.roomNumber}-{Date.now().toString().slice(-4)}</div>
                  <div className="text-slate-500 mt-1">Date: {new Date().toLocaleDateString('en-GB')}</div>
                </div>
              </div>

              {/* Guest & Stay Details */}
              <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-3 mb-4 text-[11px]">
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Guest Details</span>
                  <span className="font-bold text-sm text-slate-900 block">{stay.guestName}</span>
                  <span className="text-slate-600 block">Phone: {stay.guestPhone}</span>
                  <span className="text-slate-600 block">Room: {stay.roomNumber} ({stay.roomCategory})</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Stay Schedule</span>
                  <span className="text-slate-700 block">Arrival: <strong>{stay.checkInDate}</strong></span>
                  <span className="text-slate-700 block">Departure: <strong>{stay.checkOutDate}</strong></span>
                  <span className="text-slate-700 block">Total Nights: 3 Nights</span>
                </div>
              </div>

              {/* Departmental breakdown summary table */}
              <table className="w-full text-left mb-4 border border-slate-200 text-xs">
                <thead className="bg-slate-100 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2">Department</th>
                    <th className="p-2">Description</th>
                    <th className="p-2 text-right">Tax Component</th>
                    <th className="p-2 text-right">Amount (₦)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td className="p-2 font-semibold text-slate-800">{t.department}</td>
                      <td className="p-2 text-slate-700">{t.description}</td>
                      <td className="p-2 text-right text-slate-500 font-mono tabular-nums">
                        {formatMoney(t.taxAmount)}
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatMoney(t.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals & Payments */}
              <div className="flex justify-end mt-4">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal Charges:</span>
                    <span className="font-mono tabular-nums font-semibold">{formatMoney(totalCharges - totalTax)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>VAT (7.5%) & Service (5%):</span>
                    <span className="font-mono tabular-nums font-semibold">{formatMoney(totalTax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-900 border-t border-slate-300 pt-1">
                    <span>Total Folio Bill:</span>
                    <span className="font-mono tabular-nums">{formatMoney(totalCharges)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-medium pt-1">
                    <span>Less Payments Received:</span>
                    <span className="font-mono tabular-nums">-{formatMoney(totalPaid)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-900 border-t border-slate-300 pt-1">
                    <span>Net Balance Due:</span>
                    <span className="font-mono tabular-nums text-rose-700">
                      {balanceOutstanding <= 100 ? '₦0.00 (Fully Settled)' : formatMoney(balanceOutstanding)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
                Thank you for staying at Grand Vista Hotel & Suites. We hope you enjoyed your stay!
              </div>

              <div className="mt-4 flex justify-end print:hidden">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 text-white rounded font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-800"
                >
                  <Printer className="w-4 h-4" />
                  Print Official Folio Invoice
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {balanceOutstanding > 100 ? (
              <span className="text-amber-600 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Folio must be zero-balanced prior to completing checkout.
              </span>
            ) : (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Folio is fully settled. Guest is cleared for checkout.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
            >
              Close Window
            </button>
            <button
              onClick={handleCheckoutClick}
              className={`px-4 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 ${
                balanceOutstanding <= 100
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-pointer'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              {balanceOutstanding <= 100 ? 'Complete Checkout' : 'Settle & Checkout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
