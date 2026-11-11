/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePMS } from '../../context/PMSContext';
import { Car, Plus, Navigation, Clock, User, Phone, CheckCircle2 } from 'lucide-react';

export const TransportView: React.FC = () => {
  const { transportTrips, stays, createTransportTrip, formatMoney, showToast } = usePMS();

  const [showBookingModal, setShowBookingModal] = useState(false);
  const activeStays = stays.filter((s) => s.status === 'active');

  const [selectedStayId, setSelectedStayId] = useState(activeStays[0]?.id || '');
  const [tripType, setTripType] = useState<
    'Airport Pickup' | 'Airport Drop-off' | 'VIP Chauffeur City Ride' | 'Hotel Shuttle Bus'
  >('Airport Pickup');
  const [vehicle, setVehicle] = useState('Toyota Prado TX - APP-492-LG');
  const [driver, setDriver] = useState('Chinedu Okafor');
  const [pickupLocation, setPickupLocation] = useState('Murtala Muhammed International Airport (LOS)');
  const [destination, setDestination] = useState('Grand Vista Hotel');
  const [scheduledTime, setScheduledTime] = useState('2026-11-12 14:00');
  const [fee, setFee] = useState(35000);
  const [paymentMethod, setPaymentMethod] = useState<'room_charge' | 'direct'>('room_charge');

  const fleet = [
    { name: 'Toyota Prado TX - APP-492-LG', type: 'Executive SUV', driver: 'Chinedu Okafor' },
    { name: 'Mercedes-Benz E300 - KJA-201-FK', type: 'Luxury Sedan', driver: 'Samuel Adekunle' },
    { name: 'Toyota Coaster Shuttle - BDG-882-XA', type: '18-Seat Bus', driver: 'Segun Adebayo' },
  ];

  const handleTripTypeChange = (type: any) => {
    setTripType(type);
    if (type === 'Airport Pickup') {
      setPickupLocation('Murtala Muhammed International Airport (LOS)');
      setDestination('Grand Vista Hotel');
      setFee(35000);
    } else if (type === 'Airport Drop-off') {
      setPickupLocation('Grand Vista Hotel Lobby');
      setDestination('Murtala Muhammed Domestic Terminal 2');
      setFee(30000);
    } else if (type === 'VIP Chauffeur City Ride') {
      setPickupLocation('Hotel Lobby');
      setDestination('Victoria Island / Ikoyi Business District');
      setFee(65000);
    } else {
      setPickupLocation('Hotel Shuttle Stop');
      setDestination('Lekki Phase 1 Commercial Circle');
      setFee(10000);
    }
  };

  const handleBookTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const stay = activeStays.find((s) => s.id === selectedStayId);

    createTransportTrip({
      guestName: stay?.guestName || 'VIP Guest',
      stayId: paymentMethod === 'room_charge' ? stay?.id : undefined,
      roomNumber: stay?.roomNumber,
      tripType,
      vehicle,
      driver,
      pickupLocation,
      destination,
      scheduledTime,
      fee,
      paymentMethod,
    });

    setShowBookingModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Transport, Fleet & Chauffeur Services
            </h2>
            <p className="text-xs text-slate-500">
              Airport transfers, executive fleet dispatch & automated room posting.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowBookingModal(true)}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Book Guest Transfer
        </button>
      </div>

      {/* Trips Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Trip Code</th>
                <th className="py-3 px-4">Guest & Room</th>
                <th className="py-3 px-4">Transfer Type</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Vehicle & Chauffeur</th>
                <th className="py-3 px-4">Scheduled Time</th>
                <th className="py-3 px-4 text-right">Fare (₦)</th>
                <th className="py-3 px-4">Billing</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {transportTrips.map((tr) => (
                <tr key={tr.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                    {tr.tripCode}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {tr.guestName}
                    </div>
                    {tr.roomNumber && (
                      <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                        Room {tr.roomNumber}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                    {tr.tripType}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    {tr.pickupLocation} → {tr.destination}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    <div>{tr.vehicle}</div>
                    <div className="text-[11px] text-slate-500">Driver: {tr.driver}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {tr.scheduledTime}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatMoney(tr.fee)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] text-slate-600 dark:text-slate-300">
                      {tr.paymentMethod === 'room_charge' ? 'Charged to Room' : 'Direct Cash/Card'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        tr.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : tr.status === 'en_route'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {tr.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-lg w-full p-6 text-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Schedule Hotel Vehicle Transfer
            </h3>

            <form onSubmit={handleBookTrip} className="space-y-4">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">
                  Assign to In-House Guest:
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Transfer Type</label>
                  <select
                    value={tripType}
                    onChange={(e: any) => handleTripTypeChange(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Airport Pickup">Airport Pickup</option>
                    <option value="Airport Drop-off">Airport Drop-off</option>
                    <option value="VIP Chauffeur City Ride">VIP Chauffeur City Ride</option>
                    <option value="Hotel Shuttle Bus">Hotel Shuttle Bus</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Vehicle</label>
                  <select
                    value={vehicle}
                    onChange={(e) => {
                      setVehicle(e.target.value);
                      const f = fleet.find((item) => item.name === e.target.value);
                      if (f) setDriver(f.driver);
                    }}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    {fleet.map((f) => (
                      <option key={f.name} value={f.name}>
                        {f.name} ({f.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Pickup Location</label>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Destination</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Scheduled Time</label>
                  <input
                    type="text"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Fare (₦)</label>
                  <input
                    type="number"
                    value={fee}
                    onChange={(e) => setFee(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg flex justify-between items-center font-bold text-sm">
                <span>Billing:</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">
                  Charge to Room ({formatMoney(fee)})
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-3.5 py-1.5 rounded text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-blue-600 text-white font-bold hover:bg-blue-700"
                >
                  Schedule & Post to Folio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
