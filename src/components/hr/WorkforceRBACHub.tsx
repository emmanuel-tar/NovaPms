/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRBAC } from '../../context/RBACContext';
import { EmployeeRecord } from '../../types/rbac';
import { EmployeeDashboardView } from './EmployeeDashboardView';
import { EmployeeDirectoryView } from './EmployeeDirectoryView';
import { EmployeeRegistrationModal } from './EmployeeRegistrationModal';
import { EmployeeProfileModal } from './EmployeeProfileModal';
import { DepartmentManagementView } from './DepartmentManagementView';
import { JobPositionManagementView } from './JobPositionManagementView';
import { ShiftsAttendanceView } from './ShiftsAttendanceView';
import { LeaveManagementView } from './LeaveManagementView';
import { UserAccountsView } from './UserAccountsView';
import { CreateAccountModal } from './CreateAccountModal';
import { InviteEmployeeModal } from './InviteEmployeeModal';
import { ActiveSessionsView } from './ActiveSessionsView';
import { RolesPermissionsView } from './RolesPermissionsView';
import { AccessScopesView } from './AccessScopesView';
import { ApprovalAuthorityView } from './ApprovalAuthorityView';
import { CashierReconciliationView } from './CashierReconciliationView';
import { SecurityAuditView } from './SecurityAuditView';

import {
  Users,
  Shield,
  Key,
  ShieldAlert,
  Building2,
  Briefcase,
  Clock,
  Calendar,
  Wifi,
  Coins,
  FileCheck,
  ChevronDown,
  UserCheck,
  Plus,
} from 'lucide-react';

export type MainSection =
  | 'EMPLOYEE_MANAGEMENT'
  | 'USER_ACCOUNT_MANAGEMENT'
  | 'ACCESS_CONTROL'
  | 'AUDIT_SECURITY';

