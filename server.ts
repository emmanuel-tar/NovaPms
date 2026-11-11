/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  ALL_PERMISSIONS,
  DEFAULT_SEEDED_ROLES,
  DEFAULT_APPROVAL_POLICIES,
  evaluateUserPermission,
  evaluateDepartmentAccess,
  evaluateOutletAccess,
} from './src/services/permissionRegistry.js';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_JOB_POSITIONS,
  INITIAL_EMPLOYEES,
  INITIAL_USER_ACCOUNTS,
  INITIAL_USER_SESSIONS,
  INITIAL_APPROVAL_REQUESTS,
  INITIAL_ATTENDANCE,
  INITIAL_CASHIER_SHIFTS,
} from './src/services/rbacService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// In-Memory Database Stores (Replicating PostgreSQL tables in memory for LAN Server)
let departments = [...INITIAL_DEPARTMENTS];
let jobPositions = [...INITIAL_JOB_POSITIONS];
let employees = [...INITIAL_EMPLOYEES];
let users = [...INITIAL_USER_ACCOUNTS];
let roles = [...DEFAULT_SEEDED_ROLES];
let permissions = [...ALL_PERMISSIONS];
let sessions = [...INITIAL_USER_SESSIONS];
let approvals = [...INITIAL_APPROVAL_REQUESTS];
let attendance = [...INITIAL_ATTENDANCE];
let cashierShifts = [...INITIAL_CASHIER_SHIFTS];

// ============================================================================
// AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// ============================================================================

interface AuthenticatedRequest extends Request {
  user?: (typeof users)[0];
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  // For developer ease in dev environment, default to Super Admin if no token provided
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
// REST API ENDPOINTS
// ============================================================================

// 1. EMPLOYEES
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

app.put('/api/employees/:id', authMiddleware, requirePermission('employees.edit'), (req, res) => {
  const { id } = req.params;
  const idx = employees.findIndex((e) => e.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Employee not found' });

  employees[idx] = { ...employees[idx], ...req.body, updatedAt: new Date().toISOString() };
  res.json({ success: true, data: employees[idx] });
});

app.post('/api/employees/:id/archive', authMiddleware, requirePermission('employees.archive'), (req, res) => {
  const { id } = req.params;
  const emp = employees.find((e) => e.id === id);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  emp.employmentStatus = 'archived';
  if (emp.userId) {
    const user = users.find((u) => u.id === emp.userId);
    if (user) user.status = 'disabled';
  }
  res.json({ success: true, message: `Employee ${emp.fullName} archived and system access revoked.` });
});

// 2. DEPARTMENTS
app.get('/api/departments', authMiddleware, (req, res) => {
  res.json({ success: true, data: departments });
});

app.post('/api/departments', authMiddleware, requirePermission('settings.edit'), (req, res) => {
  const newDept = {
    ...req.body,
    id: `dept-${Date.now()}`,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  departments.push(newDept);
  res.status(201).json({ success: true, data: newDept });
});

// 3. JOB POSITIONS
app.get('/api/job-positions', authMiddleware, (req, res) => {
  res.json({ success: true, data: jobPositions });
});

app.post('/api/job-positions', authMiddleware, requirePermission('settings.edit'), (req, res) => {
  const newPos = {
    ...req.body,
    id: `pos-${Date.now()}`,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  jobPositions.push(newPos);
  res.status(201).json({ success: true, data: newPos });
});

// 4. USER ACCOUNTS & SESSIONS
app.get('/api/users', authMiddleware, requirePermission('users.view'), (req, res) => {
  res.json({ success: true, data: users });
});

app.post('/api/users/:id/suspend', authMiddleware, requirePermission('users.suspend'), (req, res) => {
  const { id } = req.params;
  const user = users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Last Super Admin Protection
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
  sessions = sessions.filter((s) => s.userId !== id); // Revoke all active sessions
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

// 5. ROLES & PERMISSIONS
app.get('/api/roles', authMiddleware, requirePermission('roles.view'), (req, res) => {
  res.json({ success: true, data: roles });
});

app.get('/api/permissions', authMiddleware, (req, res) => {
  res.json({ success: true, data: permissions });
});

app.post('/api/roles', authMiddleware, requirePermission('roles.create'), (req, res) => {
  const newRole = {
    ...req.body,
    id: `role-${Date.now()}`,
    isSystem: false,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  roles.push(newRole);
  res.status(201).json({ success: true, data: newRole });
});

// 6. APPROVALS & FINANCIAL CONTROLS
app.get('/api/approvals', authMiddleware, (req, res) => {
  res.json({ success: true, data: approvals });
});

app.post('/api/approvals/:id/approve', authMiddleware, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const approval = approvals.find((a) => a.id === id);
  if (!approval) return res.status(404).json({ error: 'Approval request not found' });

  // Self-approval prevention
  if (req.user && approval.requestedByUserId === req.user.id) {
    return res.status(403).json({
      error: 'SECURITY VIOLATION: Self-approval is strictly prohibited by hotel separation of duties.',
    });
  }

  approval.status = 'approved';
  approval.decidedByUserId = req.user?.id;
  approval.decidedByUserName = req.user?.employeeName;
  approval.decidedAt = new Date().toISOString();
  res.json({ success: true, data: approval });
});

// 7. SYSTEM STATUS FOR HOTEL LAN
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
