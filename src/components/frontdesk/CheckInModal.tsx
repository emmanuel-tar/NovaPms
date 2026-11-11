/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePMS } from '../../context/PMSContext';
import { Room } from '../../types/pms';
import { X, UserCheck, Key, ShieldCheck, DollarSign } from 'lucide-react';

interface CheckInModalProps {
  initialRoom?: Room;
  onClose: () => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({ initialRoom, onClose }) => {
  const { rooms, checkInGuest, businessDate, formatMoney, showToast } = usePMS();

  const availableRooms = rooms.filter((r) => r.status === 'available' || r.id === initialRoom?.id);

  const [roomId, setRoomId] = useState(initialRoom?.id || availableRooms[0]?.id || '');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('+234 ');
  const [guestEmail, setGuestEmail] = useState('');
  const [idType, setIdType] = useState<'National ID' | 'International Passport' | "Driver's License">('National ID');
  const [idNumber, setIdNumber] = useState('');
  const [checkInDate, setCheckInDate] = useState(businessDate);
  const [checkOutDate, setCheckOutDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [depositAmount, setDepositAmount] = useState(100000);
  const [notes, setNotes] = useState('');

  const selectedRoom = rooms.find((r) => r.id === roomId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      showToast('Please enter guest full name', 'error');
      return;
    }
    if (!roomId) {
      showToast('Please select a room', 'error');
      return;
    }

    const stay = checkInGuest({
      guestName,
      guestPhone,
      roomId,
      checkInDate,
      checkOutDate,
      adults,
      children,
      depositAmount,
      notes: `${notes} [ID: ${idType} ${idNumber}]`,
    });

    if (stay) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Front Desk Guest Registration & Check-in
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Room Selection */}
          <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900">
            <label className="block font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Select Room & Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
              >
                {availableRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.number} — {r.category} ({formatMoney(r.baseRate)}/night)
                  </option>
                ))}
              </select>
              {selectedRoom && (
                <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <span>Floor {selectedRoom.floor}</span>
                  <span>·</span>
                  <span>Max: {selectedRoom.maxAdults} Adults, {selectedRoom.maxChildren} Children</span>
                </div>
              )}
            </div>
          </div>

          {/* Guest Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Guest Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Chief Adeleke Johnson"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="guest@company.ng"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">ID Document Type</label>
              <select
                value={idType}
                onChange={(e: any) => setIdType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="National ID">NIN / National ID</option>
                <option value="International Passport">International Passport</option>
                <option value="Driver's License">Driver's License</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">ID Number</label>
              <input
                type="text"
                placeholder="e.g. A09281922"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          {/* Dates & Occupancy */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Arrival Date</label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Departure Date</label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Adults</label>
              <input
                type="number"
                min="1"
                max="4"
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Children</label>
              <input
                type="number"
                min="0"
                max="3"
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Deposit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">
                Advance Deposit (Credited to Room Folio)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Special Preferences / Notes</label>
              <input
                type="text"
                placeholder="e.g. Non-smoking, High floor, VIP welcome drink"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Submit buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Key className="w-4 h-4" />
              Complete Check-in & Assign Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
