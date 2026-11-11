/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PMSProvider, usePMS } from './context/PMSContext';
import { RBACProvider } from './context/RBACContext';
import { Header } from './components/layout/Header';
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

const MainAppContent: React.FC<{ isDark: boolean; setIsDark: (val: boolean) => void }> = ({
  isDark,
  setIsDark,
}) => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const { toast } = usePMS();

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Bar Header */}
      <Header isDark={isDark} setIsDark={setIsDark} />

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
        <MainAppContent isDark={isDark} setIsDark={setIsDark} />
      </RBACProvider>
    </PMSProvider>
  );
}
