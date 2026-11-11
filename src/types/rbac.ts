/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// ENTERPRISE RBAC & WORKFORCE MANAGEMENT TYPES
// ============================================================================

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Trainee';

export type EmploymentStatus =
  | 'active'
  | 'on_probation'
  | 'on_leave'
  | 'suspended'
  | 'terminated'
  | 'archived';

export type AccountStatus =
  | 'pending_invitation'
  | 'active'
  | 'suspended'
  | 'disabled'
  | 'locked'
  | 'expired';

export type AccessScopeType = 'global' | 'department' | 'outlet' | 'own_record';

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description: string;
  managerEmployeeId?: string;
  managerName?: string;
  isActive: boolean;
  employeeCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobPosition {
  id: string;
  code: string;
  title: string;
  departmentId: string;
  departmentName?: string;
  description?: string;
  minSalary: number;
  maxSalary: number;
  isActive: boolean;
  employeeCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  documentType: 'Contract' | 'ID Card / NIN' | 'Passport' | 'Certificates' | 'Medical' | 'Other';
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  status: 'verified' | 'pending_verification' | 'expired';
}

export interface EmployeeRecord {
  id: string;
  empNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: EmergencyContact;
  profilePhoto?: string;
  avatarColor: string;
  departmentId: string;
  departmentName: string;
  jobPositionId: string;
  jobTitle: string;
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  hireDate: string;
  reportingManagerId?: string;
  reportingManagerName?: string;
  salary: number;
  notes?: string;
  userId?: string; // Linked user account (if any)
  hasLoginAccount: boolean;
  documents?: EmployeeDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  code: string; // e.g. "reservations.create"
  name: string;
  module: string; // e.g. "Reservations"
  resource: string; // e.g. "reservations"
  action: string; // e.g. "create"
  description: string;
  isSensitive: boolean; // requires special audit
}

export interface Role {
  id: string;
  code: string; // e.g. "super_admin", "receptionist"
  name: string;
  description: string;
  category: string; // "Administration", "Front Office", "Finance", etc.
  isSystem: boolean; // cannot be deleted
  isArchived: boolean;
  permissionIds: string[];
  userCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserDirectPermission {
  permissionId: string;
  isGranted: boolean; // true = grant, false = explicit deny
}

export interface UserAccount {
  id: string;
  employeeId: string;
  employeeName: string;
  username: string;
  email: string;
  status: AccountStatus;
  forcePasswordChange: boolean;
  failedLoginAttempts: number;
  lockedUntil?: string;
  expiresAt?: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  roleIds: string[];
  roles?: Role[];
  directPermissions: UserDirectPermission[];
  departmentAccessScope: 'all' | 'custom';
  allowedDepartmentIds: string[];
  outletAccessScope: 'all' | 'custom';
  allowedOutletIds: string[];
  approvalLimits?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface AccountInvitation {
  id: string;
  employeeId: string;
  employeeName: string;
  email: string;
  token: string;
  assignedRoleIds: string[];
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  expiresAt: string;
  createdBy: string;
  createdAt: string;
  acceptedAt?: string;
}

export interface UserSession {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  sessionToken: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
}

export interface LoginAttempt {
  id: string;
  username: string;
  ipAddress: string;
  userAgent: string;
  status: 'SUCCESS' | 'FAILED_BAD_PASSWORD' | 'FAILED_LOCKED' | 'FAILED_SUSPENDED' | 'FAILED_EXPIRED' | 'FAILED_NOT_FOUND';
  failureReason?: string;
  attemptedAt: string;
}

export type ApprovalTransactionType =
  | 'refund'
  | 'large_discount'
  | 'folio_adjustment'
  | 'stock_adjustment'
  | 'purchase_order'
  | 'expense'
  | 'journal_entry';

export interface ApprovalPolicy {
  id: string;
  transactionType: ApprovalTransactionType;
  title: string;
  maxAutoApprovedAmount: number;
  requiredApproverRole: string;
  secondaryApproverRole?: string;
  requiresTwoApprovals: boolean;
  preventSelfApproval: boolean;
  expiryHours: number;
}

export interface ApprovalRequest {
  id: string;
  requestCode: string;
  transactionType: ApprovalTransactionType;
  amount: number;
  referenceId: string;
  referenceDescription: string;
  departmentId?: string;
  departmentName?: string;
  requestedByUserId: string;
  requestedByUserName: string;
  justification: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'expired';
  requiredRole: string;
  decidedByUserId?: string;
  decidedByUserName?: string;
  decisionNotes?: string;
  createdAt: string;
  decidedAt?: string;
  expiresAt: string;
}

export interface EmployeeShiftConfig {
  id: string;
  code: string;
  name: string;
  startTime: string; // "07:00"
  endTime: string; // "15:00"
  description: string;
  isActive: boolean;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  shiftName: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  status: 'on_time' | 'late' | 'early_departure' | 'overtime' | 'absent';
  lateMinutes: number;
  overtimeMinutes: number;
  supervisorApproved: boolean;
  supervisorName?: string;
  notes?: string;
}

export interface LeaveType {
  id: string;
  code: string;
  name: string;
  daysPerYear: number;
  requiresApproval: boolean;
  isPaid: boolean;
  isActive: boolean;
}

export interface LeaveRequest {
  id: string;
  requestCode: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'supervisor_approved' | 'hr_approved' | 'rejected' | 'cancelled';
  reviewedBy?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface CashierShift {
  id: string;
  shiftNumber: string;
  cashierUserId: string;
  cashierName: string;
  outletId: string;
  outletName: string;
  openingCash: number;
  cashSales: number;
  nonCashSales: number;
  refundsTotal: number;
  cashWithdrawals: number;
  expectedCash: number;
  actualCash?: number;
  variance?: number;
  status: 'open' | 'reconciled' | 'closed';
  supervisorId?: string;
  supervisorName?: string;
  supervisorNotes?: string;
  openedAt: string;
  closedAt?: string;
}

export interface SecurityEvent {
  id: string;
  eventType:
    | 'ACCOUNT_LOCKOUT'
    | 'PASSWORD_RESET'
    | 'PRIVILEGE_ESCALATION'
    | 'UNAUTHORIZED_ACCESS'
    | 'SUSPICIOUS_LOGIN'
    | 'SESSION_REVOKED'
    | 'LAST_ADMIN_PROTECT_TRIGGERED';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId?: string;
  userName?: string;
  ipAddress: string;
  timestamp: string;
}

export interface PermissionChangeHistory {
  id: string;
  targetType: 'role' | 'user';
  targetId: string;
  targetName: string;
  changedByUserId: string;
  changedByUserName: string;
  action: 'ROLE_CREATED' | 'ROLE_UPDATED' | 'PERMISSIONS_MODIFIED' | 'DIRECT_PERMISSION_ASSIGNED' | 'ROLE_DUPLICATED';
  details: string;
  timestamp: string;
}
