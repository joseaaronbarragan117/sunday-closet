"use client";

import React, { useState, useRef, useEffect } from "react";
import { InventoryItem } from "@/types/inventory";
import { formatDriveImageUrl } from "@/lib/imageUrl";
import { DriveImage } from "@/components/common/DriveImage";
import {
  Store,
  X,
  Search,
  Barcode,
  ShoppingBag,
  Trash2,
  CheckCircle2,
  DollarSign,
  MessageCircle,
  Sparkles,
  AlertCircle,
  Tag,
} from "lucide-react";

interface PosModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onSaleCompleted: (soldSkus: string[]) => void;
}

interface CartEntry {
  item: InventoryItem;
  priceType: "sunday" | "web" | "custom";
  price: number;
}

export const PosModal: React.FC<PosModalProps> = ({
  isOpen,
  onClose,
  items,
  onSaleCompleted,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [channel, setChannel] = useState<"Instagram" | "Físico / Showroom" | "WhatsApp" | "Bazar / Pop-up">("Instagram");
  const [paymentMethod, setPaymentMethod] = useState<"Efectivo" | "Transferencia SPEI" | "Tarjeta / Terminal" | "Mercado Pago">("Transferencia SPEI");
  const [customerNotes, setCustomerNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Autofocus search on modal open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      setFeedbackMsg(null);
    } else {
      setCart([]);
      setSearchTerm("");
      setCustomerNotes("");
      setFeedbackMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter available items
  const availableItems = items.filter(
    (i) => (i.status === "Disponible" || i.status === "Programado") && !cart.some((c) => c.item.sku === i.sku)
  );

  const searchResults = searchTerm.trim() === ""
    ? []
    : availableItems.filter((i) => {
        const query = searchTerm.toLowerCase().trim();
        return (
          i.sku.toLowerCase().includes(query) ||
          i.type.toLowerCase().includes(query) ||
          i.brand.toLowerCase().includes(query) ||
          i.color.toLowerCase().includes(query)
        );
      }).slice(0, 8);

  const handleAddToCart = (item: InventoryItem) => {
    // Default to Sunday price or pricePublished/priceWeb
    const initialPrice = item.priceSunday || item.pricePublished || item.priceWeb || 0;
    setCart((prev) => [
      ...prev,
      {
        item,
        priceType: "sunday",
        price: initialPrice,
      },
    ]);
    setSearchTerm("");
    searchInputRef.current?.focus();
  };

  // Handle barcode scanner Enter or exact SKU match
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const exactMatch = availableItems.find(
        (i) => i.sku.toLowerCase() === searchTerm.trim().toLowerCase()
      );
      if (exactMatch) {
        handleAddToCart(exactMatch);
      } else if (searchResults.length === 1) {
        handleAddToCart(searchResults[0]);
      }
    }
  };

  const handleRemoveFromCart = (sku: string) => {
    setCart((prev) => prev.filter((c) => c.item.sku !== sku));
  };

  const handlePriceChange = (sku: string, newPrice: number) => {
    setCart((prev) =>
      prev.map((c) => (c.item.sku === sku ? { ...c, price: newPrice, priceType: "custom" } : c))
    );
  };

  const total = cart.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

  const handleSubmitSale = async () => {
    if (cart.length === 0) return;

    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const payload = {
        channel,
        paymentMethod,
        customerNotes: customerNotes.trim() || undefined,
        items: cart.map((c) => ({
          sku: c.item.sku,
          finalPrice: Number(c.price),
        })),
      };

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setFeedbackMsg({
          type: "success",
          text: `¡Venta registrada con éxito! ${cart.length} prenda(s) marcada(s) como Vendida(s).`,
        });
        const sold = cart.map((c) => c.item.sku);
        setTimeout(() => {
          onSaleCompleted(sold);
          onClose();
        }, 1200);
      } else {
        setFeedbackMsg({
          type: "error",
          text: data.error || "Error al procesar la venta.",
        });
      }
    } catch (err: any) {
      console.error("Sale error:", err);
      setFeedbackMsg({
        type: "error",
        text: "Error de red o conexión al servidor.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[90vh] max-h-[850px] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                Punto de Venta Manual <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono">Físico / Instagram</span>
              </h2>
              <p className="text-xs text-slate-400">
                Escanea el código de barras o busca la prenda para registrar la salida del inventario.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl flex items-center gap-3 text-sm font-medium ${
              feedbackMsg.type === "success"
                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                : "bg-rose-500/10 text-rose-300 border border-rose-500/30"
            }`}
          >
            {feedbackMsg.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Main Content: Split 2 columns (Finder & Cart) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Column: Finder & Available Items (7 cols) */}
          <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 p-6 overflow-hidden">
            {/* Search / Barcode Input */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Barcode className="w-5 h-5 text-rose-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escanear código de barras o buscar por SKU, prenda, marca..."
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-950 border border-slate-700/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm placeholder:text-slate-500 text-white transition-all shadow-inner"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    searchInputRef.current?.focus();
                  }}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Subheader hint */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
              <span>{searchTerm.trim() ? "Resultados de búsqueda" : "Prendas disponibles para venta"}</span>
              <span className="font-mono text-slate-500">{availableItems.length} disponibles</span>
            </div>

            {/* List of items */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {(searchTerm.trim() ? searchResults : availableItems.slice(0, 15)).map((item) => {
                const img = formatDriveImageUrl(item.photoUrl);
                return (
                  <div
                    key={item.sku}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40 transition-all group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-14 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                        <DriveImage
                          src={item.photoUrl}
                          alt={item.type}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-rose-400">{item.sku}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">
                            {item.size}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-100 truncate">{item.type}</h4>
                        <p className="text-xs text-slate-400 truncate">{item.brand || "Sin marca"} · {item.color}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-400">
                          ${(item.priceSunday || item.pricePublished || item.priceWeb || 0).toLocaleString("es-MX")}
                        </div>
                        <div className="text-[10px] text-slate-500">Precio Sunday</div>
                      </div>

                      <button
                        onClick={() => handleAddToCart(item)}
                        className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition-all font-medium text-xs flex items-center gap-1 shadow-xs"
                      >
                        <span>+ Agregar</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {searchTerm.trim() && searchResults.length === 0 && (
                <div className="py-12 text-center text-slate-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm font-medium">No se encontró ninguna prenda con "{searchTerm}"</p>
                  <p className="text-xs text-slate-600 mt-1">Verifica el SKU o código escaneado.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Active Cart & Checkout (5 cols) */}
          <div className="lg:col-span-5 flex flex-col bg-slate-950/30 p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-rose-400" />
                <h3 className="font-semibold text-sm text-slate-200">Carrito de Venta</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {cart.length} {cart.length === 1 ? "prenda" : "prendas"}
              </span>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-4 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-10">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center justify-center mb-3 text-slate-600">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-400">El carrito está vacío</p>
                  <p className="text-xs text-slate-600 max-w-xs mt-1">
                    Escanea una prenda o selecciónala desde la lista izquierda para iniciar la venta.
                  </p>
                </div>
              ) : (
                cart.map((entry) => (
                  <div
                    key={entry.item.sku}
                    className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-rose-400">{entry.item.sku}</span>
                        <span className="text-[10px] text-slate-400">Talla {entry.item.size}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-200 truncate">{entry.item.type}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center rounded-xl bg-slate-950 border border-slate-700/80 px-2 py-1">
                        <span className="text-xs text-slate-400 mr-1">$</span>
                        <input
                          type="number"
                          value={entry.price}
                          onChange={(e) => handlePriceChange(entry.item.sku, Number(e.target.value))}
                          className="w-16 bg-transparent text-sm font-bold text-emerald-400 text-right focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(entry.item.sku)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Eliminar de la orden"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sale Settings & Finalize */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Channel Selector */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-medium">Canal de Venta</label>
                  <select
                    value={channel}
                    onChange={(e: any) => setChannel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="Instagram">Instagram (DM)</option>
                    <option value="Físico / Showroom">Físico / Showroom</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Bazar / Pop-up">Bazar / Pop-up</option>
                  </select>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-medium">Método de Pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="Transferencia SPEI">Transferencia SPEI</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta / Terminal">Tarjeta / Terminal</option>
                    <option value="Mercado Pago">Mercado Pago</option>
                  </select>
                </div>
              </div>

              {/* Customer Notes / Handle */}
              <div>
                <input
                  type="text"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Nota opcional (ej: @usuario_ig, cliente ana)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-rose-500 placeholder:text-slate-600"
                />
              </div>

              {/* Total Row */}
              <div className="flex items-center justify-between py-2 px-1">
                <span className="text-sm text-slate-400 font-medium">Total a Cobrar:</span>
                <span className="text-2xl font-serif font-bold text-emerald-400">
                  ${total.toLocaleString("es-MX")} <span className="text-xs text-slate-500 font-sans">MXN</span>
                </span>
              </div>

              {/* Confirm Sale Button */}
              <button
                onClick={handleSubmitSale}
                disabled={cart.length === 0 || isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Registrando venta en Sheets...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar Venta ({cart.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
