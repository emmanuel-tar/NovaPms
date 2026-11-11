/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RoomCategory = 'Standard Single' | 'Deluxe Double' | 'Executive Suite' | 'Presidential Penthouse';

export type RoomStatus =
  | 'available'
  | 'occupied'
  | 'reserved'
  | 'dirty'
  | 'cleaning'
  | 'inspected'
  | 'out_of_order'
  | 'maintenance';

export interface Room {
  id: string;
  number: string;
  floor: number;
  category: RoomCategory;
  maxAdults: number;
  maxChildren: number;
  baseRate: number; // in NGN
  amenities: string[];
  status: RoomStatus;
  currentStayId?: string;
  outOfOrderReason?: string;
  lastCleaned?: string;
}

export type VIPLevel = 'Standard' | 'Silver' | 'Gold' | 'Platinum';

export interface Guest {
  id: string;
  name: string;
  phone: string;
  email: string;
  idType: 'National ID' | 'International Passport' | "Driver's License" | 'Voter Card';
  idNumber: string;
  address: string;
  companyName?: string;
  vipLevel: VIPLevel;
  totalStays: number;
  notes?: string;
}

export interface Stay {
  id: string;
  reservationId?: string;
  guestId: string;
  guestName: string;
  guestPhone: string;
  roomId: string;
  roomNumber: string;
  roomCategory: RoomCategory;
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
}

export type DepartmentSource =
  | 'Front Desk'
  | 'Main Restaurant'
  | 'Pool Bar'
  | 'Lounge Bar'
  | 'Room Service'
  | 'Laundry'
  | 'Gym & Pool'
  | 'Transport'
  | 'Minibar';

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
  createdAt: string;
  receivedBy: string;
}

export interface Reservation {
  id: string;
  bookingCode: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  companyName?: string;
  category: RoomCategory;
  assignedRoomId?: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  estimatedTotal: number;
  depositPaid: number;
  channel: 'Walk-in' | 'Direct Phone' | 'Corporate' | 'Travel Agent' | 'Website';
  status: 'confirmed' | 'tentative' | 'checked_in' | 'cancelled' | 'no_show';
  createdAt: string;
}

export type KitchenStation =
  | 'Main Kitchen'
  | 'Grill Station'
  | 'Bakery'
  | 'Beverage Station'
  | 'Pool Bar Station';

export interface MenuItem {
  id: string;
  outletIds: string[]; // e.g. ['main_rest', 'pool_bar']
  name: string;
  category: 'Starters & Soups' | 'Main Entrees' | 'Grill & BBQ' | 'Pizzas & Pasta' | 'Beverages & Cocktails' | 'Desserts';
  price: number;
  station: KitchenStation;
  available: boolean;
  prepTimeMinutes: number;
  description: string;
  ingredients: { itemName: string; qty: number; unit: string }[];
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
  tableOrRoom: string; // e.g. "Table 4" or "Room 205"
  stayId?: string;
  roomId?: string;
  guestName?: string;
  items: {
    item: MenuItem;
    quantity: number;
    notes?: string;
    station: KitchenStation;
    status: 'pending' | 'preparing' | 'ready' | 'served';
  }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'room_charge' | 'cash' | 'pos_card' | 'bank_transfer';
  paymentStatus: 'paid' | 'pending';
  folioTransactionId?: string;
  createdAt: string;
  cashierName: string;
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
    status: 'pending' | 'preparing' | 'ready' | 'served';
  }[];
  tableOrRoom: string;
  orderTime: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  priority: 'normal' | 'rush' | 'vip';
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
  facility: 'Gym Fitness Centre' | 'Olympic Swimming Pool' | 'Sauna & Steam Bath';
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
  vehicle: string; // e.g. "Toyota Prado TX - APP-492-LG"
  driver: string; // e.g. "Chinedu Okafor"
  pickupLocation: string;
  destination: string;
  scheduledTime: string;
  fee: number;
  status: 'scheduled' | 'en_route' | 'completed' | 'cancelled';
  paymentMethod: 'room_charge' | 'direct';
  folioTransactionId?: string;
  bookedAt: string;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: 'Food Ingredients' | 'Beverages & Spirits' | 'Linen & Bedding' | 'Cleaning Chemicals' | 'Guest Amenities';
  centralStock: number;
  kitchenStock: number;
  barStock: number;
  housekeepingStock: number;
  unit: string;
  reorderLevel: number;
  unitCost: number;
}

export interface StockMovement {
  id: string;
  movementCode: string;
  date: string;
  type: 'Goods Received (GRN)' | 'Department Transfer' | 'POS Consumption' | 'Wastage / Expiry';
  fromStore: string;
  toStore: string;
  itemName: string;
  quantity: number;
  unit: string;
  user: string;
  notes: string;
}

export interface HousekeepingTask {
  id: string;
  roomId: string;
  roomNumber: string;
  roomCategory: RoomCategory;
  taskType: 'Checkout Turnaround' | 'Daily Refresh' | 'Deep Sanitization' | 'Supervisor Inspection';
  assignedTo: string;
  status: 'pending' | 'in_progress' | 'completed' | 'inspected';
  priority: 'normal' | 'high' | 'urgent';
  minibarChecked: boolean;
  minibarChargesPosted?: number;
  updatedAt: string;
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
  createdAt: string;
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

export interface StaffUser {
  id: string;
  name: string;
  role: 'super_admin' | 'front_desk' | 'restaurant_cashier' | 'chef' | 'laundry_staff' | 'storekeeper' | 'accountant' | 'housekeeper';
  title: string;
  department: string;
  shift: string;
  avatarColor: string;
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
