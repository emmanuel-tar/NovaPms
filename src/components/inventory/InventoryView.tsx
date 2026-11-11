/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePMS } from '../../context/PMSContext';
import { StoreLocation } from '../../types/pms';
import { Boxes, ArrowRightLeft, History, AlertTriangle } from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { inventory, stockMovements, transferStock, formatMoney, showToast } = usePMS();

  const [activeTab, setActiveTab] = useState<'stock' | 'movements'>('stock');
  const [showTransferModal, setShowTransferModal] = useState(false);

  const [selectedItemId, setSelectedItemId] = useState(inventory[0]?.id || '');
  const [toStore, setToStore] = useState<StoreLocation>('Kitchen Store');
  const [quantity, setQuantity] = useState(5);
  const [notes, setNotes] = useState('Department requisition');

  const selectedItem = inventory.find((i) => i.id === selectedItemId);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      showToast('Please enter a positive transfer quantity', 'error');
      return;
    }

    transferStock({
      itemId: selectedItemId,
      toStore,
      quantity,
      notes,
    });

    setShowTransferModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-800 text-white flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Inventory, Central Warehouse & Department Stores
            </h2>
            <p className="text-xs text-slate-500">
              Stock replenishment, inter-department transfers & recipe consumption tracking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('stock')}
              className={`px-3 py-1 font-semibold rounded transition-colors ${
                activeTab === 'stock'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Stock on Hand
            </button>
            <button
              onClick={() => setActiveTab('movements')}
              className={`px-3 py-1 font-semibold rounded transition-colors ${
                activeTab === 'movements'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Movement Ledger ({stockMovements.length})
            </button>
          </div>

          <button
            onClick={() => setShowTransferModal(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 text-white flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Inter-Store Transfer
          </button>
        </div>
      </div>

      {/* TAB 1: STOCK ON HAND */}
      {activeTab === 'stock' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Item Code</th>
                  <th className="py-3 px-4">Item Name & Category</th>
                  <th className="py-3 px-4 text-right">Central Warehouse</th>
                  <th className="py-3 px-4 text-right">Kitchen Store</th>
                  <th className="py-3 px-4 text-right">Bar Store</th>
                  <th className="py-3 px-4 text-right">Housekeeping</th>
                  <th className="py-3 px-4 text-right">Unit Cost</th>
                  <th className="py-3 px-4">Reorder Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {inventory.map((item) => {
                  const centralStock = item.storeStocks['Central Warehouse'] || 0;
                  const kitchenStock = item.storeStocks['Kitchen Store'] || 0;
                  const barStock = item.storeStocks['Bar Store'] || 0;
                  const hkStock = item.storeStocks['Housekeeping Store'] || 0;
                  const isLow = centralStock <= item.reorderLevel;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {item.code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</div>
                        <div className="text-[11px] text-slate-500">{item.category}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                        {centralStock} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {kitchenStock} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {barStock} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {hkStock} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                        {formatMoney(item.unitCost)}
                      </td>
                      <td className="py-3 px-4">
                        {isLow ? (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock (Reorder &le; {item.reorderLevel})
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded w-fit">
                            Adequate
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MOVEMENT LEDGER */}
      {activeTab === 'movements' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Transfer Code</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Item Transferred</th>
                  <th className="py-3 px-4">From Store</th>
                  <th className="py-3 px-4">Destination Store</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4">Authorized User</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stockMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {m.movementCode}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{m.date}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{m.itemName}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{m.fromStore}</td>
                    <td className="py-3 px-4 font-medium text-blue-600 dark:text-blue-400">{m.toStore}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {m.quantity} {m.unit}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{m.user}</td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">{m.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TRANSFER MODAL */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl text-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Inter-Store Commodity Requisition
            </h3>

            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Select Item to Transfer</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                >
                  {inventory.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} (Central: {i.storeStocks['Central Warehouse'] || 0} {i.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Destination Store</label>
                  <select
                    value={toStore}
                    onChange={(e: any) => setToStore(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    <option value="Kitchen Store">Main Kitchen Store</option>
                    <option value="Restaurant Store">Restaurant Store</option>
                    <option value="Bar Store">Pool & Lounge Bar Store</option>
                    <option value="Housekeeping Store">Housekeeping Store</option>
                    <option value="Laundry Store">Laundry Store</option>
                    <option value="Maintenance Store">Maintenance Store</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedItem?.storeStocks['Central Warehouse'] || 100}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Transfer Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-3.5 py-1.5 rounded text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
