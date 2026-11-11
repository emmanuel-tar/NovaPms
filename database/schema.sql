-- ============================================================================
-- GRAND VISTA HOTEL MANAGEMENT SYSTEM (PMS & ERP)
-- PostgreSQL Enterprise Database Schema: Workforce Management & RBAC Engine
-- Target Database: PostgreSQL 14+ / 16
-- Deployment: Local Windows Server On-Premise LAN
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. DEPARTMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    manager_employee_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_departments_code ON departments(code);
CREATE INDEX IF NOT EXISTS idx_departments_active ON departments(is_active);

-- ----------------------------------------------------------------------------
-- 2. JOB POSITIONS (Strictly separated from system access roles)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS job_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(32) NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    description TEXT,
    min_salary NUMERIC(14, 2) DEFAULT 0.00,
    max_salary NUMERIC(14, 2) DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_positions_dept ON job_positions(department_id);
CREATE INDEX IF NOT EXISTS idx_job_positions_active ON job_positions(is_active);

-- ----------------------------------------------------------------------------
-- 3. EMPLOYEES (Personal & Employment Records - Allowed to exist WITHOUT a login)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    emp_number VARCHAR(32) NOT NULL UNIQUE,
    first_name VARCHAR(60) NOT NULL,
    last_name VARCHAR(60) NOT NULL,
    middle_name VARCHAR(60),
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(32),
    emergency_contact_relationship VARCHAR(50),
    profile_photo_url TEXT,
    avatar_color VARCHAR(32) DEFAULT 'bg-emerald-600',
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    job_position_id UUID NOT NULL REFERENCES job_positions(id) ON DELETE RESTRICT,
    employment_type VARCHAR(32) NOT NULL DEFAULT 'Full-time' 
        CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Trainee')),
    employment_status VARCHAR(32) NOT NULL DEFAULT 'active'
        CHECK (employment_status IN ('active', 'on_probation', 'on_leave', 'suspended', 'terminated', 'archived')),
    hire_date DATE NOT NULL,
    reporting_manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    salary NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Foreign key back to departments for department manager
ALTER TABLE departments 
    ADD CONSTRAINT fk_dept_manager 
    FOREIGN KEY (manager_employee_id) 
    REFERENCES employees(id) 
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_employees_emp_num ON employees(emp_number);
CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(employment_status);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);

-- ----------------------------------------------------------------------------
-- 4. USERS (Authentication credentials & account state)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
    username VARCHAR(64) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'active'
        CHECK (status IN ('pending_invitation', 'active', 'suspended', 'disabled', 'locked', 'expired')),
    force_password_change BOOLEAN NOT NULL DEFAULT FALSE,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    last_login_ip VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_employee ON users(employee_id);

-- ----------------------------------------------------------------------------
-- 5. ROLES (Configurable Role Catalog)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(64) NOT NULL DEFAULT 'General',
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_roles_code ON roles(code);
CREATE INDEX IF NOT EXISTS idx_roles_category ON roles(category);

-- ----------------------------------------------------------------------------
-- 6. PERMISSIONS (Granular Permissions in module.resource.action format)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    module VARCHAR(64) NOT NULL,
    resource VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    description TEXT,
    is_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_permissions_code ON permissions(code);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);

-- ----------------------------------------------------------------------------
-- 7. ROLE PERMISSIONS (Many-to-Many mapping)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

-- ----------------------------------------------------------------------------
-- 8. USER ROLES (Many-to-Many mapping)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- ----------------------------------------------------------------------------
-- 9. USER DIRECT PERMISSIONS (Individual Overrides / Specific Grants & Revocations)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_permissions (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    is_granted BOOLEAN NOT NULL DEFAULT TRUE, -- TRUE = Grant, FALSE = Explicit Deny
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, permission_id)
);

-- ----------------------------------------------------------------------------
-- 10. USER DEPARTMENT ACCESS SCOPES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_department_access (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, department_id)
);

-- ----------------------------------------------------------------------------
-- 11. USER OUTLET ACCESS SCOPES (POS & Service Outlets)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_outlet_access (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    outlet_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, outlet_id)
);

-- ----------------------------------------------------------------------------
-- 12. USER SESSIONS (Active Web/Terminal Sessions & Device Tracking)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON user_sessions(is_active);

-- ----------------------------------------------------------------------------
-- 13. LOGIN ATTEMPTS (Security Monitoring & Lockout Logic)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(64) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    status VARCHAR(32) NOT NULL 
        CHECK (status IN ('SUCCESS', 'FAILED_BAD_PASSWORD', 'FAILED_LOCKED', 'FAILED_SUSPENDED', 'FAILED_EXPIRED', 'FAILED_NOT_FOUND')),
    failure_reason TEXT,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_user ON login_attempts(username, attempted_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address, attempted_at);

-- ----------------------------------------------------------------------------
-- 14. ACCOUNT INVITATIONS (Single-Use Activation Tokens)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS account_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    email VARCHAR(120) NOT NULL,
    token VARCHAR(128) NOT NULL UNIQUE,
    assigned_roles JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(32) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_invitations_token ON account_invitations(token);

