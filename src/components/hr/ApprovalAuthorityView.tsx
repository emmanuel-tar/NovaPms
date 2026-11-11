/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRBAC } from '../../context/RBACContext';
import { ApprovalRequest, ApprovalPolicy, ApprovalTransactionType } from '../../types/rbac';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Search,
  Filter,
  DollarSign,
  UserCheck,
  X,
  Plus,
} from 'lucide-react';

export const ApprovalAuthorityView: React.FC = () => {
  const {
    approvalPolicies,
    approvalRequests,
    currentUserAccount,
    approveRequest,
    rejectRequest,
    createApprovalRequest,
  } = useRBAC();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Decision Modal
  const [selectedReq, setSelectedReq] = useState<ApprovalRequest | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  // New Request Modal (for testing separation of duties)
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newType, setNewType] = useState<ApprovalTransactionType>('refund');
  const [newAmount, setNewAmount] = useState(75000);
  const [newRefId, setNewRefId] = useState('FOL-2026-9042');
  const [newRefDesc, setNewRefDesc] = useState('Room 304 - Excess mini-bar debit correction');
  const [newJustification, setNewJustification] = useState('Guest disputed mini-bar consumption on check-out');

  const filteredRequests = approvalRequests.filter((req) => {
    const q = search.toLowerCase();
    const matchesSearch =
      req.requestCode.toLowerCase().includes(q) ||
      req.requestedByUserName.toLowerCase().includes(q) ||
      req.referenceDescription.toLowerCase().includes(q) ||
      req.referenceId.toLowerCase().includes(q);

    const matchesType = typeFilter === 'all' || req.transactionType === typeFilter;
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleApprove = () => {
    if (!selectedReq) return;
    setActionError(null);

    const res = approveRequest(selectedReq.id, decisionNotes || 'Approved per standard hotel policy');
    if (!res.success) {
      setActionError(res.error || 'Approval failed');
      return;
    }

    setSelectedReq(null);
    setDecisionNotes('');
  };

  const handleReject = () => {
    if (!selectedReq) return;
    setActionError(null);

    const res = rejectRequest(selectedReq.id, decisionNotes || 'Declined by financial authority');
    if (!res.success) {
      setActionError(res.error || 'Rejection failed');
      return;
    }

    setSelectedReq(null);
    setDecisionNotes('');
  };

  const handleCreateNewRequest = (e: React.FormEvent) => {
    e.preventDefault();
    createApprovalRequest({
      transactionType: newType,
      amount: Number(newAmount),
      referenceId: newRefId,
      referenceDescription: newRefDesc,
      justification: newJustification,
    });
    setIsNewModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Real-Time Separation of Duties Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-sm">
            Strict Internal Financial Control — Separation of Duties Enforced
          </div>
          <p className="mt-1 text-slate-600 dark:text-slate-300">
            Currently acting as: <strong className="font-mono text-slate-900 dark:text-slate-100">@{currentUserAccount.username} ({currentUserAccount.employeeName})</strong>.
            Under hotel auditing standards, <span className="underline font-semibold">self-approval is strictly forbidden</span>. Any financial transaction you initiate cannot be approved by yourself, even if you hold Super Administrator privileges.
          </p>
        </div>
      </div>

      {/* Financial Policies Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Hotel Financial Approval Threshold Policies
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {approvalPolicies.map((pol) => (
            <div
              key={pol.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
            >
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {pol.transactionType.replace('_', ' ')}
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {pol.title}
              </div>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
                Auto Limit: ₦{pol.maxAutoApprovedAmount.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Required Role:{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {pol.requiredApproverRole}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {pol.preventSelfApproval ? '✓ Self-approval prohibited' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Requests Queue */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search request code, requester, folio..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium"
            >
              <option value="all">All Statuses ({approvalRequests.length})</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Initiate Approval Request</span>
          </button>
        </div>

        {/* Requests Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Code & Type</th>
                  <th className="py-3 px-4">Amount (NGN)</th>
                  <th className="py-3 px-4">Reference & Reason</th>
                  <th className="py-3 px-4">Requested By</th>
                  <th className="py-3 px-4">Required Authority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRequests.map((req) => {
                  const isSelf = req.requestedByUserId === currentUserAccount.id;

                  return (
                    <tr
                      key={req.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          {req.requestCode}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">
                          {req.transactionType.replace('_', ' ')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm tabular-nums">
                        ₦{req.amount.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {req.referenceDescription}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Ref: <span className="font-mono">{req.referenceId}</span> • "{req.justification}"
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {req.requestedByUserName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700">
                          {req.requiredRole}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            req.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : req.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {req.status}
                        </span>
                        {req.decidedByUserName && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            by {req.decidedByUserName}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {req.status === 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedReq(req);
                              setDecisionNotes('');
                              setActionError(null);
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                              isSelf
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            }`}
                            title={isSelf ? 'Self-approval is forbidden' : 'Review & Decide'}
                          >
                            {isSelf ? 'Own Request' : 'Review'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredRequests.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No financial approval requests in queue.
            </div>
          )}
        </div>
      </div>

      {/* Review & Decision Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Financial Authorization Review</span>
              </h3>
              <button onClick={() => setSelectedReq(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {actionError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {selectedReq.requestedByUserId === currentUserAccount.id && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Self-approval violation: You cannot approve a transaction that you requested. Another authorized manager must review this request.
                  </span>
                </div>
              )}

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Request Code:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {selectedReq.requestCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transaction Type:</span>
                  <span className="font-semibold uppercase text-slate-800 dark:text-slate-200">
                    {selectedReq.transactionType.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Requested Amount:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                    ₦{selectedReq.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Initiating Officer:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {selectedReq.requestedByUserName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reference:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {selectedReq.referenceId} — {selectedReq.referenceDescription}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block mb-0.5">Officer Justification:</span>
                  <span className="italic text-slate-700 dark:text-slate-300">
                    "{selectedReq.justification}"
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Authorization / Rejection Notes
                </label>
                <textarea
                  rows={2}
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="State auditing grounds, verification checked, or reason for decline..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReq(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-300 dark:border-rose-800"
                >
                  Decline Request
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Authorize Transaction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Initiate Request Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Initiate Financial Transaction Request
              </h3>
              <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Transaction Category *</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                >
                  <option value="refund">Refund (Credit Card / Transfer Return)</option>
                  <option value="large_discount">Commercial / VIP Room Discount</option>
                  <option value="folio_adjustment">Guest Folio Debit/Credit Adjustment</option>
                  <option value="stock_adjustment">Stores / Inventory Inventory Write-Off</option>
                  <option value="purchase_order">Procurement Purchase Order</option>
                  <option value="expense">Direct Operational Cash Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Amount (₦ NGN) *</label>
                <input
                  type="number"
                  required
                  step={1000}
                  value={newAmount}
                  onChange={(e) => setNewAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Reference ID *</label>
                <input
                  type="text"
                  required
                  value={newRefId}
                  onChange={(e) => setNewRefId(e.target.value)}
                  placeholder="e.g. FOL-2026-9042 or PO-889"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Reference Description</label>
                <input
                  type="text"
                  required
                  value={newRefDesc}
                  onChange={(e) => setNewRefDesc(e.target.value)}
                  placeholder="e.g. Room 304 - Excess mini-bar debit"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Justification</label>
                <textarea
                  rows={2}
                  value={newJustification}
                  onChange={(e) => setNewJustification(e.target.value)}
                  placeholder="Operational reason for request..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
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
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
