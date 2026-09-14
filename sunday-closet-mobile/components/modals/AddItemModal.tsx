'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Sparkles, DollarSign, Image as ImageIcon, Check } from 'lucide-react';
import { NewItemFormData, ItemStyle, ItemCondition } from '@/types/inventory';
import { calculatePrices } from '@/lib/priceCalculator';
import { formatDriveImageUrl } from '@/lib/imageUrl';
import { DriveImage } from '@/components/common/DriveImage';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: NewItemFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    photoUrl: '',
    type: '',
    size: 'M',
    color: '',
    brand: '',
    style: 'Vintage' as ItemStyle,
    condition: 'Nuevo c/etiqueta' as ItemCondition,
    cost: 0,
  });

  const [selectedPriceSource, setSelectedPriceSource] = useState<'Sunday' | 'Web' | 'Facebook' | 'Paca' | 'Custom'>('Web');
  const [customPriceInput, setCustomPriceInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const calculatedPrices = calculatePrices(formData.cost);

  // Auto-update pricePublished when cost or selection source changes
  const getActivePrice = (): number => {
    if (selectedPriceSource === 'Custom') {
      return parseFloat(customPriceInput) || 0;
    }
    if (selectedPriceSource === 'Sunday') return calculatedPrices.priceSunday;
    if (selectedPriceSource === 'Web') return calculatedPrices.priceWeb;
    if (selectedPriceSource === 'Facebook') return calculatedPrices.priceFB;
    if (selectedPriceSource === 'Paca') return calculatedPrices.pricePaca;
    return 0;
  };

  useEffect(() => {
    if (isOpen) {
      setFormData({
        photoUrl: '',
        type: '',
        size: 'M',
        color: '',
        brand: '',
        style: 'Vintage',
        condition: 'Nuevo c/etiqueta',
        cost: 0,
      });
      setSelectedPriceSource('Web');
      setCustomPriceInput('');
      setShowCustomInput(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const publishedVal = getActivePrice();

    if (!formData.type || !formData.brand || formData.cost <= 0) {
      alert('Por favor completa el Tipo, Marca y un Costo válido mayor a 0.');
      return;
    }

    if (publishedVal <= 0) {
      alert('Por favor selecciona o introduce un Precio Publicado válido mayor a 0.');
      return;
    }

    const payload: NewItemFormData = {
      ...formData,
      photoUrl: formatDriveImageUrl(formData.photoUrl),
      pricePublished: publishedVal,
    };

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Agregar Nueva Prenda</h2>
              <p className="text-xs text-slate-400">Ingresa los datos base para cálculo automático</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tipo */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Prenda *</label>
              <input
                type="text"
                required
                placeholder="Ej. Blusa, Vestido Silk, Chaqueta"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:border-rose-500/50 focus:outline-none"
              />
            </div>

            {/* Marca */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Marca *</label>
              <input
                type="text"
                required
                placeholder="Ej. Zara, Levi's, Thrift"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:border-rose-500/50 focus:outline-none"
              />
            </div>

            {/* Estilo (Select Obligatorio) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Estilo *</label>
              <select
                required
                value={formData.style}
                onChange={(e) => setFormData({ ...formData, style: e.target.value as ItemStyle })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:border-rose-500/50 focus:outline-none"
              >
                <option value="Vintage">Vintage</option>
                <option value="Cute">Cute</option>
                <option value="Casual">Casual</option>
              </select>
            </div>

            {/* Condición (Select Obligatorio) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Condición *</label>
              <select
                required
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as ItemCondition })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:border-rose-500/50 focus:outline-none"
              >
                <option value="Nuevo c/etiqueta">Nuevo c/etiqueta</option>
                <option value="Nuevo s/etiqueta">Nuevo s/etiqueta</option>
                <option value="Con detalle">Con detalle</option>
              </select>
            </div>

            {/* Talla */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Talla</label>
              <select
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:border-rose-500/50 focus:outline-none"
              >
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="Única">Única</option>
              </select>
            </div>

            {/* Color */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Color Principal</label>
              <input
                type="text"
                placeholder="Ej. Beige, Negro, Floral"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:border-rose-500/50 focus:outline-none"
              />
            </div>

            {/* Foto URL */}
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> Foto URL (Google Drive o enlace web)
                </span>
                <span className="text-[10px] text-slate-400">Drive: &quot;Cualquier persona con el enlace&quot;</span>
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/file/d/... o https://..."
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:border-rose-500/50 focus:outline-none"
              />
              {formData.photoUrl.trim() && (
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="w-12 h-14 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shrink-0 flex items-center justify-center">
                    <DriveImage
                      src={formData.photoUrl}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight">
                    <p className="text-slate-200 font-medium">Previsualización de la prenda</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">
                      Si no carga la foto, verifica que en Google Drive el archivo tenga permiso público.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Costo Base */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-rose-300 mb-1 flex items-center justify-between">
                <span>Costo Base ($ MXN) *</span>
                <span className="text-[10px] text-slate-400">Genera precios de venta automáticamente</span>
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="0.00"
                  value={formData.cost || ''}
                  onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-rose-500/30 rounded-xl text-base font-bold text-rose-400 placeholder-slate-600 focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Auto calculated pricing live preview & Selector */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Precios de Venta Sugeridos</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const targetState = !showCustomInput;
                  setShowCustomInput(targetState);
                  if (targetState) {
                    setSelectedPriceSource('Custom');
                  } else {
                    setSelectedPriceSource('Web');
                  }
                }}
                className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                  showCustomInput
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/35'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
                title="Precio Personalizado"
              >
                {showCustomInput ? 'Usar Sugeridos' : '+ Personalizado'}
              </button>
            </div>

            {/* Price Cards Selector */}
            {!showCustomInput ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center select-none">
                {/* Sunday */}
                <div
                  onClick={() => setSelectedPriceSource('Sunday')}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedPriceSource === 'Sunday'
                      ? 'bg-indigo-500/10 border-indigo-500 text-indigo-200 shadow-md shadow-indigo-500/5'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <span className="block text-[9px] uppercase tracking-wider">Sunday</span>
                  <span className="font-bold text-sm block mt-0.5">${calculatedPrices.priceSunday}</span>
                  {selectedPriceSource === 'Sunday' && <Check className="w-3.5 h-3.5 mx-auto mt-1 text-indigo-400" />}
                </div>

                {/* Web (Recommended/Default) */}
                <div
                  onClick={() => setSelectedPriceSource('Web')}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedPriceSource === 'Web'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-500/5'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <span className="block text-[9px] uppercase tracking-wider">Web</span>
                  <span className="font-bold text-sm block mt-0.5">${calculatedPrices.priceWeb}</span>
                  {selectedPriceSource === 'Web' && <Check className="w-3.5 h-3.5 mx-auto mt-1 text-emerald-400" />}
                </div>

                {/* Facebook */}
                <div
                  onClick={() => setSelectedPriceSource('Facebook')}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedPriceSource === 'Facebook'
                      ? 'bg-indigo-500/10 border-indigo-500 text-indigo-200 shadow-md shadow-indigo-500/5'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <span className="block text-[9px] uppercase tracking-wider">Facebook</span>
                  <span className="font-bold text-sm block mt-0.5">${calculatedPrices.priceFB}</span>
                  {selectedPriceSource === 'Facebook' && <Check className="w-3.5 h-3.5 mx-auto mt-1 text-indigo-400" />}
                </div>

                {/* Paca */}
                <div
                  onClick={() => setSelectedPriceSource('Paca')}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedPriceSource === 'Paca'
                      ? 'bg-indigo-500/10 border-indigo-500 text-indigo-200 shadow-md shadow-indigo-500/5'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <span className="block text-[9px] uppercase tracking-wider">Paca</span>
                  <span className="font-bold text-sm block mt-0.5">${calculatedPrices.pricePaca}</span>
                  {selectedPriceSource === 'Paca' && <Check className="w-3.5 h-3.5 mx-auto mt-1 text-indigo-400" />}
                </div>
              </div>
            ) : (
              /* Custom Price Input */
              <div className="space-y-1.5 p-1">
                <label className="block text-[11px] font-semibold text-rose-300">Precio Personalizado Público ($ MXN) *</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="1"
                    required={showCustomInput}
                    placeholder="Introduce el precio manualmente"
                    value={customPriceInput}
                    onChange={(e) => {
                      setCustomPriceInput(e.target.value);
                      setSelectedPriceSource('Custom');
                    }}
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-rose-500/30 rounded-xl text-sm font-bold text-rose-300 focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Display final computed Price Published to write to Column P */}
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
              <span className="font-medium text-slate-400">Precio a Publicar (Columna P):</span>
              <span className="font-bold text-sm text-emerald-400">
                ${getActivePrice().toLocaleString('es-MX')} MXN
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-md shadow-rose-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>Guardando en Google Sheets...</>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Guardar Prenda
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
