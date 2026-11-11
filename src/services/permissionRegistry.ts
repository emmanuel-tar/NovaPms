/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Permission, Role, UserAccount, ApprovalPolicy } from '../types/rbac';

// ============================================================================
// CENTRAL PERMISSION REGISTRY
// Standard naming convention: module.resource.action
// ============================================================================

export const ALL_PERMISSIONS: Permission[] = [
  // 1. Dashboard
  { id: 'perm-dash-view', code: 'dashboard.view', name: 'View Dashboard', module: 'Dashboard', resource: 'dashboard', action: 'view', description: 'Access operational dashboards & metrics', isSensitive: false },

  // 2. Employees (HR)
  { id: 'perm-emp-view', code: 'employees.view', name: 'View Employees', module: 'Employees', resource: 'employees', action: 'view', description: 'View staff directory, profiles and documents', isSensitive: false },
  { id: 'perm-emp-create', code: 'employees.create', name: 'Create Employee', module: 'Employees', resource: 'employees', action: 'create', description: 'Register new employee records', isSensitive: true },
  { id: 'perm-emp-edit', code: 'employees.edit', name: 'Edit Employee', module: 'Employees', resource: 'employees', action: 'edit', description: 'Modify employee personal and job details', isSensitive: true },
  { id: 'perm-emp-archive', code: 'employees.archive', name: 'Archive / Terminate Employee', module: 'Employees', resource: 'employees', action: 'archive', description: 'Archive employee and disable access', isSensitive: true },

  // 3. User Accounts
  { id: 'perm-usr-view', code: 'users.view', name: 'View User Accounts', module: 'User Accounts', resource: 'users', action: 'view', description: 'View system user logins and statuses', isSensitive: false },
  { id: 'perm-usr-create', code: 'users.create', name: 'Create User / Invite', module: 'User Accounts', resource: 'users', action: 'create', description: 'Create logins and issue invitations', isSensitive: true },
  { id: 'perm-usr-suspend', code: 'users.suspend', name: 'Suspend / Enable Account', module: 'User Accounts', resource: 'users', action: 'suspend', description: 'Suspend or restore user login accounts', isSensitive: true },
  { id: 'perm-usr-disable', code: 'users.disable', name: 'Disable Account', module: 'User Accounts', resource: 'users', action: 'disable', description: 'Permanently disable system logins', isSensitive: true },
  { id: 'perm-usr-reset', code: 'users.reset_password', name: 'Reset User Password', module: 'User Accounts', resource: 'users', action: 'reset_password', description: 'Force password reset and unlock accounts', isSensitive: true },

  // 4. Roles & Permissions (Access Control)
  { id: 'perm-role-view', code: 'roles.view', name: 'View Roles & Permissions', module: 'Access Control', resource: 'roles', action: 'view', description: 'Inspect RBAC role hierarchy and permissions', isSensitive: false },
  { id: 'perm-role-create', code: 'roles.create', name: 'Create Custom Role', module: 'Access Control', resource: 'roles', action: 'create', description: 'Create and duplicate custom security roles', isSensitive: true },
  { id: 'perm-role-edit', code: 'roles.edit', name: 'Edit Role Permissions', module: 'Access Control', resource: 'roles', action: 'edit', description: 'Modify permission sets mapped to roles', isSensitive: true },
  { id: 'perm-role-assign', code: 'roles.assign', name: 'Assign Roles to Users', module: 'Access Control', resource: 'roles', action: 'assign', description: 'Grant or revoke roles from users', isSensitive: true },
  { id: 'perm-role-archive', code: 'roles.archive', name: 'Archive Role', module: 'Access Control', resource: 'roles', action: 'archive', description: 'Archive unused custom roles', isSensitive: true },

  // 5. Front Office & Reservations
  { id: 'perm-res-view', code: 'reservations.view', name: 'View Reservations', module: 'Reservations', resource: 'reservations', action: 'view', description: 'View bookings, calendar and guest manifests', isSensitive: false },
  { id: 'perm-res-create', code: 'reservations.create', name: 'Create Reservation', module: 'Reservations', resource: 'reservations', action: 'create', description: 'Book guest rooms and group allocations', isSensitive: false },
  { id: 'perm-res-edit', code: 'reservations.edit', name: 'Edit Reservation', module: 'Reservations', resource: 'reservations', action: 'edit', description: 'Modify booking dates, rates and details', isSensitive: false },
  { id: 'perm-res-cancel', code: 'reservations.cancel', name: 'Cancel Reservation', module: 'Reservations', resource: 'reservations', action: 'cancel', description: 'Cancel bookings and flag no-shows', isSensitive: true },
  { id: 'perm-res-checkin', code: 'reservations.check_in', name: 'Check-In Guest', module: 'Reservations', resource: 'reservations', action: 'check_in', description: 'Assign key cards and check in guests', isSensitive: false },
  { id: 'perm-res-checkout', code: 'reservations.check_out', name: 'Check-Out Guest', module: 'Reservations', resource: 'reservations', action: 'check_out', description: 'Settle balance and execute check-out', isSensitive: false },

  // 6. Rooms Management
  { id: 'perm-room-view', code: 'rooms.view', name: 'View Rooms & Rack', module: 'Rooms', resource: 'rooms', action: 'view', description: 'Inspect room rack and physical inventory', isSensitive: false },
  { id: 'perm-room-create', code: 'rooms.create', name: 'Create Room Category', module: 'Rooms', resource: 'rooms', action: 'create', description: 'Configure room types and standard rates', isSensitive: true },
  { id: 'perm-room-edit', code: 'rooms.edit', name: 'Edit Room Configuration', module: 'Rooms', resource: 'rooms', action: 'edit', description: 'Update room amenities and pricing tiers', isSensitive: true },
  { id: 'perm-room-status', code: 'rooms.change_status', name: 'Change Room Status', module: 'Rooms', resource: 'rooms', action: 'change_status', description: 'Toggle Clean, Dirty, Out of Order, Inspected', isSensitive: false },

  // 7. Folios & Guest Billing
  { id: 'perm-folio-view', code: 'folios.view', name: 'View Guest Folios', module: 'Folios', resource: 'folios', action: 'view', description: 'Inspect itemized guest billing accounts', isSensitive: false },
  { id: 'perm-folio-charge', code: 'folios.post_charge', name: 'Post Charge to Room', module: 'Folios', resource: 'folios', action: 'post_charge', description: 'Post department charges to room folios', isSensitive: false },
  { id: 'perm-folio-adjust', code: 'folios.adjust', name: 'Adjust / Void Charge', module: 'Folios', resource: 'folios', action: 'adjust', description: 'Reverse charges or apply rebates', isSensitive: true },
  { id: 'perm-folio-close', code: 'folios.close', name: 'Close & Archive Folio', module: 'Folios', resource: 'folios', action: 'close', description: 'Close zero-balance guest accounts', isSensitive: true },

  // 8. Payments & Cashiering
  { id: 'perm-pay-view', code: 'payments.view', name: 'View Payment Transactions', module: 'Payments', resource: 'payments', action: 'view', description: 'View settlements, cash ledger and card receipts', isSensitive: false },
  { id: 'perm-pay-collect', code: 'payments.collect', name: 'Collect Payments', module: 'Payments', resource: 'payments', action: 'collect', description: 'Process cash, card, and bank transfers', isSensitive: false },
  { id: 'perm-pay-refund', code: 'payments.refund', name: 'Initiate Refund', module: 'Payments', resource: 'payments', action: 'refund', description: 'Request guest or corporate refunds', isSensitive: true },
  { id: 'perm-pay-app-refund', code: 'payments.approve_refund', name: 'Approve Financial Refund', module: 'Payments', resource: 'payments', action: 'approve_refund', description: 'Sign off and authorize cash/card refunds', isSensitive: true },

  // 9. Point of Sale (POS)
  { id: 'perm-pos-view', code: 'pos.view', name: 'Access POS Terminals', module: 'Point of Sale', resource: 'pos', action: 'view', description: 'Access restaurant and bar sales terminals', isSensitive: false },
  { id: 'perm-pos-order', code: 'pos.create_order', name: 'Create POS Order', module: 'Point of Sale', resource: 'pos', action: 'create_order', description: 'Take food and beverage orders', isSensitive: false },
  { id: 'perm-pos-modify', code: 'pos.modify_order', name: 'Modify Order', module: 'Point of Sale', resource: 'pos', action: 'modify_order', description: 'Edit quantities or add special instructions', isSensitive: false },
  { id: 'perm-pos-cancel', code: 'pos.cancel_order', name: 'Void / Cancel Order', module: 'Point of Sale', resource: 'pos', action: 'cancel_order', description: 'Void submitted food or drink orders', isSensitive: true },
  { id: 'perm-pos-discount', code: 'pos.apply_discount', name: 'Apply Order Discount', module: 'Point of Sale', resource: 'pos', action: 'apply_discount', description: 'Apply promotional or VIP rate discounts', isSensitive: true },
  { id: 'perm-pos-roomcharge', code: 'pos.charge_to_room', name: 'Settle to Room Folio', module: 'Point of Sale', resource: 'pos', action: 'charge_to_room', description: 'Transfer POS check to guest room folio', isSensitive: false },

  // 10. Kitchen Display System (KDS)
  { id: 'perm-kit-view', code: 'kitchen.view', name: 'View Kitchen KDS', module: 'Kitchen', resource: 'kitchen', action: 'view', description: 'View station order queue and cooking tickets', isSensitive: false },
  { id: 'perm-kit-bump', code: 'kitchen.bump_ticket', name: 'Bump / Complete Ticket', module: 'Kitchen', resource: 'kitchen', action: 'bump_ticket', description: 'Advance ticket from preparing to ready/served', isSensitive: false },

  // 11. Housekeeping & Minibar
  { id: 'perm-hk-view', code: 'housekeeping.view', name: 'View Housekeeping Board', module: 'Housekeeping', resource: 'housekeeping', action: 'view', description: 'Inspect room cleaning task roster', isSensitive: false },
  { id: 'perm-hk-assign', code: 'housekeeping.assign', name: 'Assign Cleaning Tasks', module: 'Housekeeping', resource: 'housekeeping', action: 'assign', description: 'Allocate rooms to attendants and shifts', isSensitive: false },
  { id: 'perm-hk-inspect', code: 'housekeeping.inspect', name: 'Inspect & Release Room', module: 'Housekeeping', resource: 'housekeeping', action: 'inspect', description: 'Verify cleanliness and release to front office', isSensitive: false },
  { id: 'perm-hk-minibar', code: 'housekeeping.audit_minibar', name: 'Audit Minibar Charges', module: 'Housekeeping', resource: 'housekeeping', action: 'audit_minibar', description: 'Record minibar usage and post folio billing', isSensitive: false },

  // 12. Laundry & Valet
  { id: 'perm-lnd-view', code: 'laundry.view', name: 'View Laundry Operations', module: 'Laundry', resource: 'laundry', action: 'view', description: 'View laundry intake tickets and schedule', isSensitive: false },
  { id: 'perm-lnd-order', code: 'laundry.create_order', name: 'Create Laundry Intake', module: 'Laundry', resource: 'laundry', action: 'create_order', description: 'Record guest laundry and post charges', isSensitive: false },

  // 13. Inventory & Stores
  { id: 'perm-inv-view', code: 'inventory.view', name: 'View Inventory & Stores', module: 'Inventory', resource: 'inventory', action: 'view', description: 'Inspect stock on hand across all stores', isSensitive: false },
  { id: 'perm-inv-transfer', code: 'inventory.transfer', name: 'Transfer Stock', module: 'Inventory', resource: 'inventory', action: 'transfer', description: 'Execute inter-store commodity requisitions', isSensitive: false },
  { id: 'perm-inv-adjust', code: 'inventory.adjust', name: 'Adjust Stock Balance', module: 'Inventory', resource: 'inventory', action: 'adjust', description: 'Log spoilage, wastage, or audit variance', isSensitive: true },
  { id: 'perm-inv-app-adj', code: 'inventory.approve_adjustment', name: 'Approve Stock Write-Off', module: 'Inventory', resource: 'inventory', action: 'approve_adjustment', description: 'Sign off on inventory adjustments & losses', isSensitive: true },

  // 14. Procurement
  { id: 'perm-proc-view', code: 'procurement.view', name: 'View Purchase Orders', module: 'Procurement', resource: 'procurement', action: 'view', description: 'Inspect supplier requisitions and POs', isSensitive: false },
  { id: 'perm-proc-create', code: 'procurement.create_po', name: 'Create Purchase Order', module: 'Procurement', resource: 'procurement', action: 'create_po', description: 'Draft purchase orders for vendor supply', isSensitive: false },
  { id: 'perm-proc-approve', code: 'procurement.approve_po', name: 'Approve Purchase Order', module: 'Procurement', resource: 'procurement', action: 'approve_po', description: 'Authorize company expenditure and orders', isSensitive: true },

  // 15. Finance & Accounting
  { id: 'perm-acc-view', code: 'accounting.view', name: 'View General Ledger', module: 'Accounting', resource: 'accounting', action: 'view', description: 'Inspect chart of accounts and journal entries', isSensitive: true },
  { id: 'perm-acc-journal', code: 'accounting.create_journal', name: 'Create Journal Entry', module: 'Accounting', resource: 'accounting', action: 'create_journal', description: 'Post debit and credit adjusting entries', isSensitive: true },
  { id: 'perm-acc-approve', code: 'accounting.approve_journal', name: 'Approve Journal Posting', module: 'Accounting', resource: 'accounting', action: 'approve_journal', description: 'Authorize financial journal adjustments', isSensitive: true },
  { id: 'perm-acc-period', code: 'accounting.close_period', name: 'Close Accounting Period', module: 'Accounting', resource: 'accounting', action: 'close_period', description: 'Lock monthly and annual books', isSensitive: true },

  // 16. Night Audit
  { id: 'perm-na-view', code: 'night_audit.view', name: 'Access Night Audit', module: 'Night Audit', resource: 'night_audit', action: 'view', description: 'Review end-of-day balances and room roll', isSensitive: true },
  { id: 'perm-na-exec', code: 'night_audit.execute', name: 'Execute Day Close & Roll', module: 'Night Audit', resource: 'night_audit', action: 'execute', description: 'Post automatic room rates and roll business date', isSensitive: true },

  // 17. Transport Management
  { id: 'perm-trans-view', code: 'transport.view', name: 'View Fleet & Trips', module: 'Transport', resource: 'transport', action: 'view', description: 'Inspect airport transfers and chauffeur trips', isSensitive: false },
  { id: 'perm-trans-dispatch', code: 'transport.dispatch', name: 'Dispatch & Charge Rides', module: 'Transport', resource: 'transport', action: 'dispatch', description: 'Assign drivers and bill transport fees', isSensitive: false },

  // 18. Facilities & Gym/Pool
  { id: 'perm-fac-view', code: 'facilities.view', name: 'View Facilities Passes', module: 'Facilities', resource: 'facilities', action: 'view', description: 'Track gym, pool, and sauna access passes', isSensitive: false },
  { id: 'perm-fac-issue', code: 'facilities.issue_pass', name: 'Issue Facility Pass', module: 'Facilities', resource: 'facilities', action: 'issue_pass', description: 'Issue day passes and verify in-house guests', isSensitive: false },

  // 19. Maintenance
  { id: 'perm-mnt-view', code: 'maintenance.view', name: 'View Maintenance Requests', module: 'Maintenance', resource: 'maintenance', action: 'view', description: 'View engineering work orders and issues', isSensitive: false },
  { id: 'perm-mnt-create', code: 'maintenance.create_request', name: 'Create Work Order', module: 'Maintenance', resource: 'maintenance', action: 'create_request', description: 'Log repairs and request technician dispatch', isSensitive: false },
  { id: 'perm-mnt-resolve', code: 'maintenance.resolve', name: 'Resolve Maintenance Issue', module: 'Maintenance', resource: 'maintenance', action: 'resolve', description: 'Mark repairs completed and clear room locks', isSensitive: false },
  { id: 'perm-mnt-lock', code: 'maintenance.lock_room', name: 'Lock Room (Out of Order)', module: 'Maintenance', resource: 'maintenance', action: 'lock_room', description: 'Take room out of service for critical maintenance', isSensitive: true },

  // 20. Human Resources & Shifts
  { id: 'perm-hr-view', code: 'hr.view', name: 'View HR Roster & Attendance', module: 'Human Resources', resource: 'hr', action: 'view', description: 'Inspect shift rosters, clock-ins, and leave', isSensitive: false },
  { id: 'perm-hr-attendance', code: 'hr.manage_attendance', name: 'Manage Attendance & Clock-In', module: 'Human Resources', resource: 'hr', action: 'manage_attendance', description: 'Clock in/out and correct employee time records', isSensitive: false },
  { id: 'perm-hr-leave', code: 'hr.approve_leave', name: 'Approve Leave Requests', module: 'Human Resources', resource: 'hr', action: 'approve_leave', description: 'Authorize annual, sick, and maternity leave', isSensitive: true },
  { id: 'perm-hr-shifts', code: 'hr.manage_shifts', name: 'Manage Shift Rosters', module: 'Human Resources', resource: 'hr', action: 'manage_shifts', description: 'Assign shifts and handle staff scheduling', isSensitive: false },

  // 21. Reports & Analytics
  { id: 'perm-rep-view', code: 'reports.view', name: 'View Executive Reports', module: 'Reports', resource: 'reports', action: 'view', description: 'Access occupancy, financial, and departmental reports', isSensitive: false },
  { id: 'perm-rep-export', code: 'reports.export', name: 'Export Data (CSV/Print)', module: 'Reports', resource: 'reports', action: 'export', description: 'Download CSV audit manifests and tax invoices', isSensitive: true },

  // 22. Settings & System Administration
  { id: 'perm-set-view', code: 'settings.view', name: 'View System Settings', module: 'Settings', resource: 'settings', action: 'view', description: 'Inspect hotel configuration, tax rates, and database state', isSensitive: true },
  { id: 'perm-set-edit', code: 'settings.edit', name: 'Edit System Settings', module: 'Settings', resource: 'settings', action: 'edit', description: 'Change legal details, VAT rates, and backup drills', isSensitive: true },

  // 23. Audit Logs & Security
  { id: 'perm-aud-view', code: 'audit_logs.view', name: 'View Audit Logs & Security', module: 'Audit Logs', resource: 'audit_logs', action: 'view', description: 'Inspect immutable system event trail & logins', isSensitive: true },
  { id: 'perm-aud-export', code: 'audit_logs.export', name: 'Export Audit Trail', module: 'Audit Logs', resource: 'audit_logs', action: 'export', description: 'Export encrypted event logs for external compliance', isSensitive: true },
];

