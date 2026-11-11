/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePMS } from '../../context/PMSContext';
import { GuestProfile, VIPLevel } from '../../types/pms';
import {
  Users,
  Search,
  Plus,
  Crown,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  Star,
  CheckCircle2,
  X,
  Edit2,
  Building,
} from 'lucide-react';

export const GuestManagementView: React.FC = () => {
  const { guests, addGuestProfile, updateGuestProfile, formatMoney, showToast } = usePMS();
  const [search, setSearch] = useState('');
  const [vipFilter, setVipFilter] = useState<'all' | VIPLevel>('all');
  const [selectedGuest, setSelectedGuest] = useState<GuestProfile | null>(guests[0] || null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // New guest form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nationality: 'Nigerian',
    address: 'Victoria Island, Lagos',
    idType: 'National ID' as GuestProfile['idType'],
    idNumber: '',
    companyName: '',
    vipLevel: 'Standard' as VIPLevel,
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelationship: 'Next of Kin',
    preferences: '',
    specialRequests: '',
    notes: '',
  });

  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.guestCode.toLowerCase().includes(search.toLowerCase()) ||
      g.phone.includes(search) ||
      (g.email && g.email.toLowerCase().includes(search.toLowerCase())) ||
      (g.companyName && g.companyName.toLowerCase().includes(search.toLowerCase()));

    const matchesVip = vipFilter === 'all' || g.vipLevel === vipFilter;
    return matchesSearch && matchesVip;
  });

  const handleCreateGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      showToast('Please provide full name and contact phone.', 'error');
      return;
    }

    // Duplicate check
    const existing = guests.find(
      (g) => g.phone === formData.phone || (formData.email && g.email && g.email.toLowerCase() === formData.email.toLowerCase())
    );
    if (existing) {
      showToast(`Guest already exists with this phone/email (${existing.name})`, 'warning');
      return;
    }

    const created = addGuestProfile({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      nationality: formData.nationality.trim(),
      address: formData.address.trim(),
      idType: formData.idType,
      idNumber: formData.idNumber.trim(),
      companyName: formData.companyName.trim() || undefined,
      emergencyContact: {
        name: formData.emergencyName.trim() || 'Next of Kin',
        phone: formData.emergencyPhone.trim() || formData.phone.trim(),
        relationship: formData.emergencyRelationship,
      },
      vipLevel: formData.vipLevel,
      loyaltyPoints: 0,
      preferences: formData.preferences ? formData.preferences.split(',').map((p) => p.trim()) : [],
      specialRequests: formData.specialRequests.trim(),
      totalStays: 0,
      lifetimeSpend: 0,
      outstandingBalance: 0,
      notes: formData.notes.trim(),
    });

    setIsAddModalOpen(false);
    setSelectedGuest(created);
    setFormData({
      name: '',
      email: '',
      phone: '',
      nationality: 'Nigerian',
      address: 'Victoria Island, Lagos',
      idType: 'National ID',
      idNumber: '',
      companyName: '',
      vipLevel: 'Standard',
      emergencyName: '',
      emergencyPhone: '',
      emergencyRelationship: 'Next of Kin',
      preferences: '',
      specialRequests: '',
      notes: '',
    });
  };

  const handleUpdateGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuest) return;

    updateGuestProfile(selectedGuest.id, {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      nationality: formData.nationality.trim(),
      address: formData.address.trim(),
      idType: formData.idType,
      idNumber: formData.idNumber.trim(),
      companyName: formData.companyName.trim() || undefined,
      vipLevel: formData.vipLevel,
      preferences: formData.preferences ? formData.preferences.split(',').map((p) => p.trim()) : [],
      specialRequests: formData.specialRequests.trim(),
      notes: formData.notes.trim(),
    });

    setSelectedGuest((prev) =>
      prev
        ? {
            ...prev,
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            nationality: formData.nationality.trim(),
            address: formData.address.trim(),
            idType: formData.idType,
            idNumber: formData.idNumber.trim(),
            companyName: formData.companyName.trim() || undefined,
            vipLevel: formData.vipLevel,
            preferences: formData.preferences ? formData.preferences.split(',').map((p) => p.trim()) : [],
            specialRequests: formData.specialRequests.trim(),
            notes: formData.notes.trim(),
          }
        : null
    );

    setIsEditModalOpen(false);
  };

  const openEditModal = (guest: GuestProfile) => {
    setFormData({
      name: guest.name,
      email: guest.email,
      phone: guest.phone,
      nationality: guest.nationality,
      address: guest.address,
      idType: guest.idType,
      idNumber: guest.idNumber,
      companyName: guest.companyName || '',
      vipLevel: guest.vipLevel,
      emergencyName: guest.emergencyContact?.name || '',
      emergencyPhone: guest.emergencyContact?.phone || '',
      emergencyRelationship: guest.emergencyContact?.relationship || 'Next of Kin',
      preferences: guest.preferences.join(', '),
      specialRequests: guest.specialRequests || '',
      notes: guest.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const getVipBadge = (vip: VIPLevel) => {
    switch (vip) {
      case 'Platinum':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'Gold':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'Silver':
        return 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Guest Management (CRM)
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Centralized guest database, VIP loyalty tracking, stay history, and guest preferences
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: '',
              email: '',
              phone: '',
              nationality: 'Nigerian',
              address: 'Victoria Island, Lagos',
              idType: 'National ID',
              idNumber: '',
              companyName: '',
              vipLevel: 'Standard',
              emergencyName: '',
              emergencyPhone: '',
              emergencyRelationship: 'Next of Kin',
              preferences: '',
              specialRequests: '',
              notes: '',
            });
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Guest Profile</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Registered Guests</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            {guests.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Database verified profiles</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">VIP Members (Gold & Plat)</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-1">
            {guests.filter((g) => g.vipLevel === 'Gold' || g.vipLevel === 'Platinum').length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Priority amenities & fast check-in</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Lifetime Spend</div>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
            {formatMoney(guests.reduce((acc, g) => acc + g.lifetimeSpend, 0))}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Consolidated portfolio revenue</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Loyalty Points</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400 mt-1">
            {guests.reduce((acc, g) => acc + g.loyaltyPoints, 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Grand Vista Rewards club</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, code, phone, ID, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-500 shrink-0 mr-1">VIP Tier:</span>
          {(['all', 'Standard', 'Silver', 'Gold', 'Platinum'] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => setVipFilter(tier)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                vipFilter === tier
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tier === 'all' ? 'All Tiers' : tier}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Directory & Profile Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Guests Directory Table */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Guest Profiles Directory ({filteredGuests.length})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Guest / Code</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-3 py-3">VIP Tier</th>
                  <th className="px-3 py-3 text-right">Stays</th>
                  <th className="px-4 py-3 text-right">Lifetime Spend</th>
                  <th className="px-3 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredGuests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No guest profiles found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredGuests.map((guest) => {
                    const isSelected = selectedGuest?.id === guest.id;
                    return (
                      <tr
                        key={guest.id}
                        onClick={() => setSelectedGuest(guest)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/30'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {guest.name}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span>{guest.guestCode}</span>
                            {guest.companyName && (
                              <span className="text-slate-500 dark:text-slate-400">· {guest.companyName}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-mono text-slate-700 dark:text-slate-300">{guest.phone}</div>
                          {guest.email && <div className="text-[11px] text-slate-400">{guest.email}</div>}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md border ${getVipBadge(
                              guest.vipLevel
                            )}`}
                          >
                            <Crown className="w-3 h-3" />
                            {guest.vipLevel}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                          {guest.totalStays}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                          {formatMoney(guest.lifetimeSpend)}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(guest);
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit Profile"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Guest Profile Inspector Card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between">
          {selectedGuest ? (
            <div className="space-y-5">
              {/* Profile Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md border ${getVipBadge(
                        selectedGuest.vipLevel
                      )}`}
                    >
                      <Crown className="w-3 h-3" />
                      {selectedGuest.vipLevel} VIP
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{selectedGuest.guestCode}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {selectedGuest.name}
                  </h2>
                  {selectedGuest.companyName && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Building className="w-3.5 h-3.5" />
                      <span>{selectedGuest.companyName}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => openEditModal(selectedGuest)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Contact & Identification */}
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono">{selectedGuest.phone}</span>
                </div>
                {selectedGuest.email && (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{selectedGuest.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{selectedGuest.address || selectedGuest.nationality}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {selectedGuest.idType}: <strong className="font-mono">{selectedGuest.idNumber || 'Not recorded'}</strong>
                  </span>
                </div>
              </div>

              {/* Financial & Loyalty Highlights */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Stays</div>
                  <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                    {selectedGuest.totalStays} Stays
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Reward Points</div>
                  <div className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400">
                    {selectedGuest.loyaltyPoints.toLocaleString()} pts
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 col-span-2">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Lifetime Spend</div>
                  <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {formatMoney(selectedGuest.lifetimeSpend)}
                  </div>
                </div>
              </div>

              {/* Preferences & Requests */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Guest Preferences</div>
                {selectedGuest.preferences.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedGuest.preferences.map((pref, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-[11px] rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      >
                        {pref}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">No specific preferences recorded.</div>
                )}
              </div>

              {selectedGuest.specialRequests && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Special Requests</div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                    {selectedGuest.specialRequests}
                  </p>
                </div>
              )}

              {selectedGuest.notes && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Internal Front Desk Notes</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    {selectedGuest.notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">No Guest Selected</div>
              <div className="text-xs text-slate-400 mt-1">
                Select a guest from the directory to inspect their full profile, stay metrics, and preferences.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add New Guest Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Create New Guest Profile</h3>
                <p className="text-xs text-slate-500">Record traveler details and establish loyalty account</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGuest} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Full Name (Title, First & Last Name) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Babatunde Adeleke"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+234 803 123 4567"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="guest@example.com"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    ID Type
                  </label>
                  <select
                    value={formData.idType}
                    onChange={(e) => setFormData({ ...formData, idType: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    <option value="National ID">National ID (NIN)</option>
                    <option value="International Passport">International Passport</option>
                    <option value="Driver's License">Driver's License</option>
                    <option value="Voter Card">Voter's Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    ID / Document Number
                  </label>
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    placeholder="e.g. 19283746501"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. TotalEnergies E&P"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    VIP Tier
                  </label>
                  <select
                    value={formData.vipLevel}
                    onChange={(e) => setFormData({ ...formData, vipLevel: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Silver">Silver VIP</option>
                    <option value="Gold">Gold VIP</option>
                    <option value="Platinum">Platinum VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Plot 8, Alexander Road, Ikoyi, Lagos"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Preferences (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.preferences}
                  onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                  placeholder="e.g. High floor, Extra pillows, King bed"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Internal Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional remarks for front desk staff..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Guest Modal */}
      {isEditModalOpen && selectedGuest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Edit Guest: {selectedGuest.name}
                </h3>
                <p className="text-xs text-slate-500">Update guest profile data and preferences</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateGuest} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    VIP Tier
                  </label>
                  <select
                    value={formData.vipLevel}
                    onChange={(e) => setFormData({ ...formData, vipLevel: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Silver">Silver VIP</option>
                    <option value="Gold">Gold VIP</option>
                    <option value="Platinum">Platinum VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Preferences (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.preferences}
                  onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Special Requests
                </label>
                <input
                  type="text"
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Internal Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
