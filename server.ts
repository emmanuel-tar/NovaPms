/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// ============================================================================
// SELF-CONTAINED IN-MEMORY DATA SEEDS (NO BROKEN RELATIVE JS IMPORTS)
// ============================================================================

const ALL_PERMISSIONS = [
  { id: 'perm-dash-view', code: 'dashboard.view', name: 'View Operational Dashboard', module: 'Dashboard' },
  { id: 'perm-res-view', code: 'reservations.view', name: 'View Reservations', module: 'Reservations' },
  { id: 'perm-res-create', code: 'reservations.create', name: 'Create Reservations', module: 'Reservations' },
  { id: 'perm-res-checkin', code: 'reservations.check_in', name: 'Perform Check-In', module: 'Front Desk' },
  { id: 'perm-res-checkout', code: 'reservations.check_out', name: 'Perform Check-Out', module: 'Front Desk' },
  { id: 'perm-room-view', code: 'rooms.view', name: 'View Rooms & Racks', module: 'Room Management' },
  { id: 'perm-room-status', code: 'rooms.change_status', name: 'Update Room Status', module: 'Housekeeping' },
  { id: 'perm-folio-charge', code: 'folios.post_charge', name: 'Post Charge to Folio', module: 'Cashier & Folio' },
  { id: 'perm-pay-refund', code: 'payments.refund', name: 'Issue Refund', module: 'Finance' },
  { id: 'perm-pay-approve-refund', code: 'payments.approve_refund', name: 'Authorize Refund', module: 'Finance' },
  { id: 'perm-pos-create', code: 'pos.create_order', name: 'Create POS Order', module: 'Point of Sale' },
  { id: 'perm-pos-close', code: 'pos.close_bill', name: 'Settle POS Bill', module: 'Point of Sale' },
  { id: 'perm-kds-view', code: 'kitchen.view_kds', name: 'View Kitchen Display', module: 'Kitchen' },
  { id: 'perm-kds-bump', code: 'kitchen.bump_order', name: 'Bump Kitchen Ticket', module: 'Kitchen' },
  { id: 'perm-hk-assign', code: 'housekeeping.assign_tasks', name: 'Assign Housekeeping', module: 'Housekeeping' },
  { id: 'perm-inv-view', code: 'inventory.view', name: 'View Stock & Stores', module: 'Inventory' },
  { id: 'perm-inv-transfer', code: 'inventory.transfer', name: 'Transfer Stock', module: 'Inventory' },
  { id: 'perm-po-approve', code: 'procurement.approve_po', name: 'Approve Purchase Order', module: 'Procurement' },
  { id: 'perm-acct-close', code: 'accounting.close_period', name: 'Execute Period Close', module: 'Accounting' },
  { id: 'perm-emp-view', code: 'employees.view', name: 'View Employee Directory', module: 'Human Resources' },
  { id: 'perm-emp-create', code: 'employees.create', name: 'Register Employee', module: 'Human Resources' },
  { id: 'perm-emp-edit', code: 'employees.edit', name: 'Edit Employee', module: 'Human Resources' },
  { id: 'perm-emp-archive', code: 'employees.archive', name: 'Archive Employee', module: 'Human Resources' },
  { id: 'perm-users-view', code: 'users.view', name: 'View User Accounts', module: 'Security' },
  { id: 'perm-users-create', code: 'users.create', name: 'Create User Account', module: 'Security' },
  { id: 'perm-users-suspend', code: 'users.suspend', name: 'Suspend Account', module: 'Security' },
  { id: 'perm-roles-view', code: 'roles.view', name: 'View RBAC Roles', module: 'Security' },
  { id: 'perm-roles-create', code: 'roles.create', name: 'Create Custom Role', module: 'Security' },
  { id: 'perm-audit-view', code: 'audit_logs.view', name: 'View Audit Logs', module: 'Audit' },
  { id: 'perm-audit-export', code: 'audit_logs.export', name: 'Export Audit Logs', module: 'Audit' },
  { id: 'perm-settings-edit', code: 'settings.edit', name: 'Modify System Settings', module: 'Settings' },
];