// Map lookup by code for O(1) queries
export const PERMISSIONS_MAP = new Map<string, Permission>(
  ALL_PERMISSIONS.map((p) => [p.code, p])
);

// Group permissions by module
export const PERMISSIONS_BY_MODULE = ALL_PERMISSIONS.reduce<Record<string, Permission[]>>(
  (acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  },
  {}
);

// Helper to grab all permission IDs
export const ALL_PERMISSION_IDS = ALL_PERMISSIONS.map((p) => p.id);

// ============================================================================
// DEFAULT SEEDED HOTEL ROLES (Section 10)
// ============================================================================

export const DEFAULT_SEEDED_ROLES: Role[] = [
  // ADMINISTRATION
  {
    id: 'role-super-admin',
    code: 'super_admin',
    name: 'Super Administrator',
    description: 'Full unconstrained root access to all hotel operations, settings, and user security.',
    category: 'Administration',
    isSystem: true,
    isArchived: false,
    permissionIds: ALL_PERMISSION_IDS,
  },
  {
    id: 'role-general-manager',
    code: 'general_manager',
    name: 'General Manager',
    description: 'Executive management authority over all departments, financial approvals, and operations.',
    category: 'Administration',
    isSystem: true,
    isArchived: false,
    permissionIds: ALL_PERMISSION_IDS.filter(
      (id) => id !== 'perm-set-edit' // preserves root system settings for super admin
    ),
  },
  {
    id: 'role-hotel-manager',
    code: 'hotel_manager',
    name: 'Hotel Manager',
    description: 'Operational manager overseeing day-to-day lodging, F&B, and customer care.',
    category: 'Administration',
    isSystem: false,
    isArchived: false,
    permissionIds: ALL_PERMISSIONS.filter(
      (p) =>
        !p.code.startsWith('settings.') &&
        !p.code.startsWith('accounting.close_period') &&
        p.code !== 'users.disable'
    ).map((p) => p.id),
  },

  // FRONT OFFICE
  {
    id: 'role-fom',
    code: 'front_office_manager',
    name: 'Front Office Manager',
    description: 'Manager in charge of reception, reservations, room allocations, and cashier balances.',
    category: 'Front Office',
    isSystem: true,
    isArchived: false,
    permissionIds: ALL_PERMISSIONS.filter(
      (p) =>
        p.module === 'Dashboard' ||
        p.module === 'Reservations' ||
        p.module === 'Rooms' ||
        p.module === 'Folios' ||
        p.module === 'Payments' ||
        p.module === 'Housekeeping' ||
        p.module === 'Transport' ||
        p.module === 'Reports' ||
        p.code === 'audit_logs.view'
    ).map((p) => p.id),
  },
  {
    id: 'role-receptionist',
    code: 'receptionist',
    name: 'Receptionist / Front Desk Officer',
    description: 'Front desk guest check-in/out, folio charge posting, key card assignment, and queries.',
    category: 'Front Office',
    isSystem: true,
    isArchived: false,
    permissionIds: [
      'perm-dash-view',
      'perm-res-view',
      'perm-res-create',
      'perm-res-edit',
      'perm-res-checkin',
      'perm-res-checkout',
      'perm-room-view',
      'perm-room-status',
      'perm-folio-view',
      'perm-folio-charge',
      'perm-pay-view',
      'perm-pay-collect',
      'perm-hk-view',
      'perm-fac-view',
      'perm-fac-issue',
      'perm-trans-view',
    ],
  },
  {
    id: 'role-res-officer',
    code: 'reservations_officer',
    name: 'Reservations Officer',
    description: 'Direct booking coordinator, advance deposit receipting, and room availability planning.',
    category: 'Front Office',
    isSystem: false,
    isArchived: false,
    permissionIds: [
      'perm-dash-view',
      'perm-res-view',
      'perm-res-create',
      'perm-res-edit',
      'perm-res-cancel',
      'perm-room-view',
      'perm-folio-view',
      'perm-pay-view',
      'perm-pay-collect',
    ],
  },

  // FINANCE
  {
    id: 'role-finance-manager',
    code: 'finance_manager',
    name: 'Finance Manager',
    description: 'Head of accounting, approval authority on refunds, discounts, purchase orders and books.',
    category: 'Finance',
    isSystem: true,
    isArchived: false,
    permissionIds: ALL_PERMISSIONS.filter(
      (p) =>
        p.module === 'Dashboard' ||
        p.module === 'Folios' ||
        p.module === 'Payments' ||
        p.module === 'Accounting' ||
        p.module === 'Procurement' ||
        p.module === 'Night Audit' ||
        p.module === 'Reports' ||
        p.module === 'Audit Logs'
    ).map((p) => p.id),
  },
  {
    id: 'role-accountant',
    code: 'accountant',
    name: 'Accountant',
    description: 'General ledger postings, corporate receivables, bank reconciliations, and journal entries.',
    category: 'Finance',
    isSystem: true,
    isArchived: false,
    permissionIds: [
      'perm-dash-view',
      'perm-folio-view',
      'perm-folio-charge',
      'perm-folio-adjust',
      'perm-pay-view',
      'perm-pay-collect',
      'perm-pay-refund',
      'perm-acc-view',
      'perm-acc-journal',
      'perm-rep-view',
      'perm-rep-export',
      'perm-aud-view',
    ],
  },
  {
    id: 'role-cashier',
    code: 'cashier',
    name: 'POS Cashier',
    description: 'Cashier handling till sales, card settlements, cash collections, and shift reconciliation.',
    category: 'Finance',
    isSystem: true,
    isArchived: false,
    permissionIds: [
      'perm-pos-view',
      'perm-pos-order',
      'perm-pos-charge-to-room',
      'perm-pay-view',
      'perm-pay-collect',
      'perm-folio-charge',
    ],
  },
  {
    id: 'role-auditor',
    code: 'auditor',
    name: 'Night Auditor',
    description: 'End-of-day audit controller responsible for business date rolling and rate verification.',
    category: 'Finance',
    isSystem: true,
    isArchived: false,
    permissionIds: [
      'perm-dash-view',
      'perm-res-view',
      'perm-room-view',
      'perm-folio-view',
      'perm-pay-view',
      'perm-na-view',
      'perm-na-exec',
      'perm-rep-view',
      'perm-rep-export',
      'perm-aud-view',
    ],
  },

  // RESTAURANT & BAR
  {
    id: 'role-restaurant-manager',
    code: 'restaurant_manager',
    name: 'Restaurant & Bar Manager',
    description: 'Head of F&B operations, order voiding, discounts, and inventory store requisitions.',
    category: 'Restaurant',
    isSystem: true,
    isArchived: false,
    permissionIds: [
      'perm-dash-view',
      'perm-pos-view',
      'perm-pos-order',
      'perm-pos-modify',
      'perm-pos-cancel',
      'perm-pos-discount',
      'perm-pos-roomcharge',
      'perm-kit-view',
      'perm-kit-bump',
      'perm-inv-view',
      'perm-inv-transfer',
      'perm-rep-view',
    ],
  },
  {
    id: 'role-waiter',
    code: 'waiter',
    name: 'Waiter / Server',
    description: 'Food and drink order taker for restaurant, lounge booths, and in-room dining.',
    category: 'Restaurant',
    isSystem: false,
    isArchived: false,
    permissionIds: ['perm-pos-view', 'perm-pos-order', 'perm-pos-modify', 'perm-pos-roomcharge'],
  },
  {
    id: 'role-bar-manager',
    code: 'bar_manager',
    name: 'Bar Manager',
    description: 'Beverage supervisor overseeing main bar, pool bar, and cellar inventory.',
    category: 'Bar',
    isSystem: false,
    isArchived: false,
    permissionIds: [
      'perm-dash-view',
      'perm-pos-view',
      'perm-pos-order',
      'perm-pos-modify',
      'perm-pos-cancel',
      'perm-pos-discount',
      'perm-pos-roomcharge',
      'perm-inv-view',
      'perm-inv-transfer',
    ],
  },
  {
    id: 'role-bartender',
    code: 'bartender',
    name: 'Bartender',
    description: 'Dispense bar tender mixing cocktails and executing beverage orders.',
    category: 'Bar',
    isSystem: false,
    isArchived: false,
    permissionIds: ['perm-pos-view', 'perm-pos-order', 'perm-pos-roomcharge', 'perm-kit-view', 'perm-kit-bump'],
  },

  // KITCHEN
  {
    id: 'role-kitchen-manager',
    code: 'kitchen_manager',
    name: 'Executive Chef / Kitchen Manager',
    description: 'Culinary leader managing KDS routing, recipe ingredients, and store requisitions.',
    category: 'Kitchen',
    isSystem: true,
    isArchived: false,
    permissionIds: [
      'perm-dash-view',
      'perm-kit-view',
      'perm-kit-bump',
      'perm-inv-view',
      'perm-inv-transfer',
      'perm-proc-view',
      'perm-proc-create',
      'perm-hr-view',
    ],
  },
  {
    id: 'role-chef',
    code: 'chef',
    name: 'Chef / Station Cook',
    description: 'Line cook managing hot kitchen, grill, and cold larder KDS ticket execution.',
    category: 'Kitchen',
    isSystem: false,
    isArchived: false,
    permissionIds: ['perm-kit-view', 'perm-kit-bump', 'perm-inv-view'],
  },

  // HOUSEKEEPING
  {
    id: 'role-housekeeping-manager',
    code: 'housekeeping_manager',
    name: 'Housekeeping Manager',
    description: 'Head of housekeeping, room inspections, minibar ledger, and linen store inventory.',
    category: 'Housekeeping',
    isSystem: true,
    isArchived: false,
    permissionIds: [
      'perm-dash-view',
      'perm-room-view',
      'perm-room-status',
      'perm-hk-view',
      'perm-hk-assign',
      'perm-hk-inspect',
      'perm-hk-minibar',
      'perm-lnd-view',
      'perm-inv-view',
      'perm-inv-transfer',
      'perm-mnt-create',
    ],
  },
  {
    id: 'role-housekeeping-supervisor',
    code: 'housekeeping_supervisor',
    name: 'Housekeeping Supervisor',
    description: 'Floor supervisor inspecting cleaned rooms and auditing minibar consumption.',
    category: 'Housekeeping',
    isSystem: false,
    isArchived: false,
    permissionIds: [
      'perm-room-view',
      'perm-room-status',
      'perm-hk-view',
      'perm-hk-inspect',
      'perm-hk-minibar',
      'perm-mnt-create',
    ],
  },
  {
    id: 'role-housekeeping-attendant',
    code: 'housekeeping_attendant',
    name: 'Housekeeping Attendant',
    description: 'Room cleaner updating cleaning status and reporting maintenance needs.',
    category: 'Housekeeping',
    isSystem: false,
    isArchived: false,
    permissionIds: ['perm-room-view', 'perm-room-status', 'perm-hk-view'],
  },

  // LAUNDRY
  {
    id: 'role-laundry-manager',
    code: 'laundry_manager',
    name: 'Laundry Manager',
    description: 'Manager overseeing guest valet and hotel linen dry cleaning operations.',
    category: 'Laundry',
    isSystem: false,
    isArchived: false,
    permissionIds: [
      'perm-dash-view',
      'perm-lnd-view',
      'perm-lnd-order',
      'perm-folio-charge',
      'perm-inv-view',
      'perm-inv-transfer',
    ],
  },

  // INVENTORY & PROCUREMENT
  {
    id: 'role-inventory-manager',
    code: 'inventory_manager',
    name: 'Inventory Manager / Head Storekeeper',
    description: 'Central Warehouse controller managing all commodity transfers and store requisitions.',
    category: 'Inventory',
    isSystem: true,
    isArchived: false,
    permissionIds: [
      'perm-dash-view',
      'perm-inv-view',
      'perm-inv-transfer',
      'perm-inv-adjust',
      'perm-proc-view',
      'perm-proc-create',
      'perm-rep-view',
    ],
  },
  {
    id: 'role-storekeeper',
    code: 'storekeeper',
    name: 'Storekeeper',
    description: 'Warehouse clerk receiving vendor supplies and dispensing stock to departments.',
    category: 'Inventory',
    isSystem: false,
    isArchived: false,
    permissionIds: ['perm-inv-view', 'perm-inv-transfer', 'perm-proc-view'],
  },
  {
    id: 'role-procurement-officer',
    code: 'procurement_officer',
    name: 'Procurement Officer',
    description: 'Purchasing officer drafting POs, negotiating supplier terms, and receiving shipments.',
    category: 'Procurement',
    isSystem: false,
    isArchived: false,
    permissionIds: ['perm-inv-view', 'perm-proc-view', 'perm-proc-create', 'perm-rep-view'],
  },

  // HUMAN RESOURCES
  {
    id: 'role-hr-manager',
    code: 'hr_manager',
    name: 'Human Resources Manager',
    description: 'Workforce administrator managing employees, attendance, leave approvals, and job positions.',
    category: 'Human Resources',
    isSystem: true,
    isArchived: false,
    permissionIds: [
      'perm-dash-view',
      'perm-emp-view',
      'perm-emp-create',
      'perm-emp-edit',
      'perm-emp-archive',
      'perm-hr-view',
      'perm-hr-attendance',
      'perm-hr-leave',
      'perm-hr-shifts',
      'perm-rep-view',
    ],
  },

  // MAINTENANCE
  {
    id: 'role-maintenance-manager',
    code: 'maintenance_manager',
    name: 'Maintenance & Facilities Manager',
    description: 'Chief engineer responsible for physical plant, work orders, and Out-of-Order room locking.',
    category: 'Maintenance',
    isSystem: false,
    isArchived: false,
    permissionIds: [
      'perm-dash-view',
      'perm-room-view',
      'perm-room-status',
      'perm-mnt-view',
      'perm-mnt-create',
      'perm-mnt-resolve',
      'perm-mnt-lock',
      'perm-inv-view',
      'perm-inv-transfer',
    ],
  },
  {
    id: 'role-maintenance-tech',
    code: 'maintenance_staff',
    name: 'Maintenance Technician',
    description: 'Engineering technician resolving HVAC, plumbing, and electrical room tickets.',
    category: 'Maintenance',
    isSystem: false,
    isArchived: false,
    permissionIds: ['perm-room-view', 'perm-mnt-view', 'perm-mnt-resolve'],
  },

  // TRANSPORT
  {
    id: 'role-transport-manager',
    code: 'transport_manager',
    name: 'Transport & Fleet Manager',
    description: 'Fleet dispatcher managing vehicle trips, airport pickups, and chauffeur billing.',
    category: 'Transport',
    isSystem: false,
    isArchived: false,
    permissionIds: ['perm-dash-view', 'perm-trans-view', 'perm-trans-dispatch', 'perm-folio-charge'],
  },

  // SECURITY
  {
    id: 'role-security-manager',
    code: 'security_manager',
    name: 'Security Manager',
    description: 'Head of security monitoring access logs, security incidents, and staff entry.',
    category: 'Security',
    isSystem: false,
    isArchived: false,
    permissionIds: [
      'perm-dash-view',
      'perm-aud-view',
      'perm-aud-export',
      'perm-hr-view',
      'perm-emp-view',
    ],
  },
];

