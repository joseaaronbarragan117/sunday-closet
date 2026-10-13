'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Layers,
  DollarSign,
  Image as ImageIcon,
  Calendar,
  Trash2,
} from 'lucide-react';
import { AddLotFormData, LotItemInput, ItemStyle, ItemCondition } from '@/types/inventory';
import { formatDriveImageUrl } from '@/lib/imageUrl';
import { DriveImage } from '@/components/common/DriveImage';

interface AddLotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: AddLotFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export const AddLotModal: React.FC<AddLotModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  // Lot Info
  const [lotName, setLotName] = useState('');
  const [lotDate, setLotDate] = useState('');
  const [lotTotalCost, setLotTotalCost] = useState<number>(0);
  const [isIndividualPrice, setIsIndividualPrice] = useState<boolean>(false);

  // Items in this lot
  const [lotItems, setLotItems] = useState<LotItemInput[]>([]);

  // Current item being drafted
  const [draftItem, setDraftItem] = useState({
    type: '',
    brand: '',
    style: 'Vintage' as ItemStyle,
    condition: 'Nuevo c/etiqueta' as ItemCondition,
    size: 'M',
    color: '',
    photoUrl: '',
    cost: 0,
    pricePublished: 0,
  });

  // Initialize today's date
  useEffect(() => {
    if (isOpen) {
      setLotName('');
      setLotDate(new Date().toISOString().split('T')[0]);
      setLotTotalCost(0);
      setIsIndividualPrice(false);
      setLotItems([]);
      resetDraftItem();
    }
  }, [isOpen]);

  const resetDraftItem = () => {
    setDraftItem({
      type: '',
      brand: '',
      style: 'Vintage',
      condition: 'Nuevo c/etiqueta',
      size: 'M',
      color: '',
      photoUrl: '',
      cost: 0,
      pricePublished: 0,
    });
  };

  if (!isOpen) return null;

  // Calculate current unit cost when equitable division is on
  const projectedCount = Math.max(1, lotItems.length + 1);
  const autoUnitCost = lotTotalCost > 0 ? parseFloat((lotTotalCost / projectedCount).toFixed(2)) : 0;

  const handleAddDraftToList = (e: React.FormEvent) => {
    e.preventDefault();

    if (!draftItem.type || !draftItem.brand) {
      alert('Por favor introduce al menos el Tipo de prenda y la Marca.');
      return;
    }

    if (isIndividualPrice && draftItem.cost <= 0) {
      alert('Has activado el costo específico por prenda. Por favor introduce un costo válido mayor a 0 para esta prenda.');
      return;
    }

    if (!draftItem.pricePublished || draftItem.pricePublished <= 0) {
      alert('Por favor introduce un Precio de Venta manual válido mayor a 0 para la prenda.');
      return;
    }

    const newItem: LotItemInput = {
      ...draftItem,
      photoUrl: formatDriveImageUrl(draftItem.photoUrl),
      cost: isIndividualPrice ? draftItem.cost : undefined,
      pricePublished: Number(draftItem.pricePublished),
    };

    setLotItems((prev) => [...prev, newItem]);
    resetDraftItem();
  };

  const handleRemoveItem = (index: number) => {
    setLotItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = async () => {
    if (!lotName.trim()) {
      alert('Por favor introduce el nombre del lote.');
      return;
    }

    if (lotTotalCost <= 0) {
      alert('Por favor introduce un costo total del lote mayor a 0.');
      return;
    }

    if (lotItems.length === 0) {
      alert('Debes agregar al menos 1 prenda al lote antes de guardar.');
      return;
    }

    const payload: AddLotFormData = {
      lotName: lotName.trim(),
      lotDate: lotDate || new Date().toISOString().split('T')[0],
      lotTotalCost: Number(lotTotalCost),
      isIndividualPrice,
      items: lotItems,
    };

    await onSubmit(payload);
  };

  // Unit cost for finalized items in summary
  const finalDividedCost = lotItems.length > 0 && lotTotalCost > 0
    ? parseFloat((lotTotalCost / lotItems.length).toFixed(2))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-md shadow-amber-500/5">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Agregar Lote de Prendas
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Batch Mode
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Registra pacas o lotes completos con precios y costos directos para Google Sheets
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: Lot Header Config */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Layers className="w-4 h-4" />
                <span>1. Información del Lote</span>
              </div>
              <span className="text-[11px] text-slate-400">Columnas W, X e Y de Sheets</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Nombre del Lote */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Lote *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Paca Invierno #2, Lote Vestidos"
                  value={lotName}
                  onChange={(e) => setLotName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
                />
              </div>

              {/* Fecha del Lote */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Fecha del Lote
                </label>
                <input
                  type="date"
                  value={lotDate}
                  onChange={(e) => setLotDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 focus:border-amber-500/50 focus:outline-none"
                />
              </div>

              {/* Costo Total del Lote */}
              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center justify-between">
                  <span>Costo Total Lote ($) *</span>
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="1"
                    placeholder="0.00"
                    value={lotTotalCost || ''}
                    onChange={(e) => setLotTotalCost(parseFloat(e.target.value) || 0)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-amber-500/30 rounded-xl text-sm font-bold text-amber-400 placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* BUTTON / TOGGLE: Individual Price vs Auto Lot Division */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    ¿Asignar costo específico por prenda?
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {isIndividualPrice
                      ? '✓ Modo Manual: Defines el costo individual de compra de cada prenda.'
                      : '✓ Modo Equitativo: Divide el costo total del lote entre la cantidad de piezas automáticamente.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsIndividualPrice(!isIndividualPrice)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                    isIndividualPrice
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isIndividualPrice ? 'bg-rose-400' : 'bg-emerald-400'
                    }`}
                  />
                  {isIndividualPrice ? 'Costo Manual Por Prenda' : 'Dividir Costo del Lote'}
                </button>
              </div>
            </div>
          </div>

          {/* STEP 2: Add Garment Form to this Lot */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
                <Plus className="w-4 h-4" />
                <span>2. Agregar Prenda al Lote</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {lotItems.length} prenda(s) en la lista
              </span>
            </div>

            <form onSubmit={handleAddDraftToList} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Tipo de Prenda */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Prenda *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Blusa, Vestido, Falda"
                    value={draftItem.type}
                    onChange={(e) => setDraftItem({ ...draftItem, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:border-rose-500/50 focus:outline-none"
                  />
                </div>

                {/* Marca */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Marca *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Zara, Shein, H&M"
                    value={draftItem.brand}
                    onChange={(e) => setDraftItem({ ...draftItem, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:border-rose-500/50 focus:outline-none"
                  />
                </div>

                {/* Talla */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Talla</label>
                  <select
                    value={draftItem.size}
                    onChange={(e) => setDraftItem({ ...draftItem, size: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 focus:border-rose-500/50 focus:outline-none"
                  >
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="Única">Única</option>
                  </select>
                </div>

                {/* Estilo */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estilo *</label>
                  <select
                    value={draftItem.style}
                    onChange={(e) => setDraftItem({ ...draftItem, style: e.target.value as ItemStyle })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 focus:border-rose-500/50 focus:outline-none"
                  >
                    <option value="Vintage">Vintage</option>
                    <option value="Cute">Cute</option>
                    <option value="Casual">Casual</option>
                  </select>
                </div>

                {/* Condición */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Condición *</label>
                  <select
                    value={draftItem.condition}
                    onChange={(e) => setDraftItem({ ...draftItem, condition: e.target.value as ItemCondition })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 focus:border-rose-500/50 focus:outline-none"
                  >
                    <option value="Nuevo c/etiqueta">Nuevo c/etiqueta</option>
                    <option value="Nuevo s/etiqueta">Nuevo s/etiqueta</option>
                    <option value="Con detalle">Con detalle</option>
                  </select>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Color Principal</label>
                  <input
                    type="text"
                    placeholder="Ej. Blanco, Azul, Flores"
                    value={draftItem.color}
                    onChange={(e) => setDraftItem({ ...draftItem, color: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:border-rose-500/50 focus:outline-none"
                  />
                </div>

                {/* Foto URL */}
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> Foto URL (Drive o web)
                    </span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/..."
                    value={draftItem.photoUrl}
                    onChange={(e) => setDraftItem({ ...draftItem, photoUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:border-rose-500/50 focus:outline-none"
                  />
                </div>

                {/* Costo de Compra */}
                <div>
                  <label className="block text-xs font-semibold text-rose-300 mb-1 flex items-center justify-between">
                    <span>{isIndividualPrice ? 'Costo Compra ($) *' : 'Costo Asignado ($)'}</span>
                    <span className="text-[10px] text-slate-400">
                      {isIndividualPrice ? 'Manual' : 'Automático'}
                    </span>
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="0"
                      disabled={!isIndividualPrice}
                      value={isIndividualPrice ? (draftItem.cost || '') : autoUnitCost}
                      onChange={(e) => setDraftItem({ ...draftItem, cost: parseFloat(e.target.value) || 0 })}
                      className={`w-full pl-9 pr-3 py-2 rounded-xl text-sm font-bold border focus:outline-none ${
                        isIndividualPrice
                          ? 'bg-slate-900 text-rose-400 border-rose-500/40 focus:border-rose-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>

                {/* PRECIO DE VENTA DIRECTO / MANUAL */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-emerald-300 mb-1 flex items-center justify-between">
                    <span>Precio de Venta / Publicado ($ MXN) *</span>
                    <span className="text-[10px] text-emerald-400 font-medium">Ingreso manual</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="Introduce el precio de venta manualmente (ej. 350)"
                      value={draftItem.pricePublished || ''}
                      onChange={(e) => setDraftItem({ ...draftItem, pricePublished: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-emerald-500/50 rounded-xl text-sm font-bold text-emerald-300 placeholder-slate-600 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/30 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Add draft item button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-md shadow-rose-500/20 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Agregar esta prenda a la lista del lote
                </button>
              </div>
            </form>
          </div>

          {/* STEP 3: Current Batch List Overview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span>3. Prendas en el Lote</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                  {lotItems.length}
                </span>
              </h3>

              {lotItems.length > 0 && (
                <div className="text-xs text-slate-400">
                  Costo unitario {isIndividualPrice ? 'manual' : 'automático'}:{' '}
                  <span className="font-bold text-amber-300">
                    ${isIndividualPrice ? 'Varía' : finalDividedCost} MXN
                  </span>
                </div>
              )}
            </div>

            {lotItems.length === 0 ? (
              <div className="py-8 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-slate-500 text-xs space-y-1">
                <p className="font-medium text-slate-400">No hay prendas agregadas al lote todavía.</p>
                <p>Completa el formulario de arriba y haz clic en &quot;+ Agregar esta prenda a la lista del lote&quot;.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {lotItems.map((item, idx) => {
                  const itemCost = isIndividualPrice && item.cost ? item.cost : finalDividedCost;

                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shrink-0 flex items-center justify-center">
                          {item.photoUrl ? (
                            <DriveImage
                              src={item.photoUrl}
                              alt={item.type}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-slate-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">
                            #{idx + 1} {item.type}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {item.brand} • Talla {item.size} • {item.style}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400">Costo: ${itemCost}</p>
                          <p className="font-bold text-emerald-400 text-xs">Venta: ${item.pricePublished}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors"
                          title="Eliminar de la lista"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer / Actions */}
        <div className="px-6 py-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/60 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="font-semibold text-slate-200">{lotItems.length} prendas listas</span>
            <span>•</span>
            <span>Total Lote: <strong className="text-amber-300">${lotTotalCost} MXN</strong></span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isSubmitting || lotItems.length === 0 || !lotName.trim() || lotTotalCost <= 0}
              onClick={handleFinalSubmit}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>Guardando lote en Google Sheets...</>
              ) : (
                <>
                  <Layers className="w-4 h-4" /> Guardar Lote Completo ({lotItems.length} prendas)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
