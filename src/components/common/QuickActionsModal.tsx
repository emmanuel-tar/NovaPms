/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePMS } from '../../context/PMSContext';
import { DepartmentSource, RoomStatus } from '../../types/pms';
import {
  Zap,
  BedDouble,
  DollarSign,
  Sparkles,
  CalendarCheck,
  CheckCircle2,
  X,
  CreditCard,
  Plus,
} from 'lucide-react';

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAction?: 'walkin' | 'postcharge' | 'roomstatus' | 'booking';
}

export const QuickActionsModal: React.FC<QuickActionsModalProps> = ({
  isOpen,
  onClose,
  defaultAction = 'walkin',
}) => {
  const {
    rooms,
    stays,
    roomCategories,
    businessDate,
    currency,
    formatMoney,
    checkInGuest,
    postChargeToRoom,
    updateRoomStatus,
    createReservation,
    showToast,
  } = usePMS();

  const [activeTab, setActiveTab] = useState<'walkin' | 'postcharge' | 'roomstatus' | 'booking'>(
    defaultAction
  );

  // Form states for Quick Walk-In
  const [walkinGuestName, setWalkinGuestName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinRoomId, setWalkinRoomId] = useState('');
  const [walkinNights, setWalkinNights] = useState(1);
  const [walkinDeposit, setWalkinDeposit] = useState(50000);

  // Form states for Quick Charge
  const [chargeStayId, setChargeStayId] = useState('');
  const [chargeDept, setChargeDept] = useState<DepartmentSource>('Main Restaurant');
  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeAmount, setChargeAmount] = useState<number>(5000);
  const [chargeQty, setChargeQty] = useState<number>(1);

  // Form states for Quick Room Status
  const [statusRoomId, setStatusRoomId] = useState('');
  const [statusTarget, setStatusTarget] = useState<RoomStatus>('inspected');
  const [statusReason, setStatusReason] = useState('');

  // Form states for Quick Reservation
  const [resGuestName, setResGuestName] = useState('');
  const [resPhone, setResPhone] = useState('');
  const [resCatId, setResCatId] = useState(roomCategories[0]?.id || '');
  const [resNights, setResNights] = useState(2);

  if (!isOpen) return null;

  // Filter available and ready rooms
  const availableRooms = rooms.filter(
    (r) => r.status === 'available' || r.status === 'inspected'
  );

  // Occupied stays for quick charging
  const activeStays = stays.filter((s) => s.status === 'active');

  const handleWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinGuestName || !walkinPhone || !walkinRoomId) {
      showToast('Please fill in guest name, phone, and select an available room', 'error');
      return;
    }

    const checkInDate = businessDate;
    const checkOut = new Date(businessDate);
    checkOut.setDate(checkOut.getDate() + Number(walkinNights));
    const checkOutDate = checkOut.toISOString().split('T')[0];

    const result = checkInGuest({
      guestName: walkinGuestName,
      guestPhone: walkinPhone,
      roomId: walkinRoomId,
      checkInDate,
      checkOutDate,
      adults: 1,
      children: 0,
      depositAmount: Number(walkinDeposit),
      notes: 'Express Walk-In Arrival',
    });

    if (result) {
      showToast(`Guest ${walkinGuestName} checked in to Room successfully!`, 'success');
      onClose();
    }
  };

  const handleChargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargeStayId || !chargeDesc || chargeAmount <= 0) {
      showToast('Please select guest stay, enter description and valid amount', 'error');
      return;
    }

    const result = postChargeToRoom(
      chargeStayId,
      chargeDept,
      chargeDesc,
      Number(chargeQty),
      Number(chargeAmount),
      0
    );

    if (result) {
      showToast(`Charged ${formatMoney(chargeAmount * chargeQty)} to room folio`, 'success');
      onClose();
    }
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusRoomId) {
      showToast('Please select a room to update', 'error');
      return;
    }

    updateRoomStatus(statusRoomId, statusTarget, statusReason || 'Quick status update');
    showToast(`Room status updated to ${statusTarget.toUpperCase()}`, 'success');
    onClose();
  };

  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resGuestName || !resPhone || !resCatId) {
      showToast('Please fill in guest details and select category', 'error');
      return;
    }

    const checkInDate = businessDate;
    const checkOut = new Date(businessDate);
    checkOut.setDate(checkOut.getDate() + Number(resNights));
    const checkOutDate = checkOut.toISOString().split('T')[0];

    const category = roomCategories.find((c) => c.id === resCatId);
    const catName = category ? category.name : 'Deluxe Room';
    const rate = category ? category.baseRate : 60000;

    createReservation({
      guestName: resGuestName,
      guestPhone: resPhone,
      guestEmail: `${resGuestName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      category: catName,
      roomCount: 1,
      assignedRoomNumbers: [],
      checkInDate,
      checkOutDate,
      adults: 1,
      children: 0,
      nightlyRate: rate,
      estimatedTotal: rate * Number(resNights),
      depositPaid: 0,
      channel: 'Direct Phone',
      type: 'individual',
      status: 'confirmed',
      notes: 'Quick telephone booking capture',
    });

    showToast(`Confirmed reservation for ${resGuestName}`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Front Office Quick Actions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                High-speed express operations for front desk and outlets
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

        {/* Tab selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6 gap-2">
          <button
            onClick={() => setActiveTab('walkin')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'walkin'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BedDouble className="w-4 h-4" />
            Express Walk-In
          </button>
          <button
            onClick={() => setActiveTab('postcharge')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'postcharge'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Post Room Charge
          </button>
          <button
            onClick={() => setActiveTab('roomstatus')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'roomstatus'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Flip Room Status
          </button>
          <button
            onClick={() => setActiveTab('booking')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'booking'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            Fast Booking
          </button>
        </div>

        {/* Tab 1: Express Walk-In */}
        {activeTab === 'walkin' && (
          <form onSubmit={handleWalkInSubmit} className="p-6 space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-3 text-xs text-emerald-800 dark:text-emerald-300">
              ⚡ Instant check-in for arriving walk-in guests in under 30 seconds.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Guest Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={walkinGuestName}
                  onChange={(e) => setWalkinGuestName(e.target.value)}
                  placeholder="e.g. Dr. Folake Solanke"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Telephone *
                </label>
                <input
                  type="tel"
                  required
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  placeholder="+234 803 123 4567"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Select Clean & Ready Room *
              </label>
              <select
                required
                value={walkinRoomId}
                onChange={(e) => setWalkinRoomId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">-- Choose available ready room --</option>
                {availableRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.number} · {r.category} (Floor {r.floor}) - {formatMoney(r.baseRate)}/night [{r.status.toUpperCase()}]
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Length of Stay (Nights)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={walkinNights}
                  onChange={(e) => setWalkinNights(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Deposit Paid ({currency})
                </label>
                <input
                  type="number"
                  step="5000"
                  value={walkinDeposit}
                  onChange={(e) => setWalkinDeposit(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Complete Express Check-In
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Post Room Charge */}
        {activeTab === 'postcharge' && (
          <form onSubmit={handleChargeSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Select Active In-House Guest / Room *
              </label>
              <select
                required
                value={chargeStayId}
                onChange={(e) => setChargeStayId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">-- Choose occupied guest room --</option>
                {activeStays.map((s) => (
                  <option key={s.id} value={s.id}>
                    Room {s.roomNumber} · {s.guestName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Posting Department *
                </label>
                <select
                  value={chargeDept}
                  onChange={(e) => setChargeDept(e.target.value as DepartmentSource)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Main Restaurant">Main Restaurant</option>
                  <option value="Main Bar">Main Bar</option>
                  <option value="Pool Bar">Pool Bar</option>
                  <option value="Room Service">Room Service</option>
                  <option value="Minibar">Minibar</option>
                  <option value="Laundry">Laundry</option>
                  <option value="Spa & Wellness">Spa & Wellness</option>
                  <option value="Gym & Facilities">Gym & Facilities</option>
                  <option value="Transport">Transport</option>
                  <option value="Front Desk">Front Desk</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Charge Amount ({currency}) *
                </label>
                <input
                  type="number"
                  step="500"
                  required
                  value={chargeAmount}
                  onChange={(e) => setChargeAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Item Description / Ticket # *
                </label>
                <input
                  type="text"
                  required
                  value={chargeDesc}
                  onChange={(e) => setChargeDesc(e.target.value)}
                  placeholder="e.g. 2x Suya Platter & Cocktail #T-489"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={chargeQty}
                  onChange={(e) => setChargeQty(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <CreditCard className="w-4 h-4" />
                Post To Guest Folio
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Flip Room Status */}
        {activeTab === 'roomstatus' && (
          <form onSubmit={handleStatusSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Select Room *
              </label>
              <select
                required
                value={statusRoomId}
                onChange={(e) => setStatusRoomId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">-- Choose room --</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.number} · Currently [{r.status.toUpperCase()}] · {r.category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                New Housekeeping / PMS Status *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['available', 'inspected', 'dirty', 'maintenance'] as RoomStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusTarget(st)}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                      statusTarget === st
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {st.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reason / Inspection Notes
              </label>
              <input
                type="text"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="e.g. VIP turnover complete, mini-bar restocked"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                Update Status
              </button>
            </div>
          </form>
        )}

        {/* Tab 4: Fast Booking */}
        {activeTab === 'booking' && (
          <form onSubmit={handleReservationSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Guest Name *
                </label>
                <input
                  type="text"
                  required
                  value={resGuestName}
                  onChange={(e) => setResGuestName(e.target.value)}
                  placeholder="Mr. Chukwuma Obi"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={resPhone}
                  onChange={(e) => setResPhone(e.target.value)}
                  placeholder="+234 802 999 8888"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Room Category *
                </label>
                <select
                  value={resCatId}
                  onChange={(e) => setResCatId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {roomCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({formatMoney(c.baseRate)}/night)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nights
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={resNights}
                  onChange={(e) => setResNights(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Confirm Fast Booking
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
