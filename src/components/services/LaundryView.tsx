/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePMS } from '../../context/PMSContext';
import { LaundryOrder } from '../../types/pms';
import {
  Shirt,
  Plus,
  CheckCircle2,
  Clock,
  Building,
  User,
  Truck,
  CreditCard,
  Search,
} from 'lucide-react';

export const LaundryView: React.FC = () => {
  const {
    laundryOrders,
    stays,
    createLaundryOrder,
    formatMoney,
    showToast,
  } = usePMS();

  const [showOrderModal, setShowOrderModal] = useState(false);
  const activeStays = stays.filter((s) => s.status === 'active');

  // Form state
  const [selectedStayId, setSelectedStayId] = useState(activeStays[0]?.id || '');
  const [guestName, setGuestName] = useState(activeStays[0]?.guestName || '');
  const [guestPhone, setGuestPhone] = useState(activeStays[0]?.guestPhone || '+234 ');
  const [serviceType, setServiceType] = useState<
    'Standard Wash' | 'Dry Cleaning' | 'Pressing / Ironing' | 'Express 4-Hour'
  >('Dry Cleaning');
  const [paymentMethod, setPaymentMethod] = useState<'room_charge' | 'cash' | 'pos_card'>('room_charge');
  const [expectedDelivery, setExpectedDelivery] = useState('2026-11-11 18:00');

  // Laundry item catalogue
  const catalog = [
    { name: 'Executive Long-sleeve Shirt', price: 1500 },
    { name: 'Formal Trousers / Slacks', price: 2000 },
    { name: 'Full 2-Piece Business Suit', price: 6000 },
    { name: 'Traditional Agbada 3-Piece', price: 6500 },
    { name: 'Evening Gown / Dress', price: 4500 },
    { name: 'Casual T-shirt / Polo', price: 1000 },
    { name: 'Undergarments (Pack of 3)', price: 1200 },
  ];

  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({
    'Executive Long-sleeve Shirt': 2,
    'Formal Trousers / Slacks': 1,
  });

  const handleStayChange = (stayId: string) => {
    setSelectedStayId(stayId);
    const stay = activeStays.find((s) => s.id === stayId);
    if (stay) {
      setGuestName(stay.guestName);
      setGuestPhone(stay.guestPhone);
    }
  };

  const calculateTotal = () => {
    return Object.entries(selectedItems).reduce((sum, [itemName, qty]) => {
      const item = catalog.find((c) => c.name === itemName);
      return sum + (item ? item.price * qty : 0);
    }, 0);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const itemsArray = Object.entries(selectedItems)
      .filter(([_, qty]) => qty > 0)
      .map(([name, quantity]) => {
        const item = catalog.find((c) => c.name === name);
        return { name, quantity, unitPrice: item?.price || 1500 };
      });

    if (itemsArray.length === 0) {
      showToast('Please select at least one garment', 'error');
      return;
    }

    const stay = activeStays.find((s) => s.id === selectedStayId);

    createLaundryOrder({
      stayId: paymentMethod === 'room_charge' ? stay?.id : undefined,
      roomId: stay?.roomId,
      roomNumber: stay?.roomNumber,
      guestName: stay?.guestName || guestName,
      guestPhone: stay?.guestPhone || guestPhone,
      serviceType,
      items: itemsArray,
      paymentMethod,
      expectedDelivery,
    });

    setShowOrderModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Shirt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Laundry, Dry Cleaning & Valet Management
            </h2>
            <p className="text-xs text-slate-500">
              Department order registration with automated Charge to Room posting.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowOrderModal(true)}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Laundry Intake
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Order Code</th>
                <th className="py-3 px-4">Room / Guest</th>
                <th className="py-3 px-4">Service Type</th>
                <th className="py-3 px-4">Garments</th>
                <th className="py-3 px-4">Delivery Due</th>
                <th className="py-3 px-4 text-right">Amount (₦)</th>
                <th className="py-3 px-4">Tender</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {laundryOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                    {ord.orderCode}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {ord.guestName}
                    </div>
                    {ord.roomNumber && (
                      <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                        Room {ord.roomNumber}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    {ord.serviceType}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {ord.expectedDelivery}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatMoney(ord.totalAmount)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                      {ord.paymentMethod === 'room_charge' ? 'Charged to Room' : 'Direct Cash/POS'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        ord.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : ord.status === 'ready'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Laundry Intake Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-lg w-full p-6 text-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              New Laundry Intake & Valet Slip
            </h3>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">
                  Assign to In-House Guest Room (Charge to Room):
                </label>
                <select
                  value={selectedStayId}
                  onChange={(e) => handleStayChange(e.target.value)}
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
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Service Type</label>
                  <select
                    value={serviceType}
                    onChange={(e: any) => setServiceType(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Dry Cleaning">Dry Cleaning</option>
                    <option value="Standard Wash">Standard Wash & Fold</option>
                    <option value="Pressing / Ironing">Pressing / Ironing Only</option>
                    <option value="Express 4-Hour">Express 4-Hour Turnaround</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    <option value="room_charge">Charge to Room Folio</option>
                    <option value="pos_card">Direct POS Card</option>
                    <option value="cash">Direct Cash</option>
                  </select>
                </div>
              </div>

              {/* Garment Selector */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Garment Breakdown & Quantity:
                </label>
                <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 max-h-48 overflow-y-auto space-y-2">
                  {catalog.map((item) => {
                    const count = selectedItems[item.name] || 0;
                    return (
                      <div key={item.name} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">{item.name}</div>
                          <div className="text-[11px] text-slate-500">{formatMoney(item.price)} each</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedItems((prev) => ({
                                ...prev,
                                [item.name]: Math.max(0, (prev[item.name] || 0) - 1),
                              }))
                            }
                            className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-bold tabular-nums">{count}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedItems((prev) => ({
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
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg flex justify-between items-center font-bold text-sm">
                <span>Calculated Laundry Total:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  {formatMoney(calculateTotal())}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-3.5 py-1.5 rounded text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                >
                  Confirm & Post to Folio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
