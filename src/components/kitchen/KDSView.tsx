/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePMS } from '../../context/PMSContext';
import { KitchenStation, KitchenTicket } from '../../types/pms';
import {
  ChefHat,
  Flame,
  Coffee,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Volume2,
  Filter,
} from 'lucide-react';

export const KDSView: React.FC = () => {
  const { kitchenTickets, updateKitchenTicketStatus, showToast } = usePMS();

  const stations: (KitchenStation | 'All Stations')[] = [
    'All Stations',
    'Main Kitchen',
    'Grill Station',
    'Bakery',
    'Beverage Station',
    'Pool Bar Station',
  ];

  const [activeStation, setActiveStation] = useState<KitchenStation | 'All Stations'>('All Stations');
  const [statusFilter, setStatusFilter] = useState<'active' | 'served' | 'all'>('active');

  const filteredTickets = kitchenTickets.filter((ticket) => {
    if (activeStation !== 'All Stations' && ticket.station !== activeStation) return false;
    if (statusFilter === 'active' && ticket.status === 'served') return false;
    if (statusFilter === 'served' && ticket.status !== 'served') return false;
    return true;
  });

  const getStationIcon = (st: KitchenStation) => {
    switch (st) {
      case 'Grill Station':
        return <Flame className="w-3.5 h-3.5 text-orange-500" />;
      case 'Beverage Station':
        return <Coffee className="w-3.5 h-3.5 text-blue-500" />;
      default:
        return <ChefHat className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  const advanceTicket = (ticket: KitchenTicket) => {
    if (ticket.status === 'pending') {
      updateKitchenTicketStatus(ticket.id, 'preparing');
    } else if (ticket.status === 'preparing') {
      updateKitchenTicketStatus(ticket.id, 'ready');
      showToast(`${ticket.kotNumber} for ${ticket.tableOrRoom} is READY for service!`, 'success');
    } else if (ticket.status === 'ready') {
      updateKitchenTicketStatus(ticket.id, 'served');
    }
  };

  return (
    <div className="space-y-4">
      {/* KDS Station Header & Station Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 text-white border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-600 flex items-center justify-center text-white">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">
              Kitchen Display System (KDS) & KOT Routing
            </h2>
            <p className="text-xs text-slate-400">
              Live automated kitchen routing from Restaurant, Pool Bar & Room Service.
            </p>
          </div>
        </div>

        {/* Status filter toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 font-semibold rounded transition-colors ${
              statusFilter === 'active' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Active ({kitchenTickets.filter((t) => t.status !== 'served').length})
          </button>
          <button
            onClick={() => setStatusFilter('served')}
            className={`px-3 py-1 font-semibold rounded transition-colors ${
              statusFilter === 'served' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Served Completed
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 font-semibold rounded transition-colors ${
              statusFilter === 'all' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            All KOTs
          </button>
        </div>
      </div>

      {/* Station Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {stations.map((st) => {
          const count =
            st === 'All Stations'
              ? kitchenTickets.filter((t) => t.status !== 'served').length
              : kitchenTickets.filter((t) => t.station === st && t.status !== 'served').length;

          return (
            <button
              key={st}
              onClick={() => setActiveStation(st)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold transition-colors ${
                activeStation === st
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <span>{st}</span>
              {count > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono tabular-nums">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* KOT Tickets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTickets.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-10 h-10 mx-auto stroke-1 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">
              Station is completely clear!
            </p>
            <p className="text-slate-400 text-[11px] mt-1">
              New orders submitted from POS will automatically chime and appear here.
            </p>
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const isReady = ticket.status === 'ready';
            const isPreparing = ticket.status === 'preparing';
            const isPending = ticket.status === 'pending';

            return (
              <div
                key={ticket.id}
                className={`rounded-xl border flex flex-col justify-between overflow-hidden shadow-xs transition-all ${
                  isReady
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : isPreparing
                    ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                {/* Ticket Header */}
                <div
                  className={`p-3 border-b flex items-center justify-between text-xs ${
                    isReady
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : isPreparing
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-slate-800 text-white border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-mono font-bold text-sm tracking-tight">
                      {ticket.kotNumber}
                    </div>
                    <div className="text-[11px] opacity-90">{ticket.outletName}</div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-xs uppercase bg-black/20 px-2 py-0.5 rounded">
                      {ticket.tableOrRoom}
                    </div>
                    <div className="text-[10px] opacity-80 mt-0.5 flex items-center justify-end gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {ticket.orderTime}
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-3.5 space-y-2.5 flex-1 text-xs">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    {getStationIcon(ticket.station)}
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {ticket.station}
                    </span>
                    {ticket.priority === 'rush' && (
                      <span className="text-[10px] bg-rose-600 text-white font-bold px-1 rounded ml-auto uppercase">
                        RUSH
                      </span>
                    )}
                    {ticket.priority === 'vip' && (
                      <span className="text-[10px] bg-purple-600 text-white font-bold px-1 rounded ml-auto uppercase">
                        VIP ROOM
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-2">
                    {ticket.items.map((i, idx) => (
                      <div key={idx} className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <span className="font-bold font-mono text-slate-900 dark:text-slate-100 mr-1.5">
                            {i.quantity}x
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {i.name}
                          </span>
                          {i.notes && (
                            <div className="text-[11px] text-amber-700 dark:text-amber-400 italic ml-4">
                              Note: {i.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ticket Bump Action */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <button
                    onClick={() => advanceTicket(ticket)}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                      isPending
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : isPreparing
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : isReady
                        ? 'bg-slate-900 hover:bg-slate-800 text-white'
                        : 'bg-slate-200 text-slate-500 cursor-default'
                    }`}
                  >
                    {isPending && 'Start Preparing (Fire)'}
                    {isPreparing && 'Mark Ready for Pick-up'}
                    {isReady && 'Mark Served to Guest'}
                    {ticket.status === 'served' && 'Completed'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
