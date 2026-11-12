/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      category: 'Universal Fast Actions',
      items: [
        { keys: ['Ctrl', 'K'], label: 'Open Universal Search & Command Palette' },
        { keys: ['?'], label: 'Open Keyboard Shortcuts Cheat Sheet' },
        { keys: ['Esc'], label: 'Close open dialog, modal, or dropdown' },
      ],
    },
    {
      category: 'Front Office & Quick Operations',
      items: [
        { keys: ['Alt', 'N'], label: 'Express Walk-In Check-In (30-second arrival)' },
        { keys: ['Alt', 'C'], label: 'Quick Post Room Charge to Active Folio' },
        { keys: ['Alt', 'S'], label: 'Quick Flip Room Cleaning / Inspection Status' },
        { keys: ['Alt', 'H'], label: 'Front Desk Shift Handover & Cash Float Drawer' },
        { keys: ['Alt', 'P'], label: 'System Performance & LAN Health Monitor' },
      ],
    },
    {
      category: 'Direct Module Navigation',
      items: [
        { keys: ['Alt', '1'], label: 'Jump to Dashboard Overview' },
        { keys: ['Alt', '2'], label: 'Jump to Front Office & Room Rack' },
        { keys: ['Alt', '3'], label: 'Jump to Reservations & Bookings' },
        { keys: ['Alt', '4'], label: 'Jump to Guest Profiles (CRM)' },
        { keys: ['Alt', '5'], label: 'Jump to Point of Sale (POS)' },
        { keys: ['Alt', '6'], label: 'Jump to Kitchen KDS Line' },
        { keys: ['Alt', '7'], label: 'Jump to Housekeeping Board' },
        { keys: ['Alt', '8'], label: 'Jump to Finance & Night Audit' },
        { keys: ['Alt', '9'], label: 'Jump to Human Resources & RBAC' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Front Office Keyboard Accelerators
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Speed up front desk, cashier, and management workflows with hotkeys
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

        {/* Shortcuts List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {shortcutGroups.map((group) => (
            <div key={group.category} className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.category}
              </h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/40 dark:bg-slate-950/40">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3.5 py-2.5 text-xs"
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {item.label}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-1 text-[11px] font-mono font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 shadow-xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Works globally on any page</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
