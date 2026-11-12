/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { usePMS } from '../../context/PMSContext';
import { useRBAC } from '../../context/RBACContext';
import { NavTab } from '../layout/Sidebar';
import {
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle2,
  UtensilsCrossed,
  Sparkles,
  Boxes,
  ShieldAlert,
  ArrowRight,
  BedDouble,
  X,
} from 'lucide-react';

interface NotificationsCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab) => void;
  onOpenFolio?: (stayId: string) => void;
}

export const NotificationsCenter: React.FC<NotificationsCenterProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenFolio,
}) => {
  const {
    stays,
    rooms,
    kitchenTickets,
    housekeepingTasks,
    inventory,
    businessDate,
    folioTransactions,
    folioPayments,
    formatMoney,
  } = usePMS();

  const { approvalRequests, leaveRequests } = useRBAC();
  const [filter, setFilter] = useState<'all' | 'urgent' | 'operations' | 'rbac'>('all');
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  // Compute live operational alerts from hotel state
  const liveAlerts = useMemo(() => {
    const alerts: {
      id: string;
      title: string;
      description: string;
      severity: 'urgent' | 'warning' | 'info';
      category: 'operations' | 'finance' | 'rbac' | 'urgent';
      timestamp: string;
      actionLabel: string;
      action: () => void;
    }[] = [];

    // 1. Pending Checkouts Today
    const todayCheckouts = stays.filter(
      (s) => s.status === 'active' && s.checkOutDate <= businessDate
    );
    todayCheckouts.forEach((s) => {
      const charges = folioTransactions
        .filter((t) => t.stayId === s.id && t.status === 'posted')
        .reduce((sum, t) => sum + t.totalAmount, 0);
      const payments = folioPayments
        .filter((p) => p.stayId === s.id)
        .reduce((sum, p) => sum + p.amount, 0) + s.depositAmount;
      const folioBal = charges - payments;

      alerts.push({
        id: `checkout-${s.id}`,
        title: `Departure Due: Room ${s.roomNumber} (${s.guestName})`,
        description: `Scheduled check-out is today. Folio balance: ${formatMoney(folioBal)}`,
        severity: folioBal > 0 ? 'urgent' : 'warning',
        category: 'operations',
        timestamp: 'Today · 12:00 PM standard',
        actionLabel: 'Settle Folio',
        action: () => {
          if (onOpenFolio) onOpenFolio(s.id);
          else onNavigate('frontdesk');
          onClose();
        },
      });
    });

    // 2. Kitchen Tickets Pending
    const pendingTickets = kitchenTickets.filter((t) => t.status === 'pending');
    if (pendingTickets.length > 0) {
      alerts.push({
        id: 'kds-pending-alert',
        title: `${pendingTickets.length} Kitchen Orders Awaiting Preparation`,
        description: `Active dining/room service orders requiring cook attention in KDS line.`,
        severity: 'urgent',
        category: 'operations',
        timestamp: 'Live Kitchen Alert',
        actionLabel: 'Open KDS',
        action: () => {
          onNavigate('kitchen');
          onClose();
        },
      });
    }

    // 3. Low Inventory Alerts
    const lowStockItems = inventory.filter((i) => {
      const total = Object.values(i.storeStocks).reduce((a, b) => a + b, 0);
      return total <= i.reorderLevel;
    });
    lowStockItems.slice(0, 3).forEach((item) => {
      const total = Object.values(item.storeStocks).reduce((a, b) => a + b, 0);
      alerts.push({
        id: `inv-${item.id}`,
        title: `Low Stock Alert: ${item.name}`,
        description: `Current quantity: ${total} ${item.unit} (Minimum reorder: ${item.reorderLevel}).`,
        severity: 'warning',
        category: 'operations',
        timestamp: 'Inventory Monitor',
        actionLabel: 'View Stores',
        action: () => {
          onNavigate('inventory');
          onClose();
        },
      });
    });

    // 4. Dirty Rooms pending Housekeeping inspection
    const dirtyRoomsCount = rooms.filter((r) => r.status === 'dirty').length;
    if (dirtyRoomsCount > 0) {
      alerts.push({
        id: 'hk-dirty-rooms',
        title: `${dirtyRoomsCount} Rooms Flagged Dirty / Awaiting Turnover`,
        description: `Housekeeping attendants have turnover assignments pending completion.`,
        severity: 'info',
        category: 'operations',
        timestamp: 'Housekeeping Desk',
        actionLabel: 'Housekeeping Board',
        action: () => {
          onNavigate('housekeeping');
          onClose();
        },
      });
    }

    // 5. Pending RBAC Financial Approvals
    const pendingApprovals = approvalRequests.filter((a) => a.status === 'pending');
    pendingApprovals.forEach((req) => {
      alerts.push({
        id: `rbac-app-${req.id}`,
        title: `Financial Approval Request: ${req.transactionType.toUpperCase()}`,
        description: `Requested by ${req.requestedByUserName} (Amount: ₦${req.amount?.toLocaleString() || 'N/A'}). Justification: ${req.justification}`,
        severity: 'urgent',
        category: 'rbac',
        timestamp: 'RBAC Authorization',
        actionLabel: 'Review Request',
        action: () => {
          onNavigate('hr');
          onClose();
        },
      });
    });

    // 6. Pending Employee Leave Requests
    const pendingLeave = leaveRequests.filter((l) => l.status === 'pending');
    if (pendingLeave.length > 0) {
      alerts.push({
        id: 'leave-pending-alert',
        title: `${pendingLeave.length} Staff Leave Applications Pending`,
        description: `Employee leave applications require managerial sign-off.`,
        severity: 'info',
        category: 'rbac',
        timestamp: 'Human Resources',
        actionLabel: 'Manage Leaves',
        action: () => {
          onNavigate('hr');
          onClose();
        },
      });
    }

    return alerts.filter((a) => !dismissedIds.includes(a.id));
  }, [
    stays,
    rooms,
    kitchenTickets,
    inventory,
    approvalRequests,
    leaveRequests,
    businessDate,
    dismissedIds,
    onNavigate,
    onOpenFolio,
    onClose,
  ]);

  const filteredAlerts = useMemo(() => {
    if (filter === 'all') return liveAlerts;
    if (filter === 'urgent') return liveAlerts.filter((a) => a.severity === 'urgent');
    return liveAlerts.filter((a) => a.category === filter);
  }, [liveAlerts, filter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-lg">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Operational Alert Center
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {liveAlerts.length} active operational notifications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            All ({liveAlerts.length})
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              filter === 'urgent'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Urgent ({liveAlerts.filter((a) => a.severity === 'urgent').length})
          </button>
          <button
            onClick={() => setFilter('operations')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              filter === 'operations'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Operations
          </button>
          <button
            onClick={() => setFilter('rbac')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              filter === 'rbac'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Approvals
          </button>
        </div>

        {/* Alert List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredAlerts.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-80" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                All clear! No pending alerts
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Hotel operations, kitchen tickets, and approval queues are up to date.
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  alert.severity === 'urgent'
                    ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                    : alert.severity === 'warning'
                    ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {alert.severity === 'urgent' && (
                      <span className="p-1 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/80 dark:text-rose-300">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {alert.severity === 'warning' && (
                      <span className="p-1 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300">
                        <Clock className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {alert.severity === 'info' && (
                      <span className="p-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300">
                        <Bell className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {alert.title}
                    </h4>
                  </div>
                  <button
                    onClick={() => setDismissedIds((prev) => [...prev, alert.id])}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    title="Dismiss alert"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {alert.description}
                </p>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {alert.timestamp}
                  </span>
                  <button
                    onClick={alert.action}
                    className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {alert.actionLabel}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Clear All Footer */}
        {filteredAlerts.length > 0 && (
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-[11px] text-slate-400">
              Auto-refreshes every state change
            </span>
            <button
              onClick={() => setDismissedIds(liveAlerts.map((a) => a.id))}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            >
              Dismiss all
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
