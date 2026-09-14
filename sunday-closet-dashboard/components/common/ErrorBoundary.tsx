'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleResetCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-8 h-8" />
              <h2 className="text-lg font-bold">Error en la aplicación</h2>
            </div>

            <p className="text-sm text-slate-300">
              Ocurrió un error inesperado al renderizar la pantalla:
            </p>

            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-rose-300 font-mono overflow-x-auto whitespace-pre-wrap">
              {this.state.error?.message || 'Error desconocido'}
            </pre>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Recargar página
              </button>

              <button
                onClick={this.handleResetCache}
                className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
              >
                <Trash2 className="w-3.5 h-3.5 text-amber-400" />
                Limpiar datos guardados y reiniciar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
