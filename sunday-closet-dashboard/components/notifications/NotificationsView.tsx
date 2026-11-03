'use client';

import React, { useState, useMemo } from 'react';
import { InventoryItem } from '@/types/inventory';
import {
  classifyGarmentCategory,
  CATEGORY_LABELS,
} from '@/lib/categoryClassifier';
import { DriveImage } from '@/components/common/DriveImage';
import {
  Bell,
  AlertTriangle,
  Edit3,
  Copy,
  Check,
  CheckCircle2,
  Save,
  X,
  Loader2,
  Calendar,
  Tag,
  Palette,
  Sparkles,
} from 'lucide-react';

interface NotificationsViewProps {
  items: InventoryItem[];
  onUpdateItemType: (sku: string, newType: string) => Promise<boolean>;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  items,
  onUpdateItemType,
}) => {
  const [editingSku, setEditingSku] = useState<string | null>(null);
  const [editTypeValue, setEditTypeValue] = useState<string>('');
  const [savingSku, setSavingSku] = useState<string | null>(null);
  const [copiedSku, setCopiedSku] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  // Filter items that strictly fall into 'otros'
  const otrosItems = useMemo(() => {
    return items.filter((item) => classifyGarmentCategory(item.type) === 'otros');
  }, [items]);

  const handleStartEdit = (item: InventoryItem) => {
    setEditingSku(item.sku);
    setEditTypeValue(item.type);
  };

  const handleCancelEdit = () => {
    setEditingSku(null);
    setEditTypeValue('');
  };

  const handleSaveType = async (sku: string) => {
    const trimmed = editTypeValue.trim();
    if (!trimmed) return;
    setSavingSku(sku);
    try {
      const ok = await onUpdateItemType(sku, trimmed);
      if (ok) {
        setEditingSku(null);
        setEditTypeValue('');
      }
    } finally {
      setSavingSku(null);
    }
  };

  const buildTechnicalReport = (item: InventoryItem) => {
    return [
      `⚠️ Reporte Técnico Sunday Clóset — Prenda sin categoría definida (cayó en 'Otros'):`,
      `- SKU: ${item.sku}`,
      `- Tipo de Prenda actual (Columna C): "${item.type}"`,
      `- Marca: ${item.brand || 'N/A'}`,
      `- Color: ${item.color || 'N/A'}`,
      `- Fecha de Compra: ${item.purchaseDate || item.lotDate || 'N/A'}`,
      `Solicitud: Agrega la palabra clave de "${item.type}" al diccionario de categorías en categoryClassifier.ts.`,
    ].join('\n');
  };

  const handleCopyReport = async (item: InventoryItem) => {
    const text = buildTechnicalReport(item);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSku(item.sku);
      setTimeout(() => setCopiedSku(null), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyAllReports = async () => {
    if (otrosItems.length === 0) return;
    const uniqueTypes = Array.from(new Set(otrosItems.map((i) => i.type)));
    const header = `⚠️ Reporte Masivo Sunday Clóset — ${otrosItems.length} prendas cayeron en la categoría 'Otros':\nPalabras detectadas en Columna C: ${uniqueTypes.map((t) => `"${t}"`).join(', ')}\n\nDetalle por prenda:\n`;
    const body = otrosItems
      .map(
        (it) =>
          `• ${it.sku} | Tipo: "${it.type}" | Marca: ${it.brand || 'N/A'} | Color: ${it.color || 'N/A'} | Fecha Compra: ${it.purchaseDate || it.lotDate || 'N/A'}`
      )
      .join('\n');
    const footer = `\n\nPor favor agrega estas palabras clave al diccionario estricto de categorías en categoryClassifier.ts.`;

    try {
      await navigator.clipboard.writeText(header + body + footer);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950/25 to-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <Bell className="w-3.5 h-3.5 text-rose-400" />
            <span>Detector de Categoría &quot;Otros&quot;</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-100">
            Centro de Notificaciones de Inventario
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Aquí aparecen automáticamente las prendas cuyo <strong className="text-slate-200">Tipo de Prenda (Columna C)</strong> no coincide con ninguna palabra clave de los diccionarios estrictos y cayeron en la categoría <strong className="text-rose-400">&quot;Otros&quot;</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5">
            <span className="text-xs text-slate-400">Alertas activas:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                otrosItems.length > 0
                  ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {otrosItems.length}
            </span>
          </div>

          {otrosItems.length > 0 && (
            <button
              onClick={handleCopyAllReports}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              {copiedAll ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">¡Reporte completo copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-rose-400" />
                  <span>Copiar reporte de todas ({otrosItems.length})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Empty State when 0 items in 'otros' */}
      {otrosItems.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">
            ¡Todo tu inventario está perfectamente categorizado!
          </h3>
          <p className="text-xs text-slate-400 max-w-md">
            Ninguna prenda se encuentra en la categoría &quot;Otros&quot;. Todas las prendas coinciden con Tops, Prendas Inferiores, Vestidos, Abrigos o Accesorios.
          </p>
        </div>
      ) : (
        /* Alert Cards List */
        <div className="grid grid-cols-1 gap-4">
          {otrosItems.map((item) => {
            const isEditing = editingSku === item.sku;
            const isSaving = savingSku === item.sku;
            const isCopied = copiedSku === item.sku;
            const previewNewCategory = isEditing
              ? classifyGarmentCategory(editTypeValue)
              : 'otros';

            return (
              <div
                key={`${item.sku}-${item.type}`}
                className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-rose-500/30 hover:border-rose-500/50 shadow-xl transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left Info */}
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-16 h-20 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                    <DriveImage
                      src={item.photoUrl}
                      alt={item.type}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-2 min-w-0 flex-1">
                    {/* Required Alert Message */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>Prenda sin categoría definida (cayó en &apos;Otros&apos;)</span>
                    </div>

                    {/* Garment Metadata Grid */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">SKU:</span>
                        <span className="font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                          {item.sku}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">Tipo de Prenda actual:</span>
                        <span className="font-bold text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                          &quot;{item.type || 'Vacío'}&quot;
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-500">Marca:</span>
                        <span className="font-semibold text-slate-200">{item.brand || 'Sin marca'}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Palette className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-500">Color:</span>
                        <span className="font-medium text-slate-200">{item.color || 'Sin color'}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-500">Fecha de Compra:</span>
                        <span className="font-mono text-slate-300">
                          {item.purchaseDate || item.lotDate || 'No registrada'}
                        </span>
                      </div>
                    </div>

                    {/* Inline Quick Editor for Tipo de Prenda (Columna C) */}
                    {isEditing && (
                      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl animate-in fade-in duration-150">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={editTypeValue}
                            onChange={(e) => setEditTypeValue(e.target.value)}
                            placeholder="Ej. Blusa con encaje, Falda, Pantalón..."
                            className="w-full px-3.5 py-2 bg-slate-950 border border-rose-500/50 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                            autoFocus
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border flex items-center gap-1 ${
                              previewNewCategory !== 'otros'
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            }`}
                          >
                            <Sparkles className="w-3 h-3" />
                            {CATEGORY_LABELS[previewNewCategory]}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleSaveType(item.sku)}
                            disabled={isSaving || !editTypeValue.trim()}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            {isSaving ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Save className="w-3.5 h-3.5" />
                            )}
                            <span>Guardar en Sheets</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(item)}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar Tipo de Prenda</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleCopyReport(item)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">¡Reporte copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copiar reporte técnico</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