-- ----------------------------------------------------------------------------
-- 15. PASSWORD RESET TOKENS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(128) NOT NULL UNIQUE,
    status VARCHAR(32) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'used', 'expired')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMPTZ
);

-- ----------------------------------------------------------------------------
-- 16. FINANCIAL APPROVAL POLICIES & AUTHORITY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS approval_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_type VARCHAR(64) NOT NULL UNIQUE
        CHECK (transaction_type IN ('refund', 'large_discount', 'folio_adjustment', 'stock_adjustment', 'purchase_order', 'expense', 'journal_entry')),
    max_auto_approved_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    required_approver_role VARCHAR(64) NOT NULL,
    secondary_approver_role VARCHAR(64),
    requires_two_approvals BOOLEAN NOT NULL DEFAULT FALSE,
    prevent_self_approval BOOLEAN NOT NULL DEFAULT TRUE,
    expiry_hours INT NOT NULL DEFAULT 24,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 17. APPROVAL REQUESTS (Live Requests Queue)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_code VARCHAR(32) NOT NULL UNIQUE,
    transaction_type VARCHAR(64) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    reference_id VARCHAR(64),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    requested_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    justification TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected', 'escalated', 'expired')),
    required_role VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_approval_req_status ON approval_requests(status);

-- ----------------------------------------------------------------------------
-- 18. APPROVAL HISTORY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS approval_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    approval_request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
    decided_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    decision VARCHAR(32) NOT NULL CHECK (decision IN ('approved', 'rejected')),
    notes TEXT,
    decided_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 19. EMPLOYEE SHIFTS & ATTENDANCE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employee_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    shift_id UUID REFERENCES employee_shifts(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    clock_in TIMESTAMPTZ NOT NULL,
    clock_out TIMESTAMPTZ,
    status VARCHAR(32) NOT NULL DEFAULT 'on_time'
        CHECK (status IN ('on_time', 'late', 'early_departure', 'overtime', 'absent')),
    late_minutes INT DEFAULT 0,
    overtime_minutes INT DEFAULT 0,
    supervisor_approved BOOLEAN NOT NULL DEFAULT FALSE,
    supervisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_attendance_emp_date ON attendance_records(employee_id, date);

-- ----------------------------------------------------------------------------
-- 20. LEAVE MANAGEMENT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leave_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    days_per_year INT NOT NULL DEFAULT 14,
    requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
    is_paid BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_code VARCHAR(32) NOT NULL UNIQUE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'supervisor_approved', 'hr_approved', 'rejected', 'cancelled')),
    reviewed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 21. CASHIER SHIFTS (POS Till Opening, Reconciliation & Closing)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cashier_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_number VARCHAR(32) NOT NULL UNIQUE,
    cashier_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    outlet_id VARCHAR(64) NOT NULL,
    outlet_name VARCHAR(100) NOT NULL,
    opening_cash NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    cash_sales NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    non_cash_sales NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    refunds_total NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    cash_withdrawals NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    expected_cash NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    actual_cash NUMERIC(14, 2),
    variance NUMERIC(14, 2),
    status VARCHAR(32) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'reconciled', 'closed')),
    supervisor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    supervisor_notes TEXT,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_cashier_shifts_status ON cashier_shifts(status);

-- ----------------------------------------------------------------------------
-- 22. IMMUTABLE AUDIT LOGS & SECURITY TRAIL
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    log_code VARCHAR(32) NOT NULL UNIQUE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    user_name VARCHAR(100) NOT NULL,
    user_role VARCHAR(64) NOT NULL,
    category VARCHAR(32) NOT NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(64) NOT NULL,
    record_reference VARCHAR(100),
    previous_value JSONB,
    new_value JSONB,
    details TEXT,
    ip_address VARCHAR(45) NOT NULL,
    severity VARCHAR(16) NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON audit_logs(category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(created_at);

-- ----------------------------------------------------------------------------
-- 23. SECURITY EVENTS LOG
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(64) NOT NULL,
    severity VARCHAR(16) NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address VARCHAR(45) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 24. PERMISSION CHANGE HISTORY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS permission_change_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    changed_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action VARCHAR(64) NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- CRITICAL SECURITY RULE: Prevent Deletion of the Last Active Super Admin
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION prevent_last_super_admin_removal()
RETURNS TRIGGER AS $$
DECLARE
    super_admin_count INT;
BEGIN
    -- Check how many active users have the super_admin role
    SELECT COUNT(DISTINCT u.id) INTO super_admin_count
    FROM users u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
    WHERE r.code = 'super_admin' AND u.status = 'active';

    IF super_admin_count <= 1 THEN
        -- If trying to delete the user or role assignment
        RAISE EXCEPTION 'CRITICAL SECURITY VIOLATION: Cannot remove or deactivate the last remaining active Super Administrator account.';
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_super_admin_delete ON users;
CREATE TRIGGER trg_prevent_super_admin_delete
    BEFORE DELETE OR UPDATE ON users
    FOR EACH ROW
    WHEN (OLD.status = 'active' AND NEW.status != 'active')
    EXECUTE FUNCTION prevent_last_super_admin_removal();
