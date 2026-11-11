/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RoomCategoryName =
  | 'Standard Single'
  | 'Standard Double'
  | 'Deluxe Room'
  | 'Executive Suite'
  | 'Diplomatic Suite'
  | 'Presidential Suite';

export type RoomStatus =
  | 'available'
  | 'occupied'
  | 'reserved'
  | 'dirty'
  | 'cleaning'
  | 'inspected'
  | 'out_of_order'
  | 'maintenance';

export interface RoomCategoryConfig {
  id: string;
  name: RoomCategoryName | string;
  code: string;
  description: string;
  baseRate: number; // in NGN
  weekendRate: number;
  seasonalRate: number;
  extraAdultRate: number;
  extraChildRate: number;
  maxAdults: number;
  maxChildren: number;
  amenities: string[];
  totalRoomsCount: number;
}

export interface Building {
  id: string;
  name: string;
  floorsCount: number;
  description: string;
}

export interface Room {
  id: string;
  number: string;
  building: string;
  floor: number;
  category: string;
  maxAdults: number;
  maxChildren: number;
  baseRate: number;
  amenities: string[];
  status: RoomStatus;
  currentStayId?: string;
  assignedHousekeeper?: string;
  outOfOrderReason?: string;
  lastCleaned?: string;
  keyCardStatus?: 'issued' | 'returned' | 'lost';
}

export type VIPLevel = 'Standard' | 'Silver' | 'Gold' | 'Platinum';

export interface GuestProfile {
  id: string;
  guestCode: string;
  name: string;
  phone: string;
  email: string;
  idType: 'National ID' | 'International Passport' | "Driver's License" | 'Voter Card';
  idNumber: string;
  nationality: string;
  address: string;
  companyName?: string;
  emergencyContact: { name: string; phone: string; relationship: string };
  vipLevel: VIPLevel;
  loyaltyPoints: number;
  preferences: string[];
  specialRequests?: string;
  totalStays: number;
  lifetimeSpend: number;
  outstandingBalance: number;
  notes?: string;
  createdAt: string;
}

export type ReservationStatus =
  | 'enquiry'
  | 'tentative'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'no_show';

export type ReservationType = 'individual' | 'group' | 'corporate' | 'walk_in' | 'online';

export interface Reservation {
  id: string;
  bookingCode: string;
  guestId?: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  companyName?: string;
  category: string;
  roomCount: number;
  assignedRoomNumbers: string[];
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  nightlyRate: number;
  estimatedTotal: number;
  depositPaid: number;
  channel: 'Walk-in' | 'Direct Phone' | 'Corporate' | 'Travel Agent' | 'Website Direct';
  type: ReservationType;
  status: ReservationStatus;
  notes?: string;
  createdAt: string;
}

export interface Stay {
  id: string;
  reservationId?: string;
  guestId: string;
  guestName: string;
  guestPhone: string;
  roomId: string;
  roomNumber: string;
  roomCategory: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  nightlyRate: number;
  status: 'active' | 'completed' | 'cancelled';
  depositAmount: number;
  notes?: string;
  checkedInAt: string;
  checkedInBy: string;
  actualCheckOutAt?: string;
  keyCardAssigned?: string;
}

export type DepartmentSource =
  | 'Front Desk'
  | 'Main Restaurant'
  | 'Main Bar'
  | 'Pool Bar'
  | 'Room Service'
  | 'Laundry'
  | 'Gym & Facilities'
  | 'Transport'
  | 'Minibar'
  | 'Spa & Wellness';

export interface FolioTransaction {
  id: string;
  stayId: string;
  roomId: string;
  roomNumber: string;
  guestName: string;
  department: DepartmentSource;
  sourceOrderId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  vatRate: number; // e.g. 0.075 for 7.5%
  serviceChargeRate: number; // e.g. 0.05 for 5%
  taxAmount: number;
  totalAmount: number; // Net total
  status: 'posted' | 'reversed' | 'adjusted';
  reversalReason?: string;
  createdAt: string;
  postedBy: string;
}

export interface FolioPayment {
  id: string;
  stayId: string;
  amount: number;
  paymentMethod: 'cash' | 'pos_card' | 'bank_transfer' | 'corporate_credit';
  reference?: string;
  corporateAccountId?: string;
  receiptNumber: string;
  createdAt: string;
  receivedBy: string;
}