// ============================================================================
// DEFAULT FINANCIAL APPROVAL POLICIES (Section 13)
// ============================================================================

export const DEFAULT_APPROVAL_POLICIES: ApprovalPolicy[] = [
  {
    id: 'pol-refund',
    transactionType: 'refund',
    title: 'Guest & Corporate Payment Refunds',
    maxAutoApprovedAmount: 0.0, // Every refund requires manager sign-off
    requiredApproverRole: 'finance_manager',
    secondaryApproverRole: 'general_manager',
    requiresTwoApprovals: true,
    preventSelfApproval: true,
    expiryHours: 24,
  },
  {
    id: 'pol-discount',
    transactionType: 'large_discount',
    title: 'Discounts Exceeding 10%',
    maxAutoApprovedAmount: 15000.0, // Below ₦15,000 cashier/waiter can apply
    requiredApproverRole: 'restaurant_manager',
    preventSelfApproval: true,
    expiryHours: 8,
    requiresTwoApprovals: false,
  },
  {
    id: 'pol-folio-adj',
    transactionType: 'folio_adjustment',
    title: 'Room Folio Charge Reversals / Rebates',
    maxAutoApprovedAmount: 5000.0,
    requiredApproverRole: 'front_office_manager',
    preventSelfApproval: true,
    expiryHours: 12,
    requiresTwoApprovals: false,
  },
  {
    id: 'pol-stock-adj',
    transactionType: 'stock_adjustment',
    title: 'Inventory Spoilage & Breakage Write-Off',
    maxAutoApprovedAmount: 20000.0,
    requiredApproverRole: 'finance_manager',
    preventSelfApproval: true,
    expiryHours: 48,
    requiresTwoApprovals: false,
  },
  {
    id: 'pol-po',
    transactionType: 'purchase_order',
    title: 'Vendor Purchase Orders',
    maxAutoApprovedAmount: 50000.0,
    requiredApproverRole: 'finance_manager',
    secondaryApproverRole: 'general_manager',
    requiresTwoApprovals: true,
    preventSelfApproval: true,
    expiryHours: 72,
  },
];