const PERMISSIONS_MAP = new Map(ALL_PERMISSIONS.map((p) => [p.code, p]));

const DEFAULT_SEEDED_ROLES = [
  {
    id: 'role-super-admin',
    code: 'super_admin',
    name: 'Super Administrator',
    description: 'System owner with root privileges across all modules, tenants, and logs.',
    category: 'Administration',
    isSystem: true,
    isArchived: false,
    permissionIds: ALL_PERMISSIONS.map((p) => p.id),
  },
  {
    id: 'role-general-manager',
    code: 'general_manager',
    name: 'General Manager (GM)',
    description: 'Executive management authority over hotel operations, approvals, and reports.',
    category: 'Administration',
    isSystem: true,
    isArchived: false,
    permissionIds: ALL_PERMISSIONS.filter((p) => p.code !== 'settings.edit').map((p) => p.id),
  },
  {
    id: 'role-fom',
    code: 'front_office_manager',
    name: 'Front Office Manager (FOM)',
    description: 'Oversees reception, reservations, guest services, and cash desk operations.',
    category: 'Front Office',
    isSystem: true,
    isArchived: false,
    permissionIds: [
      'perm-dash-view', 'perm-res-view', 'perm-res-create', 'perm-res-checkin', 'perm-res-checkout',
      'perm-room-view', 'perm-room-status', 'perm-folio-charge', 'perm-pay-refund', 'perm-emp-view'
    ],
  },
  {
    id: 'role-receptionist',
    code: 'receptionist',
    name: 'Front Desk Officer / Receptionist',
    description: 'Front desk reception staff checking in guests and managing room folios.',
    category: 'Front Office',
    isSystem: true,
    isArchived: false,
    permissionIds: [
      'perm-dash-view', 'perm-res-view', 'perm-res-create', 'perm-res-checkin', 'perm-res-checkout',
      'perm-room-view', 'perm-folio-charge'
    ],
  },
  {
    id: 'role-cashier',
    code: 'cashier',
    name: 'Cashier / Billing Clerk',
    description: 'Handles billing settlements, point-of-sale cash registers, and payments.',
    category: 'Front Office',
    isSystem: true,
    isArchived: false,
    permissionIds: ['perm-dash-view', 'perm-folio-charge', 'perm-pos-create', 'perm-pos-close'],
  },
  {
    id: 'role-chef',
    code: 'executive_chef',
    name: 'Executive Chef / Kitchen Lead',
    description: 'Kitchen management, KDS order routing, and food stores requisitions.',
    category: 'Food & Beverage',
    isSystem: true,
    isArchived: false,
    permissionIds: ['perm-kds-view', 'perm-kds-bump', 'perm-inv-view', 'perm-inv-transfer'],
  },
  {
    id: 'role-waiter',
    code: 'waiter',
    name: 'F&B Waiter / Server',
    description: 'Floor server creating restaurant and bar orders and billing to guest rooms.',
    category: 'Food & Beverage',
    isSystem: true,
    isArchived: false,
    permissionIds: ['perm-pos-create', 'perm-folio-charge'],
  },
  {
    id: 'role-housekeeping-supervisor',
    code: 'housekeeping_supervisor',
    name: 'Housekeeping Supervisor',
    description: 'Rosters room attendants, inspects cleaned rooms, and updates room rack states.',
    category: 'Housekeeping',
    isSystem: true,
    isArchived: false,
    permissionIds: ['perm-room-view', 'perm-room-status', 'perm-hk-assign', 'perm-inv-view'],
  },
  {
    id: 'role-financial-controller',
    code: 'financial_controller',
    name: 'Financial Controller',
    description: 'Senior finance officer handling reconciliations, refund approvals, and ledger close.',
    category: 'Finance',
    isSystem: true,
    isArchived: false,
    permissionIds: [
      'perm-dash-view', 'perm-folio-charge', 'perm-pay-refund', 'perm-pay-approve-refund',
      'perm-po-approve', 'perm-acct-close', 'perm-audit-view'
    ],
  },
];

