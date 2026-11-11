/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRBAC } from '../../context/RBACContext';
import { EmployeeRecord } from '../../types/rbac';
import {
  X,
  User,
  Briefcase,
  FileText,
  Key,
  Shield,
  Clock,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Upload,
  Lock,
  ExternalLink,
  Plus,
} from 'lucide-react';

interface EmployeeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeRecord | null;
  onEdit: (emp: EmployeeRecord) => void;
  onNavigateSubTab: (tab: string) => void;
}

export const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({
  isOpen,
  onClose,
  employee,
  onEdit,
  onNavigateSubTab,
}) => {
  const {
    userAccounts,
    attendanceRecords,
    leaveRequests,
    activateEmployee,
    archiveEmployee,
    resetUserPassword,
  } = useRBAC();

  const [activeTab, setActiveTab] = useState<'details' | 'account' | 'documents' | 'attendance' | 'leaves'>('details');
  const [tempPassAlert, setTempPassAlert] = useState<string | null>(null);

  if (!isOpen || !employee) return null;

  const linkedUser = userAccounts.find((u) => u.employeeId === employee.id);
  const employeeAttendance = attendanceRecords.filter((a) => a.employeeId === employee.id);
  const employeeLeaves = leaveRequests.filter((l) => l.employeeId === employee.id);

  const formatNaira = (amt: number) => `₦${amt.toLocaleString()}`;

  const handleResetPassword = () => {
    if (!linkedUser) return;
    const res = resetUserPassword(linkedUser.id);
    if (res.success && res.tempPassword) {
      setTempPassAlert(`Password reset. Temporary password: ${res.tempPassword}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header Hero */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl text-white flex items-center justify-center text-xl font-bold shadow-sm ${employee.avatarColor}`}
            >
              {employee.firstName[0]}
              {employee.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {employee.fullName}
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {employee.empNumber}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    employee.employmentStatus === 'active'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : employee.employmentStatus === 'on_leave'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {employee.employmentStatus.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {employee.jobTitle} • {employee.departmentName} ({employee.employmentType})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 gap-6 text-xs font-semibold bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'details'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'account'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Login Account</span>
            {employee.hasLoginAccount ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            ) : (
              <span className="text-[10px] text-slate-400 font-normal">(None)</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'documents'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Documents ({employee.documents?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'attendance'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Attendance Log ({employeeAttendance.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'leaves'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Leaves ({employeeLeaves.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {tempPassAlert && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
              <span>{tempPassAlert}</span>
              <button
                onClick={() => setTempPassAlert(null)}
                className="text-xs font-semibold underline ml-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* TAB 1: Profile Details */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Contact & Identification
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold">{employee.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{employee.email}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>{employee.address}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Emergency Contact
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {employee.emergencyContact.name}
                    </div>
                    <div className="text-slate-500">
                      Relationship: {employee.emergencyContact.relationship}
                    </div>
                    <div className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      {employee.emergencyContact.phone}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Monthly Salary
                  </div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                    {formatNaira(employee.salary)}
                  </div>
                  <div className="text-[11px] text-slate-500">Base gross salary</div>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Hire Date
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {employee.hireDate}
                  </div>
                  <div className="text-[11px] text-slate-500">Service start date</div>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Direct Supervisor
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                    {employee.reportingManagerName || 'General Manager'}
                  </div>
                  <div className="text-[11px] text-slate-500">Approving line manager</div>
                </div>
              </div>

              {employee.notes && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Internal HR Notes
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{employee.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: System Login Account */}
          {activeTab === 'account' && (
            <div className="space-y-4">
              {linkedUser ? (
                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100 font-mono">
                          @{linkedUser.username}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            linkedUser.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : linkedUser.status === 'suspended'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {linkedUser.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{linkedUser.email}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleResetPassword}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateSubTab('users');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <span>Manage Account</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Role badges */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Assigned RBAC Roles
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {linkedUser.roles?.map((r) => (
                        <span
                          key={r.id}
                          className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          {r.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Scopes */}
                  <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-500">Department Scope:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 ml-2 capitalize">
                        {linkedUser.departmentAccessScope}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Outlet Scope:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 ml-2 capitalize">
                        {linkedUser.outletAccessScope}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Last Login:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 ml-2">
                        {linkedUser.lastLoginAt ? new Date(linkedUser.lastLoginAt).toLocaleString() : 'Never'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Failed Attempts:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 ml-2">
                        {linkedUser.failedLoginAttempts}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      No Login Account Provisioned
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      This employee exists purely as an HR record without software credentials. You can provision an account or send an invitation.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateSubTab('create-account');
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                  >
                    Provision Account for this Employee
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Documents */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Compliance and verification documents stored securely.
                </span>
                <button className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Document</span>
                </button>
              </div>

              {employee.documents && employee.documents.length > 0 ? (
                <div className="space-y-2">
                  {employee.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-emerald-600" />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {doc.fileName}
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            {doc.documentType} • {doc.fileSize} • Uploaded {doc.uploadedAt}
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No documents uploaded for this employee yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Attendance Log */}
          {activeTab === 'attendance' && (
            <div className="space-y-3">
              {employeeAttendance.length > 0 ? (
                <div className="space-y-2">
                  {employeeAttendance.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {att.date} — {att.shiftName}
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          In: <span className="font-mono font-medium">{att.clockIn}</span> | Out:{' '}
                          <span className="font-mono font-medium">{att.clockOut || 'Active'}</span>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          att.status === 'on_time'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {att.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No attendance records logged for this employee.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Leaves */}
          {activeTab === 'leaves' && (
            <div className="space-y-3">
              {employeeLeaves.length > 0 ? (
                <div className="space-y-2">
                  {employeeLeaves.map((l) => (
                    <div
                      key={l.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {l.leaveTypeName} ({l.totalDays} Days)
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          {l.startDate} to {l.endDate} • {l.reason}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          l.status === 'hr_approved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : l.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {l.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No leave applications filed by this employee.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            {employee.employmentStatus === 'active' ? (
              <button
                type="button"
                onClick={() => {
                  archiveEmployee(employee.id);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
              >
                Archive Employee
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  activateEmployee(employee.id);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
              >
                Reactivate Employee
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(employee);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Edit Details
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
