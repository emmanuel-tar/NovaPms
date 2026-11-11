/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRBAC } from '../../context/RBACContext';
import { X, Mail, Send, CheckCircle2, Copy, Check, Clock, AlertCircle } from 'lucide-react';

interface InviteEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteEmployeeModal: React.FC<InviteEmployeeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    employees,
    roles,
    invitations,
    inviteEmployee,
    activateInvitedAccount,
  } = useRBAC();

  const unlinkedEmployees = employees.filter((e) => !e.hasLoginAccount && e.employmentStatus !== 'archived');

  const [selectedEmpId, setSelectedEmpId] = useState(unlinkedEmployees[0]?.id || '');
  const [email, setEmail] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(['role-receptionist']);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Success link preview
  const [generatedInvite, setGeneratedInvite] = useState<{ token: string; link: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [simPass, setSimPass] = useState('Password@2026!');
  const [simSuccess, setSimSuccess] = useState(false);

  if (!isOpen) return null;

  const handleEmpChange = (empId: string) => {
    setSelectedEmpId(empId);
    const emp = employees.find((e) => e.id === empId);
    if (emp) {
      setEmail(emp.email);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedEmpId) {
      setErrorMsg('Please select an employee');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Valid email address is required');
      return;
    }
    if (selectedRoleIds.length === 0) {
      setErrorMsg('Please select at least one role to grant');
      return;
    }

    const res = inviteEmployee({
      employeeId: selectedEmpId,
      email: email.trim(),
      assignedRoleIds: selectedRoleIds,
    });

    if (!res.success || !res.invitation) {
      setErrorMsg(res.error || 'Failed to dispatch invitation');
      return;
    }

    const inviteLink = `https://pms.grandvistahotel.com/activate?token=${res.invitation.token}`;
    setGeneratedInvite({ token: res.invitation.token, link: inviteLink });
  };

  const handleSimulateActivation = () => {
    if (!generatedInvite) return;
    const res = activateInvitedAccount(generatedInvite.token, simPass);
    if (res.success) {
      setSimSuccess(true);
    } else {
      setErrorMsg(res.error || 'Activation failed');
    }
  };

  const copyLink = () => {
    if (!generatedInvite) return;
    navigator.clipboard.writeText(generatedInvite.link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span>Invite Employee (Workflow B)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Generates a single-use token valid for 48 hours allowing the employee to establish their password.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!generatedInvite ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1">Select Employee *</label>
              <select
                value={selectedEmpId}
                onChange={(e) => handleEmpChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="">-- Choose employee --</option>
                {unlinkedEmployees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.empNumber} — {e.fullName} ({e.departmentName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Destination Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@grandvistahotel.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Target Roles *</label>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
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
                            if (selectedRoleIds.length === 1) return;
                            setSelectedRoleIds(selectedRoleIds.filter((id) => id !== r.id));
                          } else {
                            setSelectedRoleIds([...selectedRoleIds, r.id]);
                          }
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>{r.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={unlinkedEmployees.length === 0}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Invitation</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 space-y-2">
              <div className="font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Invitation Dispatched Successfully
              </div>
              <p>
                A secure 48-hour activation token has been created for <strong>{email}</strong>.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  readOnly
                  value={generatedInvite.link}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-blue-300 dark:border-blue-800 bg-white dark:bg-slate-900 text-[11px] font-mono text-slate-700 dark:text-slate-300"
                />
                <button
                  onClick={copyLink}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center gap-1"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* In-Browser Simulation for Hotel Admin / Testing */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50 dark:bg-slate-800/40 text-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300">
                Simulate Employee Activation Now:
              </div>
              {!simSuccess ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={simPass}
                      onChange={(e) => setSimPass(e.target.value)}
                      placeholder="Employee Chosen Password"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleSimulateActivation}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                    >
                      Complete Activation
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    This tests token redemption, password hashing, and active user record generation.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-lg font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Account activated! Employee can now log in.</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
