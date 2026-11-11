/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  Department,
  JobPosition,
  EmployeeRecord,
  UserAccount,
  Role,
  Permission,
  AccountInvitation,
  UserSession,
  LoginAttempt,
  ApprovalPolicy,
  ApprovalRequest,
  EmployeeShiftConfig,
  AttendanceRecord,
  LeaveType,
  LeaveRequest,
  CashierShift,
  SecurityEvent,
  PermissionChangeHistory,
  ApprovalTransactionType,
} from '../types/rbac';
import {
  ALL_PERMISSIONS,
  DEFAULT_SEEDED_ROLES,
  DEFAULT_APPROVAL_POLICIES,
  evaluateUserPermission,
  evaluateDepartmentAccess,
  evaluateOutletAccess,
} from '../services/permissionRegistry';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_JOB_POSITIONS,
  INITIAL_EMPLOYEES,
  INITIAL_USER_ACCOUNTS,
  INITIAL_USER_SESSIONS,
  INITIAL_APPROVAL_REQUESTS,
  INITIAL_SHIFTS,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVE_TYPES,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_CASHIER_SHIFTS,
} from '../services/rbacService';

interface RBACContextType {
  // Master State
  departments: Department[];
  jobPositions: JobPosition[];
  employees: EmployeeRecord[];
  userAccounts: UserAccount[];
  currentUserAccount: UserAccount;
  roles: Role[];
  permissions: Permission[];
  invitations: AccountInvitation[];
  activeSessions: UserSession[];
  loginAttempts: LoginAttempt[];
  approvalPolicies: ApprovalPolicy[];
  approvalRequests: ApprovalRequest[];
  shifts: EmployeeShiftConfig[];
  attendanceRecords: AttendanceRecord[];
  leaveTypes: LeaveType[];
  leaveRequests: LeaveRequest[];
  cashierShifts: CashierShift[];
  securityEvents: SecurityEvent[];
  permissionHistory: PermissionChangeHistory[];

  // Employee Methods
  addEmployee: (emp: Omit<EmployeeRecord, 'id' | 'empNumber' | 'createdAt' | 'updatedAt' | 'hasLoginAccount'>) => EmployeeRecord;
  updateEmployee: (id: string, updates: Partial<EmployeeRecord>) => void;
  archiveEmployee: (id: string, reason?: string) => void;
  activateEmployee: (id: string) => void;

  // Department Methods
  addDepartment: (dept: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>) => Department;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  archiveDepartment: (id: string) => void;

  // Job Position Methods
  addJobPosition: (pos: Omit<JobPosition, 'id' | 'createdAt' | 'updatedAt'>) => JobPosition;
  updateJobPosition: (id: string, updates: Partial<JobPosition>) => void;
  archiveJobPosition: (id: string) => void;

  // User Account Methods
  createAccount: (params: {
    employeeId: string;
    username: string;
    email: string;
    roleIds: string[];
    departmentAccessScope: 'all' | 'custom';
    allowedDepartmentIds: string[];
    outletAccessScope: 'all' | 'custom';
    allowedOutletIds: string[];
    approvalLimits?: Record<string, number>;
    tempPassword?: string;
  }) => { success: boolean; user?: UserAccount; error?: string };
  inviteEmployee: (params: {
    employeeId: string;
    email: string;
    assignedRoleIds: string[];
  }) => { success: boolean; invitation?: AccountInvitation; error?: string };
  activateInvitedAccount: (token: string, newPassword: string) => { success: boolean; error?: string };
  suspendAccount: (userId: string, reason: string) => { success: boolean; error?: string };
  activateUserAccount: (userId: string) => { success: boolean; error?: string };
  disableAccount: (userId: string, reason: string) => { success: boolean; error?: string };
  resetUserPassword: (userId: string) => { success: boolean; tempPassword?: string; error?: string };
  revokeSession: (sessionId: string) => void;
  revokeAllUserSessions: (userId: string) => void;
  setCurrentUserAccount: (user: UserAccount) => void;