export type KitchenStation =
  | 'Main Kitchen'
  | 'Grill Station'
  | 'Bakery'
  | 'Beverage Station'
  | 'Pool Bar Station';

export interface MenuItem {
  id: string;
  outletIds: string[];
  code: string;
  name: string;
  category: 'Starters & Soups' | 'Main Entrees' | 'Grill & BBQ' | 'Pizzas & Pasta' | 'Beverages & Cocktails' | 'Desserts';
  price: number;
  station: KitchenStation;
  available: boolean;
  prepTimeMinutes: number;
  description: string;
  ingredients: { itemId: string; itemName: string; qty: number; unit: string }[];
}

export interface OrderCartItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
}

export interface POSOrder {
  id: string;
  orderNumber: string;
  outletId: string;
  outletName: string;
  orderType: 'dine_in' | 'takeaway' | 'room_service';
  tableOrRoom: string;
  stayId?: string;
  roomId?: string;
  guestName?: string;
  items: {
    item: MenuItem;
    quantity: number;
    notes?: string;
    station: KitchenStation;
    status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  }[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  total: number;
  paymentMethod: 'room_charge' | 'cash' | 'pos_card' | 'bank_transfer' | 'split';
  paymentStatus: 'paid' | 'pending';
  folioTransactionId?: string;
  cashierName: string;
  createdAt: string;
}

export interface KitchenTicket {
  id: string;
  kotNumber: string;
  orderId: string;
  outletName: string;
  station: KitchenStation;
  items: {
    name: string;
    quantity: number;
    notes?: string;
    status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  }[];
  tableOrRoom: string;
  orderTime: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  priority: 'normal' | 'rush' | 'vip';
}

export interface HousekeepingTask {
  id: string;
  roomId: string;
  roomNumber: string;
  roomCategory: string;
  taskType: 'Checkout Turnaround' | 'Daily Refresh' | 'Deep Sanitization' | 'Supervisor Inspection';
  assignedTo: string;
  status: 'pending' | 'in_progress' | 'completed' | 'inspected';
  priority: 'normal' | 'high' | 'urgent';
  checklist: { task: string; completed: boolean }[];
  minibarChecked: boolean;
  minibarChargesPosted?: number;
  notes?: string;
  updatedAt: string;
}

export interface LostAndFoundItem {
  id: string;
  itemCode: string;
  description: string;
  foundLocation: string; // e.g. Room 205
  foundBy: string;
  foundDate: string;
  status: 'claimed' | 'unclaimed' | 'disposed';
  claimedBy?: string;
  claimedDate?: string;
}

export interface LaundryOrder {
  id: string;
  orderCode: string;
  stayId?: string;
  roomId?: string;
  roomNumber?: string;
  guestName: string;
  guestPhone: string;
  serviceType: 'Standard Wash' | 'Dry Cleaning' | 'Pressing / Ironing' | 'Express 4-Hour';
  items: { name: string; quantity: number; unitPrice: number }[];
  totalAmount: number;
  status: 'received' | 'processing' | 'ready' | 'delivered';
  paymentMethod: 'room_charge' | 'cash' | 'pos_card';
  folioTransactionId?: string;
  createdAt: string;
  expectedDelivery: string;
  staffName: string;
}

export interface FacilityPass {
  id: string;
  guestType: 'in_house' | 'external';
  stayId?: string;
  roomNumber?: string;
  guestName: string;
  guestPhone?: string;
  facility: 'Gym Fitness Centre' | 'Olympic Swimming Pool' | 'Sauna & Steam Bath' | 'Tennis Court';
  passType: 'Complimentary (In-House)' | 'Day Pass' | 'Personal Training Session' | 'Monthly Membership';
  amount: number;
  paymentMethod?: 'room_charge' | 'cash' | 'pos_card';
  folioTransactionId?: string;
  createdAt: string;
  staffName: string;
}

export interface TransportTrip {
  id: string;
  tripCode: string;
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
  status: 'scheduled' | 'en_route' | 'completed' | 'cancelled';
  paymentMethod: 'room_charge' | 'direct';
  folioTransactionId?: string;
  bookedAt: string;
}

export type StoreLocation =
  | 'Central Warehouse'
  | 'Kitchen Store'
  | 'Restaurant Store'
  | 'Bar Store'
  | 'Housekeeping Store'
  | 'Laundry Store'
  | 'Maintenance Store';

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: 'Food Ingredients' | 'Beverages & Spirits' | 'Linen & Bedding' | 'Cleaning Chemicals' | 'Guest Amenities' | 'Maintenance Parts';
  storeStocks: Record<StoreLocation, number>;
  unit: string;
  reorderLevel: number;
  unitCost: number;
  supplierName: string;
}

