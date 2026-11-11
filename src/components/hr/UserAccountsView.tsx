/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRBAC } from '../../context/RBACContext';
import { UserAccount, AccountStatus } from '../../types/rbac';
import {
  UserCheck,
  Search,
  Plus,
  Shield,
  Key,
  Lock,
  Unlock,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  Mail,
  UserX,
  X,
  ExternalLink,
} from 'lucide-react';

interface UserAccountsViewProps {
  onOpenCreateAccount: () => void;
  onOpenInviteModal: () => void;
  onNavigateSubTab: (tab: string) => void;
}

export const UserAccountsView: React.FC<UserAccountsViewProps> = ({
  onOpenCreateAccount,
  onOpenInviteModal,
  onNavigateSubTab,
}) => {
  const {
    userAccounts,
    suspendAccount,
    activateUserAccount,
    disableAccount,
    resetUserPassword,
  } = useRBAC();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Action Modals
  const [actionUser, setActionUser] = useState<UserAccount | null>(null);
  const [actionType, setActionType] = useState<'suspend' | 'disable' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  // Password reset alert
  const [tempPassInfo, setTempPassInfo] = useState<{ username: string; pass: string } | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);

  const filteredUsers = userAccounts.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      u.username.toLowerCase().includes(q) ||
      u.employeeName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.roles?.some((r) => r.name.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExecuteAction = () => {
    if (!actionUser || !actionType) return;
    setActionError(null);

    if (actionType === 'suspend') {
      const res = suspendAccount(actionUser.id, actionReason || 'Administrative suspension');
      if (!res.success) {
        setActionError(res.error || 'Failed to suspend account');
        return;
      }
    } else if (actionType === 'disable') {
      const res = disableAccount(actionUser.id, actionReason || 'Account deactivated');
      if (!res.success) {
        setActionError(res.error || 'Failed to disable account');
        return;
      }
    }

    setActionUser(null);
    setActionType(null);
    setActionReason('');
  };

  const handlePasswordReset = (user: UserAccount) => {
    const res = resetUserPassword(user.id);
    if (res.success && res.tempPassword) {
      setTempPassInfo({ username: user.username, pass: res.tempPassword });
      setCopiedPass(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Alert Banner for Temp Password Generation */}
      {tempPassInfo && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                Temporary Password Generated for @{tempPassInfo.username}
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                Password: <code className="font-mono font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">{tempPassInfo.pass}</code>
                <span className="ml-2 text-[11px]">(User will be forced to change this on next login)</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(tempPassInfo.pass)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1.5 transition-colors"
            >
              {copiedPass ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPass ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => setTempPassInfo(null)}
              className="p-1.5 text-emerald-600 hover:text-emerald-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Action and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user accounts by username, staff name, role..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium"
          >
            <option value="all">All Statuses ({userAccounts.length})</option>
            <option value="active">Active</option>
            <option value="pending_invitation">Pending Invitation</option>
            <option value="suspended">Suspended</option>
            <option value="disabled">Disabled</option>
            <option value="locked">Locked</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenInviteModal}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-blue-500" />
            <span>Invite Employee</span>
          </button>
          <button
            onClick={onOpenCreateAccount}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Account</span>
          </button>
        </div>
      </div>

      {/* User Accounts Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">User & Linked Employee</th>
                <th className="py-3 px-4">Assigned Roles</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Access Scope</th>
                <th className="py-3 px-4">Security Status</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Account Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((user) => {
                const isSuperAdminUser = user.roles?.some((r) => r.code === 'super_admin');

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* User & Linked Employee */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                        @{user.username}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {user.employeeName} • {user.email}
                      </div>
                    </td>

                    {/* Roles */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((r) => (
                          <span
                            key={r.id}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              r.code === 'super_admin'
                                ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-900'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {r.name}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : user.status === 'pending_invitation'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : user.status === 'suspended'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {user.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Access Scope */}
                    <td className="py-3.5 px-4">
                      <div className="text-[11px]">
                        <span className="text-slate-400">Dept: </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                          {user.departmentAccessScope}
                        </span>
                      </div>
                      <div className="text-[11px] mt-0.5">
                        <span className="text-slate-400">Outlet: </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                          {user.outletAccessScope}
                        </span>
                      </div>
                    </td>

                    {/* Security flags */}
                    <td className="py-3.5 px-4">
                      {user.forcePasswordChange ? (
                        <span className="text-amber-600 dark:text-amber-400 text-[11px] font-medium block">
                          Must change pass
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-medium block">
                          Password healthy
                        </span>
                      )}
                      {user.failedLoginAttempts > 0 && (
                        <span className="text-rose-600 text-[10px] font-semibold">
                          {user.failedLoginAttempts} failed attempts
                        </span>
                      )}
                    </td>

                    {/* Last login */}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {user.lastLoginAt ? (
                        <div>
                          <div>{new Date(user.lastLoginAt).toLocaleDateString()}</div>
                          <div className="text-slate-400 font-mono text-[10px]">
                            {user.lastLoginIp || 'LAN'}
                          </div>
                        </div>
                      ) : (
                        <span>Never logged in</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handlePasswordReset(user)}
                          title="Reset Password"
                          className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        {user.status === 'active' ? (
                          <button
                            onClick={() => {
                              setActionUser(user);
                              setActionType('suspend');
                              setActionReason('');
                              setActionError(null);
                            }}
                            title="Suspend Account"
                            className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => activateUserAccount(user.id)}
                            title="Activate Account"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setActionUser(user);
                            setActionType('disable');
                            setActionReason('');
                            setActionError(null);
                          }}
                          title="Deactivate / Disable"
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Suspend or Disable */}
      {actionUser && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>
                  {actionType === 'suspend' ? 'Suspend User Account' : 'Deactivate User Account'}
                </span>
              </h3>
              <button
                onClick={() => {
                  setActionUser(null);
                  setActionType(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
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

              <p className="text-xs text-slate-600 dark:text-slate-400">
                Are you sure you want to {actionType} the account for{' '}
                <strong className="text-slate-900 dark:text-slate-100">
                  @{actionUser.username} ({actionUser.employeeName})
                </strong>
                ? All active sessions will be terminated immediately.
              </p>

              <div>
                <label className="block text-xs font-semibold mb-1">Reason / Justification</label>
                <textarea
                  rows={2}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="e.g. Disciplinary inquiry, operational rotation, staff exit..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActionUser(null);
                    setActionType(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteAction}
                  className={`px-5 py-2 text-xs font-bold text-white rounded-lg ${
                    actionType === 'suspend'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Confirm {actionType === 'suspend' ? 'Suspension' : 'Deactivation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
