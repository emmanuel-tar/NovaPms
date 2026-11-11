/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePMS } from '../../context/PMSContext';
import { HousekeepingTask } from '../../types/pms';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Wine,
  User,
  Plus,
  AlertCircle,
  Building,
} from 'lucide-react';

export const HousekeepingBoard: React.FC = () => {
  const {
    housekeepingTasks,
    rooms,
    updateHousekeepingStatus,
    postMinibarCharges,
    formatMoney,
    showToast,
  } = usePMS();

  const [minibarModalRoomId, setMinibarModalRoomId] = useState<string | null>(null);

  // Minibar catalogue
  const minibarItems = [
    { name: 'Evian Mineral Water (750ml)', price: 3000 },
    { name: 'Red Bull Energy Drink', price: 3500 },
    { name: 'Pringles Original Chips', price: 4000 },
    { name: 'Heineken Beer (Can)', price: 2500 },
    { name: 'Snickers Chocolate Bar', price: 2000 },
    { name: 'Miniature Single Malt Scotch (50ml)', price: 8500 },
  ];

  const [consumedCounts, setConsumedCounts] = useState<Record<string, number>>({});

  const handleOpenMinibar = (roomId: string) => {
    setMinibarModalRoomId(roomId);
    setConsumedCounts({
      'Evian Mineral Water (750ml)': 2,
      'Pringles Original Chips': 1,
    });
  };

  const handlePostMinibar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!minibarModalRoomId) return;

    const itemsToPost = Object.entries(consumedCounts)
      .filter(([_, qty]) => qty > 0)
      .map(([name, qty]) => {
        const item = minibarItems.find((m) => m.name === name);
        return { name, qty, price: item?.price || 2000 };
      });

    if (itemsToPost.length === 0) {
      showToast('No items checked as consumed.', 'info');
      setMinibarModalRoomId(null);
      return;
    }

    postMinibarCharges(minibarModalRoomId, itemsToPost);
    setMinibarModalRoomId(null);
  };

  const occupiedRooms = rooms.filter((r) => r.status === 'occupied');

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-600 flex items-center justify-center text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Housekeeping Board & Minibar Auditing
            </h2>
            <p className="text-xs text-slate-500">
              Room sanitization workflow, turnarounds & automated minibar folio posting.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {occupiedRooms.length > 0 && (
            <button
              onClick={() => handleOpenMinibar(occupiedRooms[0].id)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Wine className="w-4 h-4" />
              Audit Minibar & Post Folio
            </button>
          )}
        </div>
      </div>

      {/* Housekeeping Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {housekeepingTasks.map((task) => {
          const isInspected = task.status === 'inspected';
          const isInProgress = task.status === 'in_progress';
          const isPending = task.status === 'pending';

          return (
            <div
              key={task.id}
              className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                isInspected
                  ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : isInProgress
                  ? 'border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                      Room {task.roomNumber}
                    </span>
                    <div className="text-[11px] text-slate-500">{task.roomCategory}</div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      isInspected
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : isInProgress
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Task: {task.taskType}
                  </div>
                  <div className="text-slate-500 flex items-center gap-1 text-[11px]">
                    <User className="w-3 h-3" />
                    <span>Attendant: {task.assignedTo}</span>
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Updated: {task.updatedAt}
                  </div>
                </div>

                {task.minibarChecked && (
                  <div className="mt-2.5 p-1.5 rounded bg-purple-50 dark:bg-purple-950/40 text-[11px] text-purple-800 dark:text-purple-300 flex items-center justify-between">
                    <span>Minibar Audited</span>
                    {task.minibarChargesPosted && (
                      <span className="font-bold tabular-nums">
                        {formatMoney(task.minibarChargesPosted)} posted
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Status progression button */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                {isPending && (
                  <button
                    onClick={() => updateHousekeepingStatus(task.id, 'in_progress')}
                    className="w-full py-1.5 px-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold text-xs rounded transition-colors"
                  >
                    Begin Cleaning
                  </button>
                )}
                {isInProgress && (
                  <button
                    onClick={() => updateHousekeepingStatus(task.id, 'inspected')}
                    className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded transition-colors"
                  >
                    Supervisor Sign-Off (Ready)
                  </button>
                )}
                {isInspected && (
                  <div className="w-full text-center text-xs text-emerald-600 dark:text-emerald-400 font-semibold py-1">
                    Room Inspected & Available
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Minibar Modal */}
      {minibarModalRoomId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wine className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Minibar Consumption Check
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Automatically debits the guest's folio in real time.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePostMinibar} className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">
                  Select Occupied Room:
                </label>
                <select
                  value={minibarModalRoomId}
                  onChange={(e) => setMinibarModalRoomId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                >
                  {occupiedRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Room {r.number} ({r.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 max-h-52 overflow-y-auto space-y-2">
                {minibarItems.map((item) => {
                  const qty = consumedCounts[item.name] || 0;
                  return (
                    <div key={item.name} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-500">{formatMoney(item.price)} each</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setConsumedCounts((prev) => ({
                              ...prev,
                              [item.name]: Math.max(0, (prev[item.name] || 0) - 1),
                            }))
                          }
                          className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-bold tabular-nums">{qty}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setConsumedCounts((prev) => ({
                              ...prev,
                              [item.name]: (prev[item.name] || 0) + 1,
                            }))
                          }
                          className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg flex justify-between items-center font-bold text-sm">
                <span>Total to Post:</span>
                <span className="font-mono text-purple-600 dark:text-purple-400">
                  {formatMoney(
                    Object.entries(consumedCounts).reduce((sum, [name, q]) => {
                      const item = minibarItems.find((m) => m.name === name);
                      return sum + (item ? item.price * q : 0);
                    }, 0)
                  )}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMinibarModalRoomId(null)}
                  className="px-3.5 py-1.5 rounded text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-purple-600 text-white font-bold hover:bg-purple-700"
                >
                  Post Charges to Room Folio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
