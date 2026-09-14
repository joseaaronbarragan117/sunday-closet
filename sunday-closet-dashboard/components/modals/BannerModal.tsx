'use client';

import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Sparkles, CheckCircle, ExternalLink } from 'lucide-react';
import { DriveImage } from '@/components/common/DriveImage';

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateBanner: (bannerUrl: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const BannerModal: React.FC<BannerModalProps> = ({
  isOpen,
  onClose,
  onUpdateBanner,
  isSubmitting = false,
}) => {
  const [bannerUrl, setBannerUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Fetch current banner
      fetch('/api/banner')
        .then((res) => res.json())
        .then((data) => {
          if (data.bannerUrl) {
            setBannerUrl(data.bannerUrl);
          }
        })
        .catch((err) => console.warn('Could not load banner:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUrlChange = (val: string) => {
    setBannerUrl(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerUrl.trim()) {
      alert('Por favor ingresa una URL válida para el banner.');
      return;
    }
    await onUpdateBanner(bannerUrl.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Actualizar Banner de la Web</h2>
              <p className="text-xs text-slate-400">
                Cambia la imagen principal del Hero Banner en el sitio web público
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

        {/* Form & Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <span>URL de la Imagen (Google Drive, Unsplash, etc.) *</span>
            </label>
            <input
              type="url"
              required
              placeholder="https://drive.google.com/file/d/... o https://images.unsplash.com/..."
              value={bannerUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:border-rose-500/50 focus:outline-none"
            />
            <p className="mt-1.5 text-[11px] text-slate-400 flex items-center gap-1">
              <ExternalLink className="w-3 h-3 text-rose-400" />
              Soporta links públicos de Google Drive (convierte automáticamente el enlace de compartir).
            </p>
          </div>

          {/* 16:9 Live Preview */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">Vista Previa del Banner</span>
            <div className="w-full aspect-[16/7] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden relative flex items-center justify-center">
              {bannerUrl.trim() ? (
                <DriveImage
                  src={bannerUrl}
                  alt="Vista previa del banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-slate-600 text-xs flex flex-col items-center gap-1">
                  <ImageIcon className="w-6 h-6" />
                  <span>Ingresa una URL para ver la previsualización</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
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
              disabled={isSubmitting || !bannerUrl.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-md shadow-rose-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>Guardando Banner...</>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" /> Actualizar Banner
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
