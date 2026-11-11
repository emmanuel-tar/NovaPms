/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePMS } from '../../context/PMSContext';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  DollarSign,
  BedDouble,
  TrendingUp,
  Package,
  Layers,
  FileSpreadsheet,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

export const ReportsAnalyticsView: React.FC = () => {
  const {
    rooms,
    stays,
    folioTransactions,
    folioPayments,
    reservations,
    inventory,
    hotelSettings,
    businessDate,
    formatMoney,
    currency,
  } = usePMS();

  const [activeReportType, setActiveReportType] = useState<
    'occupancy' | 'financial' | 'departmental' | 'inventory' | 'arrivals_departures'
  >('occupancy');

  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | 'week' | 'month'>('today');

  // Operational Metrics
  const totalRooms = rooms.length; // 140
  const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
  const dirtyRooms = rooms.filter((r) => r.status === 'dirty' || r.status === 'cleaning').length;
  const outOfOrderRooms = rooms.filter((r) => r.status === 'out_of_order' || r.status === 'maintenance').length;
  const availableRooms = rooms.filter((r) => r.status === 'available' || r.status === 'inspected').length;
  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

  // Financial Metrics
  const validTransactions = folioTransactions.filter((tx) => tx.status === 'posted');
  const totalRevenue = validTransactions.reduce((acc, tx) => acc + tx.totalAmount, 0);

  const roomRevenue = validTransactions
    .filter((tx) => tx.department === 'Front Desk')
    .reduce((acc, tx) => acc + tx.totalAmount, 0);

  const fAndBRevenue = validTransactions
    .filter(
      (tx) =>
        tx.department === 'Main Restaurant' ||
        tx.department === 'Main Bar' ||
        tx.department === 'Pool Bar' ||
        tx.department === 'Room Service'
    )
    .reduce((acc, tx) => acc + tx.totalAmount, 0);

  const otherRevenue = totalRevenue - (roomRevenue + fAndBRevenue);

  const adr = occupiedRooms > 0 ? roomRevenue / occupiedRooms : 0;
  const revPar = totalRooms > 0 ? roomRevenue / totalRooms : 0;

  // Departmental breakdown data
  const departmentsList = [
    'Front Desk',
    'Main Restaurant',
    'Main Bar',
    'Pool Bar',
    'Room Service',
    'Laundry',
    'Gym & Facilities',
    'Transport',
    'Minibar',
  ];

  const deptRevenueMap = departmentsList.map((dept) => {
    const txs = validTransactions.filter((t) => t.department === dept);
    const amount = txs.reduce((acc, t) => acc + t.totalAmount, 0);
    const txCount = txs.length;
    return {
      name: dept,
      amount,
      txCount,
      percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0,
    };
  });

  // Inventory valuation helper
  const getItemTotalStock = (item: (typeof inventory)[0]) =>
    Object.values(item.storeStocks).reduce((a, b) => a + b, 0);

  const totalStockValuation = inventory.reduce(
    (acc, item) => acc + getItemTotalStock(item) * item.unitCost,
    0
  );
  const lowStockItems = inventory.filter(
    (item) => (item.storeStocks['Central Warehouse'] || 0) <= item.reorderLevel
  );

  // In-house & arrivals
  const activeStays = stays.filter((s) => s.status === 'active');
  const expectedDepartures = activeStays.filter((s) => s.checkOutDate <= businessDate);
  const expectedArrivals = reservations.filter(
    (r) => r.status === 'confirmed' && r.checkInDate === businessDate
  );

  // Helper for guest in room
  const getRoomGuestName = (stayId?: string) => {
    if (!stayId) return 'Vacant';
    const s = stays.find((st) => st.id === stayId);
    return s ? s.guestName : 'Occupied';
  };

  // Export to CSV Function
  const handleExportCSV = () => {
    let csvRows: string[][] = [];
    let filename = `GrandVista_Report_${activeReportType}_${businessDate}.csv`;

    if (activeReportType === 'occupancy') {
      csvRows = [
        ['Room Number', 'Category', 'Floor', 'Building', 'Status', 'Current Guest', 'Nightly Rate (NGN)'],
        ...rooms.map((r) => [
          r.number,
          r.category,
          `Floor ${r.floor}`,
          r.building,
          r.status.toUpperCase(),
          getRoomGuestName(r.currentStayId),
          r.baseRate.toString(),
        ]),
      ];
    } else if (activeReportType === 'financial' || activeReportType === 'departmental') {
      csvRows = [
        ['Transaction ID', 'Date', 'Room', 'Guest', 'Department', 'Description', 'Qty', 'Unit Price', 'VAT', 'Total (NGN)'],
        ...validTransactions.map((tx) => [
          tx.id,
          tx.createdAt,
          tx.roomNumber,
          tx.guestName,
          tx.department,
          `"${tx.description.replace(/"/g, '""')}"`,
          tx.quantity.toString(),
          tx.unitPrice.toString(),
          tx.taxAmount.toString(),
          tx.totalAmount.toString(),
        ]),
      ];
    } else if (activeReportType === 'inventory') {
      csvRows = [
        ['Item Code', 'Item Name', 'Category', 'Central Stock', 'Total Stock', 'Unit', 'Unit Cost (NGN)', 'Valuation (NGN)', 'Status'],
        ...inventory.map((item) => {
          const tot = getItemTotalStock(item);
          const central = item.storeStocks['Central Warehouse'] || 0;
          return [
            item.code,
            `"${item.name.replace(/"/g, '""')}"`,
            item.category,
            central.toString(),
            tot.toString(),
            item.unit,
            item.unitCost.toString(),
            (tot * item.unitCost).toString(),
            central <= item.reorderLevel ? 'LOW_STOCK' : 'NORMAL',
          ];
        }),
      ];
    } else {
      csvRows = [
        ['Type', 'Reference / Room', 'Guest Name', 'Phone', 'Check-In', 'Check-Out', 'Status'],
        ...activeStays.map((s) => [
          'In-House Stay',
          s.roomNumber,
          s.guestName,
          s.guestPhone,
          s.checkInDate,
          s.checkOutDate,
          s.status.toUpperCase(),
        ]),
        ...expectedArrivals.map((r) => [
          'Expected Arrival',
          r.bookingCode,
          r.guestName,
          r.guestPhone,
          r.checkInDate,
          r.checkOutDate,
          r.status.toUpperCase(),
        ]),
      ];
    }

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Reports & Executive Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time audit summaries, occupancy trends, ADR/RevPAR, departmental revenue, and inventory valuations
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date Range Selector */}
          <div className="flex items-center p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
            {(['today', 'yesterday', 'week', 'month'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-2.5 py-1 font-medium rounded-md capitalize transition-colors ${
                  dateRange === r
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {r === 'week' ? 'Last 7D' : r === 'month' ? 'MTD' : r}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Flash Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span>Occupancy Rate</span>
            <span className="font-mono text-emerald-600">{occupiedRooms}/{totalRooms}</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            {occupancyRate.toFixed(1)}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span>Average Daily Rate (ADR)</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
            {formatMoney(adr)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Revenue per occupied room night</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span>RevPAR</span>
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            {formatMoney(revPar)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across all 140 physical rooms</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span>Total Posted Revenue</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 px-1 rounded font-bold">
              NET
            </span>
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            {formatMoney(totalRevenue)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Including VAT & Service charges</div>
        </div>
      </div>

      {/* Report Module Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'occupancy', label: 'Room Occupancy Audit', icon: BedDouble },
          { id: 'departmental', label: 'Departmental Revenue', icon: DollarSign },
          { id: 'financial', label: 'All Posted Transactions', icon: FileSpreadsheet },
          { id: 'inventory', label: 'Inventory & Store Valuation', icon: Package },
          { id: 'arrivals_departures', label: 'Arrivals & Departures', icon: ArrowUpRight },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReportType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportType(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Report Viewport */}
      {activeReportType === 'occupancy' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-[11px] text-slate-400">Occupied Rooms</span>
              <div className="text-lg font-bold font-mono text-emerald-600">{occupiedRooms}</div>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-[11px] text-slate-400">Available / Inspected</span>
              <div className="text-lg font-bold font-mono text-blue-600">{availableRooms}</div>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-[11px] text-slate-400">Dirty / Cleaning</span>
              <div className="text-lg font-bold font-mono text-amber-600">{dirtyRooms}</div>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-[11px] text-slate-400">Out of Order (OOO)</span>
              <div className="text-lg font-bold font-mono text-rose-600">{outOfOrderRooms}</div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                140 Room Property Audit Status
              </span>
              <span className="text-[11px] font-mono text-slate-400">Date: {businessDate}</span>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800 sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Room</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Wing & Floor</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Current In-House Guest</th>
                    <th className="px-4 py-3 text-right">Standard Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {rooms.slice(0, 30).map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-2.5 font-bold font-mono text-slate-900 dark:text-slate-100">
                        {r.number}
                      </td>
                      <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{r.category}</td>
                      <td className="px-4 py-2.5 text-slate-500">
                        {r.building} · Floor {r.floor}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md ${
                            r.status === 'occupied'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : r.status === 'available' || r.status === 'inspected'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : r.status === 'dirty' || r.status === 'cleaning'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {r.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-200">
                        {getRoomGuestName(r.currentStayId)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">
                        {formatMoney(r.baseRate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-2.5 text-center text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
              Showing first 30 of 140 rooms. Use "Export CSV" to download the full property audit manifest.
            </div>
          </div>
        </div>
      )}

      {activeReportType === 'departmental' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-xs text-slate-400">Front Desk & Rooms</span>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                {formatMoney(roomRevenue)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {totalRevenue > 0 ? ((roomRevenue / totalRevenue) * 100).toFixed(1) : 0}% of total revenue
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-xs text-slate-400">Food & Beverages (4 Outlets)</span>
              <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {formatMoney(fAndBRevenue)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {totalRevenue > 0 ? ((fAndBRevenue / totalRevenue) * 100).toFixed(1) : 0}% of total revenue
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-xs text-slate-400">Other Services (Laundry/Fleet/Spa)</span>
              <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                {formatMoney(otherRevenue)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {totalRevenue > 0 ? ((otherRevenue / totalRevenue) * 100).toFixed(1) : 0}% of total revenue
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Departmental Revenue Breakdown
              </span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Operating Department</th>
                  <th className="px-4 py-3 text-center">Transactions</th>
                  <th className="px-4 py-3 text-right">Revenue Contributed</th>
                  <th className="px-4 py-3 text-right">Share of Total</th>
                  <th className="px-4 py-3">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {deptRevenueMap.map((d) => (
                  <tr key={d.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{d.name}</td>
                    <td className="px-4 py-3 text-center font-mono text-slate-600 dark:text-slate-400">
                      {d.txCount}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatMoney(d.amount)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                      {d.percentage.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 w-40">
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full"
                          style={{ width: `${Math.min(100, d.percentage)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReportType === 'financial' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              General Ledger Posted Folio Transactions ({validTransactions.length})
            </span>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800 sticky top-0">
                <tr>
                  <th className="px-4 py-3">Date / Time</th>
                  <th className="px-3 py-3">Room</th>
                  <th className="px-4 py-3">Guest Name</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-3 py-3 text-right">Net Price</th>
                  <th className="px-3 py-3 text-right">Taxes (VAT+SC)</th>
                  <th className="px-4 py-3 text-right">Gross Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {validTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500">{tx.createdAt}</td>
                    <td className="px-3 py-2.5 font-bold font-mono text-emerald-600">
                      {tx.roomNumber ? `Rm ${tx.roomNumber}` : '—'}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-200">{tx.guestName}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {tx.department}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{tx.description}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-600 dark:text-slate-400">
                      {formatMoney(tx.unitPrice * tx.quantity)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-500">
                      {formatMoney(tx.taxAmount)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatMoney(tx.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReportType === 'inventory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-xs text-slate-400">Total Inventory Valuation</span>
              <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {formatMoney(totalStockValuation)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Across Central and Departmental stores</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-xs text-slate-400">Catalogued Items</span>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                {inventory.length} SKUs
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Active tracked hotel commodities</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-xs text-slate-400">Low Stock Warnings</span>
              <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
                {lowStockItems.length} Items
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Requires replenishment purchase order</div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Item / Code</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Central Stock</th>
                  <th className="px-4 py-3 text-right">Total In Stores</th>
                  <th className="px-3 py-3 text-right">Unit Cost</th>
                  <th className="px-4 py-3 text-right">Total Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {inventory.map((item) => {
                  const central = item.storeStocks['Central Warehouse'] || 0;
                  const total = getItemTotalStock(item);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{item.code}</div>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{item.category}</td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        {central} {item.unit}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                        {total} {item.unit}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-600 dark:text-slate-400">
                        {formatMoney(item.unitCost)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatMoney(total * item.unitCost)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReportType === 'arrivals_departures' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Expected Departures */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Expected Departures Today ({expectedDepartures.length})
              </span>
            </div>
            <div className="p-3 divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {expectedDepartures.length === 0 ? (
                <div className="py-6 text-center text-slate-400">No scheduled departures today.</div>
              ) : (
                expectedDepartures.map((s) => (
                  <div key={s.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        Room {s.roomNumber} · {s.guestName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Stay ID: {s.id} · In since {s.checkInDate}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Checkout Due
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Expected Arrivals */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Expected Arrivals Today ({expectedArrivals.length})
              </span>
            </div>
            <div className="p-3 divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {expectedArrivals.length === 0 ? (
                <div className="py-6 text-center text-slate-400">No scheduled arrivals today.</div>
              ) : (
                expectedArrivals.map((r) => (
                  <div key={r.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {r.guestName} ({r.category})
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Booking: {r.bookingCode} · Phone: {r.guestPhone}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Confirmed Booking
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
