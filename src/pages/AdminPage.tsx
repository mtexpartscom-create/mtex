import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminMorgue } from '@/pages/admin/AdminMorgue';
import { AdminParts } from '@/pages/admin/AdminParts';
import { AdminServis } from '@/pages/admin/AdminServis';
import { AdminKlimatici } from '@/pages/admin/AdminKlimatici';
import { AdminProdai } from '@/pages/admin/AdminProdai';
import { LayoutDashboard, Car, ShoppingCart, Wrench, Snowflake, HandCoins, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';

type Tab = 'dashboard' | 'morgue' | 'parts' | 'servis' | 'klimatici' | 'prodai';

const ADMIN_USERNAME = 'mtexadmin';
const ADMIN_PASSWORD = 'Bmw606626';
const SESSION_KEY = 'mtex_admin_session';
const SESSION_DURATION = 8 * 60 * 60 * 1000;

export function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [tab, setTab] = useState<Tab>('dashboard');

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.expiresAt && Date.now() < data.expiresAt) {
          setAuthed(true);
        } else {
          sessionStorage.removeItem(SESSION_KEY);
        }
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
    setChecking(false);
  }, []);

  function login(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const expiresAt = Date.now() + SESSION_DURATION;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ expiresAt }));
      setAuthed(true);
      setUsername('');
      setPassword('');
    } else {
      setError('Грешно потребителско име или парола.');
    }
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
    setTab('dashboard');
  }

  if (checking) {
    return (
      <div className="pt-24 min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-400">Зареждане...</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="pt-24 min-h-screen bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-mtex-red/10 border border-mtex-red/20 mb-4">
              <Lock className="w-8 h-8 text-mtex-red" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-white">Администрация</h1>
            <p className="text-sm text-zinc-500 mt-2">Въведете вашите данни за достъп.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 text-center">
              {error}
            </div>
          )}

          <form onSubmit={login} className="space-y-4">
            <div>
              <input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Потребителско име"
                className="input-dark"
                autoComplete="username"
              />
            </div>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Парола"
                className="input-dark pr-12"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <button type="submit" className="btn-red w-full">
              Вход
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-zinc-500 hover:text-zinc-300">
              Към сайта
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Car }[] = [
    { id: 'dashboard', label: 'Табло', icon: LayoutDashboard },
    { id: 'morgue', label: 'Автоморга', icon: Car },
    { id: 'parts', label: 'Авточасти', icon: ShoppingCart },
    { id: 'servis', label: 'Автосервиз', icon: Wrench },
    { id: 'klimatici', label: 'Автоклиматици', icon: Snowflake },
    { id: 'prodai', label: 'Продай автомобил', icon: HandCoins },
  ];

  return (
    <div className="pt-16 min-h-screen bg-black flex flex-col">
      <header className="flex items-center justify-between px-4 md:px-6 h-14 border-b border-zinc-800 bg-zinc-950 sticky top-16 z-40">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-mtex-red" />
          <h1 className="font-heading text-lg font-bold text-white">Админ панел</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            Към сайта
          </Link>
          <button onClick={logout} className="text-sm text-zinc-400 hover:text-mtex-red">
            Изход
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav className="w-16 md:w-56 border-r border-zinc-800 bg-zinc-950 flex flex-col py-2 overflow-y-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${tab === t.id ? 'bg-mtex-darkblue/30 text-mtex-lightblue border-l-2 border-mtex-lightblue' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="hidden md:inline">{t.label}</span>
              </button>
            );
          })}
        </nav>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-black">
          {tab === 'dashboard' && <Dashboard />}
          {tab === 'morgue' && <AdminMorgue />}
          {tab === 'parts' && <AdminParts />}
          {tab === 'servis' && <AdminServis />}
          {tab === 'klimatici' && <AdminKlimatici />}
          {tab === 'prodai' && <AdminProdai />}
        </main>
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Общ преглед</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <Car className="w-8 h-8 text-mtex-lightblue mb-2" />
          <p className="text-zinc-400 text-sm">Автоморга</p>
          <p className="text-zinc-300 text-sm mt-2">Управлявайте автомобилите на части и техните снимки.</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <ShoppingCart className="w-8 h-8 text-mtex-lightblue mb-2" />
          <p className="text-zinc-400 text-sm">Авточасти</p>
          <p className="text-zinc-300 text-sm mt-2">Добавяйте, редактирайте и публикувайте продукти в магазина.</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <Wrench className="w-8 h-8 text-mtex-lightblue mb-2" />
          <p className="text-zinc-400 text-sm">Автосервиз</p>
          <p className="text-zinc-300 text-sm mt-2">Преглеждайте резервациите и управлявайте галерията преди/след.</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <Snowflake className="w-8 h-8 text-mtex-lightblue mb-2" />
          <p className="text-zinc-400 text-sm">Автоклиматици</p>
          <p className="text-zinc-300 text-sm mt-2">Управлявайте резервациите за климатик и цените на услугите.</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <HandCoins className="w-8 h-8 text-mtex-lightblue mb-2" />
          <p className="text-zinc-400 text-sm">Продай автомобил</p>
          <p className="text-zinc-300 text-sm mt-2">Преглеждайте заявките за изкупуване с качените снимки.</p>
        </div>
      </div>
    </div>
  );
}
