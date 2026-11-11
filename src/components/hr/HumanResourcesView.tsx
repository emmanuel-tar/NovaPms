/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePMS } from '../../context/PMSContext';
import { Employee, StaffRole } from '../../types/pms';
import {
  UserCheck,
  Search,
  Plus,
  Shield,
  Briefcase,
  Clock,
  Phone,
  Mail,
  Calendar,
  X,
  Edit2,
  CheckCircle2,
  Lock,
  ChevronRight,
  User,
} from 'lucide-react';

export const HumanResourcesView: React.FC = () => {
  const { employees, addEmployee, updateEmployee, currentEmployee, setCurrentEmployee, formatMoney, showToast } =
    usePMS();

  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'rbac'>('directory');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Add employee form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'receptionist' as StaffRole,
    title: 'Front Desk Officer',
    department: 'Front Office',
    shift: 'Morning (07:00-15:00)' as Employee['shift'],
    status: 'active' as Employee['status'],
    hireDate: '2026-01-15',
    salary: 220000,
  });

  const departments = ['Management', 'Front Office', 'F&B Service', 'Kitchen & Culinary', 'Housekeeping', 'Accounts & Finance', 'Inventory & Stores', 'Engineering'];

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.empNumber.toLowerCase().includes(search.toLowerCase()) ||
      emp.title.toLowerCase().includes(search.toLowerCase()) ||
      emp.phone.includes(search) ||
      emp.email.toLowerCase().includes(search.toLowerCase());

    const matchesDept = deptFilter === 'all' || emp.department === deptFilter;
    const matchesShift = shiftFilter === 'all' || emp.shift === shiftFilter;

    return matchesSearch && matchesDept && matchesShift;
  });

  const totalMonthlyPayroll = employees
    .filter((e) => e.status === 'active')
    .reduce((acc, e) => acc + e.salary, 0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      showToast('Please provide employee name and contact phone.', 'error');
      return;
    }

    addEmployee({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      role: formData.role,
      title: formData.title.trim(),
      department: formData.department,
      shift: formData.shift,
      status: formData.status,
      hireDate: formData.hireDate,
      salary: Number(formData.salary),
      avatarColor: 'bg-emerald-600',
    });

    setIsAddModalOpen(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'receptionist',
      title: 'Front Desk Officer',
      department: 'Front Office',
      shift: 'Morning (07:00-15:00)',
      status: 'active',
      hireDate: '2026-01-15',
      salary: 220000,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    updateEmployee(editingEmployee.id, {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      role: formData.role,
      title: formData.title.trim(),
      department: formData.department,
      shift: formData.shift,
      status: formData.status,
      salary: Number(formData.salary),
    });

    setEditingEmployee(null);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      role: emp.role,
      title: emp.title,
      department: emp.department,
      shift: emp.shift,
      status: emp.status,
      hireDate: emp.hireDate,
      salary: emp.salary,
    });
  };

  // RBAC Matrix Definitions
  const rbacPermissions: {
    role: StaffRole;
    name: string;
    modules: string[];
    canVoid: boolean;
    canViewFinance: boolean;
    canConfig: boolean;
  }[] = [
    {
      role: 'super_admin',
      name: 'System Super Administrator',
      modules: ['All 18 Modules Unrestricted'],
      canVoid: true,
      canViewFinance: true,
      canConfig: true,
    },
    {
      role: 'general_manager',
      name: 'General Manager',
      modules: ['All Modules, Night Audit, Audit Logs, Reports'],
      canVoid: true,
      canViewFinance: true,
      canConfig: true,
    },
    {
      role: 'front_office_manager',
      name: 'Front Office Manager',
      modules: ['Front Desk, Reservations, Guests, Rooms, Reports'],
      canVoid: true,
      canViewFinance: true,
      canConfig: false,
    },
    {
      role: 'receptionist',
      name: 'Front Desk Receptionist',
      modules: ['Room Rack, Check-in/out, Folio Charges, Bookings'],
      canVoid: false,
      canViewFinance: false,
      canConfig: false,
    },
    {
      role: 'accountant',
      name: 'Financial Accountant',
      modules: ['Finance, Ledger, Night Audit, Folios, Corporate A/C'],
      canVoid: true,
      canViewFinance: true,
      canConfig: false,
    },
    {
      role: 'cashier',
      name: 'Point of Sale Cashier',
      modules: ['POS Terminal, Bill Settlement, Room Charges'],
      canVoid: false,
      canViewFinance: false,
      canConfig: false,
    },
    {
      role: 'restaurant_manager',
      name: 'F&B / Restaurant Manager',
      modules: ['POS, Kitchen KDS, Inventory Requisition, Reports'],
      canVoid: true,
      canViewFinance: true,
      canConfig: false,
    },
    {
      role: 'chef',
      name: 'Executive Chef / Sous Chef',
      modules: ['Kitchen KDS Station, Recipe Requisitions, Store Orders'],
      canVoid: false,
      canViewFinance: false,
      canConfig: false,
    },
    {
      role: 'housekeeping_supervisor',
      name: 'Housekeeping Supervisor',
      modules: ['Housekeeping Board, Room Inspections, Minibar Audit'],
      canVoid: false,
      canViewFinance: false,
      canConfig: false,
    },
    {
      role: 'storekeeper',
      name: 'Central Storekeeper',
      modules: ['Inventory, Store Transfers, PO Receiving, Minibar'],
      canVoid: false,
      canViewFinance: false,
      canConfig: false,
    },
    {
      role: 'maintenance_staff',
      name: 'Maintenance Engineer',
      modules: ['Maintenance Work Orders, Room Lock / Out of Order'],
      canVoid: false,
      canViewFinance: false,
      canConfig: false,
    },
    {
      role: 'auditor',
      name: 'Night Auditor / Internal Auditor',
      modules: ['Night Audit Wizard, Daily Revenue, Audit Logs, Folios'],
      canVoid: false,
      canViewFinance: true,
      canConfig: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Human Resources & Staff Access
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Employee staff directory, departmental assignments, shift rosters, and Role-Based Access Control (RBAC)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub Tab Switcher */}
          <div className="flex items-center p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
            <button
              onClick={() => setActiveSubTab('directory')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeSubTab === 'directory'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Staff Directory
            </button>
            <button
              onClick={() => setActiveSubTab('rbac')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeSubTab === 'rbac'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>RBAC Matrix</span>
            </button>
          </div>

          {activeSubTab === 'directory' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Hotel Staff</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            {employees.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across 8 hotel departments</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Active On-Duty</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
            {employees.filter((e) => e.status === 'active').length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {employees.filter((e) => e.status === 'on_leave').length} on leave
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Monthly Payroll Obligation</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            {formatMoney(totalMonthlyPayroll)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Base gross monthly compensation</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Current Logged-in Staff</div>
          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 truncate">
            {currentEmployee.name}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            {currentEmployee.title} ({currentEmployee.role})
          </div>
        </div>
      </div>

      {activeSubTab === 'directory' ? (
        <>
          {/* Filters Bar */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search staff by name, ID, title, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Shifts</option>
                <option value="Morning (07:00-15:00)">Morning Shift</option>
                <option value="Evening (15:00-23:00)">Evening Shift</option>
                <option value="Night (23:00-07:00)">Night Shift</option>
                <option value="General Shift">General Shift</option>
              </select>
            </div>
          </div>

          {/* Employee Directory Table */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Employee / ID</th>
                    <th className="px-4 py-3">Job Title & Dept</th>
                    <th className="px-4 py-3">Current Shift</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-3 py-3 text-right">Monthly Salary</th>
                    <th className="px-3 py-3 text-center">Status</th>
                    <th className="px-3 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredEmployees.map((emp) => {
                    const isSelf = currentEmployee.id === emp.id;
                    return (
                      <tr
                        key={emp.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                          isSelf ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-xs">
                              {emp.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                <span>{emp.name}</span>
                                {isSelf && (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-mono text-slate-400">{emp.empNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800 dark:text-slate-200">{emp.title}</div>
                          <div className="text-[11px] text-slate-400">{emp.department}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[11px]">{emp.shift}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-mono text-slate-700 dark:text-slate-300">{emp.phone}</div>
                          <div className="text-[11px] text-slate-400">{emp.email}</div>
                        </td>
                        <td className="px-3 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                          {formatMoney(emp.salary)}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md ${
                              emp.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : emp.status === 'on_leave'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {emp.status === 'active' ? 'Active' : emp.status === 'on_leave' ? 'On Leave' : 'Terminated'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openEditModal(emp)}
                              className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Edit Employee"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {!isSelf && (
                              <button
                                onClick={() => {
                                  setCurrentEmployee(emp);
                                  showToast(`Switched active terminal user to: ${emp.name}`, 'info');
                                }}
                                className="px-2 py-0.5 text-[10px] font-medium rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Login / Switch to this user"
                              >
                                Switch
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* RBAC Permission Matrix */
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              Role-Based Access Control (RBAC) Governance Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Authorizations enforce strict separation of duties between Cashiers, Waiters, Housekeeping, Night Auditors, and Hotel Management.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Role Code & Name</th>
                    <th className="px-4 py-3">Authorized Operational Modules</th>
                    <th className="px-3 py-3 text-center">Void / Reversals</th>
                    <th className="px-3 py-3 text-center">Financial Reports</th>
                    <th className="px-3 py-3 text-center">System Settings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {rbacPermissions.map((rbac) => (
                    <tr key={rbac.role} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{rbac.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{rbac.role}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {rbac.modules.join(', ')}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {rbac.canVoid ? (
                          <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Allowed
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-slate-400 text-xs">
                            <Lock className="w-3.5 h-3.5 mr-1" /> Blocked
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {rbac.canViewFinance ? (
                          <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Allowed
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-slate-400 text-xs">
                            <Lock className="w-3.5 h-3.5 mr-1" /> Blocked
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {rbac.canConfig ? (
                          <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-slate-400 text-xs">
                            <Lock className="w-3.5 h-3.5 mr-1" /> Restricted
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Add Staff Member</h3>
                <p className="text-xs text-slate-500">Register employee record and assign shift & role</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Samuel Okon"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+234 803 000 1122"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="s.okon@grandvistahotel.com"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Night Receptionist"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    System RBAC Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    <option value="receptionist">Receptionist</option>
                    <option value="front_office_manager">Front Office Manager</option>
                    <option value="cashier">POS Cashier</option>
                    <option value="waiter">Waiter / Server</option>
                    <option value="chef">Chef / Kitchen Staff</option>
                    <option value="restaurant_manager">Restaurant Manager</option>
                    <option value="housekeeping_supervisor">Housekeeping Supervisor</option>
                    <option value="housekeeping_staff">Housekeeping Staff</option>
                    <option value="storekeeper">Storekeeper</option>
                    <option value="accountant">Accountant</option>
                    <option value="maintenance_staff">Maintenance Staff</option>
                    <option value="auditor">Auditor</option>
                    <option value="general_manager">General Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Shift</label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Morning (07:00-15:00)">Morning (07:00-15:00)</option>
                    <option value="Evening (15:00-23:00)">Evening (15:00-23:00)</option>
                    <option value="Night (23:00-07:00)">Night (23:00-07:00)</option>
                    <option value="General Shift">General Shift (08:30-17:00)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Monthly Salary (₦)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
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
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Edit Staff: {editingEmployee.name}
                </h3>
                <p className="text-xs text-slate-500">{editingEmployee.empNumber}</p>
              </div>
              <button
                onClick={() => setEditingEmployee(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Full Name
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
                    Job Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Role (RBAC)
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    <option value="receptionist">Receptionist</option>
                    <option value="front_office_manager">Front Office Manager</option>
                    <option value="cashier">POS Cashier</option>
                    <option value="waiter">Waiter / Server</option>
                    <option value="chef">Chef / Kitchen Staff</option>
                    <option value="restaurant_manager">Restaurant Manager</option>
                    <option value="housekeeping_supervisor">Housekeeping Supervisor</option>
                    <option value="housekeeping_staff">Housekeeping Staff</option>
                    <option value="storekeeper">Storekeeper</option>
                    <option value="accountant">Accountant</option>
                    <option value="maintenance_staff">Maintenance Staff</option>
                    <option value="auditor">Auditor</option>
                    <option value="general_manager">General Manager</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Monthly Salary (₦)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Update Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
