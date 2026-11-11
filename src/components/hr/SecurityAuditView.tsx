/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRBAC } from '../../context/RBACContext';
import {
  ShieldAlert,
  Search,
  Download,
  AlertTriangle,
  CheckCircle2,
  Lock,
  RotateCcw,
  History,
  UserCheck,
  Filter,
} from 'lucide-react';

export const SecurityAuditView: React.FC = () => {
  const {
    securityEvents,
    loginAttempts,
    permissionHistory,
    userAccounts,
  } = useRBAC();

  const [activeTab, setActiveTab] = useState<'security_events' | 'login_attempts' | 'permission_history'>('security_events');
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filteredSecurityEvents = securityEvents.filter((e) => {
    const q = search.toLowerCase();
    const matchesSearch =
      e.description.toLowerCase().includes(q) ||
      e.eventType.toLowerCase().includes(q) ||
      (e.userName && e.userName.toLowerCase().includes(q)) ||
      e.ipAddress.includes(q);

    const matchesSeverity = severityFilter === 'all' || e.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const filteredLoginAttempts = loginAttempts.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.username.toLowerCase().includes(q) ||
      a.ipAddress.includes(q) ||
      a.status.toLowerCase().includes(q) ||
      (a.failureReason && a.failureReason.toLowerCase().includes(q))
    );
  });

  const filteredPermissionHistory = permissionHistory.filter((h) => {
    const q = search.toLowerCase();
    return (
      h.targetName.toLowerCase().includes(q) ||
      h.changedByUserName.toLowerCase().includes(q) ||
      h.action.toLowerCase().includes(q) ||
      h.details.toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    let rows: string[][] = [];
    let headers: string[] = [];

    if (activeTab === 'security_events') {
      headers = ['Timestamp', 'Severity', 'Event Type', 'User', 'IP Address', 'Description'];
      rows = filteredSecurityEvents.map((e) => [
        e.timestamp,
        e.severity,
        e.eventType,
        e.userName || 'System',
        e.ipAddress,
        `"${e.description.replace(/"/g, '""')}"`,
      ]);
    } else if (activeTab === 'login_attempts') {
      headers = ['Timestamp', 'Username', 'IP Address', 'Status', 'Failure Reason'];
      rows = filteredLoginAttempts.map((a) => [
        a.attemptedAt,
        a.username,
        a.ipAddress,
        a.status,
        `"${(a.failureReason || '').replace(/"/g, '""')}"`,
      ]);
    } else {
      headers = ['Timestamp', 'Target Name', 'Target Type', 'Action', 'Changed By', 'Details'];
      rows = filteredPermissionHistory.map((h) => [
        h.timestamp,
        `"${h.targetName}"`,
        h.targetType,
        h.action,
        h.changedByUserName,
        `"${h.details.replace(/"/g, '""')}"`,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeTab}_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Tab Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('security_events')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'security_events'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Security Events ({securityEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('login_attempts')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'login_attempts'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Login Attempts ({loginAttempts.length})
          </button>
          <button
            onClick={() => setActiveTab('permission_history')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'permission_history'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Permission History ({permissionHistory.length})
          </button>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter audit entries by user, IP, action, or description..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {activeTab === 'security_events' && (
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        )}
      </div>

      {/* TAB 1: Security Events */}
      {activeTab === 'security_events' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Event Category</th>
                  <th className="py-3 px-4">Target User</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Audit Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSecurityEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(evt.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          evt.severity === 'critical'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : evt.severity === 'high'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                            : evt.severity === 'medium'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {evt.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {evt.eventType}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {evt.userName || 'System Engine'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {evt.ipAddress}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-md">
                      {evt.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSecurityEvents.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No security events recorded under this filter.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Login Attempts */}
      {activeTab === 'login_attempts' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Attempt Time</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Outcome</th>
                  <th className="py-3 px-4">Failure Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLoginAttempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(att.attemptedAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      @{att.username}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {att.ipAddress}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          att.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {att.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {att.failureReason || 'Authenticated cleanly'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLoginAttempts.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No login attempts in history.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Permission Change History */}
      {activeTab === 'permission_history' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Changed By</th>
                  <th className="py-3 px-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPermissionHistory.map((hist) => (
                  <tr key={hist.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(hist.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {hist.targetName}
                    </td>
                    <td className="py-3 px-4 uppercase text-[10px] font-semibold text-slate-400">
                      {hist.targetType}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-emerald-600 dark:text-emerald-400">
                      {hist.action}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {hist.changedByUserName}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-md">
                      {hist.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPermissionHistory.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No permission changes recorded yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
