/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRBAC } from '../../context/RBACContext';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Calendar,
  Search,
  Filter,
  Check,
  Play,
  Square,
  Sun,
  Sunset,
  Moon,
  Briefcase,
} from 'lucide-react';

export const ShiftsAttendanceView: React.FC = () => {
  const {
    shifts,
    attendanceRecords,
    employees,
    clockIn,
    clockOut,
    approveAttendance,
  } = useRBAC();

  const [dateFilter, setDateFilter] = useState('2026-02-16');
  const [search, setSearch] = useState('');
  const [selectedShiftForClockIn, setSelectedShiftForClockIn] = useState('Morning (07:00 - 15:00)');
  const [selectedEmpForClockIn, setSelectedEmpForClockIn] = useState(employees[0]?.id || '');

  const filteredAttendance = attendanceRecords.filter((rec) => {
    const matchesDate = !dateFilter || rec.date === dateFilter;
    const matchesSearch =
      rec.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      rec.shiftName.toLowerCase().includes(search.toLowerCase());
    return matchesDate && matchesSearch;
  });

  const handleQuickClockIn = () => {
    if (!selectedEmpForClockIn) return;
    clockIn(selectedEmpForClockIn, selectedShiftForClockIn);
  };

  const handleQuickClockOut = () => {
    if (!selectedEmpForClockIn) return;
    clockOut(selectedEmpForClockIn);
  };

  return (
    <div className="space-y-6">
      {/* Shift Roster Configuration Cards */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Hotel Standard Operational Shifts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  {shift.name}
                </span>
                {shift.code === 'MORN' && <Sun className="w-4 h-4 text-amber-500" />}
                {shift.code === 'AFTN' && <Sunset className="w-4 h-4 text-orange-500" />}
                {shift.code === 'NIGHT' && <Moon className="w-4 h-4 text-indigo-500" />}
                {shift.code === 'GEN' && <Briefcase className="w-4 h-4 text-emerald-500" />}
              </div>
              <div className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {shift.startTime} – {shift.endTime}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{shift.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Clock-In / Clock-Out Station */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-emerald-50/40 dark:bg-emerald-950/20">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Shift Attendance Terminal</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate employee biometric or RFID badge clock-in and clock-out events.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedEmpForClockIn}
              onChange={(e) => setSelectedEmpForClockIn(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.empNumber} — {e.fullName} ({e.jobTitle})
                </option>
              ))}
            </select>

            <select
              value={selectedShiftForClockIn}
              onChange={(e) => setSelectedShiftForClockIn(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
            >
              {shifts.map((s) => (
                <option key={s.id} value={`${s.name} (${s.startTime} - ${s.endTime})`}>
                  {s.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleQuickClockIn}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Clock In</span>
            </button>

            <button
              onClick={handleQuickClockOut}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Clock Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Log Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search staff or shift..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
              />
            </div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium"
            />
          </div>

          <span className="text-xs text-slate-400">
            Showing {filteredAttendance.length} attendance records
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Shift</th>
                  <th className="py-3 px-4">Clock In / Out</th>
                  <th className="py-3 px-4">Late / Overtime</th>
                  <th className="py-3 px-4">Punctuality Status</th>
                  <th className="py-3 px-4">Supervisor Approval</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAttendance.map((rec) => (
                  <tr
                    key={rec.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {rec.employeeName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {rec.shiftName}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium">
                      <span className="text-emerald-600 dark:text-emerald-400">{rec.clockIn}</span>
                      <span className="text-slate-400 mx-1.5">→</span>
                      <span className={rec.clockOut ? 'text-slate-800 dark:text-slate-200' : 'text-amber-500'}>
                        {rec.clockOut || 'On Duty'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {rec.lateMinutes > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold font-mono">
                          +{rec.lateMinutes} min late
                        </span>
                      ) : rec.overtimeMinutes > 0 ? (
                        <span className="text-blue-600 dark:text-blue-400 font-semibold font-mono">
                          +{rec.overtimeMinutes} min OT
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          rec.status === 'on_time'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : rec.status === 'late'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {rec.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {rec.supervisorApproved ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approved by {rec.supervisorName || 'Supervisor'}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Pending sign-off</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {!rec.supervisorApproved && (
                        <button
                          onClick={() => approveAttendance(rec.id)}
                          className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Sign Off
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAttendance.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No attendance logs found for this date.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
