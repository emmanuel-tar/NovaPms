/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRBAC } from '../../context/RBACContext';
import { UserAccount } from '../../types/rbac';
import {
  Layers,
  Building2,
  UtensilsCrossed,
  Shield,
  Check,
  Save,
  Search,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const AccessScopesView: React.FC = () => {
  const {
    userAccounts,
    departments,
    roles,
    updateUserScopes,
    assignUserRoles,
  } = useRBAC();

  const [selectedUserId, setSelectedUserId] = useState<string>(userAccounts[0]?.id || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Available Outlets in Grand Vista Hotel
  const ALL_OUTLETS = [
    { id: 'outlet-main', name: 'Azure Grand Restaurant (Main Dining)', code: 'REST-01' },
    { id: 'outlet-rooftop', name: 'Skyline Rooftop Lounge & Cocktail Bar', code: 'BAR-01' },
    { id: 'outlet-pool', name: 'Lagoon Poolside Bar & Grill', code: 'POOL-01' },
    { id: 'outlet-inroom', name: '24/7 In-Room Dining & Room Service', code: 'IR-01' },
    { id: 'outlet-cafe', name: 'Oasis Lobby Bakery & Espresso Bar', code: 'CAFE-01' },
    { id: 'outlet-banquet', name: 'Grand Ballroom & Banqueting Bar', code: 'BANQ-01' },
  ];

  const currentUser = userAccounts.find((u) => u.id === selectedUserId) || userAccounts[0];

  // Local Form state synced when currentUser changes
  const [deptScope, setDeptScope] = useState<'all' | 'custom'>(currentUser?.departmentAccessScope || 'all');
  const [allowedDepts, setAllowedDepts] = useState<string[]>(currentUser?.allowedDepartmentIds || []);
  const [outletScope, setOutletScope] = useState<'all' | 'custom'>(currentUser?.outletAccessScope || 'all');
  const [allowedOutlets, setAllowedOutlets] = useState<string[]>(currentUser?.allowedOutletIds || []);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(currentUser?.roleIds || []);

  const handleSelectUser = (user: UserAccount) => {
    setSelectedUserId(user.id);
    setDeptScope(user.departmentAccessScope);
    setAllowedDepts(user.allowedDepartmentIds || []);
    setOutletScope(user.outletAccessScope);
    setAllowedOutlets(user.allowedOutletIds || []);
    setSelectedRoleIds(user.roleIds || []);
    setSaveSuccess(false);
  };

  const handleToggleDept = (deptId: string) => {
    if (allowedDepts.includes(deptId)) {
      setAllowedDepts(allowedDepts.filter((id) => id !== deptId));
    } else {
      setAllowedDepts([...allowedDepts, deptId]);
    }
  };

  const handleToggleOutlet = (outletId: string) => {
    if (allowedOutlets.includes(outletId)) {
      setAllowedOutlets(allowedOutlets.filter((id) => id !== outletId));
    } else {
      setAllowedOutlets([...allowedOutlets, outletId]);
    }
  };

  const handleToggleRole = (roleId: string) => {
    if (selectedRoleIds.includes(roleId)) {
      if (selectedRoleIds.length === 1) return;
      setSelectedRoleIds(selectedRoleIds.filter((id) => id !== roleId));
    } else {
      setSelectedRoleIds([...selectedRoleIds, roleId]);
    }
  };

  const handleSave = () => {
    if (!currentUser) return;
    updateUserScopes(currentUser.id, deptScope, allowedDepts, outletScope, allowedOutlets);
    assignUserRoles(currentUser.id, selectedRoleIds);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: User Picker */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select User Account ({userAccounts.length})
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 space-y-1.5 max-h-[70vh] overflow-y-auto">
            {userAccounts.map((user) => {
              const isSelected = user.id === selectedUserId;

              return (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500 shadow-xs'
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                        @{user.username}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {user.employeeName}
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                        user.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>Scope: {user.departmentAccessScope}</span>
                    <span>•</span>
                    <span>Outlet: {user.outletAccessScope}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Scopes Configuration */}
        <div className="lg:col-span-8 space-y-5">
          {currentUser && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
              {/* Top Banner */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Access Scope & Role Assignment for @{currentUser.username}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentUser.employeeName} ({currentUser.email})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {saveSuccess && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Changes Saved</span>
                    </span>
                  )}
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Scopes</span>
                  </button>
                </div>
              </div>

              {/* Roles Multi-Assignment */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span>Assigned System Roles</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  {roles.map((r) => {
                    const checked = selectedRoleIds.includes(r.id);
                    return (
                      <label
                        key={r.id}
                        className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleRole(r.id)}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="truncate">{r.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 1. Department Access Scope */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>Department Access Scope</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="deptScope"
                        checked={deptScope === 'all'}
                        onChange={() => setDeptScope('all')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Global (All 19 Departments)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer ml-3">
                      <input
                        type="radio"
                        name="deptScope"
                        checked={deptScope === 'custom'}
                        onChange={() => setDeptScope('custom')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Restricted to Custom Departments</span>
                    </label>
                  </div>
                </div>

                {deptScope === 'custom' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 max-h-48 overflow-y-auto animate-in fade-in">
                    {departments.map((dept) => {
                      const isAllowed = allowedDepts.includes(dept.id);
                      return (
                        <label
                          key={dept.id}
                          className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isAllowed}
                            onChange={() => handleToggleDept(dept.id)}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="truncate">
                            {dept.code} - {dept.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. POS Outlet Access Scope */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                    <span>Point of Sale (POS) Outlet Scope</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="outletScope"
                        checked={outletScope === 'all'}
                        onChange={() => setOutletScope('all')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>All POS Outlets</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer ml-3">
                      <input
                        type="radio"
                        name="outletScope"
                        checked={outletScope === 'custom'}
                        onChange={() => setOutletScope('custom')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>Assigned Outlets Only</span>
                    </label>
                  </div>
                </div>

                {outletScope === 'custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 animate-in fade-in">
                    {ALL_OUTLETS.map((outlet) => {
                      const isAllowed = allowedOutlets.includes(outlet.id);
                      return (
                        <label
                          key={outlet.id}
                          className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <input
                            type="checkbox"
                            checked={isAllowed}
                            onChange={() => handleToggleOutlet(outlet.id)}
                            className="rounded text-amber-600 focus:ring-amber-500"
                          />
                          <div>
                            <span className="font-semibold block">{outlet.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {outlet.code}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
