/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePMS } from '../../context/PMSContext';
import { useRBAC } from '../../context/RBACContext';
import { useUITemplate } from '../../context/UITemplateContext';
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
  Palette,
  Search,
  Zap,
  Clock,
  Activity,
  Keyboard,
} from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
  onOpenQuickActions?: () => void;
  onOpenShiftHandover?: () => void;
  onOpenPerformance?: () => void;
  onOpenShortcuts?: () => void;
  notificationCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  setIsDark,
  onOpenSearch,
  onOpenNotifications,
  onOpenQuickActions,
  onOpenShiftHandover,
  onOpenPerformance,
  onOpenShortcuts,
  notificationCount = 0,
}) => {
  const {
    currentEmployee,
    employees,
    setCurrentEmployee,
    businessDate,
    rooms,
    stays,
    folioTransactions,
    currency,
    setCurrency,
    formatMoney,
  } = usePMS();

  const { templateConfig, openTemplateModal } = useUITemplate();
  const { userAccounts, setCurrentUserAccount } = useRBAC();

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

      {/* Zone 1.5: Quick Search Bar */}
      <div className="flex-1 max-w-xs hidden md:block">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs transition-colors shadow-2xs"
          title="Universal Search (Ctrl + K)"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-normal text-slate-500 dark:text-slate-400">Search rooms, guests, folios...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-400 shadow-2xs">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Zone 2: 4-5 clean single-line live operational telemetry */}
      <div className="hidden xl:flex items-center gap-5 text-xs font-medium text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-slate-500">Date:</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {businessDate}
          </span>
        </div>

        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="text-slate-500">Occ:</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {occupancyPct}% ({activeStaysCount}/{totalRooms})
          </span>
        </div>

        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <DollarSign className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="text-slate-500">Rev:</span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {formatMoney(todayRevenue)}
          </span>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-md">
          <button
            onClick={() => setCurrency('NGN')}
            className={`px-1.5 py-0.5 text-[11px] font-semibold rounded transition-colors ${
              currency === 'NGN'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            ₦
          </button>
          <button
            onClick={() => setCurrency('USD')}
            className={`px-1.5 py-0.5 text-[11px] font-semibold rounded transition-colors ${
              currency === 'USD'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            $
          </button>
        </div>
      </div>

      {/* Zone 3: 1 primary action / Operational Tooling */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile Search Icon */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Search (Ctrl + K)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Quick Actions Fast Button */}
        <button
          onClick={onOpenQuickActions}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300/40 text-xs font-bold transition-all shadow-2xs"
          title="Front Desk Quick Actions (Walk-In, Fast Charge, Status)"
        >
          <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span className="hidden sm:inline">Quick Actions</span>
        </button>

        {/* Shift Handover Button */}
        <button
          onClick={onOpenShiftHandover}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title="Front Desk Shift Handover & Cash Float"
        >
          <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="hidden lg:inline">Shift Handover</span>
        </button>

        {/* LAN Telemetry & Optimizer */}
        <button
          onClick={onOpenPerformance}
          className="hidden md:flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition-colors"
          title="LAN Health & Database Optimizer"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono">LAN 1.4ms</span>
        </button>

        {/* Operational Alerts Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Operational Alerts Center"
        >
          <Bell className="w-4 h-4" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse shadow-xs">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* UI Template Selector Button */}
        <button
          onClick={openTemplateModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          title="Switch Hotel PMS UI Template (Standard, Opera Classic, Luxury Obsidian, Touch POS)"
        >
          <Palette className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden xl:inline">{templateConfig.name.split(' ')[0]} Skin</span>
        </button>

        {/* Keyboard Shortcuts Help */}
        <button
          onClick={onOpenShortcuts}
          className="hidden sm:flex items-center justify-center w-7 h-7 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Keyboard Shortcuts (?)"
        >
          ?
        </button>

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
              className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold ${currentEmployee.avatarColor}`}
            >
              {currentEmployee.name[0]}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                {currentEmployee.name}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                {currentEmployee.title}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                Switch Operational Role & Account
              </div>
              {employees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => {
                    setCurrentEmployee(emp);
                    const linked = userAccounts.find(
                      (u) =>
                        u.employeeId === emp.id ||
                        u.employeeName.toLowerCase().includes(emp.name.toLowerCase())
                    );
                    if (linked) {
                      setCurrentUserAccount(linked);
                    }
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                    currentEmployee.id === emp.id ? 'bg-slate-50 dark:bg-slate-800/70 font-semibold' : ''
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0 ${emp.avatarColor}`}
                  >
                    {emp.name[0]}
                  </div>
                  <div className="truncate">
                    <div className="text-xs text-slate-900 dark:text-slate-100">{emp.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {emp.title} · {emp.department}
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
