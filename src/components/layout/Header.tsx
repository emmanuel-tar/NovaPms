/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePMS } from '../../context/PMSContext';
import {
  Calendar,
  Building2,
  DollarSign,
  ChevronDown,
  UserCheck,
  CheckCircle,
  AlertCircle,
  Bell,
  Sun,
  Moon,
} from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ isDark, setIsDark }) => {
  const {
    currentUser,
    staffUsers,
    setCurrentUser,
    businessDate,
    rooms,
    stays,
    folioTransactions,
    currency,
    setCurrency,
    formatMoney,
  } = usePMS();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const activeStaysCount = stays.filter((s) => s.status === 'active').length;
  const totalRooms = rooms.length;
  const occupancyPct = Math.round((activeStaysCount / totalRooms) * 100);

  const todayRevenue = folioTransactions
    .filter((t) => t.createdAt.startsWith(businessDate) && t.status === 'posted')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
          GV
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
            Grand Vista Hotel PMS & ERP
          </span>
          <span className="hidden sm:inline-block text-xs text-slate-400 dark:text-slate-500 ml-2">
            Victoria Island, Lagos
          </span>
        </div>
      </div>

      {/* Zone 2: 4-5 clean single-line live operational telemetry */}
      <div className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-slate-500">Business Date:</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {businessDate}
          </span>
        </div>

        <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
          <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-slate-500">Occupancy:</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {occupancyPct}% ({activeStaysCount}/{totalRooms})
          </span>
        </div>

        <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
          <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="text-slate-500">Today's Revenue:</span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {formatMoney(todayRevenue)}
          </span>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-md">
          <button
            onClick={() => setCurrency('NGN')}
            className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
              currency === 'NGN'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            NGN (₦)
          </button>
          <button
            onClick={() => setCurrency('USD')}
            className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
              currency === 'USD'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            USD ($)
          </button>
        </div>
      </div>

      {/* Zone 3: 1 primary action / User Switcher */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Dark/Light toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle color theme"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Staff Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors whitespace-nowrap text-left"
          >
            <div
              className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold ${currentUser.avatarColor}`}
            >
              {currentUser.name[0]}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                {currentUser.title}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                Switch Operational Role
              </div>
              {staffUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    setCurrentUser(user);
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                    currentUser.id === user.id ? 'bg-slate-50 dark:bg-slate-800/70 font-semibold' : ''
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0 ${user.avatarColor}`}
                  >
                    {user.name[0]}
                  </div>
                  <div className="truncate">
                    <div className="text-xs text-slate-900 dark:text-slate-100">{user.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {user.title} · {user.department}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
