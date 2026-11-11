/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRBAC } from '../../context/RBACContext';
import { EmployeeRecord, EmploymentType } from '../../types/rbac';
import { X, User, Briefcase, Key, Shield, Check, AlertCircle } from 'lucide-react';

interface EmployeeRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeToEdit?: EmployeeRecord | null;
}

export const EmployeeRegistrationModal: React.FC<EmployeeRegistrationModalProps> = ({
  isOpen,
  onClose,
  employeeToEdit,
}) => {
  const {
    departments,
    jobPositions,
    employees,
    roles,
    addEmployee,
    updateEmployee,
    createAccount,
    inviteEmployee,
  } = useRBAC();

  const [activeStep, setActiveStep] = useState<'personal' | 'employment' | 'account'>('personal');

  // Form State
  const [firstName, setFirstName] = useState(employeeToEdit?.firstName || '');
  const [lastName, setLastName] = useState(employeeToEdit?.lastName || '');
  const [middleName, setMiddleName] = useState(employeeToEdit?.middleName || '');
  const [phone, setPhone] = useState(employeeToEdit?.phone || '');
  const [email, setEmail] = useState(employeeToEdit?.email || '');
  const [address, setAddress] = useState(employeeToEdit?.address || 'Victoria Island, Lagos');
  const [emergencyName, setEmergencyName] = useState(employeeToEdit?.emergencyContact.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(employeeToEdit?.emergencyContact.phone || '');
  const [emergencyRel, setEmergencyRel] = useState(employeeToEdit?.emergencyContact.relationship || 'Spouse');

  // Employment
  const [departmentId, setDepartmentId] = useState(employeeToEdit?.departmentId || departments[0]?.id || '');
  const [jobPositionId, setJobPositionId] = useState(employeeToEdit?.jobPositionId || jobPositions[0]?.id || '');
  const [employmentType, setEmploymentType] = useState<EmploymentType>(employeeToEdit?.employmentType || 'Full-time');
  const [salary, setSalary] = useState(employeeToEdit?.salary || 250000);
  const [hireDate, setHireDate] = useState(employeeToEdit?.hireDate || '2026-02-01');
  const [reportingManagerId, setReportingManagerId] = useState(employeeToEdit?.reportingManagerId || '');
  const [notes, setNotes] = useState(employeeToEdit?.notes || '');

  // System Account Option (only for new employees or editing without account)
  const [accountOption, setAccountOption] = useState<'none' | 'direct' | 'invite'>('none');
  const [username, setUsername] = useState('');
  const [tempPassword, setTempPassword] = useState('Welcome@2026');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(['role-receptionist']);
  const [deptScope, setDeptScope] = useState<'all' | 'custom'>('all');
  const [outletScope, setOutletScope] = useState<'all' | 'custom'>('all');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredPositions = jobPositions.filter((p) => !departmentId || p.departmentId === departmentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('First name and last name are required');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Phone number is required');
      return;
    }

    const dept = departments.find((d) => d.id === departmentId);
    const pos = jobPositions.find((p) => p.id === jobPositionId);
    const mgr = employees.find((e) => e.id === reportingManagerId);

    const avatarColors = [
      'bg-emerald-600',
      'bg-blue-600',
      'bg-indigo-600',
      'bg-purple-600',
      'bg-amber-600',
      'bg-rose-600',
      'bg-teal-600',
    ];
    const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    if (employeeToEdit) {
      updateEmployee(employeeToEdit.id, {
        firstName,
        lastName,
        middleName,
        fullName: `${firstName} ${lastName}`,
        phone,
        email,
        address,
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relationship: emergencyRel,
        },
        departmentId,
        departmentName: dept?.name || employeeToEdit.departmentName,
        jobPositionId,
        jobTitle: pos?.title || employeeToEdit.jobTitle,
        employmentType,
        salary: Number(salary),
        hireDate,
        reportingManagerId: reportingManagerId || undefined,
        reportingManagerName: mgr ? mgr.fullName : undefined,
        notes,
      });
      onClose();
    } else {
      // New employee
      const newEmp = addEmployee({
        firstName,
        lastName,
        middleName,
        fullName: `${firstName} ${lastName}`,
        phone,
        email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@grandvistahotel.com`,
        address,
        emergencyContact: {
          name: emergencyName || 'Emergency Contact',
          phone: emergencyPhone || phone,
          relationship: emergencyRel,
        },
        avatarColor: randomColor,
        departmentId,
        departmentName: dept?.name || 'Front Office',
        jobPositionId,
        jobTitle: pos?.title || 'Staff Officer',
        employmentType,
        employmentStatus: 'active',
        salary: Number(salary),
        hireDate,
        reportingManagerId: reportingManagerId || undefined,
        reportingManagerName: mgr ? mgr.fullName : undefined,
        notes,
      });

      // Handle account provisioning if requested
      if (accountOption === 'direct') {
        const uname = username.trim() || `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
        const accResult = createAccount({
          employeeId: newEmp.id,
          username: uname,
          email: newEmp.email,
          roleIds: selectedRoleIds,
          departmentAccessScope: deptScope,
          allowedDepartmentIds: deptScope === 'custom' ? [departmentId] : [],
          outletAccessScope: outletScope,
          allowedOutletIds: [],
          tempPassword: tempPassword || 'Welcome@2026',
        });
        if (!accResult.success) {
          setErrorMsg(`Employee created, but account failed: ${accResult.error}`);
          return;
        }
      } else if (accountOption === 'invite') {
        const invResult = inviteEmployee({
          employeeId: newEmp.id,
          email: newEmp.email,
          assignedRoleIds: selectedRoleIds,
        });
        if (!invResult.success) {
          setErrorMsg(`Employee created, but invitation failed: ${invResult.error}`);
          return;
        }
      }

      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {employeeToEdit ? 'Edit Employee Profile' : 'Register New Employee'}
            </h2>
            <p className="text-xs text-slate-500">
              {employeeToEdit
                ? `Update HR record for ${employeeToEdit.fullName} (${employeeToEdit.empNumber})`
                : 'Enter workforce details and optionally configure system login credentials'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation */}
        <div className="grid grid-cols-3 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveStep('personal')}
            className={`py-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeStep === 'personal'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <User className="w-4 h-4" />
            <span>1. Personal Info</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStep('employment')}
            className={`py-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeStep === 'employment'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>2. Employment</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStep('account')}
            className={`py-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeStep === 'account'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>3. System Access</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: Personal Info */}
            {activeStep === 'personal' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Adebayo"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      placeholder="e.g. Samuel"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Adeleke"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 802 345 6789"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="adebayo@grandvistahotel.com"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Residential Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 14 Adeola Odeku St, Victoria Island, Lagos"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Emergency Contact */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Emergency Contact
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="Contact Full Name"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                    <input
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="Emergency Phone"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                    <input
                      type="text"
                      value={emergencyRel}
                      onChange={(e) => setEmergencyRel(e.target.value)}
                      placeholder="Relationship (e.g. Spouse)"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Employment */}
            {activeStep === 'employment' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Department *
                    </label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.code} - {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Job Position *
                    </label>
                    <select
                      value={jobPositionId}
                      onChange={(e) => setJobPositionId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    >
                      {filteredPositions.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} (₦{p.minSalary.toLocaleString()} - ₦{p.maxSalary.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Employment Type
                    </label>
                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Trainee">Trainee / Intern</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Monthly Salary (₦ NGN) *
                    </label>
                    <input
                      type="number"
                      step={5000}
                      value={salary}
                      onChange={(e) => setSalary(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Hire Date
                    </label>
                    <input
                      type="date"
                      value={hireDate}
                      onChange={(e) => setHireDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reporting Manager
                  </label>
                  <select
                    value={reportingManagerId}
                    onChange={(e) => setReportingManagerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  >
                    <option value="">None / Direct to GM</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.fullName} — {e.jobTitle} ({e.departmentName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Internal Notes / Qualifications
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Certified hospitality supervisor, holds food safety certification"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: System Access */}
            {activeStep === 'account' && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 rounded-xl text-xs text-blue-800 dark:text-blue-300">
                  <p className="font-semibold mb-1">Enterprise Architecture Rule:</p>
                  <p>
                    Employees can exist without a login account (e.g. room attendants, kitchen stewards, gardeners).
                    Authentication credentials are kept separate from HR employee records.
                  </p>
                </div>

                {!employeeToEdit?.hasLoginAccount ? (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Account Provisioning Choice
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setAccountOption('none')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          accountOption === 'none'
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100">No Login Account</div>
                        <div className="text-[11px] text-slate-500 mt-1">HR record only. Staff does not use software.</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAccountOption('direct')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          accountOption === 'direct'
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Create Direct (Workflow A)</div>
                        <div className="text-[11px] text-slate-500 mt-1">Admin sets username & temporary password.</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAccountOption('invite')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          accountOption === 'invite'
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Send Invitation (Workflow B)</div>
                        <div className="text-[11px] text-slate-500 mt-1">Single-use activation token sent via email.</div>
                      </button>
                    </div>

                    {accountOption === 'direct' && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Username
                            </label>
                            <input
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              placeholder={firstName ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}` : 'username'}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Temporary Password
                            </label>
                            <input
                              type="text"
                              value={tempPassword}
                              onChange={(e) => setTempPassword(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Assign System Roles
                          </label>
                          <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
                            {roles.map((r) => {
                              const isChecked = selectedRoleIds.includes(r.id);
                              return (
                                <label
                                  key={r.id}
                                  className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      if (isChecked) {
                                        setSelectedRoleIds(selectedRoleIds.filter((id) => id !== r.id));
                                      } else {
                                        setSelectedRoleIds([...selectedRoleIds, r.id]);
                                      }
                                    }}
                                    className="rounded text-emerald-600 focus:ring-emerald-500"
                                  />
                                  <span>{r.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block font-semibold mb-1">Department Access Scope</label>
                            <select
                              value={deptScope}
                              onChange={(e) => setDeptScope(e.target.value as any)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                            >
                              <option value="all">Global (All 19 Departments)</option>
                              <option value="custom">Assigned Department Only</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-semibold mb-1">POS Outlet Access Scope</label>
                            <select
                              value={outletScope}
                              onChange={(e) => setOutletScope(e.target.value as any)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                            >
                              <option value="all">All Outlets</option>
                              <option value="custom">Restricted to Assigned Outlets</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {accountOption === 'invite' && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in">
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          An invitation email containing a secure 48-hour activation link will be prepared. The employee will choose their own password upon first access.
                        </p>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Assign Target Roles
                          </label>
                          <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
                            {roles.map((r) => {
                              const isChecked = selectedRoleIds.includes(r.id);
                              return (
                                <label
                                  key={r.id}
                                  className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      if (isChecked) {
                                        setSelectedRoleIds(selectedRoleIds.filter((id) => id !== r.id));
                                      } else {
                                        setSelectedRoleIds([...selectedRoleIds, r.id]);
                                      }
                                    }}
                                    className="rounded text-emerald-600 focus:ring-emerald-500"
                                  />
                                  <span>{r.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                    <p className="font-bold flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      Active User Account Linked
                    </p>
                    <p>
                      This employee already has a login account provisioned. Use the <strong>User Accounts</strong> module to modify passwords, suspend, or adjust granular permissions.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div>
              {activeStep !== 'personal' && (
                <button
                  type="button"
                  onClick={() => setActiveStep(activeStep === 'account' ? 'employment' : 'personal')}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Back
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              {activeStep !== 'account' ? (
                <button
                  type="button"
                  onClick={() => setActiveStep(activeStep === 'personal' ? 'employment' : 'account')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                >
                  {employeeToEdit ? 'Save Changes' : 'Register Employee'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
