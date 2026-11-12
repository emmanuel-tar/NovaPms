/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRBAC } from '../../context/RBACContext';
import { EmployeeRecord } from '../../types/rbac';
import {
  Search,
  Filter,
  Plus,
  UserCheck,
  UserX,
  FileSpreadsheet,
  MoreVertical,
  ShieldAlert,
  ShieldCheck,
  Key,
  Eye,
  Edit2,
  Lock,
  ChevronRight,
  Download,
  Info,
  UserPlus,
} from 'lucide-react';

interface EmployeeDirectoryViewProps {
  onOpenAddModal: () => void;
  onOpenProfile: (emp: EmployeeRecord) => void;
  onEditEmployee: (emp: EmployeeRecord) => void;
  onNavigateSubTab: (tab: string) => void;
  onOpenCreateAccountForEmployee?: (empId: string) => void;
}

export const EmployeeDirectoryView: React.FC<EmployeeDirectoryViewProps> = ({
  onOpenAddModal,
  onOpenProfile,
  onEditEmployee,
  onNavigateSubTab,
  onOpenCreateAccountForEmployee,
}) => {
  const { employees, departments, archiveEmployee, activateEmployee } = useRBAC();

  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all'); // all, with_account, without_account

  const filteredEmployees = employees.filter((emp) => {
    const q = search.toLowerCase();
    const matchesSearch =
      emp.fullName.toLowerCase().includes(q) ||
      emp.empNumber.toLowerCase().includes(q) ||
      emp.jobTitle.toLowerCase().includes(q) ||
      emp.phone.includes(q) ||
      emp.email.toLowerCase().includes(q);

    const matchesDept = departmentFilter === 'all' || emp.departmentId === departmentFilter;
    const matchesStatus = statusFilter === 'all' || emp.employmentStatus === statusFilter;
    const matchesAccount =
      accountFilter === 'all'
        ? true
        : accountFilter === 'with_account'
        ? emp.hasLoginAccount
        : !emp.hasLoginAccount;

    return matchesSearch && matchesDept && matchesStatus && matchesAccount;
  });

  const unlinkedCount = employees.filter((e) => !e.hasLoginAccount && e.employmentStatus !== 'archived').length;

  const exportCSV = () => {
    const headers = ['Employee ID', 'Full Name', 'Department', 'Job Title', 'Type', 'Status', 'Has Account', 'Salary', 'Hire Date'];
    const rows = filteredEmployees.map((e) => [
      e.empNumber,
      `"${e.fullName}"`,
      `"${e.departmentName}"`,
      `"${e.jobTitle}"`,
      e.employmentType,
      e.employmentStatus,
      e.hasLoginAccount ? 'Yes' : 'No',
      e.salary,
      e.hireDate,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hotel_employees_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Information Banner regarding separation of HR and Login Accounts */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-slate-600 dark:text-slate-300">
            <span className="font-bold text-slate-900 dark:text-slate-100 mr-1.5">Workforce & Security Architecture:</span>
            Staff members (housekeeping attendants, stewards, maintenance) can exist purely as HR records. To grant hotel software access, click <strong>"+ Provision Account"</strong> on any staff member to assign system roles and outlet privileges.
          </div>
        </div>
        {unlinkedCount > 0 && (
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold whitespace-nowrap self-start sm:self-auto text-[11px]">
            {unlinkedCount} Staff Without Account
          </span>
        )}
      </div>

      {/* Action and Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, employee ID, title, email or phone..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Departments ({departments.length})</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} - {d.name}
              </option>
            ))}
          </select>

          {/* Account Filter */}
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Accounts</option>
            <option value="with_account">Has Login Account</option>
            <option value="without_account">No Login Account (Staff only)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="on_leave">On Leave</option>
            <option value="on_probation">On Probation</option>
            <option value="suspended">Suspended</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
            title="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
          
          <button
            onClick={() => onNavigateSubTab('create-account')}
            className="px-3.5 py-2 rounded-xl border border-emerald-600/40 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
            title="Create user account with roles"
          >
            <Key className="w-3.5 h-3.5 text-emerald-600" />
            <span>+ Create Account</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department & Position</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">System Access</th>
                <th className="py-3 px-4">Salary</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Employee Name & Number */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl text-white flex items-center justify-center text-xs font-bold shadow-xs shrink-0 ${emp.avatarColor}`}
                      >
                        {emp.firstName[0]}
                        {emp.lastName[0]}
                      </div>
                      <div>
                        <button
                          onClick={() => onOpenProfile(emp)}
                          className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 text-left"
                        >
                          {emp.fullName}
                        </button>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] text-slate-500">{emp.empNumber}</span>
                          <span className="text-[10px] text-slate-400">• {emp.employmentType}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Department & Position */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{emp.jobTitle}</div>
                    <div className="text-[11px] text-slate-500">{emp.departmentName}</div>
                  </td>

                  {/* Contact */}
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-slate-700 dark:text-slate-300">{emp.phone}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[160px]">{emp.email}</div>
                  </td>

                  {/* Employment Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        emp.employmentStatus === 'active'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : emp.employmentStatus === 'on_leave'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : emp.employmentStatus === 'on_probation'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {emp.employmentStatus.replace('_', ' ')}
                    </span>
                  </td>

                  {/* System Access (Crucial: Employee vs User Account Separation) */}
                  <td className="py-3.5 px-4">
                    {emp.hasLoginAccount ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 font-medium text-[11px]">
                        <Key className="w-3 h-3 text-emerald-600" />
                        <span>Login Enabled</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          if (onOpenCreateAccountForEmployee) {
                            onOpenCreateAccountForEmployee(emp.id);
                          } else {
                            onNavigateSubTab('create-account');
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 font-semibold text-[11px] transition-colors"
                        title="Click to provision login account for this staff"
                      >
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>+ Enable Login</span>
                      </button>
                    )}
                  </td>

                  {/* Salary */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                      ₦{emp.salary.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block">/month</span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenProfile(emp)}
                        title="View Profile"
                        className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditEmployee(emp)}
                        title="Edit Employee"
                        className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {!emp.hasLoginAccount && (
                        <button
                          onClick={() => {
                            if (onOpenCreateAccountForEmployee) {
                              onOpenCreateAccountForEmployee(emp.id);
                            } else {
                              onNavigateSubTab('create-account');
                            }
                          }}
                          title="Provision Login Account"
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors shadow-xs"
                        >
                          + Provision Account
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-xs">
            No employees match the selected criteria.
          </div>
        )}
      </div>
    </div>
  );
};
