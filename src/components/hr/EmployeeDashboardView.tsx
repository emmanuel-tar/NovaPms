/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useRBAC } from '../../context/RBACContext';
import {
  Users,
  Building2,
  Briefcase,
  UserCheck,
  Clock,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Coins,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';

interface EmployeeDashboardViewProps {
  onNavigateSubTab: (tab: string) => void;
  onOpenAddEmployee: () => void;
}

export const EmployeeDashboardView: React.FC<EmployeeDashboardViewProps> = ({
  onNavigateSubTab,
  onOpenAddEmployee,
}) => {
  const {
    employees,
    departments,
    jobPositions,
    userAccounts,
    attendanceRecords,
    leaveRequests,
    approvalRequests,
    shifts,
  } = useRBAC();

  const activeEmployees = employees.filter((e) => e.employmentStatus === 'active');
  const onLeaveEmployees = employees.filter((e) => e.employmentStatus === 'on_leave');
  const accountsCreated = employees.filter((e) => e.hasLoginAccount).length;
  const employeesWithoutAccount = employees.length - accountsCreated;

  const totalPayroll = activeEmployees.reduce((sum, e) => sum + e.salary, 0);

  const pendingApprovalsCount = approvalRequests.filter((a) => a.status === 'pending').length;
  const pendingLeavesCount = leaveRequests.filter((l) => l.status === 'pending').length;

  const formatNaira = (amt: number) => `₦${amt.toLocaleString()}`;

  // Department Distribution
  const deptCounts = departments.map((d) => {
    const count = employees.filter((e) => e.departmentId === d.id && e.employmentStatus !== 'archived').length;
    return { name: d.name, count, code: d.code };
  }).filter((d) => d.count > 0);

  return (
    <div className="space-y-6">
      {/* KPI Flash Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Staff Headcount</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            {employees.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
            <span>{activeEmployees.length} Active On-Duty</span>
            <span className="text-amber-600 font-medium">{onLeaveEmployees.length} On Leave</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>User Login Accounts</span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            {userAccounts.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
            <span className="text-emerald-600 font-medium">{userAccounts.filter((u) => u.status === 'active').length} Active</span>
            <span className="text-slate-500">{employeesWithoutAccount} Staff (No Account)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Pending Approvals</span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-1">
            {pendingApprovalsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Refunds, discounts & PO requisitions
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Monthly Payroll Liability</span>
            <Coins className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            {formatNaira(totalPayroll)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across {activeEmployees.length} salaried personnel</div>
        </div>
      </div>

      {/* Quick Action Operations */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Enterprise Workforce & RBAC Center</div>
            <div className="text-[11px] text-slate-400">Strict separation of duties, department scopes & financial approval controls.</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddEmployee}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Employee</span>
          </button>
          <button
            onClick={() => onNavigateSubTab('create_account')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Create User Login</span>
          </button>
          <button
            onClick={() => onNavigateSubTab('approvals')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Review Approvals ({pendingApprovalsCount})</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Department Distribution & Shift Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Headcount Breakdown */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Departmental Workforce Allocation ({departments.length} Configured Departments)
              </h3>
            </div>
            <button
              onClick={() => onNavigateSubTab('departments')}
              className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-1"
            >
              <span>Manage Departments</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {deptCounts.map((dept) => (
              <div
                key={dept.code}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">{dept.name}</div>
                  <div className="text-[10px] font-mono text-slate-400">{dept.code}</div>
                </div>
                <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {dept.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Shift & Attendance Flash */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Shift Coverage Today</h3>
            </div>
            <button
              onClick={() => onNavigateSubTab('attendance')}
              className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-1"
            >
              <span>Attendance Log</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            {shifts.map((sh) => (
              <div
                key={sh.id}
                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{sh.name}</div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {sh.startTime} - {sh.endTime}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                  Active Shift
                </span>
              </div>
            ))}
          </div>

          {/* Pending Leave Requests alert */}
          <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{pendingLeavesCount} Pending Leave Requests</span>
            </div>
            <button
              onClick={() => onNavigateSubTab('leave')}
              className="text-[11px] font-bold underline hover:text-amber-700"
            >
              Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
