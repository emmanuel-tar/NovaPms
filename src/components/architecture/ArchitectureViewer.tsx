/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Database,
  FileCode2,
  Server,
  Layers,
  CheckCircle,
  Network,
  ListTree,
  TableProperties,
} from 'lucide-react';

export const ArchitectureViewer: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'erd' | 'arch' | 'roadmap' | 'prd'>('erd');
  const [selectedModule, setSelectedModule] = useState<string>('all');

  // ERD Tables definition
  const erdModules = [
    {
      module: 'Rooms & Stays',
      color: 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300',
      tables: [
        {
          name: 'rooms',
          pk: 'id (UUID)',
          columns: ['number (VARCHAR)', 'floor (INT)', 'category_id (FK)', 'status (ENUM)', 'base_rate (NUMERIC)', 'is_active (BOOL)'],
        },
        {
          name: 'room_types',
          pk: 'id (UUID)',
          columns: ['code (VARCHAR)', 'name (VARCHAR)', 'max_adults (INT)', 'max_children (INT)', 'amenities (JSONB)'],
        },
        {
          name: 'reservations',
          pk: 'id (UUID)',
          columns: ['booking_code (VARCHAR)', 'guest_id (FK)', 'check_in_date (DATE)', 'check_out_date (DATE)', 'status (ENUM)', 'deposit_paid (NUMERIC)'],
        },
        {
          name: 'stays',
          pk: 'id (UUID)',
          columns: ['reservation_id (FK)', 'guest_id (FK)', 'room_id (FK)', 'actual_check_in (TIMESTAMPTZ)', 'actual_check_out (TIMESTAMPTZ)', 'status (ENUM)'],
        },
      ],
    },
    {
      module: 'Central Folio & Financial Ledger',
      color: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300',
      tables: [
        {
          name: 'folios',
          pk: 'id (UUID)',
          columns: ['stay_id (FK)', 'folio_number (VARCHAR)', 'status (ENUM)', 'balance_outstanding (NUMERIC)', 'currency_code (CHAR(3))'],
        },
        {
          name: 'folio_transactions',
          pk: 'id (UUID)',
          columns: ['folio_id (FK)', 'department (VARCHAR)', 'source_order_id (VARCHAR)', 'unit_price (NUMERIC)', 'vat_amount (NUMERIC)', 'total_amount (NUMERIC)', 'posted_by (FK)'],
        },
        {
          name: 'folio_payments',
          pk: 'id (UUID)',
          columns: ['folio_id (FK)', 'amount (NUMERIC)', 'payment_method (ENUM)', 'reference (VARCHAR)', 'received_by (FK)'],
        },
        {
          name: 'journal_entries',
          pk: 'id (UUID)',
          columns: ['business_date (DATE)', 'debit_account_id (FK)', 'credit_account_id (FK)', 'amount (NUMERIC)', 'source_module (VARCHAR)'],
        },
      ],
    },
    {
      module: 'POS & Kitchen Routing (KDS)',
      color: 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300',
      tables: [
        {
          name: 'pos_orders',
          pk: 'id (UUID)',
          columns: ['order_number (VARCHAR)', 'outlet_id (FK)', 'order_type (ENUM)', 'table_or_room (VARCHAR)', 'stay_id (FK)', 'total (NUMERIC)', 'payment_method (ENUM)'],
        },
        {
          name: 'order_items',
          pk: 'id (UUID)',
          columns: ['order_id (FK)', 'menu_item_id (FK)', 'quantity (INT)', 'unit_price (NUMERIC)', 'station (ENUM)', 'status (ENUM)'],
        },
        {
          name: 'kitchen_tickets (KOT)',
          pk: 'id (UUID)',
          columns: ['kot_number (VARCHAR)', 'order_id (FK)', 'station (ENUM)', 'priority (ENUM)', 'status (ENUM)', 'created_at (TIMESTAMPTZ)'],
        },
        {
          name: 'menu_items',
          pk: 'id (UUID)',
          columns: ['code (VARCHAR)', 'name (VARCHAR)', 'category (VARCHAR)', 'price (NUMERIC)', 'station (ENUM)', 'is_available (BOOL)'],
        },
      ],
    },
    {
      module: 'Inventory & Procurement',
      color: 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300',
      tables: [
        {
          name: 'inventory_items',
          pk: 'id (UUID)',
          columns: ['code (VARCHAR)', 'name (VARCHAR)', 'category (VARCHAR)', 'unit (VARCHAR)', 'unit_cost (NUMERIC)', 'reorder_level (INT)'],
        },
        {
          name: 'inventory_balances',
          pk: 'id (UUID)',
          columns: ['item_id (FK)', 'store_location_id (FK)', 'quantity_on_hand (NUMERIC)', 'last_count_date (DATE)'],
        },
        {
          name: 'inventory_movements',
          pk: 'id (UUID)',
          columns: ['movement_code (VARCHAR)', 'movement_type (ENUM)', 'from_store (FK)', 'to_store (FK)', 'item_id (FK)', 'quantity (NUMERIC)', 'created_by (FK)'],
        },
        {
          name: 'recipe_bills_of_materials',
          pk: 'id (UUID)',
          columns: ['menu_item_id (FK)', 'raw_item_id (FK)', 'quantity_consumed (NUMERIC)', 'unit (VARCHAR)'],
        },
      ],
    },
    {
      module: 'Hotel Services',
      color: 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-300',
      tables: [
        {
          name: 'laundry_orders',
          pk: 'id (UUID)',
          columns: ['order_code (VARCHAR)', 'stay_id (FK)', 'service_type (ENUM)', 'total_amount (NUMERIC)', 'folio_tx_id (FK)', 'status (ENUM)'],
        },
        {
          name: 'facility_passes',
          pk: 'id (UUID)',
          columns: ['stay_id (FK)', 'visitor_name (VARCHAR)', 'facility (ENUM)', 'pass_type (ENUM)', 'amount (NUMERIC)', 'folio_tx_id (FK)'],
        },
        {
          name: 'transport_trips',
          pk: 'id (UUID)',
          columns: ['trip_code (VARCHAR)', 'stay_id (FK)', 'vehicle_id (FK)', 'trip_type (ENUM)', 'fee (NUMERIC)', 'folio_tx_id (FK)', 'status (ENUM)'],
        },
        {
          name: 'maintenance_requests',
          pk: 'id (UUID)',
          columns: ['room_id (FK)', 'category (ENUM)', 'description (TEXT)', 'priority (ENUM)', 'locks_room (BOOL)', 'status (ENUM)'],
        },
      ],
    },
    {
      module: 'Security & Audit Control',
      color: 'border-slate-500 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300',
      tables: [
        {
          name: 'staff_users',
          pk: 'id (UUID)',
          columns: ['username (VARCHAR)', 'password_hash (VARCHAR)', 'role_id (FK)', 'department (VARCHAR)', 'is_active (BOOL)'],
        },
        {
          name: 'audit_logs',
          pk: 'id (UUID)',
          columns: ['user_id (FK)', 'action (VARCHAR)', 'entity_name (VARCHAR)', 'entity_id (VARCHAR)', 'old_data (JSONB)', 'new_data (JSONB)', 'timestamp (TIMESTAMPTZ)'],
        },
        {
          name: 'night_audit_runs',
          pk: 'id (UUID)',
          columns: ['business_date (DATE)', 'closed_by (FK)', 'occupancy_rate (NUMERIC)', 'adr (NUMERIC)', 'revpar (NUMERIC)', 'total_revenue (NUMERIC)'],
        },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            System Blueprint & Technical Specification
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
            Grand Vista Hotel PMS Architecture & Database ERD
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Modular Monolith · Centralized Transaction Folio Engine · PostgreSQL 35+ Table Schema
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setActiveSection('erd')}
            className={`px-3 py-1.5 font-semibold rounded-md transition-colors ${
              activeSection === 'erd'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Database ERD (35+ Tables)
          </button>
          <button
            onClick={() => setActiveSection('arch')}
            className={`px-3 py-1.5 font-semibold rounded-md transition-colors ${
              activeSection === 'arch'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            System Topology
          </button>
          <button
            onClick={() => setActiveSection('roadmap')}
            className={`px-3 py-1.5 font-semibold rounded-md transition-colors ${
              activeSection === 'roadmap'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Implementation Roadmap
          </button>
        </div>
      </div>

      {/* ERD DIAGRAM VIEW */}
      {activeSection === 'erd' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600 shrink-0" />
              <span>
                <strong>PostgreSQL Normalized Relational Schema:</strong> High-integrity database design with UUID primary keys, transactional immutability on posted folios, and foreign-key integrity across all hotel departments.
              </span>
            </div>
            <span className="font-mono font-bold text-[11px] bg-white dark:bg-slate-800 px-2.5 py-1 rounded border border-indigo-200 dark:border-indigo-800">
              NUMERIC(18,2) Money
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {erdModules.map((mod) => (
              <div
                key={mod.module}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs"
              >
                <div className={`p-2 rounded-lg border text-xs font-bold ${mod.color}`}>
                  {mod.module}
                </div>

                <div className="space-y-3">
                  {mod.tables.map((tbl) => (
                    <div
                      key={tbl.name}
                      className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs font-mono space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                        <span className="text-emerald-700 dark:text-emerald-400">{tbl.name}</span>
                        <span className="text-[10px] text-slate-400">PK: {tbl.pk}</span>
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400 space-y-0.5 border-t border-slate-200 dark:border-slate-700 pt-1">
                        {tbl.columns.map((col, idx) => (
                          <div key={idx} className="truncate">
                            {col}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SYSTEM TOPOLOGY VIEW */}
      {activeSection === 'arch' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Network className="w-5 h-5 text-emerald-600" />
              Integrated Hotel PMS Topology & Data Flow
            </h3>
            <p className="text-xs text-slate-500">
              How Front Desk, POS Outlets, Kitchen KDS, Laundry, and Housekeeping communicate with the central billing engine.
            </p>
          </div>

          {/* Architecture Visual Diagram */}
          <div className="p-6 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 font-mono text-xs space-y-6">
            <div className="text-center font-bold text-amber-400 text-sm">
              [ HOTEL OPERATIONAL CLIENT DEVICES OVER SECURE LAN ]
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[11px]">
              <div className="p-2.5 rounded bg-slate-800 border border-slate-700">
                Front Desk Browser
              </div>
              <div className="p-2.5 rounded bg-slate-800 border border-slate-700">
                Restaurant POS Terminals
              </div>
              <div className="p-2.5 rounded bg-slate-800 border border-slate-700">
                Kitchen KDS Screens
              </div>
              <div className="p-2.5 rounded bg-slate-800 border border-slate-700">
                Laundry & Housekeeping Tablets
              </div>
              <div className="p-2.5 rounded bg-slate-800 border border-slate-700">
                Executive Management Dashboard
              </div>
            </div>

            <div className="text-center text-slate-500">&darr; &uarr; HTTPS REST API & Real-time WebSockets &darr; &uarr;</div>

            {/* Central Node.js Server Box */}
            <div className="p-4 rounded-xl bg-slate-900 border-2 border-emerald-500 space-y-3">
              <div className="flex justify-between items-center text-emerald-400 font-bold">
                <span>CENTRAL APPLICATION SERVER (Node.js + Express)</span>
                <span className="text-[11px] bg-emerald-950 border border-emerald-700 px-2 py-0.5 rounded">
                  PORT 3000 / LOCAL SERVER
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                <div className="p-2 bg-slate-800/80 rounded border border-slate-700">
                  <div className="text-white font-bold mb-1">Central Folio Engine</div>
                  <div className="text-slate-400 text-[10px]">
                    Validates active stay & occupancy before posting charges. Idempotent transactions.
                  </div>
                </div>

                <div className="p-2 bg-slate-800/80 rounded border border-slate-700">
                  <div className="text-white font-bold mb-1">POS & Station Dispatcher</div>
                  <div className="text-slate-400 text-[10px]">
                    Routes order items to Grill, Bakery, Beverage & Kitchen stations automatically.
                  </div>
                </div>

                <div className="p-2 bg-slate-800/80 rounded border border-slate-700">
                  <div className="text-white font-bold mb-1">Inventory Ledger & Night Audit</div>
                  <div className="text-slate-400 text-[10px]">
                    Deducts recipe ingredients on sale. Automatically rolls business date & ADR.
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center text-slate-500">&darr; &uarr; Relational ACID Transactions &darr; &uarr;</div>

            {/* Database Box */}
            <div className="p-4 rounded-xl bg-slate-900 border border-blue-500 flex justify-between items-center">
              <div>
                <span className="font-bold text-blue-400">CENTRAL POSTGRESQL DATABASE</span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Single source of truth for Rooms, Stays, Folios, Inventory, Staff & General Ledger.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-blue-300 bg-blue-950 border border-blue-800 px-2 py-1 rounded">
                UUID Keys · NUMERIC Currency
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ROADMAP & DEFINITION OF DONE VIEW */}
      {activeSection === 'roadmap' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Commercial Hotel PMS Delivery Roadmap
            </h3>
            <p className="text-xs text-slate-500">
              Progressive phased rollout for 120-200 room hotel operations.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {[
              {
                phase: 'Phase 1: Core PMS Foundation & Room Operations',
                status: 'Completed & Operational',
                color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 border-emerald-200',
                items: [
                  'Room management (Single, Double, Deluxe, Suite, Presidential)',
                  'Room statuses: Available, Occupied, Dirty, Cleaning, Inspected, Out of Order',
                  'Front Desk check-in with deposits and guest ID verification',
                  'Stay lifecycle management, room assignments, and check-out settlement',
                ],
              },
              {
                phase: 'Phase 2: Central Guest Folio & Charge Engine',
                status: 'Completed & Operational',
                color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 border-emerald-200',
                items: [
                  'Central consolidated folio for every in-house guest',
                  'Immutable transaction postings with VAT (7.5%) and Service Charge (5%)',
                  'Seamless department posting from Restaurant, Laundry, Bar, Gym, and Transport',
                  'Split settlements, corporate credit routing, and official folio tax invoices',
                ],
              },
              {
                phase: 'Phase 3: Multi-Outlet Restaurant POS & Kitchen KDS',
                status: 'Completed & Operational',
                color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 border-emerald-200',
                items: [
                  'Multiple outlets: Main Restaurant, Pool Bar, Lounge Bar, Room Service',
                  'Charge to Room validation (verifies occupied room and guest name)',
                  'Automated KOT station routing (Main Kitchen, Grill, Bakery, Beverage, Pool Bar)',
                  'Real-time preparation bump bar (Pending -> Preparing -> Ready -> Served)',
                ],
              },
              {
                phase: 'Phase 4: Hotel Services (Laundry, Gym, Pool, Transport, Housekeeping)',
                status: 'Completed & Operational',
                color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 border-emerald-200',
                items: [
                  'Laundry & valet garment intake with automated room charging',
                  'Gym and swimming pool pass management (in-house vs external day passes)',
                  'Airport pickup/drop-off and VIP chauffeur bookings',
                  'Minibar auditing with immediate folio charge posting and room inspection',
                ],
              },
              {
                phase: 'Phase 5: Inventory, Stores & Double-Entry Accounting',
                status: 'Completed & Operational',
                color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 border-emerald-200',
                items: [
                  'Central store and department stores (Kitchen, Bar, Housekeeping)',
                  'Stock movements (GRN receipts, requisitions, transfers, recipe consumption)',
                  'Corporate credit accounts with credit limits and aging balances',
                  'Automated Night Audit wizard calculating ADR, Occupancy %, and RevPAR',
                ],
              },
            ].map((p, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{p.phase}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${p.color}`}>
                    {p.status}
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 pl-1">
                  {p.items.map((it, itIdx) => (
                    <li key={itIdx}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
