'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, CheckSquare, Square, Sparkles } from 'lucide-react';
import { InventoryItem, ScheduleDropPayload } from '@/types/inventory';

interface DropSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onScheduleDrop: (payload: ScheduleDropPayload) => Promise<void>;
  isSubmitting?: boolean;
}

export const DropSchedulerModal: React.FC<DropSchedulerModalProps> = ({
  isOpen,
  onClose,
  items,
  onScheduleDrop,
  isSubmitting = false,
}) => {
  const hiddenItems = items.filter((item) => !item.visibleInWeb);
  const [selectedSkus, setSelectedSkus] = useState<string[]>([]);
  const [dropName, setDropName] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Default datetime to tomorrow at 20:00
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(20, 0, 0, 0);
      
      // Format YYYY-MM-THH:mm for datetime-local input
      const localIso = tomorrow.toISOString().slice(0, 16);
      setScheduledAt(localIso);
      setSelectedSkus([]);
      setDropName('Drop Domingo Vintage');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSelectAll = () => {
    if (selectedSkus.length === hiddenItems.length) {
      setSelectedSkus([]);
    } else {
      setSelectedSkus(hiddenItems.map((item) => item.sku));
    }
  };

  const toggleSelectSku = (sku: string) => {
    setSelectedSkus((prev) =>
      prev.includes(sku) ? prev.filter((s) => s !== sku) : [...prev, sku]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSkus.length === 0) {
      alert('Por favor selecciona al menos una prenda para programar.');
      return;
    }
    if (!dropName || !scheduledAt) {
      alert('Por favor indica un Nombre y la Fecha y Hora del Drop.');
      return;
    }

    await onScheduleDrop({
      dropName,
      scheduledAt,
      skus: selectedSkus,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Programar Nuevo Drop</h2>
              <p className="text-xs text-slate-400">
                Selecciona prendas no visibles en web para su lanzamiento programado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Drop Details Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre del Drop *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Drop Vintage Vol. 12"
                value={dropName}
                onChange={(e) => setDropName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:border-amber-500/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Fecha y Hora de Lanzamiento *
              </label>
              <input
                type="datetime-local"
                required
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-amber-300 focus:border-amber-500/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Item Selection List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Prendas Invisibles en Web ({hiddenItems.length})
              </span>
              {hiddenItems.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  {selectedSkus.length === hiddenItems.length ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5" /> Deseleccionar todo
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5" /> Seleccionar todo
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="border border-slate-800 rounded-2xl bg-slate-950/60 divide-y divide-slate-800/80 max-h-56 overflow-y-auto">
              {hiddenItems.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Todas las prendas están visibles en web. ¡No hay prendas pendientes para programar!
                </div>
              ) : (
                hiddenItems.map((item) => {
                  const isSelected = selectedSkus.includes(item.sku);
                  return (
                    <div
                      key={item.sku}
                      onClick={() => toggleSelectSku(item.sku)}
                      className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? 'bg-amber-500/10' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // Handled by parent div
                          className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900"
                        />
                        <div>
                          <div className="text-sm font-semibold text-slate-200">
                            {item.sku} - {item.type}
                          </div>
                          <div className="text-xs text-slate-400">
                            {item.brand} | Talla {item.size} | ${item.priceWeb} Web
                          </div>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
                        Oculto en Web
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Cloud Function Cron Banner Info */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-amber-400">
              <Sparkles className="w-4 h-4" /> Firebase Cloud Function Activated
            </div>
            <p className="text-[11px] text-amber-200/80">
              Al confirmar, el cron job de Firebase revisará la fecha y cambiará el estado a &quot;VERDADERO&quot; en Google Sheets automáticamente llegada la hora del Drop.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedSkus.length === 0}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>Programando Drop...</>
              ) : (
                <>
                  <Calendar className="w-4 h-4" /> Programar Drop ({selectedSkus.length})
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
