'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, Flashlight, AlertCircle, RefreshCw } from 'lucide-react';

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (sku: string) => void;
}

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [manualCode, setManualCode] = useState('');

  // Audio beep
  const playScanBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(920, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  };

  // Start camera and barcode detection
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    let animationId: number | null = null;
    let detector: any = null;

    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        detector = new (window as any).BarcodeDetector({
          formats: ['code_128', 'code_39', 'qr_code', 'ean_13', 'upc_a'],
        });
      } catch (err) {
        console.warn('BarcodeDetector format error:', err);
      }
    }

    const startCamera = async () => {
      setErrorMessage(null);
      setIsDetecting(true);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        // Check if torch/flashlight is supported
        const track = stream.getVideoTracks()[0];
        const capabilities: any = track.getCapabilities ? track.getCapabilities() : {};
        if (capabilities.torch) {
          setHasTorch(true);
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
        }

        // Loop detection
        const scanLoop = async () => {
          if (!isMounted || !videoRef.current) return;

          if (detector && videoRef.current.readyState >= 2) {
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes && barcodes.length > 0) {
                const found = barcodes[0].rawValue;
                if (found && found.trim()) {
                  playScanBeep();
                  try {
                    navigator.vibrate?.([120, 60, 120]);
                  } catch {}
                  onScanSuccess(found.trim());
                  return;
                }
              }
            } catch {}
          }

          animationId = requestAnimationFrame(scanLoop);
        };

        animationId = requestAnimationFrame(scanLoop);
      } catch (err: any) {
        console.error('Error opening camera:', err);
        if (isMounted) {
          setErrorMessage(
            err.name === 'NotAllowedError'
              ? 'Permiso de cámara denegado. Por favor autoriza el acceso a la cámara para escanear.'
              : 'No se pudo acceder a la cámara trasera. Asegúrate de estar en HTTPS.'
          );
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (animationId) cancelAnimationFrame(animationId);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen, onScanSuccess]);

  // Toggle flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const next = !torchOn;
        await (track as any).applyConstraints({ advanced: [{ torch: next }] });
        setTorchOn(next);
      } catch {}
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 animate-in fade-in duration-200">
      {/* Header Top Controls */}
      <div className="w-full max-w-md flex items-center justify-between text-white py-2 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">📷</span>
          <div>
            <h3 className="font-bold text-sm">Escáner de Código de Barras</h3>
            <p className="text-[11px] text-slate-400">Apunta la cámara a la etiqueta de la prenda</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasTorch && (
            <button
              onClick={toggleTorch}
              className={`p-2.5 rounded-full border transition-colors ${
                torchOn
                  ? 'bg-amber-400 text-black border-amber-300 shadow-lg shadow-amber-400/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <Flashlight className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative w-full max-w-md aspect-3/4 max-h-[65vh] rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-800 flex items-center justify-center shadow-2xl">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          autoPlay
          playsInline
        />

        {/* Target Reticle / Scanning Frame */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8">
          <div className="w-64 h-36 border-2 border-rose-500/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
            {/* Corner highlights */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-rose-400 rounded-tl"></div>
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-rose-400 rounded-tr"></div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-rose-400 rounded-bl"></div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-rose-400 rounded-br"></div>

            {/* Moving Laser Line Animation */}
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent absolute top-0 animate-[bounce_2s_infinite] shadow-[0_0_8px_rgba(244,63,94,1)]"></div>
          </div>
        </div>

        {/* Error message overlay */}
        {errorMessage && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-400" />
            <p className="text-xs text-rose-200">{errorMessage}</p>
          </div>
        )}
      </div>

      {/* Bottom Manual Entry Fallback */}
      <div className="w-full max-w-md space-y-2 py-3 z-10">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && manualCode.trim()) {
                playScanBeep();
                onScanSuccess(manualCode.trim());
              }
            }}
            placeholder="O escribe el SKU manual aquí..."
            className="flex-1 bg-slate-900 text-white placeholder-slate-500 text-xs px-4 py-2.5 rounded-2xl border border-slate-800 focus:outline-none focus:border-rose-500 uppercase"
          />
          <button
            onClick={() => {
              if (manualCode.trim()) {
                playScanBeep();
                onScanSuccess(manualCode.trim());
              }
            }}
            disabled={!manualCode.trim()}
            className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-semibold rounded-2xl"
          >
            Agregar
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400">
          Sunday Clóset · Reconocimiento instantáneo CODE 128
        </p>
      </div>
    </div>
  );
};
