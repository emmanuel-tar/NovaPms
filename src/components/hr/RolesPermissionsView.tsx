/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useRBAC } from '../../context/RBACContext';
import { Role, Permission } from '../../types/rbac';
import {
  Shield,
  Plus,
  Copy,
  Edit2,
  Check,
  X,
  Search,
  Filter,
  Layers,
  Lock,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
} from 'lucide-react';

export const RolesPermissionsView: React.FC = () => {
  const {
    roles,
    permissions,
    addRole,
    updateRole,
    duplicateRole,
    archiveRole,
    userAccounts,
  } = useRBAC();

  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id || '');
  const [permissionSearch, setPermissionSearch] = useState('');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState('all');

  // Comparison Mode
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareRoleId, setCompareRoleId] = useState<string>(roles[1]?.id || roles[0]?.id || '');

  // Add/Edit Role Modal
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [modalRoleName, setModalRoleName] = useState('');
  const [modalRoleCode, setModalRoleCode] = useState('');
  const [modalRoleCategory, setModalRoleCategory] = useState('Front Office');
  const [modalRoleDescription, setModalRoleDescription] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  // Duplicate Role State
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicateTargetRole, setDuplicateTargetRole] = useState<Role | null>(null);
  const [newDuplicateName, setNewDuplicateName] = useState('');
  const [newDuplicateCode, setNewDuplicateCode] = useState('');

  const currentRole = roles.find((r) => r.id === selectedRoleId) || roles[0];
  const compareRole = roles.find((r) => r.id === compareRoleId) || roles[1];

  // Group permissions by module
  const moduleGroups = useMemo(() => {
    const map = new Map<string, Permission[]>();
    permissions.forEach((p) => {
      if (!map.has(p.module)) {
        map.set(p.module, []);
      }
      map.get(p.module)!.push(p);
    });
    return Array.from(map.entries()).map(([moduleName, perms]) => ({
      moduleName,
      permissions: perms,
    }));
  }, [permissions]);

  const allModules = useMemo(() => Array.from(new Set(permissions.map((p) => p.module))), [permissions]);

  const handleTogglePermission = (permissionId: string) => {
    if (!currentRole) return;
    if (currentRole.code === 'super_admin') return; // Cannot modify Super Admin base

    const exists = currentRole.permissionIds.includes(permissionId);
    const newPermIds = exists
      ? currentRole.permissionIds.filter((id) => id !== permissionId)
      : [...currentRole.permissionIds, permissionId];

    updateRole(currentRole.id, { permissionIds: newPermIds });
  };

  const handleSelectAllInModule = (perms: Permission[], select: boolean) => {
    if (!currentRole || currentRole.code === 'super_admin') return;
    const permIdsInModule = perms.map((p) => p.id);
    let newPermIds = [...currentRole.permissionIds];

    if (select) {
      permIdsInModule.forEach((id) => {
        if (!newPermIds.includes(id)) newPermIds.push(id);
      });
    } else {
      newPermIds = newPermIds.filter((id) => !permIdsInModule.includes(id));
    }

    updateRole(currentRole.id, { permissionIds: newPermIds });
  };

  const handleOpenAddRole = () => {
    setEditingRole(null);
    setModalRoleName('');
    setModalRoleCode('');
    setModalRoleCategory('Front Office');
    setModalRoleDescription('');
    setModalError(null);
    setIsRoleModalOpen(true);
  };

  const handleOpenDuplicate = (role: Role) => {
    setDuplicateTargetRole(role);
    setNewDuplicateName(`${role.name} (Custom Copy)`);
    setNewDuplicateCode(`${role.code}_copy`);
    setIsDuplicateModalOpen(true);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!modalRoleName.trim() || !modalRoleCode.trim()) {
      setModalError('Role name and code are required');
      return;
    }

    if (editingRole) {
      const res = updateRole(editingRole.id, {
        name: modalRoleName.trim(),
        code: modalRoleCode.trim().toLowerCase(),
        category: modalRoleCategory,
        description: modalRoleDescription.trim(),
      });
      if (!res.success) {
        setModalError(res.error || 'Failed to update role');
        return;
      }
    } else {
      const newRole = addRole({
        name: modalRoleName.trim(),
        code: modalRoleCode.trim().toLowerCase(),
        category: modalRoleCategory,
        description: modalRoleDescription.trim(),
        isArchived: false,
        permissionIds: [],
      });
      setSelectedRoleId(newRole.id);
    }

    setIsRoleModalOpen(false);
  };

  const handleConfirmDuplicate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!duplicateTargetRole || !newDuplicateCode || !newDuplicateName) return;

    const dup = duplicateRole(duplicateTargetRole.id, newDuplicateCode.trim().toLowerCase(), newDuplicateName.trim());
    setSelectedRoleId(dup.id);
    setIsDuplicateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Role Creator & Comparator */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCompareMode(!isCompareMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              isCompareMode
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>{isCompareMode ? 'Exit Comparison' : 'Compare 2 Roles'}</span>
          </button>
        </div>

        <button
          onClick={handleOpenAddRole}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create Custom Role</span>
        </button>
      </div>

      {/* Main Split: Left Role Picker, Right Permissions Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Roles Catalog */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Configured Roles ({roles.length})
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 space-y-1.5 max-h-[70vh] overflow-y-auto">
            {roles.map((role) => {
              const isSelected = role.id === selectedRoleId;
              const userCount = userAccounts.filter((u) => u.roleIds.includes(role.id)).length;

              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500 shadow-xs'
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {role.name}
                        </span>
                        {role.isSystem && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase border border-slate-200 dark:border-slate-700">
                            System
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {role.code} • {role.category}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDuplicate(role);
                        }}
                        title="Duplicate Role"
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>{role.permissionIds.length} Granular Permissions</span>
                    <span className="font-medium">{userCount} Active Users</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Permission Matrix or Comparator */}
        <div className="lg:col-span-8 space-y-4">
          {!isCompareMode ? (
            /* Single Role Inspector & Permission Assignment */
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
              {/* Active Role Banner */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {currentRole?.name}
                    </h3>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {currentRole?.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {currentRole?.description || 'Assign or revoke granular capabilities across hotel modules.'}
                  </p>
                </div>

                {currentRole?.code === 'super_admin' ? (
                  <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-purple-800 dark:text-purple-300 text-xs font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Protected Root: Grants all privileges unconditionally</span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {currentRole?.permissionIds.length}
                    </span>{' '}
                    / {permissions.length} Enabled
                  </div>
                )}
              </div>

              {/* Filter and Search within permissions */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={permissionSearch}
                    onChange={(e) => setPermissionSearch(e.target.value)}
                    placeholder="Search permissions (e.g. refund, rate, guest, pos)..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <select
                  value={selectedModuleFilter}
                  onChange={(e) => setSelectedModuleFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-medium"
                >
                  <option value="all">All Modules ({allModules.length})</option>
                  {allModules.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Modules Accordion / Matrix */}
              <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                {moduleGroups
                  .filter((group) => selectedModuleFilter === 'all' || group.moduleName === selectedModuleFilter)
                  .map((group) => {
                    const filteredPerms = group.permissions.filter((p) => {
                      const q = permissionSearch.toLowerCase();
                      return (
                        p.name.toLowerCase().includes(q) ||
                        p.code.toLowerCase().includes(q) ||
                        p.description.toLowerCase().includes(q)
                      );
                    });

                    if (filteredPerms.length === 0) return null;

                    const grantedCount = filteredPerms.filter((p) =>
                      currentRole?.permissionIds.includes(p.id) || currentRole?.code === 'super_admin'
                    ).length;

                    const isAllGranted = grantedCount === filteredPerms.length;

                    return (
                      <div
                        key={group.moduleName}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                              {group.moduleName}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                              {grantedCount} / {filteredPerms.length}
                            </span>
                          </div>

                          {currentRole?.code !== 'super_admin' && (
                            <div className="flex items-center gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() => handleSelectAllInModule(filteredPerms, true)}
                                className="text-[11px] font-semibold text-emerald-600 hover:underline"
                              >
                                Select All
                              </button>
                              <span className="text-slate-300">|</span>
                              <button
                                type="button"
                                onClick={() => handleSelectAllInModule(filteredPerms, false)}
                                className="text-[11px] font-semibold text-slate-500 hover:underline"
                              >
                                Clear
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {filteredPerms.map((perm) => {
                            const isGranted =
                              currentRole?.code === 'super_admin' ||
                              currentRole?.permissionIds.includes(perm.id);

                            return (
                              <label
                                key={perm.id}
                                className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                                  isGranted
                                    ? 'bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-800'
                                    : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-60'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  disabled={currentRole?.code === 'super_admin'}
                                  checked={isGranted}
                                  onChange={() => handleTogglePermission(perm.id)}
                                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 shrink-0"
                                />
                                <div>
                                  <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                    <span>{perm.name}</span>
                                    {perm.isSensitive && (
                                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold uppercase">
                                        Sensitive
                                      </span>
                                    )}
                                  </div>
                                  <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                                    {perm.code}
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    {perm.description}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            /* Role Comparator Mode */
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
                  <span>Side-by-Side Role Capability Comparator</span>
                </h3>

                <div className="flex items-center gap-3">
                  <select
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        Role A: {r.name}
                      </option>
                    ))}
                  </select>

                  <span className="text-xs font-bold text-slate-400">VS</span>

                  <select
                    value={compareRoleId}
                    onChange={(e) => setCompareRoleId(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        Role B: {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[60vh]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500">
                    <tr>
                      <th className="py-2.5 px-3">Permission Code & Name</th>
                      <th className="py-2.5 px-3 text-center">{currentRole?.name}</th>
                      <th className="py-2.5 px-3 text-center">{compareRole?.name}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {permissions.map((p) => {
                      const hasA = currentRole?.code === 'super_admin' || currentRole?.permissionIds.includes(p.id);
                      const hasB = compareRole?.code === 'super_admin' || compareRole?.permissionIds.includes(p.id);

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3">
                            <div className="font-semibold">{p.name}</div>
                            <div className="font-mono text-[10px] text-slate-400">{p.code}</div>
                          </td>
                          <td className="py-2 px-3 text-center">
                            {hasA ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                            ) : (
                              <X className="w-4 h-4 text-slate-300 inline" />
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {hasB ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                            ) : (
                              <X className="w-4 h-4 text-slate-300 inline" />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Role Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {editingRole ? 'Edit Role' : 'Create Custom Role'}
              </h3>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs">{modalError}</div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Role Code *</label>
                  <input
                    type="text"
                    required
                    value={modalRoleCode}
                    onChange={(e) => setModalRoleCode(e.target.value.toLowerCase())}
                    placeholder="e.g. night_auditor"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Role Name *</label>
                  <input
                    type="text"
                    required
                    value={modalRoleName}
                    onChange={(e) => setModalRoleName(e.target.value)}
                    placeholder="e.g. Night Auditor"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Functional Category</label>
                <select
                  value={modalRoleCategory}
                  onChange={(e) => setModalRoleCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                >
                  <option value="Administration">Administration</option>
                  <option value="Front Office">Front Office</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Housekeeping">Housekeeping</option>
                  <option value="Finance & Accounting">Finance & Accounting</option>
                  <option value="Inventory & Stores">Inventory & Stores</option>
                  <option value="Engineering & Maintenance">Engineering & Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={modalRoleDescription}
                  onChange={(e) => setModalRoleDescription(e.target.value)}
                  placeholder="Operational scope and primary responsibilities..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Save Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Duplicate Role Modal */}
      {isDuplicateModalOpen && duplicateTargetRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Copy className="w-4 h-4 text-emerald-600" />
                <span>Duplicate Role: {duplicateTargetRole.name}</span>
              </h3>
              <button onClick={() => setIsDuplicateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmDuplicate} className="p-6 space-y-4">
              <p className="text-xs text-slate-500">
                Creates a clone of this role containing all {duplicateTargetRole.permissionIds.length} granted permissions.
              </p>

              <div>
                <label className="block text-xs font-semibold mb-1">New Role Code *</label>
                <input
                  type="text"
                  required
                  value={newDuplicateCode}
                  onChange={(e) => setNewDuplicateCode(e.target.value.toLowerCase())}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">New Role Name *</label>
                <input
                  type="text"
                  required
                  value={newDuplicateName}
                  onChange={(e) => setNewDuplicateName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDuplicateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Duplicate Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
