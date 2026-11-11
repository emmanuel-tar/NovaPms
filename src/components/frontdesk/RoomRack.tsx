/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePMS } from '../../context/PMSContext';
import { Room, RoomStatus, Stay } from '../../types/pms';
import { GuestFolioModal } from './GuestFolioModal';
import { CheckInModal } from './CheckInModal';
import {
  Search,
  Filter,
  UserCheck,
  Receipt,
  Sparkles,
  Wrench,
  AlertOctagon,
  LogOut,
  Bed,
  CheckCircle,
  Plus,
} from 'lucide-react';

export const RoomRack: React.FC = () => {
  const { rooms, stays, folioTransactions, formatMoney, updateRoomStatus } = usePMS();

  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedStayForFolio, setSelectedStayForFolio] = useState<Stay | null>(null);
  const [selectedRoomForCheckIn, setSelectedRoomForCheckIn] = useState<Room | null>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  // Status mapping
  const statusStyles: Record<
    RoomStatus,
    { label: string; bg: string; text: string; border: string; dot: string }
  > = {
    available: {
      label: 'Available Clean',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-900',
      dot: 'bg-emerald-500',
    },
    occupied: {
      label: 'Occupied',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-900',
      dot: 'bg-blue-500',
    },
    reserved: {
      label: 'Reserved (Arrival)',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-900',
      dot: 'bg-purple-500',
    },
    dirty: {
      label: 'Dirty (Vacant)',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-800 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-900',
      dot: 'bg-amber-500',
    },
    cleaning: {
      label: 'Housekeeping In Progress',
      bg: 'bg-yellow-50 dark:bg-yellow-950/40',
      text: 'text-yellow-800 dark:text-yellow-300',
      border: 'border-yellow-200 dark:border-yellow-900',
      dot: 'bg-yellow-500',
    },
    inspected: {
      label: 'Inspected Ready',
      bg: 'bg-teal-50 dark:bg-teal-950/40',
      text: 'text-teal-800 dark:text-teal-300',
      border: 'border-teal-200 dark:border-teal-900',
      dot: 'bg-teal-500',
    },
    out_of_order: {
      label: 'Out of Order',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-800 dark:text-rose-300',
      border: 'border-rose-200 dark:border-rose-900',
      dot: 'bg-rose-500',
    },
    maintenance: {
      label: 'Under Maintenance',
      bg: 'bg-orange-50 dark:bg-orange-950/40',
      text: 'text-orange-800 dark:text-orange-300',
      border: 'border-orange-200 dark:border-orange-900',
      dot: 'bg-orange-500',
    },
  };

  // Filter rooms
  const filteredRooms = rooms.filter((room) => {
    if (selectedFloor !== 'all' && room.floor !== selectedFloor) return false;
    if (statusFilter !== 'all' && room.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const stay = stays.find((s) => s.id === room.currentStayId && s.status === 'active');
      const matchesNum = room.number.toLowerCase().includes(q);
      const matchesCat = room.category.toLowerCase().includes(q);
      const matchesGuest = stay && stay.guestName.toLowerCase().includes(q);
      if (!matchesNum && !matchesCat && !matchesGuest) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Top Controls & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search room # or guest..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Floor tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setSelectedFloor('all')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                selectedFloor === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Floors
            </button>
            {[1, 2, 3, 4].map((floor) => (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  selectedFloor === floor
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {floor === 4 ? 'Penthouses (Fl 4)' : `Floor ${floor}`}
              </button>
            ))}
          </div>

          {/* Status filter dropdown */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Statuses ({rooms.length})</option>
              <option value="available">Available Clean</option>
              <option value="occupied">Occupied</option>
              <option value="dirty">Dirty</option>
              <option value="cleaning">Cleaning</option>
              <option value="inspected">Inspected</option>
              <option value="out_of_order">Out of Order</option>
            </select>
          </div>
        </div>

        {/* Primary Action: New Guest Check-in */}
        <button
          onClick={() => {
            setSelectedRoomForCheckIn(null);
            setShowCheckInModal(true);
          }}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Walk-in Guest Check-in
        </button>
      </div>

      {/* Room Rack Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
        {filteredRooms.map((room) => {
          const stay = stays.find((s) => s.id === room.currentStayId && s.status === 'active');
          const style = statusStyles[room.status];

          // Calculate current balance if occupied
          let folioTotal = 0;
          if (stay) {
            folioTotal = folioTransactions
              .filter((t) => t.stayId === stay.id && t.status === 'posted')
              .reduce((sum, t) => sum + t.totalAmount, 0);
          }

          const isShowcaseRoom = room.number === '205';

          return (
            <div
              key={room.id}
              className={`rounded-xl border p-3.5 flex flex-col justify-between transition-all ${
                style.bg
              } ${style.border} ${
                isShowcaseRoom ? 'ring-2 ring-emerald-500 shadow-md' : 'hover:shadow-xs'
              }`}
            >
              <div>
                {/* Room Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                      {room.number}
                    </span>
                    {isShowcaseRoom && (
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded uppercase">
                        Active Stay
                      </span>
                    )}
                  </div>
                  <span className={`text-[11px] font-semibold ${style.text}`}>
                    {style.label}
                  </span>
                </div>

                {/* Category & Rate */}
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 flex justify-between items-center">
                  <span className="font-medium truncate">{room.category}</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300">
                    {formatMoney(room.baseRate)}
                  </span>
                </div>

                {/* Occupancy details if occupied */}
                {stay && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800/80 text-xs">
                    <div className="font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{stay.guestName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex justify-between">
                      <span>Out: {stay.checkOutDate}</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-slate-200 tabular-nums">
                        Folio: {formatMoney(folioTotal)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Out of order reason */}
                {room.status === 'out_of_order' && room.outOfOrderReason && (
                  <div className="mt-2 text-[11px] text-rose-700 dark:text-rose-400 italic">
                    Reason: {room.outOfOrderReason}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-1.5">
                {room.status === 'occupied' && stay && (
                  <>
                    <button
                      onClick={() => setSelectedStayForFolio(stay)}
                      className="flex-1 py-1 px-2 text-xs font-semibold rounded bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/50 flex items-center justify-center gap-1 transition-colors"
                      title="View itemized consolidated folio"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      View Folio
                    </button>
                    <button
                      onClick={() => setSelectedStayForFolio(stay)}
                      className="py-1 px-2 text-xs font-semibold rounded bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 transition-colors"
                      title="Settlement & Checkout"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                {room.status === 'available' && (
                  <button
                    onClick={() => {
                      setSelectedRoomForCheckIn(room);
                      setShowCheckInModal(true);
                    }}
                    className="w-full py-1 px-2 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1 transition-colors"
                  >
                    <Bed className="w-3.5 h-3.5" />
                    Check-in
                  </button>
                )}

                {room.status === 'dirty' && (
                  <button
                    onClick={() => updateRoomStatus(room.id, 'cleaning')}
                    className="w-full py-1 px-2 text-xs font-semibold rounded bg-yellow-600 hover:bg-yellow-700 text-white flex items-center justify-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Start Cleaning
                  </button>
                )}

                {room.status === 'cleaning' && (
                  <button
                    onClick={() => updateRoomStatus(room.id, 'inspected')}
                    className="w-full py-1 px-2 text-xs font-semibold rounded bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-1 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Mark Inspected
                  </button>
                )}

                {room.status === 'inspected' && (
                  <button
                    onClick={() => updateRoomStatus(room.id, 'available')}
                    className="w-full py-1 px-2 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Make Available
                  </button>
                )}

                {room.status === 'out_of_order' && (
                  <button
                    onClick={() => updateRoomStatus(room.id, 'dirty')}
                    className="w-full py-1 px-2 text-xs font-semibold rounded bg-slate-700 hover:bg-slate-800 text-white flex items-center justify-center gap-1 transition-colors"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Release Room
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Guest Folio Modal */}
      {selectedStayForFolio && (
        <GuestFolioModal
          stay={selectedStayForFolio}
          onClose={() => setSelectedStayForFolio(null)}
        />
      )}

      {/* Check In Modal */}
      {showCheckInModal && (
        <CheckInModal
          initialRoom={selectedRoomForCheckIn || undefined}
          onClose={() => {
            setShowCheckInModal(false);
            setSelectedRoomForCheckIn(null);
          }}
        />
      )}
    </div>
  );
};
