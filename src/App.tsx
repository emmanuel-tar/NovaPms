/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PMSProvider, usePMS } from './context/PMSContext';
import { RBACProvider } from './context/RBACContext';
import { UITemplateProvider } from './context/UITemplateContext';
import { Header } from './components/layout/Header';
import { UITemplateModal } from './components/layout/UITemplateModal';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { RoleDashboard } from './components/dashboard/RoleDashboard';
import { RoomRack } from './components/frontdesk/RoomRack';
import { ReservationsList } from './components/frontdesk/ReservationsList';
import { GuestManagementView } from './components/guests/GuestManagementView';
import { RoomManagementView } from './components/rooms/RoomManagementView';
import { RestaurantPOS } from './components/pos/RestaurantPOS';
import { KDSView } from './components/kitchen/KDSView';
import { HousekeepingBoard } from './components/housekeeping/HousekeepingBoard';
import { LaundryView } from './components/services/LaundryView';
import { InventoryView } from './components/inventory/InventoryView';
import { FinanceView } from './components/finance/FinanceView';
import { WorkforceRBACHub } from './components/hr/WorkforceRBACHub';
import { TransportView } from './components/services/TransportView';
import { GymPoolView } from './components/services/GymPoolView';
import { MaintenanceView } from './components/maintenance/MaintenanceView';
import { ReportsAnalyticsView } from './components/reports/ReportsAnalyticsView';
import { SettingsView } from './components/settings/SettingsView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { NightAuditWizard } from './components/finance/NightAuditWizard';
import { ArchitectureViewer } from './components/architecture/ArchitectureViewer';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

import { CheckInModal } from './components/frontdesk/CheckInModal';
import { GuestFolioModal } from './components/frontdesk/GuestFolioModal';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { NotificationsCenter } from './components/common/NotificationsCenter';
import { QuickActionsModal } from './components/common/QuickActionsModal';
import { ShiftHandoverModal } from './components/frontdesk/ShiftHandoverModal';
import { SystemPerformanceModal } from './components/common/SystemPerformanceModal';
import { KeyboardShortcutsModal } from './components/common/KeyboardShortcutsModal';
import { useRBAC } from './context/RBACContext';