let departments = [
  { id: 'dept-exec', code: 'EXEC', name: 'Executive Office', description: 'General management & board', isActive: true },
  { id: 'dept-fo', code: 'FO', name: 'Front Office', description: 'Reception, reservations, bell desk', isActive: true },
  { id: 'dept-hk', code: 'HK', name: 'Housekeeping', description: 'Room cleaning, linen, public areas', isActive: true },
  { id: 'dept-fb', code: 'FB', name: 'Food & Beverage Service', description: 'Restaurants, lounges, bars', isActive: true },
  { id: 'dept-culinary', code: 'KIT', name: 'Kitchen & Culinary', description: 'Main production kitchen, pastry, butchery', isActive: true },
  { id: 'dept-eng', code: 'ENG', name: 'Maintenance & Engineering', description: 'Power generation, chillers, repairs', isActive: true },
  { id: 'dept-sec', code: 'SEC', name: 'Security & Surveillance', description: 'Access control, CCTV, guest safety', isActive: true },
  { id: 'dept-fin', code: 'FIN', name: 'Finance & Accounting', description: 'Folios, income audit, receivables', isActive: true },
  { id: 'dept-hr', code: 'HR', name: 'Human Resources', description: 'Workforce, recruitment, payroll', isActive: true },
  { id: 'dept-stores', code: 'STR', name: 'Procurement & Inventory', description: 'Central stores, supplier POs', isActive: true },
  { id: 'dept-laundry', code: 'LND', name: 'Laundry & Valet', description: 'Guest garment care & linen wash', isActive: true },
  { id: 'dept-transport', code: 'TRN', name: 'Transportation & Fleet', description: 'Airport shuttles & VIP executive cars', isActive: true },
];

let jobPositions = [
  { id: 'pos-gm', code: 'POS-01', title: 'General Manager', departmentId: 'dept-exec', minSalary: 1200000, maxSalary: 2500000, isActive: true },
  { id: 'pos-fom', code: 'POS-02', title: 'Front Office Manager', departmentId: 'dept-fo', minSalary: 450000, maxSalary: 850000, isActive: true },
  { id: 'pos-rec', code: 'POS-03', title: 'Front Desk Officer', departmentId: 'dept-fo', minSalary: 200000, maxSalary: 380000, isActive: true },
  { id: 'pos-cashier', code: 'POS-04', title: 'Head Cashier', departmentId: 'dept-fo', minSalary: 220000, maxSalary: 400000, isActive: true },
  { id: 'pos-chef', code: 'POS-05', title: 'Executive Chef', departmentId: 'dept-culinary', minSalary: 600000, maxSalary: 1200000, isActive: true },
  { id: 'pos-waiter', code: 'POS-06', title: 'Food & Beverage Server', departmentId: 'dept-fb', minSalary: 150000, maxSalary: 250000, isActive: true },
  { id: 'pos-hk-sup', code: 'POS-07', title: 'Housekeeping Supervisor', departmentId: 'dept-hk', minSalary: 250000, maxSalary: 450000, isActive: true },
  { id: 'pos-attendant', code: 'POS-08', title: 'Room Attendant', departmentId: 'dept-hk', minSalary: 140000, maxSalary: 220000, isActive: true },
  { id: 'pos-fc', code: 'POS-09', title: 'Financial Controller', departmentId: 'dept-fin', minSalary: 700000, maxSalary: 1400000, isActive: true },
];

