/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePMS } from '../../context/PMSContext';
import { RoomCategoryConfig, Room } from '../../types/pms';
import {
  BedDouble,
  Building,
  Plus,
  Edit2,
  Trash2,
  Layers,
  Sparkles,
  DollarSign,
  Tag,
  ShieldAlert,
  Search,
} from 'lucide-react';

export const RoomManagementView: React.FC = () => {
  const {
    roomCategories,
    rooms,
    buildings,
    addRoomCategory,
    updateRoomCategory,
    deleteRoomCategory,
    formatMoney,
    showToast,
  } = usePMS();

  const [activeTab, setActiveTab] = useState<'categories' | 'rooms' | 'buildings'>('categories');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<RoomCategoryConfig | null>(null);

  // Form state
  const [catName, setCatName] = useState('');
  const [catCode, setCatCode] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [baseRate, setBaseRate] = useState(85000);
  const [weekendRate, setWeekendRate] = useState(95000);
  const [seasonalRate, setSeasonalRate] = useState(110000);
  const [extraAdultRate, setExtraAdultRate] = useState(20000);
  const [maxAdults, setMaxAdults] = useState(2);
  const [maxChildren, setMaxChildren] = useState(2);
  const [amenitiesInput, setAmenitiesInput] = useState('Wi-Fi, Smart TV, Ensuite Bathroom, Safe');

  // Rooms table filters
  const [roomFilterCategory, setRoomFilterCategory] = useState('all');
  const [roomFilterBuilding, setRoomFilterBuilding] = useState('all');
  const [searchRoom, setSearchRoom] = useState('');

  const openEditModal = (cat: RoomCategoryConfig) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatCode(cat.code);
    setCatDesc(cat.description);
    setBaseRate(cat.baseRate);
    setWeekendRate(cat.weekendRate);
    setSeasonalRate(cat.seasonalRate);
    setExtraAdultRate(cat.extraAdultRate);
    setMaxAdults(cat.maxAdults);
    setMaxChildren(cat.maxChildren);
    setAmenitiesInput(cat.amenities.join(', '));
    setShowCategoryModal(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catCode) {
      showToast('Please enter category name and code', 'error');
      return;
    }

    const amenities = amenitiesInput.split(',').map((s) => s.trim()).filter(Boolean);

    if (editingCategory) {
      updateRoomCategory(editingCategory.id, {
        name: catName,
        code: catCode,
        description: catDesc,
        baseRate,
        weekendRate,
        seasonalRate,
        extraAdultRate,
        maxAdults,
        maxChildren,
        amenities,
      });
    } else {
      const newCat: RoomCategoryConfig = {
        id: `cat-${Date.now()}`,
        name: catName,
        code: catCode,
        description: catDesc,
        baseRate,
        weekendRate,
        seasonalRate,
        extraAdultRate,
        extraChildRate: 10000,
        maxAdults,
        maxChildren,
        amenities,
        totalRoomsCount: 0,
      };
      addRoomCategory(newCat);
    }

    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const filteredRooms = rooms.filter((r) => {
    if (roomFilterCategory !== 'all' && r.category !== roomFilterCategory) return false;
    if (roomFilterBuilding !== 'all' && r.building !== roomFilterBuilding) return false;
    if (searchRoom.trim() && !r.number.includes(searchRoom.trim())) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-indigo-600" />
            Room, Category & Property Inventory Configuration
          </h2>
          <p className="text-xs text-slate-500">
            Configure hotel wings, floors, room categories, seasonal pricing rules and capacity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1 font-semibold rounded transition-colors ${
                activeTab === 'categories'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Categories & Rates ({roomCategories.length})
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`px-3 py-1 font-semibold rounded transition-colors ${
                activeTab === 'rooms'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Physical Rooms ({rooms.length})
            </button>
            <button
              onClick={() => setActiveTab('buildings')}
              className={`px-3 py-1 font-semibold rounded transition-colors ${
                activeTab === 'buildings'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Wings & Buildings ({buildings.length})
            </button>
          </div>

          <button
            onClick={() => {
              setEditingCategory(null);
              setCatName('');
              setCatCode('');
              setCatDesc('');
              setBaseRate(90000);
              setShowCategoryModal(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            New Category
          </button>
        </div>
      </div>

      {/* TAB 1: CATEGORIES & RATES */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roomCategories.map((cat) => {
            const count = rooms.filter((r) => r.category === cat.name).length;
            return (
              <div
                key={cat.id}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {cat.name}
                      </h3>
                      <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                        {cat.code}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {count} Rooms
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                    {cat.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-[11px] border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block">Standard Rate</span>
                      <strong className="font-mono font-bold text-slate-900 dark:text-slate-100">
                        {formatMoney(cat.baseRate)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Weekend Rate</span>
                      <strong className="font-mono text-indigo-600 dark:text-indigo-400">
                        {formatMoney(cat.weekendRate)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Seasonal Rate</span>
                      <strong className="font-mono text-purple-600 dark:text-purple-400">
                        {formatMoney(cat.seasonalRate)}
                      </strong>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Max Occupancy:</span>{' '}
                    {cat.maxAdults} Adults, {cat.maxChildren} Children
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {cat.amenities.slice(0, 3).map((am, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300"
                      >
                        {am}
                      </span>
                    ))}
                    {cat.amenities.length > 3 && (
                      <span className="text-[10px] text-slate-400">+{cat.amenities.length - 3} more</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 text-xs">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit Rates
                  </button>
                  <button
                    onClick={() => deleteRoomCategory(cat.id)}
                    className="p-1 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: PHYSICAL ROOMS DIRECTORY */}
      {activeTab === 'rooms' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search room #..."
                value={searchRoom}
                onChange={(e) => setSearchRoom(e.target.value)}
                className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-36"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500">Category:</span>
              <select
                value={roomFilterCategory}
                onChange={(e) => setRoomFilterCategory(e.target.value)}
                className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Categories</option>
                {roomCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              <span className="text-slate-500 ml-2">Building:</span>
              <select
                value={roomFilterBuilding}
                onChange={(e) => setRoomFilterBuilding(e.target.value)}
                className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Wings</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border-t border-slate-100 dark:border-slate-800 pt-2">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2 px-3">Room #</th>
                  <th className="py-2 px-3">Building / Floor</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3 text-right">Base Rate</th>
                  <th className="py-2 px-3">Max Cap</th>
                  <th className="py-2 px-3">Key Card</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRooms.slice(0, 40).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {r.number}
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                      Floor {r.floor} · {r.building.split('—')[0]}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">
                      {r.category}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {formatMoney(r.baseRate)}
                    </td>
                    <td className="py-2 px-3 text-slate-500">
                      {r.maxAdults}A / {r.maxChildren}C
                    </td>
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-500">
                      {r.keyCardStatus || 'returned'}
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRooms.length > 40 && (
              <div className="py-2 text-center text-[11px] text-slate-400">
                Showing first 40 of {filteredRooms.length} rooms matching filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BUILDINGS & WINGS */}
      {activeTab === 'buildings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buildings.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{b.name}</h3>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                  {b.floorsCount} Floors
                </span>
              </div>
              <p className="text-xs text-slate-500">{b.description}</p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-xs flex justify-between">
                <span>Total Key Inventory:</span>
                <strong className="font-mono text-slate-900 dark:text-slate-100">
                  {rooms.filter((r) => r.building === b.name).length} Rooms
                </strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Create/Edit Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-lg w-full p-6 text-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {editingCategory ? 'Edit Room Category & Rate Plan' : 'Create New Room Category'}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Code</label>
                  <input
                    type="text"
                    required
                    value={catCode}
                    onChange={(e) => setCatCode(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Base Rate (₦)</label>
                  <input
                    type="number"
                    value={baseRate}
                    onChange={(e) => setBaseRate(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Weekend (₦)</label>
                  <input
                    type="number"
                    value={weekendRate}
                    onChange={(e) => setWeekendRate(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Seasonal (₦)</label>
                  <input
                    type="number"
                    value={seasonalRate}
                    onChange={(e) => setSeasonalRate(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Max Adults</label>
                  <input
                    type="number"
                    value={maxAdults}
                    onChange={(e) => setMaxAdults(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Max Children</label>
                  <input
                    type="number"
                    value={maxChildren}
                    onChange={(e) => setMaxChildren(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Extra Bed (₦)</label>
                  <input
                    type="number"
                    value={extraAdultRate}
                    onChange={(e) => setExtraAdultRate(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">
                  Amenities (comma-separated)
                </label>
                <input
                  type="text"
                  value={amenitiesInput}
                  onChange={(e) => setAmenitiesInput(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-3.5 py-1.5 rounded text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
