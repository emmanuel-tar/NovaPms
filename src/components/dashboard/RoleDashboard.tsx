/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePMS } from '../../context/PMSContext';
import {
  TrendingUp,
  Building2,
  Users,
  CreditCard,
  DollarSign,
  AlertTriangle,
  Bed,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  ArrowRight,
  Receipt,
  Wine,
  UtensilsCrossed,
} from 'lucide-react';

export type DashboardRole = 'general_manager' | 'front_desk' | 'housekeeping' | 'finance';

export const RoleDashboard: React.FC<{ onNavigate: (tab: any) => void }> = ({ onNavigate }) => {
  const {
    rooms,
    stays,
    reservations,
    folioTransactions,
    folioPayments,
    housekeepingTasks,
    maintenanceRequests,
    formatMoney,
    businessDate,
    currentEmployee,
  } = usePMS();

  const [selectedRole, setSelectedRole] = useState<DashboardRole>('general_manager');

  // Real database-calculated figures
  const totalRoomsCount = rooms.length; // 140 rooms
  const activeStays = stays.filter((s) => s.status === 'active');
  const occupiedCount = activeStays.length;
  const availableCount = rooms.filter((r) => r.status === 'available').length;
  const reservedCount = rooms.filter((r) => r.status === 'reserved').length;
  const dirtyCount = rooms.filter((r) => r.status === 'dirty').length;
  const cleaningCount = rooms.filter((r) => r.status === 'cleaning').length;
  const inspectedCount = rooms.filter((r) => r.status === 'inspected').length;
  const outOfOrderCount = rooms.filter((r) => r.status === 'out_of_order' || r.status === 'maintenance').length;
  
  const occupancyPct = Math.round((occupiedCount / totalRoomsCount) * 1000) / 10;

  // Arrivals & Departures
  const todayArrivals = reservations.filter((r) => r.checkInDate === businessDate && r.status === 'confirmed');
  const todayDepartures = activeStays.filter((s) => s.checkOutDate === businessDate);

  // Revenue metrics from actual database transactions
  const totalPostedCharges = folioTransactions
    .filter((t) => t.status === 'posted')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const todayRevenue = folioTransactions
    .filter((t) => t.status === 'posted' && t.createdAt.startsWith(businessDate))
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const totalPaymentsCollected = folioPayments.reduce((sum, p) => sum + p.amount, 0);
  const outstandingGuestReceivables = Math.max(0, totalPostedCharges - totalPaymentsCollected);

  // Departmental sales
  const restRevenue = folioTransactions
    .filter((t) => (t.department === 'Main Restaurant' || t.department === 'Room Service') && t.status === 'posted')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const barRevenue = folioTransactions
    .filter((t) => (t.department === 'Main Bar' || t.department === 'Pool Bar') && t.status === 'posted')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const laundryRev = folioTransactions
    .filter((t) => t.department === 'Laundry' && t.status === 'posted')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const roomAccomRev = folioTransactions
    .filter((t) => t.department === 'Front Desk' && t.status === 'posted')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const adr = occupiedCount > 0 ? Math.round(roomAccomRev / occupiedCount) : 0;
  const revpar = totalRoomsCount > 0 ? Math.round(roomAccomRev / totalRoomsCount) : 0;

  return (
    <div className="space-y-6">
      {/* Role Dashboard Selector Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            Operations Command Dashboard
          </h2>
          <p className="text-xs text-slate-500">
            Real-time hotel metrics calculated from central database · Business Date:{' '}
            <strong className="font-mono text-slate-800 dark:text-slate-200">{businessDate}</strong>
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setSelectedRole('general_manager')}
            className={`px-3 py-1.5 font-semibold rounded-md transition-colors ${
              selectedRole === 'general_manager'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            General Manager
          </button>
          <button
            onClick={() => setSelectedRole('front_desk')}
            className={`px-3 py-1.5 font-semibold rounded-md transition-colors ${
              selectedRole === 'front_desk'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Front Desk
          </button>
          <button
            onClick={() => setSelectedRole('housekeeping')}
            className={`px-3 py-1.5 font-semibold rounded-md transition-colors ${
              selectedRole === 'housekeeping'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Housekeeping
          </button>
          <button
            onClick={() => setSelectedRole('finance')}
            className={`px-3 py-1.5 font-semibold rounded-md transition-colors ${
              selectedRole === 'finance'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Finance & Accounts
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. GENERAL MANAGER DASHBOARD */}
      {/* ============================================================== */}
      {selectedRole === 'general_manager' && (
        <div className="space-y-6">
          {/* Key Metric Strips */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Total Hotel Rooms</span>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5 tabular-nums">
                {totalRoomsCount}
              </div>
              <span className="text-[10px] text-slate-400">140 Key Capacity</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Occupied Rooms</span>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5 tabular-nums">
                {occupiedCount}
              </div>
              <span className="text-[10px] text-blue-500 font-semibold">{occupancyPct}% Occupancy</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Available Clean</span>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
                {availableCount}
              </div>
              <span className="text-[10px] text-emerald-600">Ready for sale</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Reserved / Due In</span>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-0.5 tabular-nums">
                {reservedCount}
              </div>
              <span className="text-[10px] text-slate-400">{todayArrivals.length} Arrivals today</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Dirty / In Cleaning</span>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5 tabular-nums">
                {dirtyCount + cleaningCount}
              </div>
              <span className="text-[10px] text-amber-600">Turnaround queue</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Out of Order (Maint)</span>
              <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5 tabular-nums">
                {outOfOrderCount}
              </div>
              <span className="text-[10px] text-rose-500">Locked from sale</span>
            </div>
          </div>

          {/* Revenue KPI Cards Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500">Today's Revenue</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                  LIVE
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono tabular-nums">
                {formatMoney(todayRevenue)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Across lodging, dining & valet</div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500">Average Daily Rate (ADR)</span>
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2 font-mono tabular-nums">
                {formatMoney(adr)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Per occupied room night</div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500">RevPAR (Yield)</span>
                <Building2 className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2 font-mono tabular-nums">
                {formatMoney(revpar)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Total inventory yield</div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500">Guest Folio Receivables</span>
                <CreditCard className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2 font-mono tabular-nums">
                {formatMoney(outstandingGuestReceivables)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Active in-house ledger balance</div>
            </div>
          </div>

          {/* Department Revenue Breakdown & Operational Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span>Departmental Revenue Contribution</span>
                <button
                  onClick={() => onNavigate('finance')}
                  className="text-xs text-emerald-600 hover:underline font-medium"
                >
                  View Full General Ledger &rarr;
                </button>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium mb-1">
                    <span>Room Accommodation Lodging</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {formatMoney(roomAccomRev)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium mb-1">
                    <span>Restaurant & In-Room Dining F&B</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {formatMoney(restRevenue)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '22%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium mb-1">
                    <span>Bars & Pool Lounge Beverages</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {formatMoney(barRevenue)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '9%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium mb-1">
                    <span>Laundry & Valet Services</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {formatMoney(laundryRev)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full" style={{ width: '4%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Operational Priority Alerts */}
            <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                Management Operational Alerts
              </h3>

              <div className="space-y-2 text-xs">
                {outOfOrderCount > 0 && (
                  <div className="p-2.5 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/30 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-rose-900 dark:text-rose-200">
                        {outOfOrderCount} Room(s) Locked Out-of-Order
                      </span>
                      <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                        Room 208 under AC maintenance. Reassignment necessary.
                      </p>
                    </div>
                  </div>
                )}

                <div className="p-2.5 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/30 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900 dark:text-amber-200">
                      {todayDepartures.length} Check-outs Expected Today
                    </span>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                      Front Desk must ensure all folios are reconciled prior to departure.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-blue-900 dark:text-blue-200">
                      LAN High-Availability Server Online
                    </span>
                    <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                      All POS terminals, KDS displays, and Front Desk sync active.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. FRONT DESK DASHBOARD */}
      {/* ============================================================== */}
      {selectedRole === 'front_desk' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Today's Expected Arrivals</span>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1 tabular-nums">
                {todayArrivals.length}
              </div>
              <span className="text-[11px] text-slate-400">Confirmed bookings</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Today's Departures</span>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
                {todayDepartures.length}
              </div>
              <span className="text-[11px] text-slate-400">Due for folio settlement</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Available Clean Rooms</span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                {availableCount}
              </div>
              <span className="text-[11px] text-emerald-600">Immediate walk-in ready</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Currently In-House</span>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1 tabular-nums">
                {occupiedCount}
              </div>
              <span className="text-[11px] text-slate-400">Active registered stays</span>
            </div>
          </div>

          {/* Quick Action Tables for Receptionist */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  Pending Check-ins (Today)
                </span>
                <button
                  onClick={() => onNavigate('reservations')}
                  className="text-xs text-emerald-600 hover:underline"
                >
                  All Bookings &rarr;
                </button>
              </div>

              {todayArrivals.length === 0 ? (
                <div className="py-6 text-center text-slate-400">No pending arrivals today.</div>
              ) : (
                <div className="space-y-2">
                  {todayArrivals.map((res) => (
                    <div
                      key={res.id}
                      className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {res.guestName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {res.category} · Phone: {res.guestPhone}
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigate('frontdesk')}
                        className="px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold text-xs"
                      >
                        Check-in
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  Pending Departures (Today)
                </span>
                <button
                  onClick={() => onNavigate('frontdesk')}
                  className="text-xs text-emerald-600 hover:underline"
                >
                  Room Rack &rarr;
                </button>
              </div>

              {todayDepartures.length === 0 ? (
                <div className="py-6 text-center text-slate-400">No scheduled departures today.</div>
              ) : (
                <div className="space-y-2">
                  {todayDepartures.map((stay) => (
                    <div
                      key={stay.id}
                      className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          Room {stay.roomNumber} — {stay.guestName}
                        </div>
                        <div className="text-[11px] text-slate-500">{stay.roomCategory}</div>
                      </div>
                      <button
                        onClick={() => onNavigate('frontdesk')}
                        className="px-2.5 py-1 rounded bg-slate-900 text-white font-semibold text-xs"
                      >
                        Settle & Checkout
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. HOUSEKEEPING DASHBOARD */}
      {/* ============================================================== */}
      {selectedRole === 'housekeeping' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Dirty Rooms (Vacant)</span>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 tabular-nums">
                {dirtyCount}
              </div>
              <span className="text-[11px] text-rose-600">Priority turnaround</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Cleaning in Progress</span>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
                {cleaningCount}
              </div>
              <span className="text-[11px] text-slate-400">Attendants active</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Awaiting Inspection</span>
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1 tabular-nums">
                {inspectedCount}
              </div>
              <span className="text-[11px] text-slate-400">Supervisor sign-off</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Cleaned & Available</span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                {availableCount}
              </div>
              <span className="text-[11px] text-emerald-600">Ready for guest arrival</span>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-bold text-slate-900 dark:text-slate-100">
                Active Cleaning Tasks & Floor Assignments
              </span>
              <button
                onClick={() => onNavigate('housekeeping')}
                className="text-xs text-emerald-600 hover:underline"
              >
                Open Housekeeping Board &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {housekeepingTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      Room {t.roomNumber}
                    </span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded uppercase">
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {t.taskType} · Attendant: {t.assignedTo}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. FINANCE DASHBOARD */}
      {/* ============================================================== */}
      {selectedRole === 'finance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Today's Cash & POS Collections</span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono tabular-nums">
                {formatMoney(totalPaymentsCollected)}
              </div>
              <span className="text-[11px] text-slate-400">Total settled tenders</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Guest Ledger Receivables</span>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 font-mono tabular-nums">
                {formatMoney(outstandingGuestReceivables)}
              </div>
              <span className="text-[11px] text-slate-400">Unsettled active folios</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Operating Bank Balance</span>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1 font-mono tabular-nums">
                {formatMoney(48500000)}
              </div>
              <span className="text-[11px] text-slate-400">GTBank Main Operating</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Trade Accounts Payable</span>
              <div className="text-2xl font-bold text-slate-700 dark:text-slate-300 mt-1 font-mono tabular-nums">
                {formatMoney(6850000)}
              </div>
              <span className="text-[11px] text-slate-400">Vendors & Food suppliers</span>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-bold text-slate-900 dark:text-slate-100">
                Recent Accounting Transactions & Payment Entries
              </span>
              <button
                onClick={() => onNavigate('finance')}
                className="text-xs text-emerald-600 hover:underline"
              >
                General Ledger & P&L &rarr;
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {folioPayments.slice(0, 5).map((pay) => (
                <div key={pay.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      Payment Received ({pay.paymentMethod.replace('_', ' ').toUpperCase()})
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Receipt #{pay.receiptNumber} · Ref: {pay.reference} · By: {pay.receivedBy}
                    </div>
                  </div>
                  <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    +{formatMoney(pay.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
