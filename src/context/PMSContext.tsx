/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState } from 'react';
import {
  Room,
  RoomCategoryConfig,
  Building,
  GuestProfile,
  Stay,
  FolioTransaction,
  FolioPayment,
  Reservation,
  MenuItem,
  KitchenTicket,
  HousekeepingTask,
  LostAndFoundItem,
  LaundryOrder,
  FacilityPass,
  TransportTrip,
  InventoryItem,
  StockMovement,
  PurchaseOrder,
  MaintenanceRequest,
  CorporateAccount,
  AccountLedgerEntry,
  Employee,
  AuditLog,
  NightAuditRun,
  HotelSettings,
  DepartmentSource,
  RoomStatus,
  KitchenStation,
  StoreLocation,
} from '../types/pms';
import {
  INITIAL_HOTEL_SETTINGS,
  INITIAL_BUILDINGS,
  INITIAL_ROOM_CATEGORIES,
  INITIAL_ROOMS,
  INITIAL_GUESTS,
  INITIAL_STAYS,
  INITIAL_FOLIO_TRANSACTIONS,
  INITIAL_FOLIO_PAYMENTS,
  INITIAL_RESERVATIONS,
  INITIAL_MENU_ITEMS,
  INITIAL_KITCHEN_TICKETS,
  INITIAL_HOUSEKEEPING_TASKS,
  INITIAL_LOST_AND_FOUND,
  INITIAL_LAUNDRY_ORDERS,
  INITIAL_FACILITY_PASSES,
  INITIAL_TRANSPORT_TRIPS,
  INITIAL_INVENTORY,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_MAINTENANCE_REQUESTS,
  INITIAL_CORPORATE_ACCOUNTS,
  INITIAL_CHART_OF_ACCOUNTS,
  INITIAL_EMPLOYEES,
  INITIAL_AUDIT_LOGS,
  INITIAL_NIGHT_AUDIT_LOG,
} from '../data/initialData';