const MainAppContent: React.FC<{ isDark: boolean; setIsDark: (val: boolean) => void }> = ({
  isDark,
  setIsDark,
}) => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const { toast, stays, rooms, kitchenTickets, inventory, businessDate } = usePMS();
  const { approvalRequests, leaveRequests } = useRBAC();

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [quickActionDefault, setQuickActionDefault] = useState<'walkin' | 'postcharge' | 'roomstatus' | 'booking'>('walkin');
  const [isShiftHandoverOpen, setIsShiftHandoverOpen] = useState(false);
  const [isPerformanceOpen, setIsPerformanceOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [activeFolioStayId, setActiveFolioStayId] = useState<string | null>(null);
  const [checkInRoomId, setCheckInRoomId] = useState<string | null>(null);

  // Calculate live operational alerts count
  const todayCheckoutsCount = stays.filter(
    (s) => s.status === 'active' && s.checkOutDate <= businessDate
  ).length;
  const pendingKdsCount = kitchenTickets.filter((t) => t.status === 'pending').length;
  const lowStockCount = inventory.filter(
    (i) => Object.values(i.storeStocks).reduce((a, b) => a + b, 0) <= i.reorderLevel
  ).length;
  const pendingApprovalsCount = approvalRequests.filter((a) => a.status === 'pending').length;
  const totalNotificationCount =
    todayCheckoutsCount + pendingKdsCount + lowStockCount + pendingApprovalsCount;

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + K or Cmd + K -> Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

      // '?' -> Keyboard Help (when not typing in an input)
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT';

      if (e.key === '?' && !isInput) {
        e.preventDefault();
        setIsShortcutsOpen(true);
        return;
      }

      // Alt shortcuts
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          setQuickActionDefault('walkin');
          setIsQuickActionsOpen(true);
        } else if (e.key.toLowerCase() === 'c') {
          e.preventDefault();
          setQuickActionDefault('postcharge');
          setIsQuickActionsOpen(true);
        } else if (e.key.toLowerCase() === 's') {
          e.preventDefault();
          setQuickActionDefault('roomstatus');
          setIsQuickActionsOpen(true);
        } else if (e.key.toLowerCase() === 'h') {
          e.preventDefault();
          setIsShiftHandoverOpen(true);
        } else if (e.key.toLowerCase() === 'p') {
          e.preventDefault();
          setIsPerformanceOpen(true);
        } else if (e.key === '1') {
          e.preventDefault();
          setActiveTab('dashboard');
        } else if (e.key === '2') {
          e.preventDefault();
          setActiveTab('frontdesk');
        } else if (e.key === '3') {
          e.preventDefault();
          setActiveTab('reservations');
        } else if (e.key === '4') {
          e.preventDefault();
          setActiveTab('guests');
        } else if (e.key === '5') {
          e.preventDefault();
          setActiveTab('pos');
        } else if (e.key === '6') {
          e.preventDefault();
          setActiveTab('kitchen');
        } else if (e.key === '7') {
          e.preventDefault();
          setActiveTab('housekeeping');
        } else if (e.key === '8') {
          e.preventDefault();
          setActiveTab('finance');
        } else if (e.key === '9') {
          e.preventDefault();
          setActiveTab('hr');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectedFolioStay = activeFolioStayId
    ? stays.find((s) => s.id === activeFolioStayId)
    : null;

  const selectedCheckInRoom = checkInRoomId
    ? rooms.find((r) => r.id === checkInRoomId)
    : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Bar Header with live telemetry and operational fast actions */}
      <Header
        isDark={isDark}
        setIsDark={setIsDark}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenQuickActions={() => {
          setQuickActionDefault('walkin');
          setIsQuickActionsOpen(true);
        }}
        onOpenShiftHandover={() => setIsShiftHandoverOpen(true)}
        onOpenPerformance={() => setIsPerformanceOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        notificationCount={totalNotificationCount}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Operational Sidebar with 18 Departments */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Content Viewport */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* 1. Dashboard */}
          {activeTab === 'dashboard' && <RoleDashboard onNavigate={(tab: any) => setActiveTab(tab)} />}

          {/* 2. Front Office */}
          {activeTab === 'frontdesk' && <RoomRack />}

          {/* 3. Reservations */}
          {activeTab === 'reservations' && <ReservationsList />}

          {/* 4. Guest Management */}
          {activeTab === 'guests' && <GuestManagementView />}

          {/* 5. Room Management */}
          {activeTab === 'rooms' && <RoomManagementView />}

          {/* 6. Point of Sale */}
          {activeTab === 'pos' && <RestaurantPOS />}

          {/* 7. Kitchen Management */}
          {activeTab === 'kitchen' && <KDSView />}

          {/* 8. Housekeeping */}
          {activeTab === 'housekeeping' && <HousekeepingBoard />}

          {/* 9. Laundry */}
          {activeTab === 'laundry' && <LaundryView />}

          {/* 10. Inventory and Procurement */}
          {activeTab === 'inventory' && <InventoryView />}

          {/* 11. Finance and Accounting */}
          {activeTab === 'finance' && <FinanceView />}

          {/* 12. Human Resources & Enterprise RBAC */}
          {activeTab === 'hr' && <WorkforceRBACHub />}

          {/* 13. Transport Management */}
          {activeTab === 'transport' && <TransportView />}

          {/* 14. Gym and Recreational Facilities */}
          {activeTab === 'facilities' && <GymPoolView />}

          {/* 15. Maintenance */}
          {activeTab === 'maintenance' && <MaintenanceView />}

          {/* 16. Reports and Analytics */}
          {activeTab === 'reports' && <ReportsAnalyticsView />}

          {/* 17. Settings */}
          {activeTab === 'settings' && <SettingsView />}

          {/* 18. Audit Logs */}
          {activeTab === 'audit' && <AuditLogsView />}

          {/* Additional Operational Views */}
          {activeTab === 'nightaudit' && <NightAuditWizard />}
          {activeTab === 'architecture' && <ArchitectureViewer />}
        </main>
      </div>

      {/* Global Modals & Speed Optimizers */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(tab) => setActiveTab(tab)}
        onOpenFolio={(stayId) => setActiveFolioStayId(stayId)}
        onOpenCheckIn={(roomId) => setCheckInRoomId(roomId || null)}
      />

      <NotificationsCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigate={(tab) => setActiveTab(tab)}
        onOpenFolio={(stayId) => setActiveFolioStayId(stayId)}
      />

      <QuickActionsModal
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
        defaultAction={quickActionDefault}
      />

      <ShiftHandoverModal
        isOpen={isShiftHandoverOpen}
        onClose={() => setIsShiftHandoverOpen(false)}
      />

      <SystemPerformanceModal
        isOpen={isPerformanceOpen}
        onClose={() => setIsPerformanceOpen(false)}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {selectedFolioStay && (
        <GuestFolioModal
          stay={selectedFolioStay}
          onClose={() => setActiveFolioStayId(null)}
        />
      )}

      {checkInRoomId && (
        <CheckInModal
          initialRoom={selectedCheckInRoom}
          onClose={() => setCheckInRoomId(null)}
        />
      )}

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-medium border border-slate-700 dark:border-slate-200 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
          {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
          <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <PMSProvider>
      <RBACProvider>
        <UITemplateProvider>
          <MainAppContent isDark={isDark} setIsDark={setIsDark} />
          <UITemplateModal />
        </UITemplateProvider>
      </RBACProvider>
    </PMSProvider>
  );
}
