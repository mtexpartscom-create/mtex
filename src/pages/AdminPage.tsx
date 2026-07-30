import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { AdminMorgue } from '@/pages/admin/AdminMorgue';
import { AdminParts } from '@/pages/admin/AdminParts';
import { AdminServis } from '@/pages/admin/AdminServis';
import { AdminKlimatici } from '@/pages/admin/AdminKlimatici';
import { AdminProdai } from '@/pages/admin/AdminProdai';
import { LayoutDashboard, Car, ShoppingCart, Wrench, Snowflake, HandCoins, ArrowLeft } from 'lucide-react';

type Tab = 'dashboard' | 'morgue' | 'parts' | 'servis' | 'klimatici' | 'prodai';

export function AdminPage() {
  const { profile, loading } = useAuth();
  const [tab, setTab] = useState<Tab>('dashboard');

  if (loading) return (<div className="pt-24 min-h-screen bg-black flex items-center justify-center"><p className="text-zinc-400">Зареждане...</p></div>);
  if (!profile || profile.role !== 'admin') return (<div className="pt-24 min-h-screen bg-black flex flex-col items-center justify-center gap-4"><p className="text-zinc-400 text-lg">Нямате достъп до админ панела.</p><Link to="/" className="btn-red">Към началната страница</Link></div>);

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
        <div className="flex items-center gap-2"><LayoutDashboard className="w-5 h-5 text-mtex-red" /><h1 className="font-heading text-lg font-bold text-white">Админ панел</h1></div>
        <Link to="/" className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="w-4 h-4" />Към сайта</Link>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <nav className="w-16 md:w-56 border-r border-zinc-800 bg-zinc-950 flex flex-col py-2 overflow-y-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (<button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${tab === t.id ? 'bg-mtex-darkblue/30 text-mtex-lightblue border-l-2 border-mtex-lightblue' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}><Icon className="w-5 h-5 shrink-0" /><span className="hidden md:inline">{t.label}</span></button>);
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
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5"><Car className="w-8 h-8 text-mtex-lightblue mb-2" /><p className="text-zinc-400 text-sm">Автоморга</p><p className="text-zinc-300 text-sm mt-2">Управлявайте автомобилите на части и техните снимки.</p></div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5"><ShoppingCart className="w-8 h-8 text-mtex-lightblue mb-2" /><p className="text-zinc-400 text-sm">Авточасти</p><p className="text-zinc-300 text-sm mt-2">Добавяйте, редактирайте и публикувайте продукти в магазина.</p></div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5"><Wrench className="w-8 h-8 text-mtex-lightblue mb-2" /><p className="text-zinc-400 text-sm">Автосервиз</p><p className="text-zinc-300 text-sm mt-2">Преглеждайте резервациите и управлявайте галерията преди/след.</p></div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5"><Snowflake className="w-8 h-8 text-mtex-lightblue mb-2" /><p className="text-zinc-400 text-sm">Автоклиматици</p><p className="text-zinc-300 text-sm mt-2">Управлявайте резервациите за климатик и цените на услугите.</p></div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5"><HandCoins className="w-8 h-8 text-mtex-lightblue mb-2" /><p className="text-zinc-400 text-sm">Продай автомобил</p><p className="text-zinc-300 text-sm mt-2">Преглеждайте заявките за изкупуване с качените снимки.</p></div>
      </div>
    </div>
  );
}