import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from '@/lib/cart';
import { AuthProvider } from '@/lib/auth';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Contacts';
import { CartDrawer } from '@/components/CartDrawer';
import { LandingPage } from '@/pages/LandingPage';
import { AvtomorgaPage } from '@/pages/AvtomorgaPage';
import { AvtoChastiPage } from '@/pages/AvtoChastiPage';
import { AvtoservisPage } from '@/pages/AvtoservisPage';
import { AvtoklimaticiPage } from '@/pages/AvtoklimaticiPage';
import { ProdaiAvtomobilPage } from '@/pages/ProdaiAvtomobilPage';
import { PatnaPomoshtPage } from '@/pages/PatnaPomoshtPage';
import { AdminPage } from '@/pages/AdminPage';

function AppInner() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header onCartClick={() => setCartOpen(true)} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/avtomorga" element={<AvtomorgaPage />} />
          <Route path="/avto-chasti" element={<AvtoChastiPage />} />
          <Route path="/avtochasti" element={<AvtoChastiPage />} />
          <Route path="/avtoservis" element={<AvtoservisPage />} />
          <Route path="/avtoklimatici" element={<AvtoklimaticiPage />} />
          <Route path="/prodai-avtomobil" element={<ProdaiAvtomobilPage />} />
          <Route path="/patna-pomosht" element={<PatnaPomoshtPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>

      <Footer />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <a
        href="tel:+359888123456"
        className="lg:hidden fixed bottom-4 right-4 z-40 pulse-ring bg-mtex-red text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
        aria-label="Пътна помощ"
      >
        <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2.28a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.21l-2.26 1.13a11 11 0 005.5 5.5l1.13-2.26a1 1 0 011.21-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.7 21 3 14.3 3 6V5z" /></svg>
      </a>
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppInner />
        </BrowserRouter>
      </AuthProvider>
    </CartProvider>
  );
}