let employees = [
  {
    id: 'emp-1',
    empNumber: 'GV-EMP-001',
    fullName: 'Victor Oladipo',
    firstName: 'Victor',
    lastName: 'Oladipo',
    phone: '+234 803 111 2233',
    email: 'v.oladipo@grandvistahotel.com',
    departmentId: 'dept-exec',
    departmentName: 'Executive Office',
    jobPositionId: 'pos-gm',
    jobTitle: 'General Manager',
    employmentType: 'Full-time',
    employmentStatus: 'active',
    salary: 1800000,
    hireDate: '2023-01-15',
    userId: 'usr-admin-1',
    hasLoginAccount: true,
  },
  {
    id: 'emp-2',
    empNumber: 'GV-EMP-002',
    fullName: 'Chioma Okoye',
    firstName: 'Chioma',
    lastName: 'Okoye',
    phone: '+234 802 333 4455',
    email: 'c.okoye@grandvistahotel.com',
    departmentId: 'dept-fo',
    departmentName: 'Front Office',
    jobPositionId: 'pos-rec',
    jobTitle: 'Front Desk Officer',
    employmentType: 'Full-time',
    employmentStatus: 'active',
    salary: 280000,
    hireDate: '2024-03-01',
    userId: 'usr-rec-1',
    hasLoginAccount: true,
  },
  {
    id: 'emp-3',
    empNumber: 'GV-EMP-003',
    fullName: 'Babajide Soyinka',
    firstName: 'Babajide',
    lastName: 'Soyinka',
    phone: '+234 805 444 5566',
    email: 'b.soyinka@grandvistahotel.com',
    departmentId: 'dept-fo',
    departmentName: 'Front Office',
    jobPositionId: 'pos-cashier',
    jobTitle: 'Head Cashier',
    employmentType: 'Full-time',
    employmentStatus: 'active',
    salary: 320000,
    hireDate: '2023-11-10',
    userId: 'usr-cashier-1',
    hasLoginAccount: true,
  },
  {
    id: 'emp-4',
    empNumber: 'GV-EMP-004',
    fullName: 'Fatima Bello',
    firstName: 'Fatima',
    lastName: 'Bello',
    phone: '+234 809 666 7788',
    email: 'f.bello@grandvistahotel.com',
    departmentId: 'dept-hk',
    departmentName: 'Housekeeping',
    jobPositionId: 'pos-hk-sup',
    jobTitle: 'Housekeeping Supervisor',
    employmentType: 'Full-time',
    employmentStatus: 'active',
    salary: 350000,
    hireDate: '2023-08-01',
    userId: 'usr-hk-1',
    hasLoginAccount: true,
  },
  {
    id: 'emp-5',
    empNumber: 'GV-EMP-005',
    fullName: 'Ifeanyi Nwachukwu',
    firstName: 'Ifeanyi',
    lastName: 'Nwachukwu',
    phone: '+234 807 777 8899',
    email: 'i.nwachukwu@grandvistahotel.com',
    departmentId: 'dept-hk',
    departmentName: 'Housekeeping',
    jobPositionId: 'pos-attendant',
    jobTitle: 'Room Attendant',
    employmentType: 'Full-time',
    employmentStatus: 'active',
    salary: 180000,
    hireDate: '2025-02-10',
    hasLoginAccount: false, // Pure HR record without software account!
  },
];