export const WorkforceRBACHub: React.FC = () => {
  const {
    currentUserAccount,
    userAccounts,
    setCurrentUserAccount,
    approvalRequests,
    leaveRequests,
    cashierShifts,
  } = useRBAC();

  // Top-level 4 sections
  const [activeSection, setActiveSection] = useState<MainSection>('EMPLOYEE_MANAGEMENT');
  // Sub-tabs
  const [subTab, setSubTab] = useState<string>('dashboard');

  // Modals
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<EmployeeRecord | null>(null);
  const [profileModalEmp, setProfileModalEmp] = useState<EmployeeRecord | null>(null);
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [createAccountEmpId, setCreateAccountEmpId] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // User switcher dropdown
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);

  const pendingApprovalsCount = approvalRequests.filter((a) => a.status === 'pending').length;
  const pendingLeavesCount = leaveRequests.filter((l) => l.status === 'pending').length;
  const openCashierCount = cashierShifts.filter((c) => c.status === 'open').length;

  const handleOpenCreateAccount = (empId?: string) => {
    setCreateAccountEmpId(empId || null);
    setIsCreateAccountOpen(true);
  };

  const handleNavigateSubTab = (tab: string, targetEmpId?: string) => {
    if (tab === 'create-account') {
      handleOpenCreateAccount(targetEmpId);
      return;
    }
    if (tab === 'invite-employee') {
      setIsInviteModalOpen(true);
      return;
    }
    if (tab === 'add-employee') {
      setEmployeeToEdit(null);
      setIsAddEmployeeOpen(true);
      return;
    }
    if (['dashboard', 'directory', 'departments', 'positions', 'shifts', 'leaves'].includes(tab)) {
      setActiveSection('EMPLOYEE_MANAGEMENT');
      setSubTab(tab);
    } else if (['users', 'sessions'].includes(tab)) {
      setActiveSection('USER_ACCOUNT_MANAGEMENT');
      setSubTab(tab);
    } else if (['roles', 'scopes', 'approvals', 'cashier'].includes(tab)) {
      setActiveSection('ACCESS_CONTROL');
      setSubTab(tab);
    } else if (['audit'].includes(tab)) {
      setActiveSection('AUDIT_SECURITY');
      setSubTab(tab);
    }
  };

  const handleOpenAddEmployee = () => {
    setEmployeeToEdit(null);
    setIsAddEmployeeOpen(true);
  };

  const handleEditEmployee = (emp: EmployeeRecord) => {
    setEmployeeToEdit(emp);
    setIsAddEmployeeOpen(true);
  };

  const handleOpenProfile = (emp: EmployeeRecord) => {
    setProfileModalEmp(emp);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Acting Identity & Role Switcher */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Workforce Administration & Enterprise RBAC</span>
              </h1>
              <p className="text-xs text-slate-500">
                Centralized employee records, separated login credentials, 22-module permission matrices, and financial separation of duties.
              </p>
            </div>
          </div>
        </div>

        {/* User Account Switcher (Tests RBAC live across accounts) */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setIsUserSwitcherOpen(!isUserSwitcherOpen)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                {currentUserAccount.employeeName[0]}
              </div>
              <div>
                <div className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                  @{currentUserAccount.username}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {currentUserAccount.roles?.[0]?.name || 'User'}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
            </button>

            {isUserSwitcherOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-40 p-2 space-y-1 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Simulate Acting Staff Account
                </div>
                {userAccounts.map((u) => {
                  const isCurrent = u.id === currentUserAccount.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUserAccount(u);
                        setIsUserSwitcherOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs transition-colors ${
                        isCurrent
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-mono">@{u.username}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {u.employeeName} ({u.roles?.[0]?.name})
                        </div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {u.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4 Main Navigation Sections Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => {
            setActiveSection('EMPLOYEE_MANAGEMENT');
            setSubTab('dashboard');
          }}
          className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all border ${
            activeSection === 'EMPLOYEE_MANAGEMENT'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>1. EMPLOYEE MANAGEMENT</span>
        </button>

        <button
          onClick={() => {
            setActiveSection('USER_ACCOUNT_MANAGEMENT');
            setSubTab('users');
          }}
          className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all border ${
            activeSection === 'USER_ACCOUNT_MANAGEMENT'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>2. USER ACCOUNTS</span>
        </button>

        <button
          onClick={() => {
            setActiveSection('ACCESS_CONTROL');
            setSubTab('roles');
          }}
          className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all border ${
            activeSection === 'ACCESS_CONTROL'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>3. ACCESS CONTROL</span>
          {pendingApprovalsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 ml-1" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveSection('AUDIT_SECURITY');
            setSubTab('security');
          }}
          className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all border ${
            activeSection === 'AUDIT_SECURITY'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>4. AUDIT & SECURITY</span>
        </button>
      </div>

      {/* Sub-Tabs Strip Based on Active Main Section */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        {activeSection === 'EMPLOYEE_MANAGEMENT' && (
          <>
            <button
              onClick={() => setSubTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                subTab === 'dashboard'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setSubTab('directory')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                subTab === 'directory'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              Employee Directory
            </button>
            <button
              onClick={() => setSubTab('departments')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                subTab === 'departments'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              Departments (19)
            </button>
            <button
              onClick={() => setSubTab('positions')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                subTab === 'positions'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              Job Positions
            </button>
            <button
              onClick={() => setSubTab('shifts')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                subTab === 'shifts'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              Shifts & Attendance
            </button>
            <button
              onClick={() => setSubTab('leaves')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                subTab === 'leaves'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>Leave Management</span>
              {pendingLeavesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-900 font-bold">
                  {pendingLeavesCount}
                </span>
              )}
            </button>
          </>
        )}

        {activeSection === 'USER_ACCOUNT_MANAGEMENT' && (
          <>
            <button
              onClick={() => setSubTab('users')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                subTab === 'users'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              User Accounts Directory
            </button>
            <button
              onClick={() => handleOpenCreateAccount()}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5 text-emerald-600" />
              <span>+ Create Account (Workflow A)</span>
            </button>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>+ Invite Employee (Workflow B)</span>
            </button>
            <button
              onClick={() => setSubTab('sessions')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                subTab === 'sessions'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              LAN Active Sessions
            </button>
          </>
        )}

        {activeSection === 'ACCESS_CONTROL' && (
          <>
            <button
              onClick={() => setSubTab('roles')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                subTab === 'roles'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              Roles & Granular Permissions
            </button>
            <button
              onClick={() => setSubTab('scopes')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                subTab === 'scopes'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              Department & Outlet Scopes
            </button>
            <button
              onClick={() => setSubTab('approvals')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                subTab === 'approvals'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>Financial Approval Authority</span>
              {pendingApprovalsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-900 font-bold">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setSubTab('cashier')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                subTab === 'cashier'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>Cashier Shift Reconciliation</span>
              {openCashierCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-white font-bold">
                  {openCashierCount} Open
                </span>
              )}
            </button>
          </>
        )}

        {activeSection === 'AUDIT_SECURITY' && (
          <>
            <span className="text-xs text-slate-400 font-medium">
              Tamper-evident audit trails for security events, login telemetry, and permission mutations.
            </span>
          </>
        )}
      </div>

      {/* Main Dynamic Viewport */}
      <div>
        {/* SECTION 1: EMPLOYEE MANAGEMENT */}
        {activeSection === 'EMPLOYEE_MANAGEMENT' && subTab === 'dashboard' && (
          <EmployeeDashboardView
            onNavigateSubTab={handleNavigateSubTab}
            onOpenAddEmployee={handleOpenAddEmployee}
          />
        )}
        {activeSection === 'EMPLOYEE_MANAGEMENT' && subTab === 'directory' && (
          <EmployeeDirectoryView
            onOpenAddModal={handleOpenAddEmployee}
            onOpenProfile={handleOpenProfile}
            onEditEmployee={handleEditEmployee}
            onNavigateSubTab={handleNavigateSubTab}
            onOpenCreateAccountForEmployee={(empId) => handleOpenCreateAccount(empId)}
          />
        )}
        {activeSection === 'EMPLOYEE_MANAGEMENT' && subTab === 'departments' && (
          <DepartmentManagementView />
        )}
        {activeSection === 'EMPLOYEE_MANAGEMENT' && subTab === 'positions' && (
          <JobPositionManagementView />
        )}
        {activeSection === 'EMPLOYEE_MANAGEMENT' && subTab === 'shifts' && (
          <ShiftsAttendanceView />
        )}
        {activeSection === 'EMPLOYEE_MANAGEMENT' && subTab === 'leaves' && (
          <LeaveManagementView />
        )}

        {/* SECTION 2: USER ACCOUNT MANAGEMENT */}
        {activeSection === 'USER_ACCOUNT_MANAGEMENT' && subTab === 'users' && (
          <UserAccountsView
            onOpenCreateAccount={() => handleOpenCreateAccount()}
            onOpenInviteModal={() => setIsInviteModalOpen(true)}
            onNavigateSubTab={handleNavigateSubTab}
          />
        )}
        {activeSection === 'USER_ACCOUNT_MANAGEMENT' && subTab === 'sessions' && (
          <ActiveSessionsView />
        )}

        {/* SECTION 3: ACCESS CONTROL */}
        {activeSection === 'ACCESS_CONTROL' && subTab === 'roles' && (
          <RolesPermissionsView />
        )}
        {activeSection === 'ACCESS_CONTROL' && subTab === 'scopes' && (
          <AccessScopesView />
        )}
        {activeSection === 'ACCESS_CONTROL' && subTab === 'approvals' && (
          <ApprovalAuthorityView />
        )}
        {activeSection === 'ACCESS_CONTROL' && subTab === 'cashier' && (
          <CashierReconciliationView />
        )}

        {/* SECTION 4: AUDIT AND SECURITY */}
        {activeSection === 'AUDIT_SECURITY' && <SecurityAuditView />}
      </div>

      {/* Global Modals */}
      <EmployeeRegistrationModal
        isOpen={isAddEmployeeOpen}
        onClose={() => setIsAddEmployeeOpen(false)}
        employeeToEdit={employeeToEdit}
      />

      <EmployeeProfileModal
        isOpen={!!profileModalEmp}
        onClose={() => setProfileModalEmp(null)}
        employee={profileModalEmp}
        onEdit={(emp) => {
          setProfileModalEmp(null);
          handleEditEmployee(emp);
        }}
        onNavigateSubTab={handleNavigateSubTab}
      />

      <CreateAccountModal
        isOpen={isCreateAccountOpen}
        onClose={() => {
          setIsCreateAccountOpen(false);
          setCreateAccountEmpId(null);
        }}
        initialEmployeeId={createAccountEmpId}
      />

      <InviteEmployeeModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
};