  // RBAC Role & Permission Methods
  addRole: (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt' | 'isSystem'>) => Role;
  updateRole: (id: string, updates: Partial<Role>) => { success: boolean; error?: string };
  duplicateRole: (sourceRoleId: string, newCode: string, newName: string) => Role;
  archiveRole: (id: string) => { success: boolean; error?: string };
  assignUserRoles: (userId: string, roleIds: string[]) => { success: boolean; error?: string };
  updateUserDirectPermissions: (userId: string, directPermissions: { permissionId: string; isGranted: boolean }[]) => void;
  updateUserScopes: (
    userId: string,
    deptScope: 'all' | 'custom',
    allowedDepts: string[],
    outletScope: 'all' | 'custom',
    allowedOutlets: string[]
  ) => void;

  // Financial Approval Methods
  createApprovalRequest: (params: {
    transactionType: ApprovalTransactionType;
    amount: number;
    referenceId: string;
    referenceDescription: string;
    departmentId?: string;
    departmentName?: string;
    justification: string;
  }) => ApprovalRequest;
  approveRequest: (requestId: string, notes?: string) => { success: boolean; error?: string };
  rejectRequest: (requestId: string, notes?: string) => { success: boolean; error?: string };

  // Shifts, Attendance & Cashier Methods
  clockIn: (employeeId: string, shiftName: string) => void;
  clockOut: (employeeId: string) => void;
  approveAttendance: (attendanceId: string) => void;
  submitLeaveRequest: (params: {
    employeeId: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    reason: string;
  }) => LeaveRequest;
  approveLeaveRequest: (requestId: string, level: 'supervisor' | 'hr') => void;
  rejectLeaveRequest: (requestId: string, reason: string) => void;
  openCashierShift: (outletId: string, outletName: string, openingCash: number) => CashierShift;
  reconcileCashierShift: (shiftId: string, actualCash: number, supervisorNotes?: string) => void;
  closeCashierShift: (shiftId: string) => void;

  // Security & Evaluation Helpers
  hasPermission: (permissionCode: string) => boolean;
  canAccessDepartment: (departmentId: string) => boolean;
  canAccessOutlet: (outletId: string) => boolean;
  canApprove: (transactionType: ApprovalTransactionType, amount: number) => boolean;
  logSecurityEvent: (eventType: SecurityEvent['eventType'], description: string, severity: SecurityEvent['severity']) => void;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export const RBACProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [jobPositions, setJobPositions] = useState<JobPosition[]>(INITIAL_JOB_POSITIONS);
  const [employees, setEmployees] = useState<EmployeeRecord[]>(INITIAL_EMPLOYEES);
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(INITIAL_USER_ACCOUNTS);
  const [currentUserAccount, setCurrentUserAccount] = useState<UserAccount>(INITIAL_USER_ACCOUNTS[0]);
  const [roles, setRoles] = useState<Role[]>(DEFAULT_SEEDED_ROLES);
  const [permissions] = useState<Permission[]>(ALL_PERMISSIONS);
  const [invitations, setInvitations] = useState<AccountInvitation[]>([]);
  const [activeSessions, setActiveSessions] = useState<UserSession[]>(INITIAL_USER_SESSIONS);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [approvalPolicies, setApprovalPolicies] = useState<ApprovalPolicy[]>(DEFAULT_APPROVAL_POLICIES);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>(INITIAL_APPROVAL_REQUESTS);
  const [shifts] = useState<EmployeeShiftConfig[]>(INITIAL_SHIFTS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [leaveTypes] = useState<LeaveType[]>(INITIAL_LEAVE_TYPES);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [cashierShifts, setCashierShifts] = useState<CashierShift[]>(INITIAL_CASHIER_SHIFTS);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [permissionHistory, setPermissionHistory] = useState<PermissionChangeHistory[]>([]);

  // Log Security Event Helper
  const logSecurityEvent = (
    eventType: SecurityEvent['eventType'],
    description: string,
    severity: SecurityEvent['severity']
  ) => {
    const evt: SecurityEvent = {
      id: `sec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      eventType,
      severity,
      description,
      userId: currentUserAccount?.id,
      userName: currentUserAccount?.employeeName,
      ipAddress: '192.168.1.100',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    setSecurityEvents((prev) => [evt, ...prev]);
  };

  // Helper to count active super admins
  const countActiveSuperAdmins = (currentUsers: UserAccount[], currentRoles: Role[]): number => {
    const superAdminRole = currentRoles.find((r) => r.code === 'super_admin');
    if (!superAdminRole) return 0;
    return currentUsers.filter(
      (u) => u.status === 'active' && u.roleIds.includes(superAdminRole.id)
    ).length;
  };

  // ==========================================================================
  // EMPLOYEE METHODS
  // ==========================================================================
  const addEmployee = (
    empData: Omit<EmployeeRecord, 'id' | 'empNumber' | 'createdAt' | 'updatedAt' | 'hasLoginAccount'>
  ): EmployeeRecord => {
    const id = `emp-${Date.now()}`;
    const count = employees.length + 1;
    const empNumber = `GV-EMP-${count.toString().padStart(3, '0')}`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newEmp: EmployeeRecord = {
      ...empData,
      id,
      empNumber,
      hasLoginAccount: false,
      createdAt: now,
      updatedAt: now,
    };

    setEmployees((prev) => [newEmp, ...prev]);
    logSecurityEvent('PRIVILEGE_ESCALATION', `New employee registered: ${newEmp.fullName} (${newEmp.empNumber}) in ${newEmp.departmentName}`, 'low');
    return newEmp;
  };

  const updateEmployee = (id: string, updates: Partial<EmployeeRecord>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...updates, updatedAt: now } : emp))
    );
  };

  const archiveEmployee = (id: string, reason?: string) => {
    const emp = employees.find((e) => e.id === id);
    if (!emp) return;

    // Termination workflow: automatically disable associated login account
    if (emp.userId) {
      disableAccount(emp.userId, `Employee archived/terminated: ${reason || 'Standard separation'}`);
    }

    updateEmployee(id, { employmentStatus: 'archived', notes: `${emp.notes || ''} [Archived: ${reason || 'Status updated'}]` });
    logSecurityEvent('PRIVILEGE_ESCALATION', `Employee archived: ${emp.fullName} (${emp.empNumber}). Account access revoked.`, 'medium');
  };

  const activateEmployee = (id: string) => {
    updateEmployee(id, { employmentStatus: 'active' });
  };

  // ==========================================================================
  // DEPARTMENT METHODS
  // ==========================================================================
  const addDepartment = (dept: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Department => {
    const id = `dept-${Date.now()}`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newDept: Department = { ...dept, id, createdAt: now, updatedAt: now };
    setDepartments((prev) => [...prev, newDept]);
    return newDept;
  };

  const updateDepartment = (id: string, updates: Partial<Department>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: now } : d))
    );
  };

  const archiveDepartment = (id: string) => {
    updateDepartment(id, { isActive: false });
  };

  // ==========================================================================
  // JOB POSITION METHODS
  // ==========================================================================
  const addJobPosition = (pos: Omit<JobPosition, 'id' | 'createdAt' | 'updatedAt'>): JobPosition => {
    const id = `pos-${Date.now()}`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newPos: JobPosition = { ...pos, id, createdAt: now, updatedAt: now };
    setJobPositions((prev) => [...prev, newPos]);
    return newPos;
  };

  const updateJobPosition = (id: string, updates: Partial<JobPosition>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setJobPositions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: now } : p))
    );
  };

  const archiveJobPosition = (id: string) => {
    updateJobPosition(id, { isActive: false });
  };

  // ==========================================================================
  // USER ACCOUNT CREATION (Workflows A & B)
  // ==========================================================================
  const createAccount = (params: {
    employeeId: string;
    username: string;
    email: string;
    roleIds: string[];
    departmentAccessScope: 'all' | 'custom';
    allowedDepartmentIds: string[];
    outletAccessScope: 'all' | 'custom';
    allowedOutletIds: string[];
    approvalLimits?: Record<string, number>;
    tempPassword?: string;
  }): { success: boolean; user?: UserAccount; error?: string } => {
    const emp = employees.find((e) => e.id === params.employeeId);
    if (!emp) return { success: false, error: 'Employee not found.' };

    if (userAccounts.some((u) => u.username.toLowerCase() === params.username.toLowerCase())) {
      return { success: false, error: 'Username already in use.' };
    }
    if (userAccounts.some((u) => u.email.toLowerCase() === params.email.toLowerCase())) {
      return { success: false, error: 'Email already registered.' };
    }

    const userId = `user-${Date.now()}`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newUser: UserAccount = {
      id: userId,
      employeeId: emp.id,
      employeeName: emp.fullName,
      username: params.username,
      email: params.email,
      status: 'active',
      forcePasswordChange: true, // First login password change enforcement (Section 17)
      failedLoginAttempts: 0,
      roleIds: params.roleIds,
      directPermissions: [],
      departmentAccessScope: params.departmentAccessScope,
      allowedDepartmentIds: params.allowedDepartmentIds,
      outletAccessScope: params.outletAccessScope,
      allowedOutletIds: params.allowedOutletIds,
      approvalLimits: params.approvalLimits || {},
      createdAt: now,
      updatedAt: now,
    };

    setUserAccounts((prev) => [newUser, ...prev]);

    // Link user account to employee
    updateEmployee(emp.id, { userId, hasLoginAccount: true });

    logSecurityEvent(
      'PRIVILEGE_ESCALATION',
      `Administrator created login account '${newUser.username}' for employee ${emp.fullName}`,
      'medium'
    );

    return { success: true, user: newUser };
  };

  const inviteEmployee = (params: {
    employeeId: string;
    email: string;
    assignedRoleIds: string[];
  }): { success: boolean; invitation?: AccountInvitation; error?: string } => {
    const emp = employees.find((e) => e.id === params.employeeId);
    if (!emp) return { success: false, error: 'Employee record not found.' };

    const token = `inv_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 16);

    const inv: AccountInvitation = {
      id: `inv-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.fullName,
      email: params.email,
      token,
      assignedRoleIds: params.assignedRoleIds,
      status: 'pending',
      expiresAt,
      createdBy: currentUserAccount.employeeName,
      createdAt: now.toISOString().replace('T', ' ').slice(0, 16),
    };

    setInvitations((prev) => [inv, ...prev]);
    logSecurityEvent(
      'PRIVILEGE_ESCALATION',
      `Single-use invitation token generated for ${emp.fullName} (${params.email}). Expires in 48h.`,
      'low'
    );

    return { success: true, invitation: inv };
  };

  const activateInvitedAccount = (token: string, newPassword: string): { success: boolean; error?: string } => {
    const inv = invitations.find((i) => i.token === token);
    if (!inv) return { success: false, error: 'Invalid or expired invitation token.' };
    if (inv.status !== 'pending') return { success: false, error: `Invitation is already ${inv.status}.` };

    const emp = employees.find((e) => e.id === inv.employeeId);
    if (!emp) return { success: false, error: 'Employee not found.' };

    // Generate username from email or name
    const username = inv.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

    const res = createAccount({
      employeeId: emp.id,
      username,
      email: inv.email,
      roleIds: inv.assignedRoleIds,
      departmentAccessScope: 'all',
      allowedDepartmentIds: [],
      outletAccessScope: 'all',
      allowedOutletIds: [],
      tempPassword: newPassword,
    });

    if (!res.success) return res;

    // Mark invitation accepted
    setInvitations((prev) =>
      prev.map((i) =>
        i.id === inv.id ? { ...i, status: 'accepted', acceptedAt: new Date().toISOString() } : i
      )
    );

    logSecurityEvent('PRIVILEGE_ESCALATION', `Employee ${emp.fullName} completed invitation activation.`, 'low');
    return { success: true };
  };

  // ==========================================================================
  // ACCOUNT STATUS MANAGEMENT & LAST SUPER ADMIN PROTECTION
  // ==========================================================================
  const suspendAccount = (userId: string, reason: string): { success: boolean; error?: string } => {
    const targetUser = userAccounts.find((u) => u.id === userId);
    if (!targetUser) return { success: false, error: 'User not found.' };

    // Section 10 & 22: Protect Last Super Admin
    const superAdminRole = roles.find((r) => r.code === 'super_admin');
    if (superAdminRole && targetUser.roleIds.includes(superAdminRole.id)) {
      const activeSuperAdmins = countActiveSuperAdmins(userAccounts, roles);
      if (activeSuperAdmins <= 1 && targetUser.status === 'active') {
        logSecurityEvent(
          'LAST_ADMIN_PROTECT_TRIGGERED',
          `Attempted suspension of last Super Administrator '${targetUser.username}' was blocked.`,
          'critical'
        );
        return {
          success: false,
          error: 'CRITICAL SECURITY VIOLATION: Cannot suspend the last remaining active Super Administrator account.',
        };
      }
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setUserAccounts((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'suspended', updatedAt: now } : u))
    );

    // Revoke sessions
    revokeAllUserSessions(userId);

    logSecurityEvent(
      'ACCOUNT_LOCKOUT',
      `Account '${targetUser.username}' suspended by ${currentUserAccount.employeeName}. Reason: ${reason}`,
      'medium'
    );

    return { success: true };
  };

  const activateUserAccount = (userId: string): { success: boolean; error?: string } => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setUserAccounts((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: 'active', failedLoginAttempts: 0, lockedUntil: undefined, updatedAt: now }
          : u
      )
    );
    return { success: true };
  };

  const disableAccount = (userId: string, reason: string): { success: boolean; error?: string } => {
    const targetUser = userAccounts.find((u) => u.id === userId);
    if (!targetUser) return { success: false, error: 'User not found.' };

    // Last Super Admin Protection
    const superAdminRole = roles.find((r) => r.code === 'super_admin');
    if (superAdminRole && targetUser.roleIds.includes(superAdminRole.id)) {
      const activeSuperAdmins = countActiveSuperAdmins(userAccounts, roles);
      if (activeSuperAdmins <= 1 && targetUser.status === 'active') {
        logSecurityEvent(
          'LAST_ADMIN_PROTECT_TRIGGERED',
          `Attempted disabling of last Super Administrator '${targetUser.username}' was blocked.`,
          'critical'
        );
        return {
          success: false,
          error: 'CRITICAL SECURITY VIOLATION: Cannot disable the last remaining active Super Administrator account.',
        };
      }
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setUserAccounts((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'disabled', updatedAt: now } : u))
    );

    revokeAllUserSessions(userId);

    logSecurityEvent('ACCOUNT_LOCKOUT', `Account '${targetUser.username}' permanently disabled. Reason: ${reason}`, 'high');
    return { success: true };
  };

  const resetUserPassword = (userId: string): { success: boolean; tempPassword?: string; error?: string } => {
    const targetUser = userAccounts.find((u) => u.id === userId);
    if (!targetUser) return { success: false, error: 'User not found.' };

    const tempPassword = `GV#${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    setUserAccounts((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, forcePasswordChange: true, failedLoginAttempts: 0, lockedUntil: undefined, updatedAt: now }
          : u
      )
    );

    revokeAllUserSessions(userId);

    logSecurityEvent(
      'PASSWORD_RESET',
      `Administrator initiated password reset for user '${targetUser.username}'. First-login change enforced.`,
      'medium'
    );

    return { success: true, tempPassword };
  };

  // ==========================================================================
  // SESSION REVOCATION (Section 17)
  // ==========================================================================
  const revokeSession = (sessionId: string) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
    logSecurityEvent('SESSION_REVOKED', `Session token ${sessionId} was manually revoked by administrator.`, 'low');
  };