interface Toast {
  id: string;
  text: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface PMSContextType {
  // Global State
  hotelSettings: HotelSettings;
  buildings: Building[];
  roomCategories: RoomCategoryConfig[];
  rooms: Room[];
  guests: GuestProfile[];
  stays: Stay[];
  folioTransactions: FolioTransaction[];
  folioPayments: FolioPayment[];
  reservations: Reservation[];
  menuItems: MenuItem[];
  kitchenTickets: KitchenTicket[];
  housekeepingTasks: HousekeepingTask[];
  lostAndFound: LostAndFoundItem[];
  laundryOrders: LaundryOrder[];
  facilityPasses: FacilityPass[];
  transportTrips: TransportTrip[];
  inventory: InventoryItem[];
  stockMovements: StockMovement[];
  purchaseOrders: PurchaseOrder[];
  maintenanceRequests: MaintenanceRequest[];
  corporateAccounts: CorporateAccount[];
  chartOfAccounts: AccountLedgerEntry[];
  employees: Employee[];
  currentEmployee: Employee;
  auditLogs: AuditLog[];
  businessDate: string;
  currency: 'NGN' | 'USD';
  exchangeRate: number;
  nightAuditLog: NightAuditRun[];
  toast: Toast | null;

  // Formatting & UI
  formatMoney: (amount: number) => string;
  setCurrentEmployee: (emp: Employee) => void;
  setCurrency: (curr: 'NGN' | 'USD') => void;
  showToast: (text: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  updateHotelSettings: (settings: Partial<HotelSettings>) => void;

  // Front Office & Central Folio
  postChargeToRoom: (
    stayId: string,
    department: DepartmentSource,
    description: string,
    quantity: number,
    unitPrice: number,
    discount?: number,
    sourceOrderId?: string
  ) => FolioTransaction | null;
  reverseFolioCharge: (txId: string, reason: string) => void;
  addPaymentToFolio: (
    stayId: string,
    amount: number,
    method: 'cash' | 'pos_card' | 'bank_transfer' | 'corporate_credit',
    reference?: string,
    corporateAccountId?: string
  ) => void;
  checkInGuest: (params: {
    guestName: string;
    guestPhone: string;
    guestEmail?: string;
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    children: number;
    depositAmount: number;
    notes?: string;
  }) => Stay | null;
  checkOutGuest: (stayId: string) => void;
  updateRoomStatus: (roomId: string, newStatus: RoomStatus, reason?: string) => void;

  // Room Management
  addRoomCategory: (cat: RoomCategoryConfig) => void;
  updateRoomCategory: (id: string, updates: Partial<RoomCategoryConfig>) => void;
  deleteRoomCategory: (id: string) => void;

  // Guest Management (CRM)
  addGuestProfile: (guest: Omit<GuestProfile, 'id' | 'guestCode' | 'createdAt'>) => GuestProfile;
  updateGuestProfile: (id: string, updates: Partial<GuestProfile>) => void;

  // Reservations
  createReservation: (res: Omit<Reservation, 'id' | 'bookingCode' | 'createdAt'>) => Reservation;
  updateReservationStatus: (id: string, status: Reservation['status']) => void;

  // POS & KDS
  createPOSOrder: (params: {
    outletId: string;
    outletName: string;
    orderType: 'dine_in' | 'takeaway' | 'room_service';
    tableOrRoom: string;
    stayId?: string;
    roomId?: string;
    guestName?: string;
    items: { item: MenuItem; quantity: number; notes?: string }[];
    paymentMethod: 'room_charge' | 'cash' | 'pos_card' | 'bank_transfer' | 'split';
  }) => { success: boolean; message: string };
  updateKitchenTicketStatus: (
    ticketId: string,
    newStatus: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled'
  ) => void;

  // Housekeeping & Lost & Found
  updateHousekeepingStatus: (
    taskId: string,
    newStatus: 'pending' | 'in_progress' | 'completed' | 'inspected'
  ) => void;
  postMinibarCharges: (roomId: string, items: { name: string; qty: number; price: number }[]) => void;
  addLostAndFoundItem: (item: Omit<LostAndFoundItem, 'id' | 'itemCode'>) => void;
  claimLostAndFoundItem: (id: string, claimedBy: string) => void;

  // Services
  createLaundryOrder: (order: Parameters<any>[0]) => void;
  createFacilityPass: (pass: Parameters<any>[0]) => void;
  createTransportTrip: (trip: Parameters<any>[0]) => void;

  // Inventory & Procurement
  transferStock: (params: {
    itemId: string;
    toStore: StoreLocation;
    quantity: number;
    notes: string;
  }) => void;
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'poNumber'>) => void;
  approvePurchaseOrder: (id: string) => void;

  // Maintenance
  createMaintenanceRequest: (req: Parameters<any>[0]) => void;
  resolveMaintenanceRequest: (id: string) => void;

  // HR & Employees
  addEmployee: (emp: Omit<Employee, 'id' | 'empNumber'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;

  // Finance & Accounting
  postJournalEntry: (entry: Omit<AccountLedgerEntry, 'id'>) => void;
  runNightAudit: () => { success: boolean; newAudit: NightAuditRun };
}

const PMSContext = createContext<PMSContextType | undefined>(undefined);

export const PMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hotelSettings, setHotelSettings] = useState<HotelSettings>(INITIAL_HOTEL_SETTINGS);
  const [buildings] = useState<Building[]>(INITIAL_BUILDINGS);
  const [roomCategories, setRoomCategories] = useState<RoomCategoryConfig[]>(INITIAL_ROOM_CATEGORIES);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [guests, setGuests] = useState<GuestProfile[]>(INITIAL_GUESTS);
  const [stays, setStays] = useState<Stay[]>(INITIAL_STAYS);
  const [folioTransactions, setFolioTransactions] = useState<FolioTransaction[]>(INITIAL_FOLIO_TRANSACTIONS);
  const [folioPayments, setFolioPayments] = useState<FolioPayment[]>(INITIAL_FOLIO_PAYMENTS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [kitchenTickets, setKitchenTickets] = useState<KitchenTicket[]>(INITIAL_KITCHEN_TICKETS);
  const [housekeepingTasks, setHousekeepingTasks] = useState<HousekeepingTask[]>(INITIAL_HOUSEKEEPING_TASKS);
  const [lostAndFound, setLostAndFound] = useState<LostAndFoundItem[]>(INITIAL_LOST_AND_FOUND);
  const [laundryOrders, setLaundryOrders] = useState<LaundryOrder[]>(INITIAL_LAUNDRY_ORDERS);
  const [facilityPasses, setFacilityPasses] = useState<FacilityPass[]>(INITIAL_FACILITY_PASSES);
  const [transportTrips, setTransportTrips] = useState<TransportTrip[]>(INITIAL_TRANSPORT_TRIPS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(INITIAL_STOCK_MOVEMENTS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>(INITIAL_MAINTENANCE_REQUESTS);
  const [corporateAccounts, setCorporateAccounts] = useState<CorporateAccount[]>(INITIAL_CORPORATE_ACCOUNTS);
  const [chartOfAccounts, setChartOfAccounts] = useState<AccountLedgerEntry[]>(INITIAL_CHART_OF_ACCOUNTS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [currentEmployee, setCurrentEmployee] = useState<Employee>(INITIAL_EMPLOYEES[0]); // General Manager
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [businessDate, setBusinessDate] = useState<string>('2026-11-11');
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [exchangeRate] = useState<number>(1550);
  const [nightAuditLog, setNightAuditLog] = useState<NightAuditRun[]>(INITIAL_NIGHT_AUDIT_LOG);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, text, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 4500);
  };

  const logAudit = (
    category: AuditLog['category'],
    action: string,
    details: string,
    severity: AuditLog['severity'] = 'info'
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      logCode: `AUD-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: `${businessDate} ${new Date().toLocaleTimeString('en-GB')}`,
      userName: currentEmployee.name,
      userRole: currentEmployee.title,
      category,
      action,
      details,
      ipAddress: '192.168.1.15 (LAN Host)',
      severity,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const formatMoney = (amountInNgn: number): string => {
    if (currency === 'USD') {
      const usdVal = amountInNgn / exchangeRate;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(usdVal);
    }
    return '₦' + new Intl.NumberFormat('en-NG').format(Math.round(amountInNgn));
  };

  const updateHotelSettings = (settings: Partial<HotelSettings>) => {
    setHotelSettings((prev) => ({ ...prev, ...settings }));
    logAudit('CONFIG', 'UPDATE_HOTEL_SETTINGS', 'Updated property configuration and tax parameters.');
    showToast('Hotel settings updated successfully.');
  };

  // Central Charge Engine
  const postChargeToRoom = (
    stayId: string,
    department: DepartmentSource,
    description: string,
    quantity: number,
    unitPrice: number,
    discount: number = 0,
    sourceOrderId?: string
  ): FolioTransaction | null => {
    const stay = stays.find((s) => s.id === stayId && s.status === 'active');
    if (!stay) {
      showToast('Cannot post charge: Active stay not found for room.', 'error');
      return null;
    }

    const gross = quantity * unitPrice - discount;
    const vatRate = hotelSettings.vatRate;
    const serviceChargeRate = hotelSettings.serviceChargeRate;
    const taxAmount = gross * (vatRate + serviceChargeRate);
    const netTotal = gross + taxAmount;

    const newTx: FolioTransaction = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      stayId: stay.id,
      roomId: stay.roomId,
      roomNumber: stay.roomNumber,
      guestName: stay.guestName,
      department,
      sourceOrderId,
      description,
      quantity,
      unitPrice,
      discount,
      vatRate,
      serviceChargeRate,
      taxAmount,
      totalAmount: netTotal,
      status: 'posted',
      createdAt: `${businessDate} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
      postedBy: currentEmployee.name,
    };

    setFolioTransactions((prev) => [newTx, ...prev]);

    logAudit(
      'FOLIO_CHARGE',
      'POST_ROOM_CHARGE',
      `Posted ${formatMoney(netTotal)} (${department}) to Room ${stay.roomNumber} - ${stay.guestName}. Ref: ${description}`
    );

    showToast(`Posted ${formatMoney(netTotal)} (${department}) to Room ${stay.roomNumber} - ${stay.guestName}`);
    return newTx;
  };

  const reverseFolioCharge = (txId: string, reason: string) => {
    const tx = folioTransactions.find((t) => t.id === txId);
    if (!tx || tx.status !== 'posted') return;

    setFolioTransactions((prev) =>
      prev.map((t) =>
        t.id === txId
          ? {
              ...t,
              status: 'reversed',
              reversalReason: reason,
            }
          : t
      )
    );

    logAudit(
      'FINANCE',
      'REVERSE_FOLIO_CHARGE',
      `Reversed charge of ${formatMoney(tx.totalAmount)} on Room ${tx.roomNumber}. Reason: ${reason}`,
      'warning'
    );
    showToast(`Reversed charge of ${formatMoney(tx.totalAmount)} on Room ${tx.roomNumber}`);
  };

  const addPaymentToFolio = (
    stayId: string,
    amount: number,
    method: 'cash' | 'pos_card' | 'bank_transfer' | 'corporate_credit',
    reference?: string,
    corporateAccountId?: string
  ) => {
    const stay = stays.find((s) => s.id === stayId);
    const receiptNumber = `RCP-${businessDate.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayment: FolioPayment = {
      id: `pay-${Date.now()}`,
      stayId,
      amount,
      paymentMethod: method,
      reference: reference || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      corporateAccountId,
      receiptNumber,
      createdAt: `${businessDate} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
      receivedBy: currentEmployee.name,
    };

    setFolioPayments((prev) => [newPayment, ...prev]);

    if (method === 'corporate_credit' && corporateAccountId) {
      setCorporateAccounts((prev) =>
        prev.map((c) => (c.id === corporateAccountId ? { ...c, currentBalance: c.currentBalance + amount } : c))
      );
    }

    logAudit(
      'FINANCE',
      'RECEIVE_PAYMENT',
      `Payment of ${formatMoney(amount)} received via ${method.toUpperCase()} for Room ${stay?.roomNumber || 'Folio'}. Receipt: ${receiptNumber}`
    );

    showToast(`Received payment of ${formatMoney(amount)} (${method.toUpperCase()}). Receipt #${receiptNumber}`);
  };

