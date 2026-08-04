import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Phone } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { COMPANY_PHONE } from '@/lib/pricing';

interface HeaderProps {
  onCartClick: () => void;
  onAuthClick: () => void;
  onAdminClick: () => void;
  onLogout: () => void;
}

export function Header({ onCartClick, onAuthClick, onAdminClick, onLogout }: HeaderProps) {
  const { profile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/avtochasti', label: 'Авточасти' },
    { to: '/avtomorga', label: 'Автоморга' },
    { to: '/avtoservis', label: 'Автосервиз' },
    { to: '/avtoklimatici', label: 'Автоклиматици' },
    { to: '/prodai-avtomobil', label: 'Продай автомобил' },
    { to: '/patna-pomosht', label: 'Пътна помощ' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-heading text-xl md:text-2xl font-bold text-white tracking-tight">
              M<span className="text-mtex-red">TEX</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-zinc-300 hover:text-mtex-lightblue transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:${COMPANY_PHONE.replace(/\s/g, '')}`}
              className="hidden md:flex items-center gap-1 text-sm font-medium text-mtex-lightblue hover:text-white transition-colors mr-2"
            >
              <Phone className="w-4 h-4" />
              {COMPANY_PHONE}
            </a>

            {profile ? (
              <div className="flex items-center gap-2">
                {profile.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-mtex-lightblue hover:underline"
                  >
                    Админ
                  </Link>
                )}
                <span className="hidden md:inline text-sm text-zinc-300 max-w-[120px] truncate">
                  {profile.full_name || profile.email}
                </span>
                <button
                  onClick={onLogout}
                  aria-label="Изход"
                  className="text-xs text-zinc-400 hover:text-mtex-red px-2 py-1 rounded-md hover:bg-zinc-900 transition-colors"
                >
                  Изход
                </button>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                aria-label="Профил"
                className="w-11 h-11 flex items-center justify-center text-zinc-200 hover:text-mtex-lightblue hover:bg-zinc-900 rounded-md transition-colors"
              >
                <User className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={onCartClick}
              aria-label="Количка"
              className="w-11 h-11 flex items-center justify-center text-zinc-200 hover:text-mtex-lightblue hover:bg-zinc-900 rounded-md transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Меню"
              className="lg:hidden w-11 h-11 flex items-center justify-center text-zinc-200 hover:text-mtex-lightblue hover:bg-zinc-900 rounded-md transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-zinc-950 border-t border-zinc-800 px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-medium text-zinc-300 hover:text-mtex-lightblue"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={`tel:${COMPANY_PHONE.replace(/\s/g, '')}`}
            className="block py-2 text-sm font-medium text-mtex-lightblue"
          >
            {COMPANY_PHONE}
          </a>
          {profile?.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-semibold text-mtex-lightblue"
            >
              Админ панел
            </Link>
          )}
          {profile && (
            <button
              onClick={() => { onLogout(); setMobileOpen(false); }}
              className="block py-2 text-sm font-semibold text-zinc-400 hover:text-mtex-red"
            >
              Изход
            </button>
          )}
        </div>
      )}
    </header>
  );
}