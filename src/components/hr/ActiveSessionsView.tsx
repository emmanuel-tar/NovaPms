/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRBAC } from '../../context/RBACContext';
import {
  Monitor,
  Smartphone,
  Shield,
  Wifi,
  XCircle,
  Clock,
  Search,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export const ActiveSessionsView: React.FC = () => {
  const { activeSessions, revokeSession, revokeAllUserSessions, userAccounts } = useRBAC();
  const [search, setSearch] = useState('');

  const filteredSessions = activeSessions.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.userName.toLowerCase().includes(q) ||
      s.userRole.toLowerCase().includes(q) ||
      s.ipAddress.includes(q) ||
      s.userAgent.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Hotel LAN Live Sessions ({activeSessions.filter((s) => s.isActive).length} Active)
            </h3>
            <p className="text-[11px] text-slate-500">
              Real-time monitor of authenticated terminals connected to the local server.
            </p>
          </div>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search IP, staff or role..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs"
          />
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSessions.map((session) => {
          const isMobile = session.userAgent.toLowerCase().includes('mobile');
          const isCurrentSession = session.id === 'sess-admin-1';

          return (
            <div
              key={session.id}
              className={`p-4 rounded-2xl border transition-all ${
                session.isActive
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                    {isMobile ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        {session.userName}
                      </span>
                      {isCurrentSession && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold uppercase">
                          Current Device
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block">{session.userRole}</span>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    session.isActive
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {session.isActive ? 'Active' : 'Revoked'}
                </span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">IP Address:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{session.ipAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Terminal:</span>
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[170px]" title={session.userAgent}>
                    {session.userAgent}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Session Start:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {new Date(session.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Ping:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {new Date(session.lastActiveAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {session.isActive && !isCurrentSession && (
                <div className="mt-4 pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => revokeAllUserSessions(session.userId)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Revoke all for user
                  </button>
                  <button
                    onClick={() => revokeSession(session.id)}
                    className="px-3 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Kill Session
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