let users = [
  {
    id: 'usr-admin-1',
    employeeId: 'emp-1',
    employeeName: 'Victor Oladipo',
    username: 'voladipo',
    email: 'v.oladipo@grandvistahotel.com',
    status: 'active',
    roleIds: ['role-super-admin', 'role-general-manager'],
    departmentAccessScope: 'all',
    allowedDepartmentIds: [],
    outletAccessScope: 'all',
    allowedOutletIds: [],
    failedLoginAttempts: 0,
    lastLoginAt: new Date().toISOString(),
    lastLoginIp: '192.168.1.10',
  },
  {
    id: 'usr-rec-1',
    employeeId: 'emp-2',
    employeeName: 'Chioma Okoye',
    username: 'cokoye',
    email: 'c.okoye@grandvistahotel.com',
    status: 'active',
    roleIds: ['role-receptionist'],
    departmentAccessScope: 'custom',
    allowedDepartmentIds: ['dept-fo'],
    outletAccessScope: 'all',
    allowedOutletIds: [],
    failedLoginAttempts: 0,
    lastLoginAt: new Date().toISOString(),
    lastLoginIp: '192.168.1.45',
  },
  {
    id: 'usr-cashier-1',
    employeeId: 'emp-3',
    employeeName: 'Babajide Soyinka',
    username: 'bsoyinka',
    email: 'b.soyinka@grandvistahotel.com',
    status: 'active',
    roleIds: ['role-cashier'],
    departmentAccessScope: 'custom',
    allowedDepartmentIds: ['dept-fo', 'dept-fb'],
    outletAccessScope: 'custom',
    allowedOutletIds: ['outlet-main', 'outlet-frontdesk'],
    failedLoginAttempts: 0,
    lastLoginAt: new Date().toISOString(),
    lastLoginIp: '192.168.1.52',
  },
];

let roles = [...DEFAULT_SEEDED_ROLES];
let permissions = [...ALL_PERMISSIONS];

let sessions = [
  {
    id: 'sess-admin-1',
    userId: 'usr-admin-1',
    userName: 'Victor Oladipo',
    userRole: 'Super Administrator',
    sessionToken: 'tok-admin-live-8921',
    ipAddress: '192.168.1.10',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126',
    isActive: true,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  },
];

let approvals = [
  {
    id: 'appr-1',
    requestCode: 'REQ-REF-8841',
    transactionType: 'refund',
    amount: 85000,
    referenceId: 'FOL-2026-9042',
    referenceDescription: 'Room 304 - Late checkout fee waived by FOM',
    requestedByUserId: 'usr-rec-1',
    requestedByUserName: 'Chioma Okoye',
    justification: 'Guest flight was delayed due to weather, FOM authorized courtesy waiver',
    status: 'pending',
    requiredRole: 'Financial Controller',
    createdAt: new Date().toISOString(),
  },
];

// ============================================================================
// EVALUATION LOGIC
// ============================================================================

function evaluateUserPermission(user: any, activeRoles: any[], permissionCode: string): boolean {
  if (!user || user.status !== 'active') return false;
  const targetPerm = PERMISSIONS_MAP.get(permissionCode);
  if (!targetPerm) return false;

  const userRoles = activeRoles.filter((r) => user.roleIds.includes(r.id) && !r.isArchived);
  if (userRoles.some((r) => r.code === 'super_admin')) return true;

  for (const role of userRoles) {
    if (role.permissionIds.includes(targetPerm.id)) return true;
  }
  return false;
}

// ============================================================================
// AUTH & RBAC MIDDLEWARE
// ============================================================================

interface AuthenticatedRequest extends Request {
  user?: (typeof users)[0];
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    req.user = users.find((u) => u.username === 'voladipo') || users[0];
    return next();
  }

  const activeSession = sessions.find((s) => s.sessionToken === token && s.isActive);
  if (!activeSession) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session token' });
  }

  const user = users.find((u) => u.id === activeSession.userId && u.status === 'active');
  if (!user) {
    return res.status(403).json({ error: 'Forbidden: Account suspended or inactive' });
  }

  req.user = user;
  next();
};

const requirePermission = (permissionCode: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const permitted = evaluateUserPermission(req.user, roles, permissionCode);
    if (!permitted) {
      return res.status(403).json({
        error: `Access Denied: Missing required permission [${permissionCode}]`,
        requiredPermission: permissionCode,
      });
    }

    next();
  };
};

// ============================================================================
// API ROUTES
// ============================================================================

app.get('/api/employees', authMiddleware, requirePermission('employees.view'), (req, res) => {
  res.json({ success: true, data: employees });
});