// ============================================================================
// RBAC EVALUATION FUNCTIONS
// ============================================================================

/**
 * Evaluates whether a user has a specific permission code (e.g. "reservations.create").
 * Resolves: User Roles -> Role Permissions -> User Direct Permission Grants & Denies.
 * Direct denies override role grants.
 */
export function evaluateUserPermission(
  user: UserAccount | null | undefined,
  roles: Role[],
  permissionCode: string
): boolean {
  if (!user) return false;
  if (user.status !== 'active') return false;

  const targetPerm = PERMISSIONS_MAP.get(permissionCode);
  if (!targetPerm) return false;

  // 1. Check direct user permission overrides
  if (user.directPermissions && user.directPermissions.length > 0) {
    const direct = user.directPermissions.find((dp) => dp.permissionId === targetPerm.id);
    if (direct !== undefined) {
      return direct.isGranted; // direct override (true or false)
    }
  }

  // 2. Super admin always has all permissions
  const userRoles = roles.filter((r) => user.roleIds.includes(r.id) && !r.isArchived);
  if (userRoles.some((r) => r.code === 'super_admin')) {
    return true;
  }

  // 3. Check role permissions
  for (const role of userRoles) {
    if (role.permissionIds.includes(targetPerm.id)) {
      return true;
    }
  }

  return false;
}

