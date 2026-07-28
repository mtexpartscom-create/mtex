import { useEffect, useState } from 'react';
import { Menu, X, Phone, User, ShoppingCart, Wrench } from 'lucide-react';
import { NAV_LINKS } from '@/lib/strings';
import { COMPANY_PHONE } from '@/lib/pricing';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';

interface HeaderProps {
  onCartClick: () => void;
  onAuthClick: () => void;
  onAdminClick: () => void;
}

export function Header({ onCartClick, onAuthClick, onAdminClick }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count } = useCart();
  const { profile } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/95 backdrop-blur border-b border-zinc-800' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <a href="#home" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-mtex-red flex items-center justify-center group-hover:scale-105 transition-transform">
              <Wrench className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-heading text-xl md:text-2xl font-bold tracking-wider text-white">
              MTEX <span className="text-mtex-red">Parts</span>
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-md transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <a
              href={`tel:${COMPANY_PHONE.replace(/\s/g, '')}`}
              className="hidden md:flex items-center gap-2 text-sm font-semibold text-white hover:text-mtex-lightblue transition-colors"
            >
              <Phone className="w-4 h-4 text-mtex-red" />
              {COMPANY_PHONE}
            </a>

            {profile?.role === 'admin' && (
              <button
                onClick={onAdminClick}
                className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-mtex-lightblue hover:underline"
              >
                Админ
              </button>
            )}

            <button
              onClick={onAuthClick}
              aria-label="Профил"
              className="w-11 h-11 flex items-center justify-center text-zinc-200 hover:text-mtex-lightblue hover:bg-zinc-900 rounded-md transition-colors"
            >
              <User className="w-5 h-5" />
            </button>

            <button
              onClick={onCartClick}
              aria-label="Количка"
              className="relative w-11 h-11 flex items-center justify-center text-zinc-200 hover:text-mtex-lightblue hover:bg-zinc-900 rounded-md transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-mtex-red text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>

            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Меню"
              className="lg:hidden w-11 h-11 flex items-center justify-center text-white hover:bg-zinc-900 rounded-md"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-black/98 border-t border-zinc-800 fade-up">
          <nav className="px-4 py-3 flex flex-col">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 px-2 text-base font-medium text-zinc-200 hover:text-mtex-lightblue border-b border-zinc-900"
              >
                {l.label}
              </a>
            ))}
            <a
              href={`tel:${COMPANY_PHONE.replace(/\s/g, '')}`}
              className="mt-3 flex items-center gap-2 text-base font-semibold text-white"
            >
              <Phone className="w-5 h-5 text-mtex-red" />
              {COMPANY_PHONE}
            </a>
            {profile?.role === 'admin' && (
              <button
                onClick={() => { onAdminClick(); setOpen(false); }}
                className="mt-2 text-sm font-semibold text-mtex-lightblue"
              >
                Админ панел
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
