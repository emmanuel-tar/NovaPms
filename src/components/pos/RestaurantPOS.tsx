/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePMS } from '../../context/PMSContext';
import { MenuItem, OrderCartItem, Stay } from '../../types/pms';
import {
  UtensilsCrossed,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Building,
  CheckCircle2,
  Printer,
  X,
  Clock,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

export const RestaurantPOS: React.FC = () => {
  const {
    menuItems,
    rooms,
    stays,
    createPOSOrder,
    formatMoney,
    currentEmployee,
    businessDate,
    showToast,
  } = usePMS();

  // Outlets
  const outlets = [
    { id: 'main_rest', name: 'Main Restaurant', icon: '🍽️' },
    { id: 'pool_bar', name: 'Pool Bar', icon: '🏊' },
    { id: 'lounge_bar', name: 'Executive Lounge Bar', icon: '🍸' },
    { id: 'room_service', name: 'In-Room Dining', icon: '🛎️' },
  ];

  const [selectedOutlet, setSelectedOutlet] = useState(outlets[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart
  const [cart, setCart] = useState<OrderCartItem[]>([]);
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'room_service'>('dine_in');
  const [tableNumber, setTableNumber] = useState('Table 4');

  // Charge to Room Modal State
  const [showRoomChargeModal, setShowRoomChargeModal] = useState(false);
  const [selectedStayId, setSelectedStayId] = useState<string>('');
  const [roomSearch, setRoomSearch] = useState('');

  // Thermal Receipt Preview Modal
  const [lastReceipt, setLastReceipt] = useState<{
    orderNumber: string;
    items: OrderCartItem[];
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
    outletName: string;
    tableOrRoom: string;
    guestName?: string;
  } | null>(null);

  // Active occupied stays for room posting
  const activeStays = stays.filter((s) => s.status === 'active');

  // Filter items by outlet and category
  const availableItems = menuItems.filter((item) => {
    const matchesOutlet = item.outletIds.includes(selectedOutlet.id);
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesOutlet && matchesCategory && matchesSearch;
  });

  const categories = [
    'All',
    'Main Entrees',
    'Starters & Soups',
    'Grill & BBQ',
    'Pizzas & Pasta',
    'Beverages & Cocktails',
  ];

  // Cart math
  const cartSubtotal = cart.reduce((sum, i) => sum + i.item.price * i.quantity, 0);
  const cartVat = cartSubtotal * 0.075;
  const cartServiceCharge = cartSubtotal * 0.05;
  const cartTotal = cartSubtotal + cartVat + cartServiceCharge;

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.item.id === itemId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const handleExecutePayment = (
    method: 'room_charge' | 'cash' | 'pos_card' | 'bank_transfer',
    stayToCharge?: Stay
  ) => {
    if (cart.length === 0) {
      showToast('Your order cart is empty!', 'error');
      return;
    }

    const targetStay = stayToCharge || activeStays.find((s) => s.id === selectedStayId);

    if (method === 'room_charge' && !targetStay) {
      showToast('Please select an active in-house guest room to charge.', 'error');
      return;
    }

    const tableOrRoomLabel =
      method === 'room_charge' && targetStay
        ? `Room ${targetStay.roomNumber} (${targetStay.guestName})`
        : orderType === 'room_service' && targetStay
        ? `Room ${targetStay.roomNumber}`
        : tableNumber;

    const res = createPOSOrder({
      outletId: selectedOutlet.id,
      outletName: selectedOutlet.name,
      orderType: method === 'room_charge' ? 'room_service' : orderType,
      tableOrRoom: tableOrRoomLabel,
      stayId: targetStay?.id,
      roomId: targetStay?.roomId,
      guestName: targetStay?.guestName,
      items: cart,
      paymentMethod: method,
    });

    if (res.success) {
      setLastReceipt({
        orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        items: [...cart],
        subtotal: cartSubtotal,
        tax: cartVat + cartServiceCharge,
        total: cartTotal,
        paymentMethod:
          method === 'room_charge'
            ? `Charge to Room ${targetStay?.roomNumber}`
            : method.toUpperCase(),
        outletName: selectedOutlet.name,
        tableOrRoom: tableOrRoomLabel,
        guestName: targetStay?.guestName,
      });

      setCart([]);
      setShowRoomChargeModal(false);
      setSelectedStayId('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-140px)]">
      {/* Left 8 Cols: Outlet Switcher, Categories, Menu Grid */}
      <div className="lg:col-span-8 flex flex-col h-full space-y-4 overflow-hidden">
        {/* Outlets Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
          {outlets.map((outlet) => (
            <button
              key={outlet.id}
              onClick={() => {
                setSelectedOutlet(outlet);
                setSelectedCategory('All');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedOutlet.id === outlet.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>{outlet.icon}</span>
              <span>{outlet.name}</span>
            </button>
          ))}
        </div>

        {/* Search & Category Filter Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search dishes, cocktails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 font-medium rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {availableItems.map((item) => (
              <div
                key={item.id}
                onClick={() => addToCart(item)}
                className="group cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors leading-snug">
                      {item.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {item.station}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatMoney(item.price)}
                  </span>
                  <button className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right 4 Cols: Active Order Cart & "Charge to Room" */}
      <div className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full shadow-xs overflow-hidden">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Current Ticket ({cart.reduce((s, i) => s + i.quantity, 0)})
              </span>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Order Type & Table selection */}
          <div className="grid grid-cols-3 gap-1 mt-3 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setOrderType('dine_in')}
              className={`py-1 font-semibold rounded transition-colors ${
                orderType === 'dine_in'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Dine-in
            </button>
            <button
              onClick={() => setOrderType('room_service')}
              className={`py-1 font-semibold rounded transition-colors ${
                orderType === 'room_service'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              In-Room
            </button>
            <button
              onClick={() => setOrderType('takeaway')}
              className={`py-1 font-semibold rounded transition-colors ${
                orderType === 'takeaway'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Takeaway
            </button>
          </div>

          {orderType === 'dine_in' && (
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-slate-500">Seating:</span>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="flex-1 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
              />
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs text-center px-4">
              <UtensilsCrossed className="w-8 h-8 stroke-1 text-slate-300 dark:text-slate-700 mb-2" />
              <p>No dishes in ticket.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Select items from the menu to add to this order.
              </p>
            </div>
          ) : (
            cart.map(({ item, quantity }) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {item.name}
                  </div>
                  <div className="text-[11px] text-slate-500 tabular-nums">
                    {formatMoney(item.price)} each · Station: {item.station}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center font-bold tabular-nums">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="w-16 text-right font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums shrink-0">
                  {formatMoney(item.price * quantity)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Totals & Checkout Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5 text-xs">
          <div className="space-y-1 text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono tabular-nums">{formatMoney(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>VAT (7.5%) + Service (5%):</span>
              <span className="font-mono tabular-nums">{formatMoney(cartVat + cartServiceCharge)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100 pt-1 border-t border-slate-200 dark:border-slate-700">
              <span>Grand Total:</span>
              <span className="font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                {formatMoney(cartTotal)}
              </span>
            </div>
          </div>

          {/* CRITICAL FEATURE BUTTON: CHARGE TO ROOM */}
          <div className="pt-2 space-y-2">
            <button
              disabled={cart.length === 0}
              onClick={() => setShowRoomChargeModal(true)}
              className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Building className="w-4 h-4" />
              Charge to Room Folio
            </button>

            {/* Direct Tenders: Card or Cash */}
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={cart.length === 0}
                onClick={() => handleExecutePayment('pos_card')}
                className="py-1.5 px-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                POS Card
              </button>
              <button
                disabled={cart.length === 0}
                onClick={() => handleExecutePayment('cash')}
                className="py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                Cash Tender
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CHARGE TO ROOM MODAL (The key workflow highlighted in prompt) */}
      {showRoomChargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-lg w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Post Bill to Guest Room Account
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Select verified active in-house guest to debit folio.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRoomChargeModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-blue-900 dark:text-blue-200 flex justify-between items-center">
              <span>Order Total to Post:</span>
              <span className="font-mono font-bold text-sm tabular-nums">
                {formatMoney(cartTotal)}
              </span>
            </div>

            {/* Room Search */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Select Active Occupied Room:
              </label>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {activeStays.map((stay) => {
                  const is205 = stay.roomNumber === '205';
                  return (
                    <div
                      key={stay.id}
                      onClick={() => setSelectedStayId(stay.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                        selectedStayId === stay.id
                          ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/50 ring-1 ring-blue-500'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${
                            is205
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {stay.roomNumber}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">
                            {stay.guestName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {stay.roomCategory} · Out: {stay.checkOutDate}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {is205 && (
                          <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded uppercase">
                            Room 205 (Prompt Demo)
                          </span>
                        )}
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Dep: {formatMoney(stay.depositAmount)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRoomChargeModal(false)}
                className="px-3.5 py-1.5 rounded text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedStayId}
                onClick={() => handleExecutePayment('room_charge')}
                className="px-4 py-1.5 rounded bg-blue-600 disabled:opacity-50 text-white font-bold hover:bg-blue-700 shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm Room Charge ({formatMoney(cartTotal)})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* THERMAL RECEIPT MODAL */}
      {lastReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 p-6 rounded-xl shadow-2xl max-w-sm w-full font-mono text-xs border border-slate-200 space-y-3">
            <div className="text-center border-b border-slate-300 pb-2">
              <h3 className="font-bold text-sm tracking-tight">GRAND VISTA HOTEL</h3>
              <p className="text-[10px] text-slate-500">Victoria Island, Lagos</p>
              <p className="text-[10px] font-bold text-slate-700 mt-1 uppercase">
                {lastReceipt.outletName}
              </p>
              <p className="text-[10px] text-slate-400">Order #{lastReceipt.orderNumber}</p>
            </div>

            <div className="text-[11px] space-y-0.5 text-slate-600">
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{businessDate} {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between">
                <span>Server:</span>
                <span>{currentEmployee.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Destination:</span>
                <span className="font-bold text-slate-900">{lastReceipt.tableOrRoom}</span>
              </div>
            </div>

            <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-1.5">
              {lastReceipt.items.map((i, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {i.quantity}x {i.item.name}
                  </span>
                  <span className="font-bold">{formatMoney(i.item.price * i.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatMoney(lastReceipt.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>VAT & Service:</span>
                <span>{formatMoney(lastReceipt.tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-300">
                <span>TOTAL:</span>
                <span>{formatMoney(lastReceipt.total)}</span>
              </div>
              <div className="flex justify-between text-blue-700 font-bold pt-1">
                <span>TENDER:</span>
                <span>{lastReceipt.paymentMethod}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-200">
              * Charges successfully integrated to Folio *
            </div>

            <div className="pt-2 flex justify-between gap-2">
              <button
                onClick={() => setLastReceipt(null)}
                className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded font-semibold text-xs flex items-center justify-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
