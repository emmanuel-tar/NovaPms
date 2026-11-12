/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { usePMS } from '../../context/PMSContext';
import { NavTab } from '../layout/Sidebar';
import {
  Search,
  BedDouble,
  Users,
  CalendarCheck,
  Receipt,
  UtensilsCrossed,
  Sparkles,
  Boxes,
  UserCheck,
  ArrowRight,
  DollarSign,
  CheckCircle2,
  X,
  CornerDownLeft,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab) => void;
  onOpenFolio?: (stayId: string) => void;
  onOpenCheckIn?: (roomId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenFolio,
  onOpenCheckIn,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    rooms,
    guests,
    stays,
    reservations,
    inventory,
    menuItems,
    employees,
    folioTransactions,
    folioPayments,
    formatMoney,
  } = usePMS();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default suggested quick navigation
      return [
        {
          id: 'nav-frontdesk',
          type: 'navigation',
          title: 'Front Office (Room Rack)',
          subtitle: 'Room status grid, express check-in, active folios',
          icon: BedDouble,
          category: 'Quick Navigation',
          action: () => {
            onNavigate('frontdesk');
            onClose();
          },
        },
        {
          id: 'nav-pos',
          type: 'navigation',
          title: 'Point of Sale (Restaurant & Bar POS)',
          subtitle: 'Orders, room charge posting, table billing',
          icon: UtensilsCrossed,
          category: 'Quick Navigation',
          action: () => {
            onNavigate('pos');
            onClose();
          },
        },
        {
          id: 'nav-housekeeping',
          type: 'navigation',
          title: 'Housekeeping Board',
          subtitle: 'Room cleaning assignments, inspection states',
          icon: Sparkles,
          category: 'Quick Navigation',
          action: () => {
            onNavigate('housekeeping');
            onClose();
          },
        },
        {
          id: 'nav-reservations',
          type: 'navigation',
          title: 'Reservations & Bookings',
          subtitle: 'Arrival calendar, confirmed reservations',
          icon: CalendarCheck,
          category: 'Quick Navigation',
          action: () => {
            onNavigate('reservations');
            onClose();
          },
        },
        {
          id: 'nav-hr',
          type: 'navigation',
          title: 'Staff & User Accounts (RBAC)',
          subtitle: 'Employee directory, login accounts, permissions',
          icon: UserCheck,
          category: 'Quick Navigation',
          action: () => {
            onNavigate('hr');
            onClose();
          },
        },
      ];
    }

    const results: any[] = [];

    // 1. Match Rooms
    rooms.forEach((r) => {
      const matchNumber = r.number.toLowerCase().includes(q);
      const matchCat = r.category.toLowerCase().includes(q);
      const matchStatus = r.status.toLowerCase().includes(q);

      if (matchNumber || matchCat || matchStatus) {
        const activeStay = stays.find((s) => s.roomId === r.id && s.status === 'active');
        let folioBalStr = '';
        if (activeStay) {
          const charges = folioTransactions
            .filter((t) => t.stayId === activeStay.id && t.status === 'posted')
            .reduce((sum, t) => sum + t.totalAmount, 0);
          const payments = folioPayments
            .filter((p) => p.stayId === activeStay.id)
            .reduce((sum, p) => sum + p.amount, 0) + activeStay.depositAmount;
          folioBalStr = formatMoney(charges - payments);
        }

        results.push({
          id: `room-${r.id}`,
          type: 'room',
          title: `Room ${r.number} · ${r.category}`,
          subtitle: activeStay
            ? `Occupied by: ${activeStay.guestName} | Folio Bal: ${folioBalStr}`
            : `Status: ${r.status.toUpperCase()} · Floor ${r.floor} (${r.building})`,
          badge: r.status.toUpperCase(),
          badgeColor:
            r.status === 'occupied'
              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              : r.status === 'available' || r.status === 'inspected'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
          icon: BedDouble,
          category: 'Rooms & Guests',
          action: () => {
            if (activeStay && onOpenFolio) {
              onOpenFolio(activeStay.id);
            } else if (!activeStay && onOpenCheckIn) {
              onOpenCheckIn(r.id);
            } else {
              onNavigate('frontdesk');
            }
            onClose();
          },
        });
      }
    });

    // 2. Match Guests
    guests.forEach((g) => {
      const matchName = g.name.toLowerCase().includes(q);
      const matchPhone = g.phone.toLowerCase().includes(q);
      const matchEmail = (g.email || '').toLowerCase().includes(q);
      const matchCode = g.guestCode.toLowerCase().includes(q);

      if (matchName || matchPhone || matchEmail || matchCode) {
        const activeStay = stays.find((s) => s.guestId === g.id && s.status === 'active');
        results.push({
          id: `guest-${g.id}`,
          type: 'guest',
          title: `${g.name} (${g.guestCode})`,
          subtitle: activeStay
            ? `Currently in Room ${activeStay.roomNumber} · VIP: ${g.vipLevel.toUpperCase()}`
            : `Total Stays: ${g.totalStays} | Phone: ${g.phone}`,
          badge: g.vipLevel.toUpperCase(),
          badgeColor:
            g.vipLevel === 'Platinum' || g.vipLevel === 'Gold'
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
          icon: Users,
          category: 'Guests (CRM)',
          action: () => {
            if (activeStay && onOpenFolio) {
              onOpenFolio(activeStay.id);
            } else {
              onNavigate('guests');
            }
            onClose();
          },
        });
      }
    });

    // 3. Match Reservations
    reservations.forEach((res) => {
      const matchCode = res.bookingCode.toLowerCase().includes(q);
      const matchGuest = res.guestName.toLowerCase().includes(q);
      if (matchCode || matchGuest) {
        results.push({
          id: `res-${res.id}`,
          type: 'reservation',
          title: `Booking ${res.bookingCode} · ${res.guestName}`,
          subtitle: `Dates: ${res.checkInDate} to ${res.checkOutDate} · ${res.category} (${res.status})`,
          badge: res.status.toUpperCase(),
          badgeColor:
            res.status === 'confirmed'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
          icon: CalendarCheck,
          category: 'Reservations',
          action: () => {
            onNavigate('reservations');
            onClose();
          },
        });
      }
    });

    // 4. Match System Modules
    const modules: { id: NavTab; name: string; desc: string; icon: any }[] = [
      { id: 'dashboard', name: 'Dashboard Overview', desc: 'Hotel operational KPIs, RevPAR, and occupancy', icon: BedDouble },
      { id: 'frontdesk', name: 'Front Desk & Room Rack', desc: 'Tape chart, room grid, and guest check-in/out', icon: BedDouble },
      { id: 'pos', name: 'F&B Restaurant POS', desc: 'Dining order entry, kitchen transfer, and room charge', icon: UtensilsCrossed },
      { id: 'kitchen', name: 'Kitchen Display System (KDS)', desc: 'Live ticket line for chef and cook stations', icon: UtensilsCrossed },
      { id: 'housekeeping', name: 'Housekeeping & Lost/Found', desc: 'Attendant tasks, room hygiene inspection', icon: Sparkles },
      { id: 'laundry', name: 'Laundry Services', desc: 'Guest dry cleaning and linen wash tracking', icon: Sparkles },
      { id: 'inventory', name: 'Inventory & Procurement', desc: 'Stock levels, purchase orders, store transfers', icon: Boxes },
      { id: 'finance', name: 'Finance & Night Audit', desc: 'General ledger, daily revenue audit, corporate AR', icon: DollarSign },
      { id: 'hr', name: 'Human Resources & RBAC', desc: 'Staff directory, shifts, user accounts, permissions', icon: UserCheck },
      { id: 'reports', name: 'Reports & Analytics', desc: 'Managerial financial statements and performance', icon: Receipt },
      { id: 'settings', name: 'Hotel System Settings', desc: 'Taxes, operational policies, and UI templates', icon: Receipt },
    ];

    modules.forEach((m) => {
      if (m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q)) {
        results.push({
          id: `mod-${m.id}`,
          type: 'navigation',
          title: m.name,
          subtitle: m.desc,
          icon: m.icon,
          category: 'System Navigation',
          action: () => {
            onNavigate(m.id);
            onClose();
          },
        });
      }
    });

    // 5. Match Employees
    employees.forEach((emp) => {
      if (
        emp.name.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        emp.title.toLowerCase().includes(q)
      ) {
        results.push({
          id: `emp-${emp.id}`,
          type: 'employee',
          title: `${emp.name} · ${emp.title}`,
          subtitle: `Dept: ${emp.department} · Shift: ${emp.shift} · Ext: ${emp.phone}`,
          badge: emp.department,
          badgeColor: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
          icon: UserCheck,
          category: 'Workforce Staff',
          action: () => {
            onNavigate('hr');
            onClose();
          },
        });
      }
    });

    return results.slice(0, 15);
  }, [query, rooms, guests, stays, reservations, employees, onNavigate, onClose, onOpenFolio, onOpenCheckIn, formatMoney]);

  // Handle keyboard navigation inside search results
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          searchResults[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search room (e.g. 205), guest, booking, staff, or system feature..."
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-400 shadow-xs">
            ESC
          </kbd>
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {searchResults.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                No matching records found for "{query}"
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for a room number (e.g. "101"), guest name, or "POS".
              </p>
            </div>
          ) : (
            searchResults.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              item.badgeColor || 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="hidden sm:inline-block text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      {item.category}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Select <CornerDownLeft className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px]">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px]">
                ↓
              </kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px]">
                ↵
              </kbd>
              to open
            </span>
          </div>
          <span>Hotel Universal Fast-Finder</span>
        </div>
      </div>
    </div>
  );
};
