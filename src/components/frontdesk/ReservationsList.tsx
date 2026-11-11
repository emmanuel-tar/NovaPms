/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePMS } from '../../context/PMSContext';
import { Reservation } from '../../types/pms';
import {
  CalendarCheck,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  Building,
  User,
} from 'lucide-react';

export const ReservationsList: React.FC = () => {
  const { reservations, rooms, checkInGuest, createReservation, formatMoney, showToast } = usePMS();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New reservation form state
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('+234 ');
  const [guestEmail, setGuestEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [category, setCategory] = useState<string>('Deluxe Double');
  const [checkInDate, setCheckInDate] = useState('2026-11-12');
  const [checkOutDate, setCheckOutDate] = useState('2026-11-15');
  const [adults, setAdults] = useState(1);
  const [channel, setChannel] = useState<'Walk-in' | 'Direct Phone' | 'Corporate' | 'Website Direct'>('Direct Phone');
  const [depositPaid, setDepositPaid] = useState(50000);

  const filtered = reservations.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.bookingCode.toLowerCase().includes(q) ||
        r.guestName.toLowerCase().includes(q) ||
        r.guestPhone.includes(q) ||
        (r.companyName && r.companyName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleQuickCheckIn = (res: Reservation) => {
    // Find an available room of matching category
    const matchingRoom = rooms.find((r) => r.category === res.category && r.status === 'available');
    if (!matchingRoom) {
      showToast(`No available ${res.category} rooms to assign right now. Clean or release a room first.`, 'error');
      return;
    }

    const stay = checkInGuest({
      guestName: res.guestName,
      guestPhone: res.guestPhone,
      roomId: matchingRoom.id,
      checkInDate: res.checkInDate,
      checkOutDate: res.checkOutDate,
      adults: res.adults,
      children: res.children,
      depositAmount: res.depositPaid,
      notes: `Reservation #${res.bookingCode} via ${res.channel}.`,
    });

    if (stay) {
      res.status = 'checked_in';
      showToast(`Reservation #${res.bookingCode} checked into Room ${matchingRoom.number}!`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search booking code, guest, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Bookings ({reservations.length})</option>
              <option value="confirmed">Confirmed</option>
              <option value="tentative">Tentative</option>
              <option value="checked_in">Checked In</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Advance Reservation
        </button>
      </div>

      {/* Reservations Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Booking Code</th>
                <th className="py-3 px-4">Guest & Contact</th>
                <th className="py-3 px-4">Room Category</th>
                <th className="py-3 px-4">Schedule</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4 text-right">Est. Total / Deposit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                    {res.bookingCode}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{res.guestName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{res.guestPhone}</div>
                    {res.companyName && (
                      <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                        {res.companyName}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                    {res.category}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    <div>Arr: <strong className="font-mono">{res.checkInDate}</strong></div>
                    <div>Dep: <strong className="font-mono">{res.checkOutDate}</strong></div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {res.channel}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {formatMoney(res.estimatedTotal)}
                    </div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                      Dep: {formatMoney(res.depositPaid)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        res.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : res.status === 'checked_in'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {res.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {res.status === 'confirmed' && (
                      <button
                        onClick={() => handleQuickCheckIn(res)}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                      >
                        Check-in Now
                      </button>
                    )}
                    {res.status === 'checked_in' && (
                      <span className="text-[11px] text-slate-400 italic">In-house</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Reservation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-lg w-full p-6 text-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Create New Hotel Reservation
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Guest Name</label>
                <input
                  type="text"
                  placeholder="Full guest name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Phone</label>
                  <input
                    type="text"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Standard Single">Standard Single</option>
                    <option value="Deluxe Double">Deluxe Double</option>
                    <option value="Executive Suite">Executive Suite</option>
                    <option value="Presidential Penthouse">Presidential Penthouse</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Arrival Date</label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Departure Date</label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Channel</label>
                  <select
                    value={channel}
                    onChange={(e: any) => setChannel(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Direct Phone">Direct Phone</option>
                    <option value="Corporate">Corporate Account</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Website Direct">Website Direct</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Advance Deposit (₦)</label>
                  <input
                    type="number"
                    value={depositPaid}
                    onChange={(e) => setDepositPaid(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!guestName) {
                    showToast('Please enter guest name', 'error');
                    return;
                  }
                  const newRes = createReservation({
                    guestName,
                    guestPhone,
                    guestEmail,
                    companyName: companyName || undefined,
                    category,
                    roomCount: 1,
                    assignedRoomNumbers: [],
                    checkInDate,
                    checkOutDate,
                    adults,
                    children: 0,
                    nightlyRate: 95000,
                    estimatedTotal: 285000,
                    depositPaid,
                    channel,
                    type: companyName ? 'corporate' : 'individual',
                    status: 'confirmed',
                    notes: '',
                  });
                  showToast(`Reservation #${newRes.bookingCode} created for ${guestName}!`);
                  setShowAddModal(false);
                  setGuestName('');
                }}
                className="px-4 py-1.5 rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
