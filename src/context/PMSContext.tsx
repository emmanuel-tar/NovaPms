/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Room,
  Stay,
  FolioTransaction,
  FolioPayment,
  Reservation,
  MenuItem,
  KitchenTicket,
  LaundryOrder,
  FacilityPass,
  TransportTrip,
  InventoryItem,
  StockMovement,
  HousekeepingTask,
  MaintenanceRequest,
  CorporateAccount,
  StaffUser,
  NightAuditRun,
  DepartmentSource,
  RoomStatus,
  KitchenStation,
} from '../types/pms';
import {
  INITIAL_ROOMS,
  INITIAL_STAYS,
  INITIAL_FOLIO_TRANSACTIONS,
  INITIAL_FOLIO_PAYMENTS,
  INITIAL_RESERVATIONS,
  INITIAL_MENU_ITEMS,
  INITIAL_KITCHEN_TICKETS,
  INITIAL_LAUNDRY_ORDERS,
  INITIAL_FACILITY_PASSES,
  INITIAL_TRANSPORT_TRIPS,
  INITIAL_INVENTORY,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_HOUSEKEEPING_TASKS,
  INITIAL_MAINTENANCE_REQUESTS,
  INITIAL_CORPORATE_ACCOUNTS,
  INITIAL_STAFF_USERS,
  INITIAL_NIGHT_AUDIT_LOG,
} from '../data/initialData';