  const revokeAllUserSessions = (userId: string) => {
    setActiveSessions((prev) => prev.filter((s) => s.userId !== userId));
    logSecurityEvent('SESSION_REVOKED', `All active sessions revoked for user ID ${userId}.`, 'medium');
  };

  // ==========================================================================
  // ROLES & GRANULAR PERMISSIONS
  // ==========================================================================
  const addRole = (roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt' | 'isSystem'>): Role => {
    const id = `role-${Date.now()}`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newRole: Role = {
      ...roleData,
      id,
      isSystem: false,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };

    setRoles((prev) => [...prev, newRole]);

    const hist: PermissionChangeHistory = {
      id: `pch-${Date.now()}`,
      targetType: 'role',
      targetId: newRole.id,
      targetName: newRole.name,
      changedByUserId: currentUserAccount.id,
      changedByUserName: currentUserAccount.employeeName,
      action: 'ROLE_CREATED',
      details: `Created custom role '${newRole.name}' with ${newRole.permissionIds.length} permissions.`,
      timestamp: now,
    };
    setPermissionHistory((prev) => [hist, ...prev]);

    return newRole;
  };

  const updateRole = (id: string, updates: Partial<Role>): { success: boolean; error?: string } => {
    const existing = roles.find((r) => r.id === id);
    if (!existing) return { success: false, error: 'Role not found.' };

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: now } : r)));

    const hist: PermissionChangeHistory = {
      id: `pch-${Date.now()}`,
      targetType: 'role',
      targetId: id,
      targetName: existing.name,
      changedByUserId: currentUserAccount.id,
      changedByUserName: currentUserAccount.employeeName,
      action: 'PERMISSIONS_MODIFIED',
      details: `Updated role '${existing.name}'. Assigned permissions: ${updates.permissionIds?.length ?? existing.permissionIds.length}`,
      timestamp: now,
    };
    setPermissionHistory((prev) => [hist, ...prev]);

    return { success: true };
  };

  const duplicateRole = (sourceRoleId: string, newCode: string, newName: string): Role => {
    const source = roles.find((r) => r.id === sourceRoleId);
    if (!source) throw new Error('Source role not found');

    const id = `role-${Date.now()}`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newRole: Role = {
      id,
      code: newCode,
      name: newName,
      description: `Duplicated from ${source.name}. ${source.description}`,
      category: source.category,
      isSystem: false,
      isArchived: false,
      permissionIds: [...source.permissionIds],
      createdAt: now,
      updatedAt: now,
    };

    setRoles((prev) => [...prev, newRole]);

    const hist: PermissionChangeHistory = {
      id: `pch-${Date.now()}`,
      targetType: 'role',
      targetId: newRole.id,
      targetName: newRole.name,
      changedByUserId: currentUserAccount.id,
      changedByUserName: currentUserAccount.employeeName,
      action: 'ROLE_DUPLICATED',
      details: `Duplicated role '${source.name}' into new role '${newRole.name}'.`,
      timestamp: now,
    };
    setPermissionHistory((prev) => [hist, ...prev]);

    return newRole;
  };

  const archiveRole = (id: string): { success: boolean; error?: string } => {
    const role = roles.find((r) => r.id === id);
    if (!role) return { success: false, error: 'Role not found.' };
    if (role.isSystem) return { success: false, error: 'Cannot archive a protected system role.' };

    updateRole(id, { isArchived: true });
    return { success: true };
  };

  const assignUserRoles = (userId: string, roleIds: string[]): { success: boolean; error?: string } => {
    const targetUser = userAccounts.find((u) => u.id === userId);
    if (!targetUser) return { success: false, error: 'User not found.' };

    const superAdminRole = roles.find((r) => r.code === 'super_admin');
    if (superAdminRole && targetUser.roleIds.includes(superAdminRole.id) && !roleIds.includes(superAdminRole.id)) {
      const activeSuperAdmins = countActiveSuperAdmins(userAccounts, roles);
      if (activeSuperAdmins <= 1 && targetUser.status === 'active') {
        logSecurityEvent(
          'LAST_ADMIN_PROTECT_TRIGGERED',
          `Attempt to remove Super Administrator role from last active admin '${targetUser.username}' was blocked.`,
          'critical'
        );
        return {
          success: false,
          error: 'CRITICAL SECURITY VIOLATION: Cannot revoke Super Administrator from the last active admin.',
        };
      }
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setUserAccounts((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, roleIds, updatedAt: now } : u))
    );

    const hist: PermissionChangeHistory = {
      id: `pch-${Date.now()}`,
      targetType: 'user',
      targetId: userId,
      targetName: targetUser.username,
      changedByUserId: currentUserAccount.id,
      changedByUserName: currentUserAccount.employeeName,
      action: 'ROLE_UPDATED',
      details: `Reassigned roles for user '${targetUser.username}'. Now assigned ${roleIds.length} roles.`,
      timestamp: now,
    };
    setPermissionHistory((prev) => [hist, ...prev]);

    return { success: true };
  };

  const updateUserDirectPermissions = (
    userId: string,
    directPermissions: { permissionId: string; isGranted: boolean }[]
  ) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setUserAccounts((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, directPermissions, updatedAt: now } : u))
    );
  };

  const updateUserScopes = (
    userId: string,
    deptScope: 'all' | 'custom',
    allowedDepts: string[],
    outletScope: 'all' | 'custom',
    allowedOutlets: string[]
  ) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setUserAccounts((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              departmentAccessScope: deptScope,
              allowedDepartmentIds: allowedDepts,
              outletAccessScope: outletScope,
              allowedOutletIds: allowedOutlets,
              updatedAt: now,
            }
          : u
      )
    );
  };

  // ==========================================================================
  // FINANCIAL APPROVAL WORKFLOW & SELF-APPROVAL PREVENTION (Section 13)
  // ==========================================================================
  const createApprovalRequest = (params: {
    transactionType: ApprovalTransactionType;
    amount: number;
    referenceId: string;
    referenceDescription: string;
    departmentId?: string;
    departmentName?: string;
    justification: string;
  }): ApprovalRequest => {
    const policy = approvalPolicies.find((p) => p.transactionType === params.transactionType);
    const requiredRole = policy?.requiredApproverRole || 'finance_manager';
    const hours = policy?.expiryHours || 24;

    const id = `req-apr-${Date.now()}`;
    const code = `APR-${Date.now().toString().slice(-4)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 16);

    const req: ApprovalRequest = {
      id,
      requestCode: code,
      transactionType: params.transactionType,
      amount: params.amount,
      referenceId: params.referenceId,
      referenceDescription: params.referenceDescription,
      departmentId: params.departmentId,
      departmentName: params.departmentName,
      requestedByUserId: currentUserAccount.id,
      requestedByUserName: currentUserAccount.employeeName,
      justification: params.justification,
      status: 'pending',
      requiredRole,
      createdAt: now.toISOString().replace('T', ' ').slice(0, 16),
      expiresAt,
    };

    setApprovalRequests((prev) => [req, ...prev]);
    return req;
  };

  const approveRequest = (requestId: string, notes?: string): { success: boolean; error?: string } => {
    const req = approvalRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, error: 'Approval request not found.' };
    if (req.status !== 'pending') return { success: false, error: `Request already ${req.status}.` };

    const policy = approvalPolicies.find((p) => p.transactionType === req.transactionType);

    // Section 13: STRICT PREVENTION OF SELF-APPROVAL
    if (policy?.preventSelfApproval && req.requestedByUserId === currentUserAccount.id) {
      logSecurityEvent(
        'UNAUTHORIZED_ACCESS',
        `Self-approval violation: User '${currentUserAccount.username}' attempted to approve their own request (${req.requestCode}).`,
        'critical'
      );
      return {
        success: false,
        error: 'SECURITY VIOLATION: Self-approval is strictly prohibited by hotel separation of duties.',
      };
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setApprovalRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'approved',
              decidedByUserId: currentUserAccount.id,
              decidedByUserName: currentUserAccount.employeeName,
              decisionNotes: notes,
              decidedAt: now,
            }
          : r
      )
    );

    return { success: true };
  };

  const rejectRequest = (requestId: string, notes?: string): { success: boolean; error?: string } => {
    const req = approvalRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, error: 'Approval request not found.' };

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setApprovalRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'rejected',
              decidedByUserId: currentUserAccount.id,
              decidedByUserName: currentUserAccount.employeeName,
              decisionNotes: notes,
              decidedAt: now,
            }
          : r
      )
    );

    return { success: true };
  };

  // ==========================================================================
  // SHIFTS, ATTENDANCE & LEAVE
  // ==========================================================================
  const clockIn = (employeeId: string, shiftName: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toISOString().replace('T', ' ').slice(0, 16);

    const record: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.fullName,
      shiftName,
      date: dateStr,
      clockIn: timeStr,
      status: 'on_time',
      lateMinutes: 0,
      overtimeMinutes: 0,
      supervisorApproved: false,
    };

    setAttendanceRecords((prev) => [record, ...prev]);
  };

  const clockOut = (employeeId: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setAttendanceRecords((prev) =>
      prev.map((a) => (a.employeeId === employeeId && !a.clockOut ? { ...a, clockOut: now } : a))
    );
  };

  const approveAttendance = (attendanceId: string) => {
    setAttendanceRecords((prev) =>
      prev.map((a) =>
        a.id === attendanceId
          ? { ...a, supervisorApproved: true, supervisorName: currentUserAccount.employeeName }
          : a
      )
    );
  };

  const submitLeaveRequest = (params: {
    employeeId: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    reason: string;
  }): LeaveRequest => {
    const emp = employees.find((e) => e.id === params.employeeId);
    const lt = leaveTypes.find((l) => l.id === params.leaveTypeId);
    const start = new Date(params.startDate);
    const end = new Date(params.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const req: LeaveRequest = {
      id: `lvr-${Date.now()}`,
      requestCode: `LEV-${Date.now().toString().slice(-4)}`,
      employeeId: params.employeeId,
      employeeName: emp?.fullName || 'Employee',
      departmentName: emp?.departmentName || 'General',
      leaveTypeId: params.leaveTypeId,
      leaveTypeName: lt?.name || 'Leave',
      startDate: params.startDate,
      endDate: params.endDate,
      totalDays,
      reason: params.reason,
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setLeaveRequests((prev) => [req, ...prev]);
    return req;
  };

  const approveLeaveRequest = (requestId: string, level: 'supervisor' | 'hr') => {
    setLeaveRequests((prev) =>
      prev.map((l) =>
        l.id === requestId
          ? {
              ...l,
              status: level === 'supervisor' ? 'supervisor_approved' : 'hr_approved',
              reviewedBy: currentUserAccount.employeeName,
            }
          : l
      )
    );
  };

  const rejectLeaveRequest = (requestId: string, reason: string) => {
    setLeaveRequests((prev) =>
      prev.map((l) =>
        l.id === requestId
          ? { ...l, status: 'rejected', rejectionReason: reason, reviewedBy: currentUserAccount.employeeName }
          : l
      )
    );
  };

  // ==========================================================================
  // CASHIER SHIFTS & RECONCILIATION
  // ==========================================================================
  const openCashierShift = (outletId: string, outletName: string, openingCash: number): CashierShift => {
    const shift: CashierShift = {
      id: `csh-${Date.now()}`,
      shiftNumber: `CSH-${Date.now().toString().slice(-6)}`,
      cashierUserId: currentUserAccount.id,
      cashierName: currentUserAccount.employeeName,
      outletId,
      outletName,
      openingCash,
      cashSales: 0,
      nonCashSales: 0,
      refundsTotal: 0,
      cashWithdrawals: 0,
      expectedCash: openingCash,
      status: 'open',
      openedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setCashierShifts((prev) => [shift, ...prev]);
    return shift;
  };

  const reconcileCashierShift = (shiftId: string, actualCash: number, supervisorNotes?: string) => {
    setCashierShifts((prev) =>
      prev.map((s) => {
        if (s.id !== shiftId) return s;
        const variance = actualCash - s.expectedCash;
        return {
          ...s,
          actualCash,
          variance,
          status: 'reconciled',
          supervisorId: currentUserAccount.id,
          supervisorName: currentUserAccount.employeeName,
          supervisorNotes,
        };
      })
    );
  };

  const closeCashierShift = (shiftId: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setCashierShifts((prev) =>
      prev.map((s) => (s.id === shiftId ? { ...s, status: 'closed', closedAt: now } : s))
    );
  };

  // ==========================================================================
  // RBAC EVALUATION HELPERS
  // ==========================================================================
  const hasPermission = (permissionCode: string): boolean => {
    return evaluateUserPermission(currentUserAccount, roles, permissionCode);
  };

  const canAccessDepartment = (departmentId: string): boolean => {
    return evaluateDepartmentAccess(currentUserAccount, roles, departmentId);
  };

  const canAccessOutlet = (outletId: string): boolean => {
    return evaluateOutletAccess(currentUserAccount, roles, outletId);
  };

  const canApprove = (transactionType: ApprovalTransactionType, amount: number): boolean => {
    const policy = approvalPolicies.find((p) => p.transactionType === transactionType);
    if (!policy) return false;

    // Check if user has the required approver role
    const userRoles = roles.filter((r) => currentUserAccount.roleIds.includes(r.id));
    return userRoles.some(
      (r) =>
        r.code === 'super_admin' ||
        r.code === policy.requiredApproverRole ||
        (policy.secondaryApproverRole && r.code === policy.secondaryApproverRole)
    );
  };

  return (
    <RBACContext.Provider
      value={{
        departments,
        jobPositions,
        employees,
        userAccounts,
        currentUserAccount,
        roles,
        permissions,
        invitations,
        activeSessions,
        loginAttempts,
        approvalPolicies,
        approvalRequests,
        shifts,
        attendanceRecords,
        leaveTypes,
        leaveRequests,
        cashierShifts,
        securityEvents,
        permissionHistory,

        addEmployee,
        updateEmployee,
        archiveEmployee,
        activateEmployee,

        addDepartment,
        updateDepartment,
        archiveDepartment,

        addJobPosition,
        updateJobPosition,
        archiveJobPosition,

        createAccount,
        inviteEmployee,
        activateInvitedAccount,
        suspendAccount,
        activateUserAccount,
        disableAccount,
        resetUserPassword,
        revokeSession,
        revokeAllUserSessions,
        setCurrentUserAccount,

        addRole,
        updateRole,
        duplicateRole,
        archiveRole,
        assignUserRoles,
        updateUserDirectPermissions,
        updateUserScopes,

        createApprovalRequest,
        approveRequest,
        rejectRequest,

        clockIn,
        clockOut,
        approveAttendance,
        submitLeaveRequest,
        approveLeaveRequest,
        rejectLeaveRequest,
        openCashierShift,
        reconcileCashierShift,
        closeCashierShift,

        hasPermission,
        canAccessDepartment,
        canAccessOutlet,
        canApprove,
        logSecurityEvent,
      }}
    >
      {children}
    </RBACContext.Provider>
  );
};

export const useRBAC = (): RBACContextType => {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
};
