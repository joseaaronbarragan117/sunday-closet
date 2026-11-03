'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Sparkles,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Loader2,
  ClipboardPaste,
} from 'lucide-react';
import { GemBatchPayload } from '@/types/inventory';
import { classifyGarmentCategory, CATEGORY_LABELS } from '@/lib/categoryClassifier';

interface GemBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jsonPayload: GemBatchPayload) => Promise<void>;
  isSubmitting?: boolean;
}

const EXAMPLE_JSON = `{
  "nombreLote": "Lote Noviembre 01",
  "costoTotalLote": 1200,
  "prendas": [
    {
      "tipoPrenda": "Vestido Silk",
      "talla": "S",
      "color": "Negro",
      "marca": "PacSun",
      "estilo": "Vintage",
      "condicion": "Nuevo c/etiqueta",
      "precioCompra": null,
      "precioVenta": 220
    },
    {
      "tipoPrenda": "Jeans Cargo",
      "talla": "M",
      "color": "Azul",
      "marca": "Zara",
      "estilo": "Casual",
      "condicion": "Nuevo s/etiqueta",
      "precioCompra": null,
      "precioVenta": null
    }
  ]
}`;

export const GemBatchModal: React.FC<GemBatchModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [rawJson, setRawJson] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRawJson('');
    }
  }, [isOpen]);

  const parsedResult = useMemo(() => {
    if (!rawJson.trim()) {
      return { valid: false, data: null as GemBatchPayload | null, error: null as string | null };
    }
    try {
      const cleaned = rawJson
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();
      const parsed = JSON.parse(cleaned);
      if (!parsed || !Array.isArray(parsed.prendas) || parsed.prendas.length === 0) {
        return {
          valid: false,
          data: null,
          error: 'El JSON debe contener un arreglo "prendas" con al menos 1 prenda.',
        };
      }
      return { valid: true, data: parsed as GemBatchPayload, error: null };
    } catch (err: any) {
      return {
        valid: false,
        data: null,
        error: 'JSON inválido: verifica las llaves, comillas o comas.',
      };
    }
  }, [rawJson]);

  if (!isOpen) return null;

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setRawJson(text);
    } catch {
      // Fallback: user can paste manually with Cmd+V / Ctrl+V
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedResult.valid || !parsedResult.data) return;
    await onSubmit(parsedResult.data);
  };

  const previewItems = useMemo(() => {
    if (!parsedResult.data) return [];
    const lotCost = Number(parsedResult.data.costoTotalLote) || 0;
    const total = parsedResult.data.prendas.length;
    const dividedCost = lotCost > 0 && total > 0 ? Number((lotCost / total).toFixed(2)) : 0;

    return parsedResult.data.prendas.map((p, idx) => {
      const tipo = String(p.tipoPrenda || 'Prenda').trim();
      const hasCustomCost =
        p.precioCompra !== null &&
        p.precioCompra !== undefined &&
        String(p.precioCompra).trim() !== '' &&
        Number(p.precioCompra) > 0;
      const unitCost = hasCustomCost ? Number(p.precioCompra) : dividedCost;

      const hasCustomPrice =
        p.precioVenta !== null &&
        p.precioVenta !== undefined &&
        String(p.precioVenta).trim() !== '' &&
        Number(p.precioVenta) > 0;
      const salePrice = hasCustomPrice
        ? Number(p.precioVenta)
        : Math.round((unitCost / 0.3) * 1.2);

      const category = classifyGarmentCategory(tipo);
      return {
        index: idx + 1,
        tipoPrenda: tipo,
        talla: p.talla || 'M',
        color: p.color || '-',
        marca: p.marca || 'PacSun',
        estilo: p.estilo || 'Vintage',
        condicion: p.condicion || 'Nuevo c/etiqueta',
        unitCost,
        salePrice,
        category,
      };
    });
  }, [parsedResult.data]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-violet-500/15 text-violet-400 border border-violet-500/30">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                Pegar lote desde Gem (JSON)
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-mono">
                  Voz IA
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Inserta lotes completos dictados por voz directamente en &apos;Inventario Central&apos;
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

        {/* Body */}
        <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                JSON generado por tu Gem de Gemini
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRawJson(EXAMPLE_JSON)}
                  className="text-[11px] text-slate-400 hover:text-violet-300 underline transition-colors"
                >
                  Cargar ejemplo
                </button>
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <ClipboardPaste className="w-3.5 h-3.5 text-violet-400" />
                  Pegar portapapeles
                </button>
              </div>
            </div>

            <textarea
              rows={8}
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
              placeholder={EXAMPLE_JSON}
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 leading-relaxed"
            />
          </div>

          {/* Validation Status & Preview */}
          {parsedResult.error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{parsedResult.error}</span>
            </div>
          )}

          {parsedResult.valid && parsedResult.data && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>JSON válido — Listo para insertar en Google Sheets</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <span>
                    Lote: <strong className="text-white">{parsedResult.data.nombreLote || 'Sin nombre'}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Costo Lote: <strong className="text-emerald-400">${Number(parsedResult.data.costoTotalLote || 0).toLocaleString('es-MX')}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Prendas: <strong className="text-violet-400">{previewItems.length}</strong>
                  </span>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto divide-y divide-slate-800/60 text-xs">
                {previewItems.map((it) => (
                  <div key={it.index} className="py-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[10px] text-slate-500 w-5">#{it.index}</span>
                      <span className="font-semibold text-slate-200 truncate">{it.tipoPrenda}</span>
                      <span className="text-slate-400">({it.talla})</span>
                      <span className="text-slate-500 truncate">• {it.marca} • {it.color}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          it.category === 'otros'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {CATEGORY_LABELS[it.category]}
                      </span>
                      <span className="text-slate-400 font-mono">
                        Costo: ${it.unitCost} → <strong className="text-emerald-400">${it.salePrice}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!parsedResult.valid || isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-500 hover:to-rose-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-violet-600/20 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Insertando en Sheets...</span>
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" />
                  <span>Insertar {previewItems.length > 0 ? `${previewItems.length} Prendas` : 'Lote'} en Sheets</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
