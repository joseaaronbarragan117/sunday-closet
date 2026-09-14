'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Flashlight, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library';

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
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  const [cameraList, setCameraList] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

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

  useEffect(() => {
    if (!isOpen) {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
        codeReaderRef.current = null;
      }
      setDetectedCode(null);
      return;
    }

    let isMounted = true;

    // Configure ZXing hints for CODE 128 and 1D barcodes
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.EAN_13,
      BarcodeFormat.QR_CODE,
      BarcodeFormat.UPC_A,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);

    const codeReader = new BrowserMultiFormatReader(hints, 250);
    codeReaderRef.current = codeReader;

    const startScanner = async () => {
      setErrorMessage(null);

      try {
        const videoInputDevices = await codeReader.listVideoInputDevices();
        if (!isMounted) return;

        setCameraList(videoInputDevices);

        // Find rear/back camera by default
        let deviceIdToUse: string | null = selectedDeviceId;
        if (!deviceIdToUse && videoInputDevices.length > 0) {
          const backCam = videoInputDevices.find((device) =>
            /back|rear|environment|trasera/i.test(device.label)
          );
          deviceIdToUse = backCam ? backCam.deviceId : videoInputDevices[videoInputDevices.length - 1].deviceId;
          setSelectedDeviceId(deviceIdToUse);
        }

        if (!videoRef.current) return;

        codeReader.decodeFromVideoDevice(
          deviceIdToUse || null,
          videoRef.current,
          (result, error) => {
            if (!isMounted) return;
            if (result) {
              const text = result.getText();
              if (text && text.trim()) {
                setDetectedCode(text.trim());
                playScanBeep();
                try {
                  navigator.vibrate?.([100, 50, 100]);
                } catch {}
                codeReader.reset();
                setTimeout(() => {
                  onScanSuccess(text.trim());
                }, 300);
              }
            }
          }
        );

        // Check torch support
        setTimeout(() => {
          if (!isMounted || !videoRef.current) return;
          const stream = videoRef.current.srcObject as MediaStream;
          if (stream) {
            const track = stream.getVideoTracks()[0];
            const caps: any = track?.getCapabilities ? track.getCapabilities() : {};
            if (caps.torch) {
              setHasTorch(true);
            }
          }
        }, 1000);
      } catch (err: any) {
        console.error('[CameraScannerModal] Scanner error:', err);
        if (isMounted) {
          setErrorMessage(
            err.name === 'NotAllowedError'
              ? 'Permiso de cámara denegado. Permite el acceso a la cámara en los ajustes de tu navegador.'
              : 'No se pudo acceder a la cámara. Verifica que ninguna otra app la esté usando.'
          );
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
        codeReaderRef.current = null;
      }
    };
  }, [isOpen, selectedDeviceId, onScanSuccess]);

  // Toggle torch / flashlight
  const toggleTorch = async () => {
    if (!videoRef.current) return;
    const stream = videoRef.current.srcObject as MediaStream;
    if (stream) {
      const track = stream.getVideoTracks()[0];
      if (track) {
        try {
          const next = !torchOn;
          await (track as any).applyConstraints({ advanced: [{ torch: next }] });
          setTorchOn(next);
        } catch {}
      }
    }
  };

  // Switch to another camera if multiple exist
  const handleSwitchCamera = () => {
    if (cameraList.length <= 1) return;
    const currentIndex = cameraList.findIndex((c) => c.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % cameraList.length;
    setSelectedDeviceId(cameraList[nextIndex].deviceId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col items-center justify-between p-4 animate-in fade-in duration-200">
      {/* Header Top Controls */}
      <div className="w-full max-w-md flex items-center justify-between text-white py-2 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">📷</span>
          <div>
            <h3 className="font-bold text-sm">Escáner CODE 128</h3>
            <p className="text-[11px] text-slate-400">Alinea el código de barras en el marco</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {cameraList.length > 1 && (
            <button
              onClick={handleSwitchCamera}
              title="Cambiar cámara"
              className="p-2.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {hasTorch && (
            <button
              onClick={toggleTorch}
              title="Linterna"
              className={`p-2.5 rounded-full border transition-colors ${
                torchOn
                  ? 'bg-amber-400 text-black border-amber-300 shadow-lg shadow-amber-400/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <Flashlight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 active:scale-95"
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
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
          <div className="w-72 h-44 border-2 border-rose-500/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
            {/* Corner highlights */}
            <div className="absolute -top-1.5 -left-1.5 w-5 h-5 border-t-4 border-l-4 border-rose-400 rounded-tl"></div>
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 border-t-4 border-r-4 border-rose-400 rounded-tr"></div>
            <div className="absolute -bottom-1.5 -left-1.5 w-5 h-5 border-b-4 border-l-4 border-rose-400 rounded-bl"></div>
            <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 border-b-4 border-r-4 border-rose-400 rounded-br"></div>

            {/* Red Laser Scanning Line */}
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent absolute top-0 animate-[bounce_1.8s_infinite] shadow-[0_0_10px_rgba(244,63,94,1)]"></div>

            {/* Center crosshair */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-0.5 bg-rose-500/40"></div>
            </div>
          </div>
        </div>

        {/* Detected Code Banner */}
        {detectedCode && (
          <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-2 z-20 animate-in zoom-in-95">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">¡Código detectado!</h4>
            <span className="font-mono text-xl font-black text-emerald-300 bg-emerald-950/80 px-4 py-1.5 rounded-xl border border-emerald-500/40">
              {detectedCode}
            </span>
          </div>
        )}

        {/* Error message overlay */}
        {errorMessage && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
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
            placeholder="O escribe el SKU aquí..."
            className="flex-1 bg-slate-900 text-white placeholder-slate-500 text-xs px-4 py-3 rounded-2xl border border-slate-800 focus:outline-none focus:border-rose-500 uppercase font-mono tracking-wider"
          />
          <button
            onClick={() => {
              if (manualCode.trim()) {
                playScanBeep();
                onScanSuccess(manualCode.trim());
              }
            }}
            disabled={!manualCode.trim()}
            className="px-5 py-3 bg-rose-500 hover:bg-rose-600 active:scale-95 disabled:opacity-50 text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-rose-500/20"
          >
            Agregar
          </button>
        </div>
        <p className="text-[11px] text-center text-slate-400 font-medium">
          Sunday Clóset · Motor de escaneo industrial CODE 128
        </p>
      </div>
    </div>
  );
};
