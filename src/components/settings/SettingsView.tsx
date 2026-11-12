/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePMS } from '../../context/PMSContext';
import { useUITemplate, UI_TEMPLATES } from '../../context/UITemplateContext';
import {
  Settings,
  Building,
  Receipt,
  Server,
  Database,
  CheckCircle2,
  Save,
  RefreshCw,
  HardDrive,
  ShieldAlert,
  Coins,
  Clock,
  UtensilsCrossed,
  ChefHat,
  Terminal,
  Palette,
  Check,
  Zap,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { hotelSettings, updateHotelSettings, currency, setCurrency, exchangeRate, showToast } = usePMS();
  const { currentTemplate, setTemplate } = useUITemplate();

  const [form, setForm] = useState({
    hotelName: hotelSettings.hotelName,
    address: hotelSettings.address,
    cityCountry: hotelSettings.cityCountry,
    tinNumber: hotelSettings.tinNumber,
    phone: hotelSettings.phone,
    email: hotelSettings.email,
    vatRate: (hotelSettings.vatRate * 100).toString(),
    serviceChargeRate: (hotelSettings.serviceChargeRate * 100).toString(),
    tourismLevyRate: (hotelSettings.tourismLevyRate * 100).toString(),
    checkInTime: hotelSettings.checkInTime,
    checkOutTime: hotelSettings.checkOutTime,
    nightAuditHour: hotelSettings.nightAuditHour,
  });

  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [activeTab, setActiveTab] = useState<'property' | 'taxes' | 'outlets' | 'database' | 'templates'>('property');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateHotelSettings({
      hotelName: form.hotelName.trim(),
      address: form.address.trim(),
      cityCountry: form.cityCountry.trim(),
      tinNumber: form.tinNumber.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      vatRate: parseFloat(form.vatRate) / 100 || 0.075,
      serviceChargeRate: parseFloat(form.serviceChargeRate) / 100 || 0.05,
      tourismLevyRate: parseFloat(form.tourismLevyRate) / 100 || 0.01,
      checkInTime: form.checkInTime,
      checkOutTime: form.checkOutTime,
      nightAuditHour: form.nightAuditHour,
    });
  };

  const handleTriggerBackupDrill = () => {
    setIsBackingUp(true);
    setBackupStatus('Connecting to PostgreSQL 16 on 192.168.1.100:5432 [pg_dump]...');
    setTimeout(() => {
      setBackupStatus(
        'pg_dump -Fc -h 192.168.1.100 -U pms_admin grandvista_pms > /backups/pms_snapshot_20261111_0300.sql (Size: 42.8 MB, SHA256: 7f8b9a1c... OK)'
      );
      setIsBackingUp(false);
      showToast('Database backup snapshot drill completed successfully!', 'success');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              System Configuration & Property Settings
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global tax rules, property identification, POS outlets, and on-premise PostgreSQL server maintenance
          </p>
        </div>

        {/* Sub Tabs */}
        <div className="flex items-center p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs self-start sm:self-auto">
          {[
            { id: 'property', label: 'Property Info', icon: Building },
            { id: 'taxes', label: 'Taxes & Currency', icon: Receipt },
            { id: 'outlets', label: 'Outlets & Stations', icon: UtensilsCrossed },
            { id: 'database', label: 'LAN Server & DB', icon: Database },
            { id: 'templates', label: 'UI Templates & Skins', icon: Palette },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Property Info Tab */}
      {activeTab === 'property' && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-3">
              Property Identification & Tax Registration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Hotel Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={form.hotelName}
                  onChange={(e) => setForm({ ...form, hotelName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Tax Identification Number (TIN)
                </label>
                <input
                  type="text"
                  required
                  value={form.tinNumber}
                  onChange={(e) => setForm({ ...form, tinNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Physical Address
                </label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  City / State / Country
                </label>
                <input
                  type="text"
                  required
                  value={form.cityCountry}
                  onChange={(e) => setForm({ ...form, cityCountry: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Front Office Telephone
                </label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Official Inquiries Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-3">
              Standard Operating Policy Schedule
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Default Check-In Time
                </label>
                <input
                  type="text"
                  value={form.checkInTime}
                  onChange={(e) => setForm({ ...form, checkInTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Default Check-Out Time
                </label>
                <input
                  type="text"
                  value={form.checkOutTime}
                  onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Night Audit Execution Hour
                </label>
                <input
                  type="text"
                  value={form.nightAuditHour}
                  onChange={(e) => setForm({ ...form, nightAuditHour: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      )}

      {/* Taxes & Currency Tab */}
      {activeTab === 'taxes' && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
              <span>Statutory Tax & Surcharge Rates</span>
              <span className="text-[11px] font-normal text-slate-500">Automatically levied on active folios</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Value Added Tax (VAT) %
                </label>
                <div className="text-[11px] text-slate-500 mb-2">FIRS statutory standard rate</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={form.vatRate}
                    onChange={(e) => setForm({ ...form, vatRate: e.target.value })}
                    className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono font-bold"
                  />
                  <span className="font-bold text-slate-700 dark:text-slate-300">%</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Hotel Service Charge %
                </label>
                <div className="text-[11px] text-slate-500 mb-2">Staff gratuity & service charge</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={form.serviceChargeRate}
                    onChange={(e) => setForm({ ...form, serviceChargeRate: e.target.value })}
                    className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono font-bold"
                  />
                  <span className="font-bold text-slate-700 dark:text-slate-300">%</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  State Tourism Levy %
                </label>
                <div className="text-[11px] text-slate-500 mb-2">State tourism development levy</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={form.tourismLevyRate}
                    onChange={(e) => setForm({ ...form, tourismLevyRate: e.target.value })}
                    className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono font-bold"
                  />
                  <span className="font-bold text-slate-700 dark:text-slate-300">%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
              <span>Multi-Currency Billing Engine</span>
              <span className="text-[11px] font-normal text-slate-500">Live dual-currency displays</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">Display Currency</div>
                  <div className="text-[11px] text-slate-500">Toggle between Nigerian Naira and US Dollars</div>
                </div>
                <div className="flex items-center gap-1 p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => setCurrency('NGN')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                      currency === 'NGN' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    NGN (₦)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('USD')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                      currency === 'USD' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    USD ($)
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">Exchange Rate Peg</div>
                  <div className="text-[11px] text-slate-500">Fixed internal accounting conversion rate</div>
                </div>
                <div className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  1 USD = ₦{exchangeRate.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Update Tax & Currency Rules</span>
            </button>
          </div>
        </form>
      )}

      {/* Outlets & Kitchen Stations Tab */}
      {activeTab === 'outlets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
              <span>Configured POS Outlets (4 Outlets)</span>
            </h3>

            <div className="space-y-3 text-xs">
              {[
                { name: 'Lagoon Terrace Restaurant', tables: '18 Tables', printer: 'Network Thermal 192.168.1.150' },
                { name: 'Atlantic Cocktail Lounge & Bar', tables: '12 Lounge Booths', printer: 'Network Thermal 192.168.1.151' },
                { name: 'Palm Breeze Pool Bar', tables: '10 Pool Loungers', printer: 'Network Thermal 192.168.1.152' },
                { name: '24/7 In-Room Dining Service', tables: 'All 140 Rooms', printer: 'Kitchen KDS Auto-route' },
              ].map((outlet, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{outlet.name}</div>
                    <div className="text-[11px] text-slate-400">Capacity: {outlet.tables}</div>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                    {outlet.printer}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-amber-500" />
              <span>Kitchen KDS Production Stations</span>
            </h3>

            <div className="space-y-3 text-xs">
              {[
                { station: 'Hot Kitchen Line', duty: 'Continental & Nigerian Entrees, Soups, Stews', status: 'Online' },
                { station: 'Cold Larder & Salads', duty: 'Starters, Salads, Sandwiches, Fruit Platters', status: 'Online' },
                { station: 'Grill & Charcoal BBQ', duty: 'Steaks, Suya, Grilled Fish, Skewers', status: 'Online' },
                { station: 'Pastry & Bakery', duty: 'Fresh Bread, Cakes, Croissants, Desserts', status: 'Online' },
                { station: 'Main Dispense Bar', duty: 'Cocktails, Mocktails, Wines, Fresh Juices', status: 'Online' },
              ].map((s, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{s.station}</div>
                    <div className="text-[11px] text-slate-400">{s.duty}</div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LAN Server & Database Tab */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Server className="w-4 h-4 text-emerald-600" />
                <span>Local Server Host</span>
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">Windows Server 2022</div>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5">IP: 192.168.1.100 (Static LAN)</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Database className="w-4 h-4 text-blue-600" />
                <span>RDBMS Instance</span>
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">PostgreSQL 16.2</div>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5">DB: grandvista_pms (Port 5432)</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <HardDrive className="w-4 h-4 text-purple-600" />
                <span>RAID Storage Pool</span>
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">1.8 TB Free / 2.0 TB</div>
              <div className="text-[11px] text-slate-400 mt-0.5">RAID-1 Mirror with offsite replication</div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  PostgreSQL Automated Backup & Disaster Recovery Drill
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Scheduled nightly cron dumps at 03:00 AM with automated checksum validation
                </p>
              </div>

              <button
                type="button"
                onClick={handleTriggerBackupDrill}
                disabled={isBackingUp}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-xs transition-colors self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isBackingUp ? 'animate-spin' : ''}`} />
                <span>{isBackingUp ? 'Executing Backup...' : 'Trigger Backup Drill'}</span>
              </button>
            </div>

            {backupStatus && (
              <div className="p-3.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-xs space-y-1 border border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 text-[11px]">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>BACKUP LOG OUTPUT:</span>
                </div>
                <div className="text-slate-300 break-all">{backupStatus}</div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="font-semibold text-slate-900 dark:text-slate-100">Daily Hot Snapshot</div>
                <div className="text-slate-500 mt-0.5">Full logical dump via pg_dump with table level locking</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="font-semibold text-slate-900 dark:text-slate-100">WAL Archiving</div>
                <div className="text-slate-500 mt-0.5">Point-in-time recovery (PITR) up to the minute</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UI Templates & Skins Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-emerald-600" />
                  <span>Hotel Terminal UI Template Engine</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Change the active UI template to adapt layout density, color accents, and contrast for specific workstation roles.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Active: {UI_TEMPLATES.find((t) => t.id === currentTemplate)?.name}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {UI_TEMPLATES.map((tmpl) => {
                const isSelected = currentTemplate === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => {
                      setTemplate(tmpl.id);
                      showToast(`Applied ${tmpl.name}`, 'success');
                    }}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between text-left ${
                      isSelected
                        ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/90'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: tmpl.accentColor }}
                          />
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {tmpl.name}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {tmpl.badge}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                        {tmpl.tagline}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                        {tmpl.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                      <div className="text-[11px] text-slate-500 flex items-start gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>
                          <strong>Recommended:</strong> {tmpl.bestFor}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-100/70 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-lg">
                        <span>Density: <strong className="text-slate-700 dark:text-slate-300 capitalize">{tmpl.density}</strong></span>
                        <span>Font: <strong className="text-slate-700 dark:text-slate-300">{tmpl.fontStyle}</strong></span>
                        {isSelected ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium">Click to Activate</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
