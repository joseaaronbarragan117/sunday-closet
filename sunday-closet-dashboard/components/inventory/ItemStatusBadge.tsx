'use client';

import React from 'react';
import { InventoryStatus } from '@/types/inventory';

interface ItemStatusBadgeProps {
  status: InventoryStatus;
}

export const ItemStatusBadge: React.FC<ItemStatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = (status: InventoryStatus) => {
    switch (status) {
      case 'Disponible':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 ring-emerald-500/30';
      case 'Programado':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20 ring-amber-500/30';
      case 'Reservado':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20 ring-sky-500/30';
      case 'Vendido':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20 ring-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shadow-xs transition-all ${getBadgeStyle(
        status
      )}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'Disponible'
            ? 'bg-emerald-400 animate-pulse'
            : status === 'Programado'
            ? 'bg-amber-400'
            : status === 'Reservado'
            ? 'bg-sky-400'
            : 'bg-rose-400'
        }`}
      />
      {status}
    </span>
  );
};