/**
 * Checks whether user is authorized to access a given department.
 */
export function evaluateDepartmentAccess(
  user: UserAccount | null | undefined,
  roles: Role[],
  departmentId: string
): boolean {
  if (!user || user.status !== 'active') return false;

  // Super admin & General manager have global access
  const userRoles = roles.filter((r) => user.roleIds.includes(r.id) && !r.isArchived);
  if (userRoles.some((r) => r.code === 'super_admin' || r.code === 'general_manager')) {
    return true;
  }

  if (user.departmentAccessScope === 'all') {
    return true;
  }

  return user.allowedDepartmentIds.includes(departmentId);
}

/**
 * Checks whether user is authorized to access a given POS / Service outlet.
 */
export function evaluateOutletAccess(
  user: UserAccount | null | undefined,
  roles: Role[],
  outletId: string
): boolean {
  if (!user || user.status !== 'active') return false;

  const userRoles = roles.filter((r) => user.roleIds.includes(r.id) && !r.isArchived);
  if (
    userRoles.some(
      (r) =>
        r.code === 'super_admin' ||
        r.code === 'general_manager' ||
        r.code === 'restaurant_manager' ||
        r.code === 'finance_manager'
    )
  ) {
    return true;
  }

  if (user.outletAccessScope === 'all') {
    return true;
  }

  return user.allowedOutletIds.includes(outletId);
}
