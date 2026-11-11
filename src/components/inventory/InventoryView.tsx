/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePMS } from '../../context/PMSContext';
import { Boxes, ArrowRightLeft, Plus, History, AlertTriangle } from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { inventory, stockMovements, transferStock, formatMoney, showToast } = usePMS();

  const [activeTab, setActiveTab] = useState<'stock' | 'movements'>('stock');
  const [showTransferModal, setShowTransferModal] = useState(false);

  const [selectedItemId, setSelectedItemId] = useState(inventory[0]?.id || '');
  const [toStore, setToStore] = useState<'kitchenStock' | 'barStock' | 'housekeepingStock'>('kitchenStock');
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
                  <th className="py-3 px-4 text-right">Central Store</th>
                  <th className="py-3 px-4 text-right">Kitchen Store</th>
                  <th className="py-3 px-4 text-right">Bar Store</th>
                  <th className="py-3 px-4 text-right">Housekeeping</th>
                  <th className="py-3 px-4 text-right">Unit Cost</th>
                  <th className="py-3 px-4">Reorder Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {inventory.map((item) => {
                  const totalStock =
                    item.centralStock + item.kitchenStock + item.barStock + item.housekeepingStock;
                  const isLow = item.centralStock <= item.reorderLevel;

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
                        {item.centralStock} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {item.kitchenStock} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {item.barStock} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {item.housekeepingStock} {item.unit}
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
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                            Adequate Stock
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
                  <th className="py-3 px-4">Slip / Code</th>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Movement Type</th>
                  <th className="py-3 px-4">Source Store &rarr; Destination</th>
                  <th className="py-3 px-4">Item & Quantity</th>
                  <th className="py-3 px-4">Responsible User</th>
                  <th className="py-3 px-4">Audit Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stockMovements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {mov.movementCode}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 tabular-nums">
                      {mov.date}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          mov.type.includes('GRN')
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : mov.type.includes('Consumption')
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {mov.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {mov.fromStore} &rarr; <strong>{mov.toStore}</strong>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {mov.quantity} {mov.unit} of {mov.itemName}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{mov.user}</td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] italic">{mov.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 text-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Department Stock Transfer Requisition
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
                      {i.name} (Central: {i.centralStock} {i.unit})
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
                    <option value="kitchenStock">Main Kitchen Store</option>
                    <option value="barStock">Pool & Lounge Bar Store</option>
                    <option value="housekeepingStock">Housekeeping Store</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedItem?.centralStock || 100}
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
                  className="px-4 py-1.5 rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold hover:bg-slate-800"
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