  const checkInGuest = (params: {
    guestName: string;
    guestPhone: string;
    guestEmail?: string;
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    children: number;
    depositAmount: number;
    notes?: string;
  }): Stay | null => {
    const targetRoom = rooms.find((r) => r.id === params.roomId);
    if (!targetRoom) {
      showToast('Room not found', 'error');
      return null;
    }
    if (targetRoom.status === 'occupied') {
      showToast(`Room ${targetRoom.number} is already occupied!`, 'error');
      return null;
    }
    if (targetRoom.status === 'out_of_order') {
      showToast(`Room ${targetRoom.number} is Out of Order for maintenance!`, 'error');
      return null;
    }

    // Match or create guest profile in CRM
    let guest = guests.find((g) => g.phone === params.guestPhone || g.name.toLowerCase() === params.guestName.toLowerCase());
    let guestId = guest?.id;
    if (!guest) {
      const newGuestProfile: GuestProfile = {
        id: `guest-${Date.now()}`,
        guestCode: `GV-GST-${Math.floor(1000 + Math.random() * 9000)}`,
        name: params.guestName,
        phone: params.guestPhone,
        email: params.guestEmail || '',
        idType: 'National ID',
        idNumber: 'PENDING-VERIFY',
        nationality: 'Nigerian',
        address: 'Lagos, Nigeria',
        emergencyContact: { name: 'Emergency Contact', phone: params.guestPhone, relationship: 'Family' },
        vipLevel: 'Standard',
        loyaltyPoints: 100,
        preferences: ['Quiet room'],
        totalStays: 1,
        lifetimeSpend: params.depositAmount,
        outstandingBalance: 0,
        createdAt: businessDate,
      };
      setGuests((prev) => [newGuestProfile, ...prev]);
      guestId = newGuestProfile.id;
    } else {
      setGuests((prev) =>
        prev.map((g) =>
          g.id === guest!.id
            ? {
                ...g,
                totalStays: g.totalStays + 1,
                loyaltyPoints: g.loyaltyPoints + 150,
              }
            : g
        )
      );
    }

    const newStayId = `stay-${Date.now()}`;
    const newStay: Stay = {
      id: newStayId,
      guestId: guestId!,
      guestName: params.guestName,
      guestPhone: params.guestPhone,
      roomId: targetRoom.id,
      roomNumber: targetRoom.number,
      roomCategory: targetRoom.category,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      adults: params.adults,
      children: params.children,
      nightlyRate: targetRoom.baseRate,
      status: 'active',
      depositAmount: params.depositAmount,
      notes: params.notes,
      checkedInAt: `${businessDate} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
      checkedInBy: currentEmployee.name,
      keyCardAssigned: `KC-${targetRoom.number}-${Math.floor(10 + Math.random() * 90)}`,
    };

    setRooms((prev) =>
      prev.map((r) =>
        r.id === targetRoom.id
          ? { ...r, status: 'occupied', currentStayId: newStayId, keyCardStatus: 'issued' }
          : r
      )
    );

    setStays((prev) => [newStay, ...prev]);

    if (params.depositAmount > 0) {
      addPaymentToFolio(newStayId, params.depositAmount, 'pos_card', `DEP-CHK-${targetRoom.number}`);
    }

    logAudit(
      'AUTH',
      'CHECK_IN_GUEST',
      `Checked in ${params.guestName} into Room ${targetRoom.number} (${targetRoom.category}). Key ${newStay.keyCardAssigned} assigned.`
    );

    showToast(`Guest ${params.guestName} successfully checked into Room ${targetRoom.number}!`);
    return newStay;
  };

  const checkOutGuest = (stayId: string) => {
    const stay = stays.find((s) => s.id === stayId);
    if (!stay) return;

    const charges = folioTransactions
      .filter((t) => t.stayId === stayId && t.status === 'posted')
      .reduce((sum, t) => sum + t.totalAmount, 0);
    const payments = folioPayments
      .filter((p) => p.stayId === stayId)
      .reduce((sum, p) => sum + p.amount, 0);
    const balance = charges - payments;

    if (balance > 100) {
      showToast(`Cannot check out: Outstanding balance of ${formatMoney(balance)}. Settle folio first.`, 'warning');
      return;
    }

    setStays((prev) =>
      prev.map((s) =>
        s.id === stayId
          ? {
              ...s,
              status: 'completed',
              actualCheckOutAt: `${businessDate} ${new Date().toLocaleTimeString('en-GB')}`,
            }
          : s
      )
    );

    setRooms((prev) =>
      prev.map((r) =>
        r.id === stay.roomId
          ? {
              ...r,
              status: 'dirty',
              currentStayId: undefined,
              keyCardStatus: 'returned',
            }
          : r
      )
    );

    // Create Housekeeping Turnaround Task
    const newHkTask: HousekeepingTask = {
      id: `hk-${Date.now()}`,
      roomId: stay.roomId,
      roomNumber: stay.roomNumber,
      roomCategory: stay.roomCategory,
      taskType: 'Checkout Turnaround',
      assignedTo: 'Blessing Udoh',
      status: 'pending',
      priority: 'high',
      checklist: [
        { task: 'Strip dirty linen & towels', completed: false },
        { task: 'Deep clean bathroom & replace amenities', completed: false },
        { task: 'Disinfect touchpoints and remotes', completed: false },
        { task: 'Vacuum & replenish minibar', completed: false },
      ],
      minibarChecked: false,
      updatedAt: `${businessDate} ${new Date().toLocaleTimeString('en-GB')}`,
    };
    setHousekeepingTasks((prev) => [newHkTask, ...prev]);

    logAudit(
      'AUTH',
      'CHECK_OUT_GUEST',
      `Checked out Room ${stay.roomNumber} (${stay.guestName}). Folio settled. Room flagged Dirty for Housekeeping.`
    );

    showToast(`Room ${stay.roomNumber} checkout complete. Room released to Housekeeping as Dirty.`);
  };

  const updateRoomStatus = (roomId: string, newStatus: RoomStatus, reason?: string) => {
    const room = rooms.find((r) => r.id === roomId);
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? {
              ...r,
              status: newStatus,
              outOfOrderReason: newStatus === 'out_of_order' || newStatus === 'maintenance' ? reason : undefined,
              lastCleaned: newStatus === 'inspected' ? `${businessDate}` : r.lastCleaned,
            }
          : r
      )
    );

    logAudit(
      'ROOM_STATUS',
      'UPDATE_ROOM_STATUS',
      `Room ${room?.number || roomId} status changed from ${room?.status} to ${newStatus}. ${reason ? `Reason: ${reason}` : ''}`,
      newStatus === 'out_of_order' ? 'warning' : 'info'
    );

    showToast(`Room ${room?.number || ''} status updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
  };

  // Room Category Manager
  const addRoomCategory = (cat: RoomCategoryConfig) => {
    setRoomCategories((prev) => [...prev, cat]);
    logAudit('CONFIG', 'CREATE_ROOM_CATEGORY', `Created room category: ${cat.name} (${cat.code})`);
    showToast(`Room category ${cat.name} created successfully.`);
  };

  const updateRoomCategory = (id: string, updates: Partial<RoomCategoryConfig>) => {
    setRoomCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    logAudit('CONFIG', 'UPDATE_ROOM_CATEGORY', `Updated room category ID ${id}`);
    showToast(`Category updated.`);
  };

  const deleteRoomCategory = (id: string) => {
    const cat = roomCategories.find((c) => c.id === id);
    // Check if rooms assigned
    const assignedRooms = rooms.filter((r) => r.category === cat?.name);
    if (assignedRooms.length > 0) {
      showToast(`Cannot delete category ${cat?.name}: ${assignedRooms.length} physical rooms are assigned to it.`, 'error');
      return;
    }
    setRoomCategories((prev) => prev.filter((c) => c.id !== id));
    logAudit('CONFIG', 'DELETE_ROOM_CATEGORY', `Deleted room category: ${cat?.name}`, 'warning');
    showToast(`Category deleted.`);
  };

  // Guest Management (CRM)
  const addGuestProfile = (guestData: Omit<GuestProfile, 'id' | 'guestCode' | 'createdAt'>): GuestProfile => {
    const newGuest: GuestProfile = {
      ...guestData,
      id: `guest-${Date.now()}`,
      guestCode: `GV-GST-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: businessDate,
    };
    setGuests((prev) => [newGuest, ...prev]);
    logAudit('RESERVATION', 'CREATE_GUEST_PROFILE', `Created profile for guest ${newGuest.name} (${newGuest.phone})`);
    showToast(`Guest profile created for ${newGuest.name}`);
    return newGuest;
  };

  const updateGuestProfile = (id: string, updates: Partial<GuestProfile>) => {
    setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
    showToast('Guest profile updated.');
  };

  // Reservations
  const createReservation = (resData: Omit<Reservation, 'id' | 'bookingCode' | 'createdAt'>): Reservation => {
    const newRes: Reservation = {
      ...resData,
      id: `res-${Date.now()}`,
      bookingCode: `GV-${businessDate.slice(0, 4)}-${Math.floor(8100 + Math.random() * 900)}`,
      createdAt: `${businessDate} ${new Date().toLocaleTimeString('en-GB')}`,
    };
    setReservations((prev) => [newRes, ...prev]);
    logAudit('RESERVATION', 'CREATE_RESERVATION', `Created reservation #${newRes.bookingCode} for ${newRes.guestName}`);
    showToast(`Reservation #${newRes.bookingCode} booked for ${newRes.guestName}`);
    return newRes;
  };

  const updateReservationStatus = (id: string, status: Reservation['status']) => {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    logAudit('RESERVATION', 'UPDATE_RESERVATION_STATUS', `Reservation ID ${id} marked ${status.toUpperCase()}`);
    showToast(`Reservation marked ${status.toUpperCase()}`);
  };

  // POS Order & KDS Routing
  const createPOSOrder = (params: {
    outletId: string;
    outletName: string;
    orderType: 'dine_in' | 'takeaway' | 'room_service';
    tableOrRoom: string;
    stayId?: string;
    roomId?: string;
    guestName?: string;
    items: { item: MenuItem; quantity: number; notes?: string }[];
    paymentMethod: 'room_charge' | 'cash' | 'pos_card' | 'bank_transfer' | 'split';
  }) => {
    if (params.items.length === 0) return { success: false, message: 'Cart is empty' };

    const subtotal = params.items.reduce((sum, i) => sum + i.item.price * i.quantity, 0);
    const vat = subtotal * hotelSettings.vatRate;
    const serviceCharge = subtotal * hotelSettings.serviceChargeRate;
    const total = subtotal + vat + serviceCharge;

    const orderId = `ord-${Date.now()}`;
    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    let folioTxId: string | undefined = undefined;

    if (params.paymentMethod === 'room_charge') {
      if (!params.stayId) {
        return { success: false, message: 'Please select an occupied room to charge.' };
      }
      const itemSummary = params.items.map((i) => `${i.quantity}x ${i.item.name}`).join(', ');
      const tx = postChargeToRoom(
        params.stayId,
        params.outletName as DepartmentSource,
        `${params.outletName}: ${itemSummary}`,
        1,
        subtotal,
        0,
        orderId
      );
      if (!tx) return { success: false, message: 'Failed to post charge to room folio.' };
      folioTxId = tx.id;
    }

    // Route items by station to generate KOT
    const stationsMap: Record<KitchenStation, { name: string; quantity: number; notes?: string; status: 'pending' }[]> = {
      'Main Kitchen': [],
      'Grill Station': [],
      'Bakery': [],
      'Beverage Station': [],
      'Pool Bar Station': [],
    };

    params.items.forEach(({ item, quantity, notes }) => {
      stationsMap[item.station].push({
        name: item.name,
        quantity,
        notes,
        status: 'pending',
      });
    });

    const newTickets: KitchenTicket[] = [];
    (Object.keys(stationsMap) as KitchenStation[]).forEach((station) => {
      if (stationsMap[station].length > 0) {
        newTickets.push({
          id: `kot-${Date.now()}-${station.replace(/\s+/g, '')}`,
          kotNumber: `KOT-${Math.floor(1000 + Math.random() * 9000)}`,
          orderId,
          outletName: params.outletName,
          station,
          items: stationsMap[station],
          tableOrRoom: params.tableOrRoom,
          orderTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          status: 'pending',
          priority: params.orderType === 'room_service' ? 'vip' : 'normal',
        });
      }
    });

    setKitchenTickets((prev) => [...newTickets, ...prev]);

    // Inventory consumption
    params.items.forEach(({ item, quantity }) => {
      if (item.ingredients) {
        item.ingredients.forEach((ing) => {
          const mov: StockMovement = {
            id: `sm-pos-${Date.now()}-${Math.random()}`,
            movementCode: `RECIPE-${Math.floor(1000 + Math.random() * 9000)}`,
            date: `${businessDate} ${new Date().toLocaleTimeString('en-GB')}`,
            type: 'POS Consumption',
            fromStore: `${params.outletName} Store`,
            toStore: 'Guest Order',
            itemName: ing.itemName,
            quantity: ing.qty * quantity,
            unit: ing.unit,
            user: currentEmployee.name,
            notes: `Recipe deduction for ${orderNumber} (${item.name})`,
          };
          setStockMovements((prev) => [mov, ...prev]);
        });
      }
    });

    showToast(`Order ${orderNumber} placed (${formatMoney(total)}). Routed to ${newTickets.length} kitchen station(s)!`);
    return { success: true, message: 'Order submitted successfully.' };
  };

  const updateKitchenTicketStatus = (
    ticketId: string,
    newStatus: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled'
  ) => {
    setKitchenTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: newStatus,
              items: t.items.map((i) => ({ ...i, status: newStatus })),
            }
          : t
      )
    );
    showToast(`Kitchen Ticket status updated to ${newStatus.toUpperCase()}`);
  };

  // Housekeeping & Minibar
  const updateHousekeepingStatus = (
    taskId: string,
    newStatus: 'pending' | 'in_progress' | 'completed' | 'inspected'
  ) => {
    setHousekeepingTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    const task = housekeepingTasks.find((t) => t.id === taskId);
    if (task && newStatus === 'inspected') {
      updateRoomStatus(task.roomId, 'available', 'Housekeeping inspected and cleared room for occupancy.');
    } else if (task && newStatus === 'in_progress') {
      updateRoomStatus(task.roomId, 'cleaning');
    }
  };

  const postMinibarCharges = (roomId: string, items: { name: string; qty: number; price: number }[]) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room || !room.currentStayId) {
      showToast('Cannot post minibar: Room is not occupied.', 'error');
      return;
    }

    const total = items.reduce((s, i) => s + i.qty * i.price, 0);
    const summary = items.map((i) => `${i.qty}x ${i.name}`).join(', ');

    postChargeToRoom(
      room.currentStayId,
      'Minibar',
      `Minibar Replenishment: ${summary}`,
      1,
      total,
      0
    );

    setHousekeepingTasks((prev) =>
      prev.map((t) => (t.roomId === roomId ? { ...t, minibarChecked: true, minibarChargesPosted: total } : t))
    );
  };

  const addLostAndFoundItem = (itemData: Omit<LostAndFoundItem, 'id' | 'itemCode'>) => {
    const newItem: LostAndFoundItem = {
      ...itemData,
      id: `lf-${Date.now()}`,
      itemCode: `LF-${businessDate.slice(0, 4)}-${Math.floor(100 + Math.random() * 900)}`,
    };
    setLostAndFound((prev) => [newItem, ...prev]);
    showToast(`Lost & Found item ${newItem.itemCode} logged.`);
  };

  const claimLostAndFoundItem = (id: string, claimedBy: string) => {
    setLostAndFound((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'claimed',
              claimedBy,
              claimedDate: businessDate,
            }
          : item
      )
    );
    showToast(`Item marked claimed by ${claimedBy}`);
  };

  // Laundry
  const createLaundryOrder = (params: any) => {
    const totalAmount = params.items.reduce((s: number, i: any) => s + i.quantity * i.unitPrice, 0);
    const orderCode = `LND-${Math.floor(1000 + Math.random() * 9000)}`;
    let folioTxId: string | undefined = undefined;

    if (params.paymentMethod === 'room_charge' && params.stayId) {
      const summary = params.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ');
      const tx = postChargeToRoom(
        params.stayId,
        'Laundry',
        `Laundry (${params.serviceType}): ${summary}`,
        1,
        totalAmount,
        0,
        orderCode
      );
      if (tx) folioTxId = tx.id;
    }

    const newOrder: LaundryOrder = {
      id: `lnd-${Date.now()}`,
      orderCode,
      stayId: params.stayId,
      roomId: params.roomId,
      roomNumber: params.roomNumber,
      guestName: params.guestName,
      guestPhone: params.guestPhone,
      serviceType: params.serviceType,
      items: params.items,
      totalAmount,
      status: 'received',
      paymentMethod: params.paymentMethod,
      folioTransactionId: folioTxId,
      createdAt: `${businessDate} ${new Date().toLocaleTimeString('en-GB')}`,
      expectedDelivery: params.expectedDelivery,
      staffName: currentEmployee.name,
    };

    setLaundryOrders((prev) => [newOrder, ...prev]);
    showToast(`Laundry order ${orderCode} created (${formatMoney(totalAmount)})`);
  };

  // Facilities
  const createFacilityPass = (params: any) => {
    let folioTxId: string | undefined = undefined;

    if (params.paymentMethod === 'room_charge' && params.stayId && params.amount > 0) {
      const tx = postChargeToRoom(
        params.stayId,
        'Gym & Facilities',
        `${params.facility} - ${params.passType}`,
        1,
        params.amount,
        0
      );
      if (tx) folioTxId = tx.id;
    }

    const newPass: FacilityPass = {
      id: `fac-${Date.now()}`,
      guestType: params.guestType,
      stayId: params.stayId,
      roomNumber: params.roomNumber,
      guestName: params.guestName,
      guestPhone: params.guestPhone,
      facility: params.facility,
      passType: params.passType,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      folioTransactionId: folioTxId,
      createdAt: `${businessDate} ${new Date().toLocaleTimeString('en-GB')}`,
      staffName: currentEmployee.name,
    };

    setFacilityPasses((prev) => [newPass, ...prev]);
    showToast(`Facility pass issued for ${params.guestName}`);
  };

  // Transport
  const createTransportTrip = (params: any) => {
    let folioTxId: string | undefined = undefined;

    if (params.paymentMethod === 'room_charge' && params.stayId) {
      const tx = postChargeToRoom(
        params.stayId,
        'Transport',
        `${params.tripType} (${params.pickupLocation} -> ${params.destination})`,
        1,
        params.fee,
        0
      );
      if (tx) folioTxId = tx.id;
    }

    const newTrip: TransportTrip = {
      id: `tr-${Date.now()}`,
      tripCode: `TRP-${Math.floor(1000 + Math.random() * 9000)}`,
      guestName: params.guestName,
      stayId: params.stayId,
      roomNumber: params.roomNumber,
      tripType: params.tripType,
      vehicle: params.vehicle,
      driver: params.driver,
      pickupLocation: params.pickupLocation,
      destination: params.destination,
      scheduledTime: params.scheduledTime,
      fee: params.fee,
      status: 'scheduled',
      paymentMethod: params.paymentMethod,
      folioTransactionId: folioTxId,
      bookedAt: `${businessDate} ${new Date().toLocaleTimeString('en-GB')}`,
    };

    setTransportTrips((prev) => [newTrip, ...prev]);
    showToast(`Transport booked: ${params.tripType} (${formatMoney(params.fee)})`);
  };

  // Inventory
  const transferStock = (params: {
    itemId: string;
    toStore: StoreLocation;
    quantity: number;
    notes: string;
  }) => {
    const item = inventory.find((i) => i.id === params.itemId);
    if (!item) return;

    if (item.storeStocks['Central Warehouse'] < params.quantity) {
      showToast(`Insufficient stock in Central Warehouse. Available: ${item.storeStocks['Central Warehouse']} ${item.unit}`, 'error');
      return;
    }

    setInventory((prev) =>
      prev.map((i) => {
        if (i.id === params.itemId) {
          return {
            ...i,
            storeStocks: {
              ...i.storeStocks,
              'Central Warehouse': i.storeStocks['Central Warehouse'] - params.quantity,
              [params.toStore]: (i.storeStocks[params.toStore] || 0) + params.quantity,
            },
          };
        }
        return i;
      })
    );

    const mov: StockMovement = {
      id: `sm-tr-${Date.now()}`,
      movementCode: `TRF-${Math.floor(1000 + Math.random() * 9000)}`,
      date: `${businessDate} ${new Date().toLocaleTimeString('en-GB')}`,
      type: 'Department Transfer',
      fromStore: 'Central Warehouse',
      toStore: params.toStore,
      itemName: item.name,
      quantity: params.quantity,
      unit: item.unit,
      user: currentEmployee.name,
      notes: params.notes,
    };

    setStockMovements((prev) => [mov, ...prev]);
    logAudit('INVENTORY', 'TRANSFER_STOCK', `Transferred ${params.quantity} ${item.unit} of ${item.name} from Central Warehouse to ${params.toStore}`);
    showToast(`Transferred ${params.quantity} ${item.unit} of ${item.name} to ${params.toStore}`);
  };

  const createPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'poNumber'>) => {
    const newPo: PurchaseOrder = {
      ...poData,
      id: `po-${Date.now()}`,
      poNumber: `PO-${businessDate.slice(0, 4)}-${Math.floor(100 + Math.random() * 900)}`,
    };
    setPurchaseOrders((prev) => [newPo, ...prev]);
    logAudit('INVENTORY', 'CREATE_PURCHASE_ORDER', `Created PO #${newPo.poNumber} for ${newPo.supplierName}`);
    showToast(`Purchase order #${newPo.poNumber} created.`);
  };

  const approvePurchaseOrder = (id: string) => {
    setPurchaseOrders((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'approved' } : p)));
    logAudit('INVENTORY', 'APPROVE_PURCHASE_ORDER', `Approved Purchase Order ID ${id}`);
    showToast('Purchase Order approved.');
  };

  // Maintenance
  const createMaintenanceRequest = (params: any) => {
    const req: MaintenanceRequest = {
      id: `mnt-${Date.now()}`,
      code: `MNT-${Math.floor(1000 + Math.random() * 9000)}`,
      roomId: params.roomId,
      locationArea: params.locationArea,
      category: params.category,
      description: params.description,
      priority: params.priority,
      reportedBy: currentEmployee.name,
      assignedTechnician: 'Sunday Ayodele (Facilities)',
      status: 'open',
      locksRoom: params.locksRoom,
      createdAt: `${businessDate} ${new Date().toLocaleTimeString('en-GB')}`,
    };

    setMaintenanceRequests((prev) => [req, ...prev]);

    if (params.roomId && params.locksRoom) {
      updateRoomStatus(params.roomId, 'out_of_order', params.description);
    }

    logAudit('ROOM_STATUS', 'CREATE_MAINTENANCE_TICKET', `Filed ticket ${req.code} for ${params.locationArea}. Locks Room: ${params.locksRoom}`);
    showToast(`Maintenance work order ${req.code} filed: ${params.category}`);
  };

  const resolveMaintenanceRequest = (id: string) => {
    const req = maintenanceRequests.find((r) => r.id === id);
    if (!req) return;

    setMaintenanceRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'resolved',
              resolvedAt: `${businessDate} ${new Date().toLocaleTimeString('en-GB')}`,
            }
          : r
      )
    );

    if (req.roomId && req.locksRoom) {
      updateRoomStatus(req.roomId, 'dirty', 'Maintenance completed. Requires housekeeping.');
    }
    logAudit('ROOM_STATUS', 'RESOLVE_MAINTENANCE_TICKET', `Resolved maintenance order ${req.code}`);
    showToast(`Maintenance order ${req.code} marked resolved.`);
  };

  // HR & Employees
  const addEmployee = (empData: Omit<Employee, 'id' | 'empNumber'>) => {
    const newEmp: Employee = {
      ...empData,
      id: `emp-${Date.now()}`,
      empNumber: `GV-EMP-${Math.floor(100 + Math.random() * 900)}`,
    };
    setEmployees((prev) => [...prev, newEmp]);
    logAudit('AUTH', 'CREATE_EMPLOYEE', `Registered employee ${newEmp.name} (${newEmp.role})`);
    showToast(`Employee ${newEmp.name} added successfully.`);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    showToast('Employee profile updated.');
  };

  // Accounting & Journal
  const postJournalEntry = (entryData: Omit<AccountLedgerEntry, 'id'>) => {
    const newEntry: AccountLedgerEntry = {
      ...entryData,
      id: `coa-${Date.now()}`,
    };
    setChartOfAccounts((prev) => [newEntry, ...prev]);
    logAudit('FINANCE', 'POST_JOURNAL_ENTRY', `Posted journal entry #${newEntry.reference} to ${newEntry.accountName}`);
    showToast(`Journal entry recorded to ${newEntry.accountName}`);
  };

  // Night Audit
  const runNightAudit = () => {
    const activeStaysList = stays.filter((s) => s.status === 'active');
    let roomRev = 0;

    activeStaysList.forEach((stay) => {
      const gross = stay.nightlyRate;
      const vatRate = hotelSettings.vatRate;
      const serviceChargeRate = hotelSettings.serviceChargeRate;
      const tax = gross * (vatRate + serviceChargeRate);
      const total = gross + tax;

      roomRev += gross;

      const tx: FolioTransaction = {
        id: `tx-na-${stay.id}-${Date.now()}`,
        stayId: stay.id,
        roomId: stay.roomId,
        roomNumber: stay.roomNumber,
        guestName: stay.guestName,
        department: 'Front Desk',
        description: `Room Accommodation - Business Date: ${businessDate} (${stay.roomCategory})`,
        quantity: 1,
        unitPrice: stay.nightlyRate,
        discount: 0,
        vatRate,
        serviceChargeRate,
        taxAmount: tax,
        totalAmount: total,
        status: 'posted',
        createdAt: `${businessDate} 23:59`,
        postedBy: 'System (Night Audit)',
      };

      setFolioTransactions((prev) => [tx, ...prev]);
    });

    const totalRoomsCount = rooms.length;
    const occupiedCount = activeStaysList.length;
    const occRate = Math.round((occupiedCount / totalRoomsCount) * 1000) / 10;
    const adrCalc = occupiedCount > 0 ? Math.round(roomRev / occupiedCount) : 0;
    const revParCalc = totalRoomsCount > 0 ? Math.round(roomRev / totalRoomsCount) : 0;

    const fAndBTotal = folioTransactions
      .filter(
        (t) =>
          ['Main Restaurant', 'Main Bar', 'Pool Bar', 'Room Service'].includes(t.department) &&
          t.createdAt.startsWith(businessDate)
      )
      .reduce((sum, t) => sum + t.totalAmount, 0);

    const servicesTotal = folioTransactions
      .filter(
        (t) =>
          ['Laundry', 'Gym & Facilities', 'Transport', 'Minibar'].includes(t.department) &&
          t.createdAt.startsWith(businessDate)
      )
      .reduce((sum, t) => sum + t.totalAmount, 0);

    const [year, month, day] = businessDate.split('-').map(Number);
    const currentDateObj = new Date(year, month - 1, day);
    currentDateObj.setDate(currentDateObj.getDate() + 1);
    const nextDate = currentDateObj.toISOString().split('T')[0];

    const newAuditRecord: NightAuditRun = {
      id: `aud-${Date.now()}`,
      auditNumber: `NA-${businessDate.replace(/-/g, '')}`,
      businessDate: businessDate,
      closedAt: `${nextDate} 03:00`,
      closedBy: currentEmployee.name,
      totalRooms: totalRoomsCount,
      occupiedRooms: occupiedCount,
      occupancyRate: occRate,
      roomRevenue: roomRev,
      fAndBRevenue: fAndBTotal,
      servicesRevenue: servicesTotal,
      totalRevenue: roomRev + fAndBTotal + servicesTotal,
      adr: adrCalc,
      revPar: revParCalc,
      notes: `Closed business date ${businessDate}. Room accommodation posted to ${occupiedCount} active in-house folios. Date rolled to ${nextDate}.`,
    };

    setNightAuditLog((prev) => [newAuditRecord, ...prev]);
    setBusinessDate(nextDate);

    logAudit(
      'FINANCE',
      'NIGHT_AUDIT_CLOSE',
      `Executed Daily Night Audit for ${businessDate}. Room accommodation posted across ${occupiedCount} folios. Total Rev: ${formatMoney(newAuditRecord.totalRevenue)}. Advanced business date to ${nextDate}.`,
      'critical'
    );

    showToast(`Night Audit completed for ${businessDate}. New business date: ${nextDate}!`, 'success');
    return { success: true, newAudit: newAuditRecord };
  };

  return (
    <PMSContext.Provider
      value={{
        hotelSettings,
        buildings,
        roomCategories,
        rooms,
        guests,
        stays,
        folioTransactions,
        folioPayments,
        reservations,
        menuItems,
        kitchenTickets,
        housekeepingTasks,
        lostAndFound,
        laundryOrders,
        facilityPasses,
        transportTrips,
        inventory,
        stockMovements,
        purchaseOrders,
        maintenanceRequests,
        corporateAccounts,
        chartOfAccounts,
        employees,
        currentEmployee,
        auditLogs,
        businessDate,
        currency,
        exchangeRate,
        nightAuditLog,
        toast,
        formatMoney,
        setCurrentEmployee,
        setCurrency,
        showToast,
        updateHotelSettings,
        postChargeToRoom,
        reverseFolioCharge,
        addPaymentToFolio,
        checkInGuest,
        checkOutGuest,
        updateRoomStatus,
        addRoomCategory,
        updateRoomCategory,
        deleteRoomCategory,
        addGuestProfile,
        updateGuestProfile,
        createReservation,
        updateReservationStatus,
        createPOSOrder,
        updateKitchenTicketStatus,
        updateHousekeepingStatus,
        postMinibarCharges,
        addLostAndFoundItem,
        claimLostAndFoundItem,
        createLaundryOrder,
        createFacilityPass,
        createTransportTrip,
        transferStock,
        createPurchaseOrder,
        approvePurchaseOrder,
        createMaintenanceRequest,
        resolveMaintenanceRequest,
        addEmployee,
        updateEmployee,
        postJournalEntry,
        runNightAudit,
      }}
    >
      {children}
    </PMSContext.Provider>
  );
};

export const usePMS = () => {
  const context = useContext(PMSContext);
  if (!context) {
    throw new Error('usePMS must be used within a PMSProvider');
  }
  return context;
};
