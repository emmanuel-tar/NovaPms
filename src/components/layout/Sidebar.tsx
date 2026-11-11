/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  Users,
  Grid,
  UtensilsCrossed,
  ChefHat,
  Sparkles,
  Shirt,
  Boxes,
  Receipt,
  UserCheck,
  Car,
  Waves,
  Wrench,
  BarChart3,
  Settings,
  ShieldAlert,
  Moon,
  FileCode2,
} from 'lucide-react';
import { usePMS } from '../../context/PMSContext';
import { useRBAC } from '../../context/RBACContext';

export type NavTab =
  | 'dashboard'
  | 'frontdesk'
  | 'reservations'
  | 'guests'
  | 'rooms'
  | 'pos'
  | 'kitchen'
  | 'housekeeping'
  | 'laundry'
  | 'inventory'
  | 'finance'
  | 'hr'
  | 'transport'
  | 'facilities'
  | 'maintenance'
  | 'reports'
  | 'settings'
  | 'audit'
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

  const { approvalRequests, leaveRequests } = useRBAC();

  const occupiedRoomsCount = rooms.filter((r) => r.status === 'occupied').length;
  const pendingKdsCount = kitchenTickets.filter((t) => t.status === 'pending' || t.status === 'preparing').length;
  const pendingLaundryCount = laundryOrders.filter((l) => l.status === 'received' || l.status === 'processing').length;
  const pendingHkCount = housekeepingTasks.filter((h) => h.status !== 'inspected').length;
  const openMaintCount = maintenanceRequests.filter((m) => m.status === 'open').length;
  const pendingRbacCount = approvalRequests.filter((a) => a.status === 'pending').length + leaveRequests.filter((l) => l.status === 'pending').length;

  const navSections: {
    groupTitle: string;
    items: {
      id: NavTab;
      label: string;
      number: string;
      icon: React.ElementType;
      badge?: number;
      badgeColor?: string;
    }[];
  }[] = [
    {
      groupTitle: 'Front Office & Rooms',
      items: [
        {
          id: 'dashboard',
          number: '1',
          label: 'Dashboard',
          icon: LayoutDashboard,
        },
        {
          id: 'frontdesk',
          number: '2',
          label: 'Front Office',
          icon: BedDouble,
          badge: occupiedRoomsCount,
          badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
        },
        {
          id: 'reservations',
          number: '3',
          label: 'Reservations',
          icon: CalendarCheck,
        },
        {
          id: 'guests',
          number: '4',
          label: 'Guest Management',
          icon: Users,
        },
        {
          id: 'rooms',
          number: '5',
          label: 'Room Management',
          icon: Grid,
        },
      ],
    },
    {
      groupTitle: 'Food & Beverage',
      items: [
        {
          id: 'pos',
          number: '6',
          label: 'Point of Sale (POS)',
          icon: UtensilsCrossed,
        },
        {
          id: 'kitchen',
          number: '7',
          label: 'Kitchen Management',
          icon: ChefHat,
          badge: pendingKdsCount,
          badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
        },
      ],
    },
    {
      groupTitle: 'Operations & Facilities',
      items: [
        {
          id: 'housekeeping',
          number: '8',
          label: 'Housekeeping',
          icon: Sparkles,
          badge: pendingHkCount,
          badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
        },
        {
          id: 'laundry',
          number: '9',
          label: 'Laundry & Valet',
          icon: Shirt,
          badge: pendingLaundryCount,
          badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
        },
        {
          id: 'transport',
          number: '13',
          label: 'Transport Management',
          icon: Car,
        },
        {
          id: 'facilities',
          number: '14',
          label: 'Gym & Recreational',
          icon: Waves,
        },
        {
          id: 'maintenance',
          number: '15',
          label: 'Maintenance',
          icon: Wrench,
          badge: openMaintCount,
          badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
        },
      ],
    },
    {
      groupTitle: 'Back Office & Administration',
      items: [
        {
          id: 'inventory',
          number: '10',
          label: 'Inventory & Procurement',
          icon: Boxes,
        },
        {
          id: 'finance',
          number: '11',
          label: 'Finance & Accounting',
          icon: Receipt,
        },
        {
          id: 'hr',
          number: '12',
          label: 'HR & Enterprise RBAC',
          icon: UserCheck,
          badge: pendingRbacCount > 0 ? pendingRbacCount : undefined,
          badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
        },
      ],
    },
    {
      groupTitle: 'Reporting & Governance',
      items: [
        {
          id: 'reports',
          number: '16',
          label: 'Reports & Analytics',
          icon: BarChart3,
        },
        {
          id: 'settings',
          number: '17',
          label: 'Settings',
          icon: Settings,
        },
        {
          id: 'audit',
          number: '18',
          label: 'Audit Logs',
          icon: ShieldAlert,
        },
        {
          id: 'nightaudit',
          number: 'NA',
          label: 'Night Audit Close',
          icon: Moon,
        },
        {
          id: 'architecture',
          number: 'DB',
          label: 'System Architecture',
          icon: FileCode2,
        },
      ],
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex flex-col h-[calc(100vh-61px)] sticky top-[61px] overflow-y-auto">
      <div className="p-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-200/60 dark:border-slate-800/60">
        Grand Vista ERP Modules
      </div>
      <nav className="flex-1 px-2 py-2 space-y-4">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {section.groupTitle}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`text-[9px] font-mono px-1 py-0.2 rounded shrink-0 font-bold ${
                        isActive
                          ? 'bg-emerald-700 text-emerald-100'
                          : 'bg-slate-200/80 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {item.number}
                    </span>
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full tabular-nums shrink-0 ml-1 ${
                        isActive ? 'bg-white text-emerald-800' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Property LAN Indicator */}
      <div className="p-3 m-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400">
        <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
          <span>140-Room Property</span>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/70 px-1 rounded">
            LAN ACTIVE
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5">PostgreSQL 16 · Windows Server</div>
      </div>
    </aside>
  );
};
