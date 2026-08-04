import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import { CartProvider } from '@/lib/cart';
import { Header } from '@/components/Header';
import { AuthModal } from '@/components/AuthModal';
import { CartDrawer } from '@/components/CartDrawer';
import { LandingPage } from '@/pages/LandingPage';
import { AvtoChastiPage } from '@/pages/AvtoChastiPage';
import { AvtomorgaPage } from '@/pages/AvtomorgaPage';
import { AvtoservisPage } from '@/pages/AvtoservisPage';
import { AvtoklimaticiPage } from '@/pages/AvtoklimaticiPage';
import { ProdaiAvtomobilPage } from '@/pages/ProdaiAvtomobilPage';
import { PatnaPomoshtPage } from '@/pages/PatnaPomoshtPage';
import { AdminPage } from '@/pages/AdminPage';

function AppContent() {
  const { profile, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setAuthOpen(false);
  };

  return (
    <BrowserRouter>
      <Header
        onCartClick={() => setCartOpen(true)}
        onAuthClick={() => setAuthOpen(true)}
        onAdminClick={() => {}}
        onLogout={handleLogout}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/avtochasti" element={<AvtoChastiPage />} />
        <Route path="/avtomorga" element={<AvtomorgaPage />} />
        <Route path="/avtoservis" element={<AvtoservisPage />} />
        <Route path="/avtoklimatici" element={<AvtoklimaticiPage />} />
        <Route path="/prodai-avtomobil" element={<ProdaiAvtomobilPage />} />
        <Route path="/patna-pomosht" element={<PatnaPomoshtPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}