interface Toast {
  id: string;
  text: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface PMSContextType {
  // State
  rooms: Room[];
  stays: Stay[];
  folioTransactions: FolioTransaction[];
  folioPayments: FolioPayment[];
  reservations: Reservation[];
  menuItems: MenuItem[];
  kitchenTickets: KitchenTicket[];
  laundryOrders: LaundryOrder[];
  facilityPasses: FacilityPass[];
  transportTrips: TransportTrip[];
  inventory: InventoryItem[];
  stockMovements: StockMovement[];
  housekeepingTasks: HousekeepingTask[];
  maintenanceRequests: MaintenanceRequest[];
  corporateAccounts: CorporateAccount[];
  currentUser: StaffUser;
  staffUsers: StaffUser[];
  businessDate: string;
  currency: 'NGN' | 'USD';
  exchangeRate: number; // NGN per USD
  nightAuditLog: NightAuditRun[];
  toast: Toast | null;

  // Actions
  formatMoney: (amount: number) => string;
  setCurrentUser: (user: StaffUser) => void;
  setCurrency: (curr: 'NGN' | 'USD') => void;
  showToast: (text: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  
  // Front Office & Folio
  postChargeToRoom: (
    stayId: string,
    department: DepartmentSource,
    description: string,
    quantity: number,
    unitPrice: number,
    discount?: number,
    sourceOrderId?: string
  ) => FolioTransaction | null;
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
  
  // POS & Kitchen
  createPOSOrder: (params: {
    outletId: string;
    outletName: string;
    orderType: 'dine_in' | 'takeaway' | 'room_service';
    tableOrRoom: string;
    stayId?: string;
    roomId?: string;
    guestName?: string;
    items: { item: MenuItem; quantity: number; notes?: string }[];
    paymentMethod: 'room_charge' | 'cash' | 'pos_card' | 'bank_transfer';
  }) => { success: boolean; message: string };
  updateKitchenTicketStatus: (ticketId: string, newStatus: 'pending' | 'preparing' | 'ready' | 'served') => void;

  // Hotel Services
  createLaundryOrder: (params: {
    stayId?: string;
    roomId?: string;
    roomNumber?: string;
    guestName: string;
    guestPhone: string;
    serviceType: 'Standard Wash' | 'Dry Cleaning' | 'Pressing / Ironing' | 'Express 4-Hour';
    items: { name: string; quantity: number; unitPrice: number }[];
    paymentMethod: 'room_charge' | 'cash' | 'pos_card';
    expectedDelivery: string;
  }) => void;
  createFacilityPass: (params: {
    guestType: 'in_house' | 'external';
    stayId?: string;
    roomNumber?: string;
    guestName: string;
    guestPhone?: string;
    facility: 'Gym Fitness Centre' | 'Olympic Swimming Pool' | 'Sauna & Steam Bath';
    passType: 'Complimentary (In-House)' | 'Day Pass' | 'Personal Training Session' | 'Monthly Membership';
    amount: number;
    paymentMethod?: 'room_charge' | 'cash' | 'pos_card';
  }) => void;
  createTransportTrip: (params: {
    guestName: string;
    stayId?: string;
    roomNumber?: string;
    tripType: 'Airport Pickup' | 'Airport Drop-off' | 'VIP Chauffeur City Ride' | 'Hotel Shuttle Bus';
    vehicle: string;
    driver: string;
    pickupLocation: string;
    destination: string;
    scheduledTime: string;
    fee: number;
    paymentMethod: 'room_charge' | 'direct';
  }) => void;

  // Housekeeping & Maintenance
  updateHousekeepingStatus: (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed' | 'inspected') => void;
  postMinibarCharges: (roomId: string, items: { name: string; qty: number; price: number }[]) => void;
  createMaintenanceRequest: (params: {
    roomId?: string;
    locationArea: string;
    category: 'HVAC / Air Conditioning' | 'Plumbing & Water' | 'Electrical & Lighting' | 'Carpentry & Lock' | 'Appliance';
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    locksRoom: boolean;
  }) => void;
  resolveMaintenanceRequest: (id: string) => void;

  // Inventory
  transferStock: (params: {
    itemId: string;
    toStore: 'kitchenStock' | 'barStock' | 'housekeepingStock';
    quantity: number;
    notes: string;
  }) => void;

  // Night Audit
  runNightAudit: () => { success: boolean; newAudit: NightAuditRun };
}

const PMSContext = createContext<PMSContextType | undefined>(undefined);

export const PMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [stays, setStays] = useState<Stay[]>(INITIAL_STAYS);
  const [folioTransactions, setFolioTransactions] = useState<FolioTransaction[]>(INITIAL_FOLIO_TRANSACTIONS);
  const [folioPayments, setFolioPayments] = useState<FolioPayment[]>(INITIAL_FOLIO_PAYMENTS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [kitchenTickets, setKitchenTickets] = useState<KitchenTicket[]>(INITIAL_KITCHEN_TICKETS);
  const [laundryOrders, setLaundryOrders] = useState<LaundryOrder[]>(INITIAL_LAUNDRY_ORDERS);
  const [facilityPasses, setFacilityPasses] = useState<FacilityPass[]>(INITIAL_FACILITY_PASSES);
  const [transportTrips, setTransportTrips] = useState<TransportTrip[]>(INITIAL_TRANSPORT_TRIPS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(INITIAL_STOCK_MOVEMENTS);
  const [housekeepingTasks, setHousekeepingTasks] = useState<HousekeepingTask[]>(INITIAL_HOUSEKEEPING_TASKS);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>(INITIAL_MAINTENANCE_REQUESTS);
  const [corporateAccounts, setCorporateAccounts] = useState<CorporateAccount[]>(INITIAL_CORPORATE_ACCOUNTS);
  const [staffUsers] = useState<StaffUser[]>(INITIAL_STAFF_USERS);
  const [currentUser, setCurrentUser] = useState<StaffUser>(INITIAL_STAFF_USERS[0]); // General Manager
  const [businessDate, setBusinessDate] = useState<string>('2026-11-11');
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [exchangeRate] = useState<number>(1550); // ₦1,550 = $1
  const [nightAuditLog, setNightAuditLog] = useState<NightAuditRun[]>(INITIAL_NIGHT_AUDIT_LOG);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, text, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 4000);
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

  // Central Charge Posting Engine
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
    const vatRate = 0.075; // 7.5% Nigerian VAT
    const serviceChargeRate = 0.05; // 5% Service Charge
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
      postedBy: currentUser.name,
    };

    setFolioTransactions((prev) => [newTx, ...prev]);
    showToast(`Posted ${formatMoney(netTotal)} (${department}) to Room ${stay.roomNumber} - ${stay.guestName}`);
    return newTx;
  };

  const addPaymentToFolio = (
    stayId: string,
    amount: number,
    method: 'cash' | 'pos_card' | 'bank_transfer' | 'corporate_credit',
    reference?: string,
    corporateAccountId?: string
  ) => {
    const newPayment: FolioPayment = {
      id: `pay-${Date.now()}`,
      stayId,
      amount,
      paymentMethod: method,
      reference: reference || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      corporateAccountId,
      createdAt: `${businessDate} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
      receivedBy: currentUser.name,
    };

    setFolioPayments((prev) => [newPayment, ...prev]);

    // If corporate credit, update corporate account balance
    if (method === 'corporate_credit' && corporateAccountId) {
      setCorporateAccounts((prev) =>
        prev.map((c) => (c.id === corporateAccountId ? { ...c, currentBalance: c.currentBalance + amount } : c))
      );
    }

    showToast(`Received payment of ${formatMoney(amount)} via ${method.replace('_', ' ').toUpperCase()}`);
  };

  const checkInGuest = (params: {
    guestName: string;
    guestPhone: string;
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
      showToast(`Room ${targetRoom.number} is Out of Order!`, 'error');
      return null;
    }

    const newStayId = `stay-${Date.now()}`;
    const newStay: Stay = {
      id: newStayId,
      guestId: `guest-${Date.now()}`,
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
      checkedInBy: currentUser.name,
    };

    // Update Room
    setRooms((prev) =>
      prev.map((r) => (r.id === targetRoom.id ? { ...r, status: 'occupied', currentStayId: newStayId } : r))
    );

    // Save Stay
    setStays((prev) => [newStay, ...prev]);

    // If deposit paid, record folio payment
    if (params.depositAmount > 0) {
      addPaymentToFolio(newStayId, params.depositAmount, 'pos_card', `DEP-CHK-${targetRoom.number}`);
    }

    showToast(`Guest ${params.guestName} successfully checked into Room ${targetRoom.number}!`);
    return newStay;
  };

  const checkOutGuest = (stayId: string) => {
    const stay = stays.find((s) => s.id === stayId);
    if (!stay) return;

    // Check outstanding balance
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

    // Complete stay
    setStays((prev) => prev.map((s) => (s.id === stayId ? { ...s, status: 'completed' } : s)));

    // Mark room dirty and clear currentStayId
    setRooms((prev) =>
      prev.map((r) => (r.id === stay.roomId ? { ...r, status: 'dirty', currentStayId: undefined } : r))
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
      minibarChecked: false,
      updatedAt: `${businessDate} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
    };
    setHousekeepingTasks((prev) => [newHkTask, ...prev]);

    showToast(`Room ${stay.roomNumber} checked out. Room status updated to Dirty. Housekeeping notified!`);
  };

  const updateRoomStatus = (roomId: string, newStatus: RoomStatus, reason?: string) => {
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
    showToast(`Room status updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
  };

  // POS Order Creation & KDS Routing
  const createPOSOrder = (params: {
    outletId: string;
    outletName: string;
    orderType: 'dine_in' | 'takeaway' | 'room_service';
    tableOrRoom: string;
    stayId?: string;
    roomId?: string;
    guestName?: string;
    items: { item: MenuItem; quantity: number; notes?: string }[];
    paymentMethod: 'room_charge' | 'cash' | 'pos_card' | 'bank_transfer';
  }) => {
    if (params.items.length === 0) {
      return { success: false, message: 'Cart is empty' };
    }

    const subtotal = params.items.reduce((sum, i) => sum + i.item.price * i.quantity, 0);
    const vat = subtotal * 0.075;
    const serviceCharge = subtotal * 0.05;
    const total = subtotal + vat + serviceCharge;

    const orderId = `ord-${Date.now()}`;
    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    let folioTxId: string | undefined = undefined;

    // IF CHARGE TO ROOM: Validate and post directly to room folio
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
      if (!tx) {
        return { success: false, message: 'Failed to post charge to room folio.' };
      }
      folioTxId = tx.id;
    }

    // Route items by station to generate KOT (Kitchen Order Tickets)
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

    // Inventory consumption simulation
    params.items.forEach(({ item, quantity }) => {
      if (item.ingredients) {
        item.ingredients.forEach((ing) => {
          // Log stock deduction
          const movement: StockMovement = {
            id: `sm-pos-${Date.now()}-${Math.random()}`,
            movementCode: `RECIPE-${Math.floor(1000 + Math.random() * 9000)}`,
            date: `${businessDate} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
            type: 'POS Consumption',
            fromStore: `${params.outletName} Store`,
            toStore: 'Guest Order',
            itemName: ing.itemName,
            quantity: ing.qty * quantity,
            unit: ing.unit,
            user: currentUser.name,
            notes: `Consumed for Order ${orderNumber} (${item.name})`,
          };
          setStockMovements((prev) => [movement, ...prev]);
        });
      }
    });

    showToast(`Order ${orderNumber} placed (${formatMoney(total)}). Routed to ${newTickets.length} kitchen station(s)!`);
    return { success: true, message: 'Order submitted successfully.' };
  };

  const updateKitchenTicketStatus = (ticketId: string, newStatus: 'pending' | 'preparing' | 'ready' | 'served') => {
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
    showToast(`Ticket status updated to ${newStatus.toUpperCase()}`);
  };

  // Laundry Service
  const createLaundryOrder = (params: {
    stayId?: string;
    roomId?: string;
    roomNumber?: string;
    guestName: string;
    guestPhone: string;
    serviceType: 'Standard Wash' | 'Dry Cleaning' | 'Pressing / Ironing' | 'Express 4-Hour';
    items: { name: string; quantity: number; unitPrice: number }[];
    paymentMethod: 'room_charge' | 'cash' | 'pos_card';
    expectedDelivery: string;
  }) => {
    const totalAmount = params.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const orderCode = `LND-${Math.floor(1000 + Math.random() * 9000)}`;

    let folioTxId: string | undefined = undefined;

    if (params.paymentMethod === 'room_charge' && params.stayId) {
      const summary = params.items.map((i) => `${i.quantity}x ${i.name}`).join(', ');
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
      createdAt: `${businessDate} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
      expectedDelivery: params.expectedDelivery,
      staffName: currentUser.name,
    };

    setLaundryOrders((prev) => [newOrder, ...prev]);
    showToast(`Laundry order ${orderCode} created for ${params.guestName} (${formatMoney(totalAmount)})`);
  };

  // Facility Pass (Gym & Swimming Pool)
  const createFacilityPass = (params: {
    guestType: 'in_house' | 'external';
    stayId?: string;
    roomNumber?: string;
    guestName: string;
    guestPhone?: string;
    facility: 'Gym Fitness Centre' | 'Olympic Swimming Pool' | 'Sauna & Steam Bath';
    passType: 'Complimentary (In-House)' | 'Day Pass' | 'Personal Training Session' | 'Monthly Membership';
    amount: number;
    paymentMethod?: 'room_charge' | 'cash' | 'pos_card';
  }) => {
    let folioTxId: string | undefined = undefined;

    if (params.paymentMethod === 'room_charge' && params.stayId && params.amount > 0) {
      const tx = postChargeToRoom(
        params.stayId,
        'Gym & Pool',
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
      createdAt: `${businessDate} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
      staffName: currentUser.name,
    };

    setFacilityPasses((prev) => [newPass, ...prev]);
    showToast(`Facility pass issued for ${params.guestName} (${params.facility})`);
  };

  // Transport Booking
  const createTransportTrip = (params: {
    guestName: string;
    stayId?: string;
    roomNumber?: string;
    tripType: 'Airport Pickup' | 'Airport Drop-off' | 'VIP Chauffeur City Ride' | 'Hotel Shuttle Bus';
    vehicle: string;
    driver: string;
    pickupLocation: string;
    destination: string;
    scheduledTime: string;
    fee: number;
    paymentMethod: 'room_charge' | 'direct';
  }) => {
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
      bookedAt: `${businessDate} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
    };

    setTransportTrips((prev) => [newTrip, ...prev]);
    showToast(`Transport booked: ${params.tripType} for ${params.guestName} (${formatMoney(params.fee)})`);
  };

  // Housekeeping & Minibar
  const updateHousekeepingStatus = (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed' | 'inspected') => {
    setHousekeepingTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    const task = housekeepingTasks.find((t) => t.id === taskId);
    if (task && newStatus === 'inspected') {
      // Room is clean and ready!
      updateRoomStatus(task.roomId, 'available');
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

    // Update housekeeping task
    setHousekeepingTasks((prev) =>
      prev.map((t) => (t.roomId === roomId ? { ...t, minibarChecked: true, minibarChargesPosted: total } : t))
    );
  };

  // Maintenance
  const createMaintenanceRequest = (params: {
    roomId?: string;
    locationArea: string;
    category: 'HVAC / Air Conditioning' | 'Plumbing & Water' | 'Electrical & Lighting' | 'Carpentry & Lock' | 'Appliance';
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    locksRoom: boolean;
  }) => {
    const req: MaintenanceRequest = {
      id: `mnt-${Date.now()}`,
      code: `MNT-${Math.floor(1000 + Math.random() * 9000)}`,
      roomId: params.roomId,
      locationArea: params.locationArea,
      category: params.category,
      description: params.description,
      priority: params.priority,
      reportedBy: currentUser.name,
      assignedTechnician: 'Sunday Ayodele (Facilities)',
      status: 'open',
      locksRoom: params.locksRoom,
      createdAt: `${businessDate} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
    };

    setMaintenanceRequests((prev) => [req, ...prev]);

    if (params.roomId && params.locksRoom) {
      updateRoomStatus(params.roomId, 'out_of_order', params.description);
    }

    showToast(`Maintenance work order ${req.code} filed: ${params.category}`);
  };

  const resolveMaintenanceRequest = (id: string) => {
    const req = maintenanceRequests.find((r) => r.id === id);
    if (!req) return;

    setMaintenanceRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'resolved' } : r))
    );

    if (req.roomId && req.locksRoom) {
      updateRoomStatus(req.roomId, 'dirty', 'Maintenance completed. Requires housekeeping.');
    }
    showToast(`Maintenance order ${req.code} marked resolved.`);
  };

  // Inventory Transfer
  const transferStock = (params: {
    itemId: string;
    toStore: 'kitchenStock' | 'barStock' | 'housekeepingStock';
    quantity: number;
    notes: string;
  }) => {
    const item = inventory.find((i) => i.id === params.itemId);
    if (!item) return;

    if (item.centralStock < params.quantity) {
      showToast(`Insufficient stock in Central Warehouse. Available: ${item.centralStock} ${item.unit}`, 'error');
      return;
    }

    setInventory((prev) =>
      prev.map((i) => {
        if (i.id === params.itemId) {
          return {
            ...i,
            centralStock: i.centralStock - params.quantity,
            [params.toStore]: i[params.toStore] + params.quantity,
          };
        }
        return i;
      })
    );

    const storeNames = {
      kitchenStock: 'Main Kitchen Store',
      barStock: 'Pool & Lounge Bar Store',
      housekeepingStock: 'Housekeeping Store',
    };

    const mov: StockMovement = {
      id: `sm-tr-${Date.now()}`,
      movementCode: `TRF-${Math.floor(1000 + Math.random() * 9000)}`,
      date: `${businessDate} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
      type: 'Department Transfer',
      fromStore: 'Central Warehouse',
      toStore: storeNames[params.toStore],
      itemName: item.name,
      quantity: params.quantity,
      unit: item.unit,
      user: currentUser.name,
      notes: params.notes,
    };

    setStockMovements((prev) => [mov, ...prev]);
    showToast(`Transferred ${params.quantity} ${item.unit} of ${item.name} to ${storeNames[params.toStore]}`);
  };

  // Night Audit
  const runNightAudit = () => {
    const activeStaysList = stays.filter((s) => s.status === 'active');
    let roomRev = 0;

    // Automatically post nightly room rate to each active folio
    activeStaysList.forEach((stay) => {
      const gross = stay.nightlyRate;
      const vatRate = 0.075;
      const serviceChargeRate = 0.05;
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

    // Calculate F&B and Services Revenue from today's transactions
    const fAndBTotal = folioTransactions
      .filter(
        (t) =>
          ['Main Restaurant', 'Pool Bar', 'Lounge Bar', 'Room Service'].includes(t.department) &&
          t.createdAt.startsWith(businessDate)
      )
      .reduce((sum, t) => sum + t.totalAmount, 0);

    const servicesTotal = folioTransactions
      .filter(
        (t) =>
          ['Laundry', 'Gym & Pool', 'Transport', 'Minibar'].includes(t.department) &&
          t.createdAt.startsWith(businessDate)
      )
      .reduce((sum, t) => sum + t.totalAmount, 0);

    // Increment business date by 1 day
    const [year, month, day] = businessDate.split('-').map(Number);
    const currentDateObj = new Date(year, month - 1, day);
    currentDateObj.setDate(currentDateObj.getDate() + 1);
    const nextDate = currentDateObj.toISOString().split('T')[0];

    const newAuditRecord: NightAuditRun = {
      id: `aud-${Date.now()}`,
      auditNumber: `NA-${businessDate.replace(/-/g, '')}`,
      businessDate: businessDate,
      closedAt: `${nextDate} 03:00`,
      closedBy: currentUser.name,
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

    showToast(`Night Audit completed for ${businessDate}. New business date: ${nextDate}!`, 'success');
    return { success: true, newAudit: newAuditRecord };
  };

  return (
    <PMSContext.Provider
      value={{
        rooms,
        stays,
        folioTransactions,
        folioPayments,
        reservations,
        menuItems,
        kitchenTickets,
        laundryOrders,
        facilityPasses,
        transportTrips,
        inventory,
        stockMovements,
        housekeepingTasks,
        maintenanceRequests,
        corporateAccounts,
        currentUser,
        staffUsers,
        businessDate,
        currency,
        exchangeRate,
        nightAuditLog,
        toast,
        formatMoney,
        setCurrentUser,
        setCurrency,
        showToast,
        postChargeToRoom,
        addPaymentToFolio,
        checkInGuest,
        checkOutGuest,
        updateRoomStatus,
        createPOSOrder,
        updateKitchenTicketStatus,
        createLaundryOrder,
        createFacilityPass,
        createTransportTrip,
        updateHousekeepingStatus,
        postMinibarCharges,
        createMaintenanceRequest,
        resolveMaintenanceRequest,
        transferStock,
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