export interface StockMovement {
  id: string;
  movementCode: string;
  date: string;
  type: 'Goods Received (GRN)' | 'Department Transfer' | 'POS Consumption' | 'Wastage / Expiry' | 'Physical Count Adjustment';
  fromStore: string;
  toStore: string;
  itemName: string;
  quantity: number;
  unit: string;
  user: string;
  notes: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  orderDate: string;
  expectedDate: string;
  items: { itemName: string; quantity: number; unit: string; estimatedCost: number }[];
  totalCost: number;
  status: 'pending_approval' | 'approved' | 'received' | 'cancelled';
  requestedBy: string;
}

export interface MaintenanceRequest {
  id: string;
  code: string;
  roomId?: string;
  roomNumber?: string;
  locationArea: string;
  category: 'HVAC / Air Conditioning' | 'Plumbing & Water' | 'Electrical & Lighting' | 'Carpentry & Lock' | 'Appliance';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reportedBy: string;
  assignedTechnician: string;
  status: 'open' | 'in_progress' | 'resolved';
  locksRoom: boolean;
  costEstimate?: number;
  createdAt: string;
  resolvedAt?: string;
}

export interface CorporateAccount {
  id: string;
  companyName: string;
  rcNumber: string;
  contactPerson: string;
  email: string;
  phone: string;
  creditLimit: number;
  currentBalance: number;
  creditPeriodDays: number;
  status: 'active' | 'suspended';
  lastBilled: string;
}

export interface AccountLedgerEntry {
  id: string;
  accountNumber: string;
  accountName: string;
  accountType: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  debit: number;
  credit: number;
  description: string;
  date: string;
  reference: string;
}

export type StaffRole =
  | 'super_admin'
  | 'general_manager'
  | 'front_office_manager'
  | 'receptionist'
  | 'accountant'
  | 'cashier'
  | 'restaurant_manager'
  | 'waiter'
  | 'chef'
  | 'housekeeping_supervisor'
  | 'housekeeping_staff'
  | 'storekeeper'
  | 'procurement_officer'
  | 'maintenance_staff'
  | 'auditor';

export interface Employee {
  id: string;
  empNumber: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  title: string;
  department: string;
  shift: 'Morning (07:00-15:00)' | 'Evening (15:00-23:00)' | 'Night (23:00-07:00)' | 'General Shift';
  status: 'active' | 'on_leave' | 'terminated';
  hireDate: string;
  salary: number;
  avatarColor: string;
}

export interface AuditLog {
  id: string;
  logCode: string;
  timestamp: string;
  userName: string;
  userRole: string;
  category: 'AUTH' | 'FINANCE' | 'RESERVATION' | 'ROOM_STATUS' | 'FOLIO_CHARGE' | 'DISCOUNT' | 'INVENTORY' | 'CONFIG';
  action: string;
  details: string;
  ipAddress: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface NightAuditRun {
  id: string;
  auditNumber: string;
  businessDate: string;
  closedAt: string;
  closedBy: string;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  roomRevenue: number;
  fAndBRevenue: number;
  servicesRevenue: number;
  totalRevenue: number;
  adr: number;
  revPar: number;
  notes: string;
}

export interface HotelSettings {
  hotelName: string;
  address: string;
  cityCountry: string;
  tinNumber: string;
  phone: string;
  email: string;
  baseCurrency: 'NGN' | 'USD';
  vatRate: number; // 0.075
  serviceChargeRate: number; // 0.05
  tourismLevyRate: number; // 0.01
  checkInTime: string; // 14:00
  checkOutTime: string; // 12:00
  nightAuditHour: string; // 02:00
}
