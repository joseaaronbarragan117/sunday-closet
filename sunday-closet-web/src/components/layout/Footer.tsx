import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[#E5E3DD] bg-[#1F1F1F] text-white">
      <div className="site-container py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <p className="font-display font-light text-xl mb-3 text-white italic">
              Sunday Clóset
            </p>
            <p className="text-xs text-white/50 font-light leading-relaxed max-w-xs">
              Piezas únicas de alta curaduría. Moda circular, estilo propio e irrepetible.
            </p>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Sunday Clóset"
              className="mt-4 inline-flex items-center gap-2 text-xs font-light text-[#C2A78C] hover:text-white transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
              </svg>
              @sundaycloset
            </a>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-light text-white/70 uppercase tracking-widest mb-4">
              Tienda
            </p>
            <ul className="space-y-2">
              {["Inicio", "Todos los productos", "Drops"].map((l) => (
                <li key={l}>
                  <Link
                    href="/"
                    className="text-xs text-white/50 font-light hover:text-white transition-colors"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <p className="text-xs font-light text-white/70 uppercase tracking-widest mb-4">
              Info
            </p>
            <ul className="space-y-2">
              {["Política de envíos", "Cambios y devoluciones", "Contacto"].map((l) => (
                <li key={l}>
                  <Link
                    href="/"
                    className="text-xs text-white/50 font-light hover:text-white transition-colors"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30 font-light">
            © {new Date().getFullYear()} Sunday Clóset. Todos los derechos reservados.
          </p>
          <p className="text-xs text-white/20 font-light">
            Pagos procesados por Mercado Pago
          </p>
        </div>
      </div>
    </footer>
  );
}
