/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRBAC } from '../../context/RBACContext';
import { X, Key, Shield, User, AlertCircle, Check } from 'lucide-react';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    employees,
    roles,
    departments,
    createAccount,
  } = useRBAC();

  // Eligible employees without accounts
  const unlinkedEmployees = employees.filter((e) => !e.hasLoginAccount && e.employmentStatus !== 'archived');

  const [selectedEmpId, setSelectedEmpId] = useState(unlinkedEmployees[0]?.id || '');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('Welcome@2026');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(['role-receptionist']);
  const [deptScope, setDeptScope] = useState<'all' | 'custom'>('all');
  const [selectedDeptIds, setSelectedDeptIds] = useState<string[]>([]);
  const [outletScope, setOutletScope] = useState<'all' | 'custom'>('all');
  const [selectedOutletIds, setSelectedOutletIds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmpChange = (empId: string) => {
    setSelectedEmpId(empId);
    const emp = employees.find((e) => e.id === empId);
    if (emp) {
      setUsername(`${emp.firstName.toLowerCase()}.${emp.lastName.toLowerCase()}`);
      setEmail(emp.email);
    }
  };

  const handleRoleToggle = (roleId: string) => {
    if (selectedRoleIds.includes(roleId)) {
      if (selectedRoleIds.length === 1) return; // keep at least 1
      setSelectedRoleIds(selectedRoleIds.filter((id) => id !== roleId));
    } else {
      setSelectedRoleIds([...selectedRoleIds, roleId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedEmpId) {
      setErrorMsg('Please select an employee to provision an account for');
      return;
    }
    if (!username.trim()) {
      setErrorMsg('Username is required');
      return;
    }
    if (selectedRoleIds.length === 0) {
      setErrorMsg('At least one role must be assigned');
      return;
    }

    const res = createAccount({
      employeeId: selectedEmpId,
      username: username.trim(),
      email: email.trim() || `${username.trim()}@grandvistahotel.com`,
      roleIds: selectedRoleIds,
      departmentAccessScope: deptScope,
      allowedDepartmentIds: selectedDeptIds,
      outletAccessScope: outletScope,
      allowedOutletIds: selectedOutletIds,
      tempPassword: tempPassword.trim(),
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to create user account');
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-600" />
              <span>Provision User Account (Workflow A)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Direct administrative credential setup with mandatory first-login password reset.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {unlinkedEmployees.length > 0 ? (
            <div>
              <label className="block text-xs font-semibold mb-1">
                Select Employee (Without Account) *
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => handleEmpChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="">-- Choose employee --</option>
                {unlinkedEmployees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.empNumber} — {e.fullName} ({e.departmentName} - {e.jobTitle})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 text-amber-800 text-xs">
              All active employees currently have login accounts. You can create a new employee first or modify existing accounts.
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Username *</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. adebayo.a"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Temporary Password *</label>
              <input
                type="text"
                required
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Email for Login / Alerts</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@grandvistahotel.com"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
          </div>

          {/* Role selection */}
          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Assign RBAC Roles * (Multi-role support)
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
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
                      onChange={() => handleRoleToggle(r.id)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="truncate">{r.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Scope Controls */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold mb-1">Department Access Scope</label>
              <select
                value={deptScope}
                onChange={(e) => setDeptScope(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="all">Global (All Departments)</option>
                <option value="custom">Custom Department Scope</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">POS Outlet Access Scope</label>
              <select
                value={outletScope}
                onChange={(e) => setOutletScope(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="all">Global (All Outlets)</option>
                <option value="custom">Custom Outlet Scope</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={unlinkedEmployees.length === 0}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-xs"
            >
              Provision Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
