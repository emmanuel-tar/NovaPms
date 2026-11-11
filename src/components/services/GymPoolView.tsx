/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePMS } from '../../context/PMSContext';
import { Waves, Dumbbell, Plus, CheckCircle2, UserCheck, Shield } from 'lucide-react';

export const GymPoolView: React.FC = () => {
  const { facilityPasses, stays, createFacilityPass, formatMoney, showToast } = usePMS();

  const [showPassModal, setShowPassModal] = useState(false);
  const activeStays = stays.filter((s) => s.status === 'active');

  const [guestType, setGuestType] = useState<'in_house' | 'external'>('in_house');
  const [selectedStayId, setSelectedStayId] = useState(activeStays[0]?.id || '');
  const [externalName, setExternalName] = useState('');
  const [externalPhone, setExternalPhone] = useState('+234 ');
  const [facility, setFacility] = useState<'Gym Fitness Centre' | 'Olympic Swimming Pool' | 'Sauna & Steam Bath'>(
    'Olympic Swimming Pool'
  );
  const [passType, setPassType] = useState<
    'Complimentary (In-House)' | 'Day Pass' | 'Personal Training Session' | 'Monthly Membership'
  >('Complimentary (In-House)');
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'room_charge' | 'pos_card' | 'cash'>('room_charge');

  const handleGuestTypeChange = (type: 'in_house' | 'external') => {
    setGuestType(type);
    if (type === 'in_house') {
      setPassType('Complimentary (In-House)');
      setAmount(0);
      setPaymentMethod('room_charge');
    } else {
      setPassType('Day Pass');
      setAmount(7500);
      setPaymentMethod('pos_card');
    }
  };

  const handleCreatePass = (e: React.FormEvent) => {
    e.preventDefault();
    const stay = activeStays.find((s) => s.id === selectedStayId);

    createFacilityPass({
      guestType,
      stayId: guestType === 'in_house' ? stay?.id : undefined,
      roomNumber: guestType === 'in_house' ? stay?.roomNumber : undefined,
      guestName: guestType === 'in_house' ? stay?.guestName || '' : externalName,
      guestPhone: guestType === 'external' ? externalPhone : undefined,
      facility,
      passType,
      amount,
      paymentMethod: amount > 0 ? paymentMethod : undefined,
    });

    setShowPassModal(false);
    setExternalName('');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Gym, Olympic Swimming Pool & Wellness Centre
            </h2>
            <p className="text-xs text-slate-500">
              In-house guest privileges & external day-pass billing with automated room charging.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowPassModal(true)}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Issue Facility Pass / Entry
        </button>
      </div>

      {/* Passes list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Visitor / Guest</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Facility</th>
                <th className="py-3 px-4">Pass Category</th>
                <th className="py-3 px-4 text-right">Fee (₦)</th>
                <th className="py-3 px-4">Billing Method</th>
                <th className="py-3 px-4">Attendant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {facilityPasses.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono text-slate-500 tabular-nums">
                    {p.createdAt}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {p.guestName}
                    </div>
                    {p.roomNumber && (
                      <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                        Room {p.roomNumber}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        p.guestType === 'in_house'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {p.guestType === 'in_house' ? 'In-House' : 'External Visitor'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                    {p.facility}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{p.passType}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {p.amount === 0 ? 'Complimentary' : formatMoney(p.amount)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] text-slate-600 dark:text-slate-300">
                      {p.paymentMethod === 'room_charge'
                        ? 'Charged to Room Folio'
                        : p.paymentMethod || 'Complimentary'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">{p.staffName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-lg w-full p-6 text-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Issue Facility Entry Pass
            </h3>

            <form onSubmit={handleCreatePass} className="space-y-4">
              <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleGuestTypeChange('in_house')}
                  className={`flex-1 py-1.5 font-bold rounded transition-colors ${
                    guestType === 'in_house'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  In-House Guest
                </button>
                <button
                  type="button"
                  onClick={() => handleGuestTypeChange('external')}
                  className={`flex-1 py-1.5 font-bold rounded transition-colors ${
                    guestType === 'external'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  External Visitor
                </button>
              </div>

              {guestType === 'in_house' ? (
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">
                    Select Active Guest Room:
                  </label>
                  <select
                    value={selectedStayId}
                    onChange={(e) => setSelectedStayId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    {activeStays.map((s) => (
                      <option key={s.id} value={s.id}>
                        Room {s.roomNumber} — {s.guestName}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Visitor Name"
                      value={externalName}
                      onChange={(e) => setExternalName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">Phone</label>
                    <input
                      type="text"
                      value={externalPhone}
                      onChange={(e) => setExternalPhone(e.target.value)}
                      className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Facility</label>
                  <select
                    value={facility}
                    onChange={(e: any) => setFacility(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Olympic Swimming Pool">Olympic Swimming Pool</option>
                    <option value="Gym Fitness Centre">Gym Fitness Centre</option>
                    <option value="Sauna & Steam Bath">Sauna & Steam Bath</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Pass Category</label>
                  <select
                    value={passType}
                    onChange={(e: any) => {
                      setPassType(e.target.value);
                      if (e.target.value.includes('Complimentary')) setAmount(0);
                      else if (e.target.value.includes('Day Pass')) setAmount(7500);
                      else if (e.target.value.includes('Training')) setAmount(15000);
                      else if (e.target.value.includes('Monthly')) setAmount(75000);
                    }}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    {guestType === 'in_house' && (
                      <option value="Complimentary (In-House)">Complimentary (In-House)</option>
                    )}
                    <option value="Day Pass">Day Pass (₦7,500)</option>
                    <option value="Personal Training Session">Personal Training Session (₦15,000)</option>
                    <option value="Monthly Membership">Monthly Membership (₦75,000)</option>
                  </select>
                </div>
              </div>

              {amount > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">Fee (₦)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e: any) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      {guestType === 'in_house' && (
                        <option value="room_charge">Charge to Room Folio</option>
                      )}
                      <option value="pos_card">POS Terminal Card</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPassModal(false)}
                  className="px-3.5 py-1.5 rounded text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-teal-600 text-white font-bold hover:bg-teal-700"
                >
                  Confirm Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