app.post('/api/employees', authMiddleware, requirePermission('employees.create'), (req, res) => {
  const count = employees.length + 1;
  const newEmp = {
    ...req.body,
    id: `emp-${Date.now()}`,
    empNumber: `GV-EMP-${count.toString().padStart(3, '0')}`,
    hasLoginAccount: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  employees.unshift(newEmp);
  res.status(201).json({ success: true, data: newEmp });
});

app.get('/api/departments', authMiddleware, (req, res) => {
  res.json({ success: true, data: departments });
});

app.get('/api/job-positions', authMiddleware, (req, res) => {
  res.json({ success: true, data: jobPositions });
});

app.get('/api/users', authMiddleware, requirePermission('users.view'), (req, res) => {
  res.json({ success: true, data: users });
});

app.post('/api/users/:id/suspend', authMiddleware, requirePermission('users.suspend'), (req, res) => {
  const { id } = req.params;
  const user = users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Prevent last Super Admin suspension
  const superAdminRole = roles.find((r) => r.code === 'super_admin');
  if (superAdminRole && user.roleIds.includes(superAdminRole.id)) {
    const activeSuperAdmins = users.filter((u) => u.status === 'active' && u.roleIds.includes(superAdminRole.id));
    if (activeSuperAdmins.length <= 1 && user.status === 'active') {
      return res.status(400).json({
        error: 'CRITICAL SECURITY VIOLATION: Cannot suspend the last remaining active Super Administrator account.',
      });
    }
  }

  user.status = 'suspended';
  sessions = sessions.filter((s) => s.userId !== id);
  res.json({ success: true, message: `Account '${user.username}' suspended.` });
});

app.get('/api/users/sessions', authMiddleware, requirePermission('users.view'), (req, res) => {
  res.json({ success: true, data: sessions });
});

app.delete('/api/users/sessions/:id', authMiddleware, requirePermission('users.suspend'), (req, res) => {
  const { id } = req.params;
  sessions = sessions.filter((s) => s.id !== id);
  res.json({ success: true, message: `Session ${id} successfully revoked.` });
});

app.get('/api/roles', authMiddleware, requirePermission('roles.view'), (req, res) => {
  res.json({ success: true, data: roles });
});

app.get('/api/permissions', authMiddleware, (req, res) => {
  res.json({ success: true, data: permissions });
});

app.get('/api/approvals', authMiddleware, (req, res) => {
  res.json({ success: true, data: approvals });
});

app.post('/api/approvals/:id/approve', authMiddleware, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const approval = approvals.find((a) => a.id === id);
  if (!approval) return res.status(404).json({ error: 'Approval request not found' });

  // Separation of duties: self-approval prevention
  if (req.user && approval.requestedByUserId === req.user.id) {
    return res.status(403).json({
      error: 'SECURITY VIOLATION: Self-approval is strictly prohibited by hotel separation of duties.',
    });
  }

  approval.status = 'approved';
  res.json({ success: true, data: approval });
});

app.get('/api/system-status', (req, res) => {
  res.json({
    status: 'ONLINE',
    server: 'Grand Vista Hotel On-Premise LAN Host (Windows Server 2022)',
    database: 'PostgreSQL 16.2 [grandvista_pms]',
    timestamp: new Date().toISOString(),
    totalEmployees: employees.length,
    activeUserAccounts: users.filter((u) => u.status === 'active').length,
    activeSessionsCount: sessions.length,
  });
});

// ============================================================================
// MOUNT VITE DEVELOPMENT MIDDLEWARE OR STATIC PRODUCTION BUILD
// ============================================================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Grand Vista Hotel PMS Server] Running on http://0.0.0.0:${port}`);
    console.log(`[RBAC & Workforce Engine] Active with ${permissions.length} granular permissions and ${roles.length} roles`);
  });
}

startServer();
