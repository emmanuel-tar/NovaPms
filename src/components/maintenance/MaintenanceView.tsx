/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePMS } from '../../context/PMSContext';
import { Wrench, Plus, CheckCircle2, AlertOctagon, User } from 'lucide-react';

export const MaintenanceView: React.FC = () => {
  const {
    maintenanceRequests,
    rooms,
    createMaintenanceRequest,
    resolveMaintenanceRequest,
    showToast,
  } = usePMS();

  const [showModal, setShowModal] = useState(false);
  const [roomId, setRoomId] = useState<string>('');
  const [locationArea, setLocationArea] = useState('Room 208');
  const [category, setCategory] = useState<
    'HVAC / Air Conditioning' | 'Plumbing & Water' | 'Electrical & Lighting' | 'Carpentry & Lock' | 'Appliance'
  >('HVAC / Air Conditioning');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('urgent');
  const [locksRoom, setLocksRoom] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      showToast('Please provide a description of the fault', 'error');
      return;
    }

    createMaintenanceRequest({
      roomId: roomId || undefined,
      locationArea,
      category,
      description,
      priority,
      locksRoom: !!roomId && locksRoom,
    });

    setShowModal(false);
    setDescription('');
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-600 flex items-center justify-center text-white">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Hotel Engineering & Preventive Maintenance
            </h2>
            <p className="text-xs text-slate-500">
              Work order dispatch with automated Out-of-Order room locking at Front Desk.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Log Maintenance Work Order
        </button>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Ticket Code</th>
                <th className="py-3 px-4">Location / Room</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Fault Description</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Locks Room?</th>
                <th className="py-3 px-4">Assigned Tech</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {maintenanceRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                    {req.code}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {req.locationArea}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {req.category}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-xs">
                    {req.description}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        req.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : req.priority === 'high'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {req.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {req.locksRoom ? (
                      <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        Out of Order
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">No</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {req.assignedTechnician}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        req.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : req.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {req.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {req.status !== 'resolved' && (
                      <button
                        onClick={() => resolveMaintenanceRequest(req.id)}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                      >
                        Resolve & Release
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-lg w-full p-6 text-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Log Maintenance Fault & Work Order
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">
                    Affects Guest Room?
                  </label>
                  <select
                    value={roomId}
                    onChange={(e) => {
                      setRoomId(e.target.value);
                      const r = rooms.find((item) => item.id === e.target.value);
                      if (r) setLocationArea(`Room ${r.number}`);
                    }}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">No / General Facility Area</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        Room {r.number} ({r.category})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Location Area</label>
                  <input
                    type="text"
                    value={locationArea}
                    onChange={(e) => setLocationArea(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Fault Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="HVAC / Air Conditioning">HVAC / Air Conditioning</option>
                    <option value="Plumbing & Water">Plumbing & Water</option>
                    <option value="Electrical & Lighting">Electrical & Lighting</option>
                    <option value="Carpentry & Lock">Carpentry & Lock</option>
                    <option value="Appliance">Appliance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Fault Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail fault symptoms and required repairs..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              {roomId && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-lg flex items-center gap-2 text-rose-800 dark:text-rose-300">
                  <input
                    type="checkbox"
                    id="locksRoom"
                    checked={locksRoom}
                    onChange={(e) => setLocksRoom(e.target.checked)}
                    className="rounded border-rose-300"
                  />
                  <label htmlFor="locksRoom" className="font-semibold cursor-pointer">
                    Lock room as "Out of Order" (Excluded from sellable Front Desk inventory)
                  </label>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 rounded text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-rose-600 text-white font-bold hover:bg-rose-700"
                >
                  Dispatch Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
