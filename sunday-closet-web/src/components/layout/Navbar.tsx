"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/store/cartStore";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { toggleCart, count } = useCartStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cartCount = count();

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/", label: "Inicio" },
    { href: "/#productos", label: "Productos" },
  ];

  const hasSolidBg = scrolled || !isHome;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          hasSolidBg
            ? "bg-[#F7F6F2]/95 backdrop-blur-md border-b border-[#E5E3DD] shadow-xs"
            : "bg-transparent"
        }`}
      >
        <nav className="site-container h-14 sm:h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            href="/"
            className="font-display font-light text-lg tracking-widest text-[#1F1F1F] hover:text-[#C2A78C] transition-colors duration-300 italic"
          >
            Sunday Clóset
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs tracking-wider uppercase font-light text-[#1F1F1F] hover:text-[#C2A78C] transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-5">
            <button
              onClick={toggleCart}
              className="relative p-1 text-[#1F1F1F] hover:text-[#C2A78C] transition-colors focus:outline-none"
              aria-label="Ver bolsa de compras"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.25]" />
              <AnimatePresence>
                {mounted && cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-[#C2A78C] text-white text-[9px] font-medium rounded-full flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-1 text-[#1F1F1F] hover:text-[#C2A78C] focus:outline-none"
              aria-label="Abrir menú"
            >
              {menuOpen ? <X className="w-4 h-4 stroke-[1.25]" /> : <Menu className="w-4 h-4 stroke-[1.25]" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-14 sm:top-16 z-30 bg-[#F7F6F2] border-b border-[#E5E3DD] p-6 md:hidden shadow-lg"
          >
            <div className="flex flex-col space-y-4 text-center">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-light tracking-widest uppercase text-[#1F1F1F] hover:text-[#C2A78C]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
