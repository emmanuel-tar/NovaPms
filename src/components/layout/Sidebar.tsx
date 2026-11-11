/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  BedDouble,
  CalendarCheck,
  UtensilsCrossed,
  ChefHat,
  Shirt,
  Waves,
  Car,
  Sparkles,
  Wrench,
  Boxes,
  Receipt,
  Moon,
  FileCode2,
} from 'lucide-react';
import { usePMS } from '../../context/PMSContext';

export type NavTab =
  | 'frontdesk'
  | 'reservations'
  | 'pos'
  | 'kds'
  | 'laundry'
  | 'facilities'
  | 'transport'
  | 'housekeeping'
  | 'maintenance'
  | 'inventory'
  | 'finance'
  | 'nightaudit'
  | 'architecture';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const {
    rooms,
    kitchenTickets,
    laundryOrders,
    housekeepingTasks,
    maintenanceRequests,
  } = usePMS();

  const occupiedRoomsCount = rooms.filter((r) => r.status === 'occupied').length;
  const pendingKdsCount = kitchenTickets.filter((t) => t.status === 'pending' || t.status === 'preparing').length;
  const pendingLaundryCount = laundryOrders.filter((l) => l.status === 'received' || l.status === 'processing').length;
  const pendingHkCount = housekeepingTasks.filter((h) => h.status !== 'inspected').length;
  const openMaintCount = maintenanceRequests.filter((m) => m.status === 'open').length;

  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'frontdesk',
      label: 'Front Desk & Rooms',
      icon: BedDouble,
      badge: occupiedRoomsCount,
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    },
    {
      id: 'reservations',
      label: 'Reservations',
      icon: CalendarCheck,
    },
    {
      id: 'pos',
      label: 'Restaurant & Bar POS',
      icon: UtensilsCrossed,
    },
    {
      id: 'kds',
      label: 'Kitchen KDS',
      icon: ChefHat,
      badge: pendingKdsCount,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    },
    {
      id: 'laundry',
      label: 'Laundry & Valet',
      icon: Shirt,
      badge: pendingLaundryCount,
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
    },
    {
      id: 'facilities',
      label: 'Gym & Swimming Pool',
      icon: Waves,
    },
    {
      id: 'transport',
      label: 'Transport & Fleet',
      icon: Car,
    },
    {
      id: 'housekeeping',
      label: 'Housekeeping & Minibar',
      icon: Sparkles,
      badge: pendingHkCount,
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
      icon: Wrench,
      badge: openMaintCount,
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    },
    {
      id: 'inventory',
      label: 'Inventory & Stores',
      icon: Boxes,
    },
    {
      id: 'finance',
      label: 'Finance & Guest Folios',
      icon: Receipt,
    },
    {
      id: 'nightaudit',
      label: 'Night Audit & Close',
      icon: Moon,
    },
    {
      id: 'architecture',
      label: 'Architecture & PRD',
      icon: FileCode2,
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex flex-col h-[calc(100vh-61px)] sticky top-[61px] overflow-y-auto">
      <div className="p-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Hotel Operations Modules
      </div>
      <nav className="flex-1 px-2 space-y-1 pb-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums shrink-0 ml-1.5 ${
                    isActive ? 'bg-white text-emerald-800' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      
      {/* Hotel Property Info Box */}
      <div className="p-3 m-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400">
        <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
          <span>Grand Vista Hotel</span>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/70 px-1 rounded">LAN ACTIVE</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5">38 Rooms · 4 Outlets · ERP v2.4</div>
      </div>
    </aside>
  );
};
