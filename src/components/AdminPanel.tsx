import { useEffect, useState } from 'react';
import { X, Users, Package, ShoppingCart, Car, LayoutDashboard, Check, X as XIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Profile, Order, OrderItem, Vehicle, BuybackRequest, Part, Category } from '@/lib/types';
import { formatBgn } from '@/lib/pricing';

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
}

type Tab = 'dashboard' | 'users' | 'orders' | 'parts' | 'vehicles' | 'buyback';

const ORDER_STATUS: Record<string, string> = { new: 'Нова', sent: 'Изпратена', done: 'Завършена', cancelled: 'Отказана' };

export function AdminPanel({ open, onClose }: AdminPanelProps) {
  const [tab, setTab] = useState<Tab>('dashboard');

  if (!open) return null;

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: 'dashboard', label: 'Табло', icon: LayoutDashboard },
    { id: 'users', label: 'Потребители', icon: Users },
    { id: 'orders', label: 'Поръчки', icon: ShoppingCart },
    { id: 'parts', label: 'Части', icon: Package },
    { id: 'vehicles', label: 'Автомобили', icon: Car },
    { id: 'buyback', label: 'Изкупуване', icon: Car },
  ];

  return (
    <div className="fixed inset-0 z-[70] bg-black flex flex-col">
      <header className="flex items-center justify-between px-4 md:px-6 h-14 border-b border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-mtex-red" />
          <h1 className="font-heading text-lg font-bold text-white">Админ панел</h1>
        </div>
        <button onClick={onClose} aria-label="Затвори" className="text-zinc-400 hover:text-white w-10 h-10 flex items-center justify-center">
          <X className="w-5 h-5" />
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav className="w-16 md:w-56 border-r border-zinc-800 bg-zinc-950 flex flex-col py-2">
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
          {tab === 'users' && <UsersTab />}
          {tab === 'orders' && <OrdersTab />}
          {tab === 'parts' && <PartsTab />}
          {tab === 'vehicles' && <VehiclesTab />}
          {tab === 'buyback' && <BuybackTab />}
        </main>
      </div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({ users: 0, orders: 0, parts: 0, vehicles: 0, buyback: 0 });
  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('parts').select('*', { count: 'exact', head: true }),
      supabase.from('vehicles').select('*', { count: 'exact', head: true }),
      supabase.from('buyback_requests').select('*', { count: 'exact', head: true }),
    ]).then(([u, o, p, v, b]) => {
      setStats({ users: u.count ?? 0, orders: o.count ?? 0, parts: p.count ?? 0, vehicles: v.count ?? 0, buyback: b.count ?? 0 });
    });
  }, []);

  const cards = [
    { label: 'Потребители', value: stats.users, color: 'text-mtex-lightblue' },
    { label: 'Поръчки', value: stats.orders, color: 'text-mtex-red' },
    { label: 'Части', value: stats.parts, color: 'text-white' },
    { label: 'Автомобили', value: stats.vehicles, color: 'text-mtex-lightblue' },
    { label: 'Заявки за изкупуване', value: stats.buyback, color: 'text-mtex-red' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Общ преглед</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
            <p className={`font-heading text-3xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-zinc-400 uppercase mt-1">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<Profile[]>([]);
  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => setUsers((data as Profile[]) ?? []));
  }, []);

  async function toggleB2b(u: Profile, approved: boolean) {
    await supabase.from('profiles').update({ b2b_approved: approved }).eq('id', u.id);
    setUsers((prev) => prev.map((p) => (p.id === u.id ? { ...p, b2b_approved: approved } : p)));
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Потребители</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-zinc-400 border-b border-zinc-800">
              <th className="py-3 px-2">Имейл</th>
              <th className="py-3 px-2">Име</th>
              <th className="py-3 px-2">Тип</th>
              <th className="py-3 px-2">Фирма / ЕИК</th>
              <th className="py-3 px-2">B2B статус</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-zinc-900 text-zinc-200">
                <td className="py-3 px-2">{u.email}</td>
                <td className="py-3 px-2">{u.full_name ?? '—'}</td>
                <td className="py-3 px-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${u.role === 'b2b' ? 'bg-mtex-darkblue/30 text-mtex-lightblue' : u.role === 'admin' ? 'bg-mtex-red/20 text-red-400' : 'bg-zinc-800 text-zinc-300'}`}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-2">{u.role === 'b2b' ? `${u.company_name ?? '—'} / ${u.uic_eik ?? '—'}` : '—'}</td>
                <td className="py-3 px-2">
                  {u.role === 'b2b' ? (
                    u.b2b_approved ? (
                      <button onClick={() => toggleB2b(u, false)} className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                        <Check className="w-4 h-4" /> Одобрен
                      </button>
                    ) : (
                      <button onClick={() => toggleB2b(u, true)} className="flex items-center gap-1 text-amber-400 text-xs font-semibold hover:underline">
                        <XIcon className="w-4 h-4" /> Чака одобрение
                      </button>
                    )
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<(Order & { items?: OrderItem[] })[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setOrders((data as Order[]) ?? []);
    });
  }, []);

  async function setStatus(o: Order, status: Order['status']) {
    await supabase.from('orders').update({ status }).eq('id', o.id);
    setOrders((prev) => prev.map((p) => (p.id === o.id ? { ...p, status } : p)));
  }

  async function loadItems(orderId: string) {
    const { data } = await supabase.from('order_items').select('*').eq('order_id', orderId);
    setOrders((prev) => prev.map((p) => (p.id === orderId ? { ...p, items: (data as OrderItem[]) ?? [] } : p)));
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Поръчки</h2>
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="bg-zinc-950 border border-zinc-800 rounded-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold text-white">{o.customer_name}</p>
                <p className="text-sm text-zinc-400">{o.phone} · {o.city} · {o.ekont_office}</p>
                <p className="text-xs text-zinc-500 mt-1">{new Date(o.created_at).toLocaleString('bg-BG')}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-white">{formatBgn(Number(o.total))}</span>
                <select value={o.status} onChange={(e) => setStatus(o, e.target.value as Order['status'])} className="input-dark py-1.5 text-sm w-auto">
                  {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <button onClick={() => { setExpanded(expanded === o.id ? null : o.id); loadItems(o.id); }} className="text-mtex-lightblue text-sm hover:underline">
                  {expanded === o.id ? 'Скрий' : 'Детайли'}
                </button>
              </div>
            </div>
            {expanded === o.id && o.items && (
              <div className="px-4 pb-4 border-t border-zinc-900 pt-3">
                <ul className="space-y-1 text-sm text-zinc-300">
                  {o.items.map((it) => (
                    <li key={it.id} className="flex justify-between">
                      <span>{it.title} × {it.quantity}</span>
                      <span>{formatBgn(Number(it.price) * it.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
        {orders.length === 0 && <p className="text-zinc-400 text-center py-8">Няма поръчки.</p>}
      </div>
    </div>
  );
}

function PartsTab() {
  const [parts, setParts] = useState<Part[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Partial<Part> | null>(null);

  useEffect(() => {
    supabase.from('parts').select('*').order('created_at', { ascending: false }).then(({ data }) => setParts((data as Part[]) ?? []));
    supabase.from('categories').select('*').order('name').then(({ data }) => setCats((data as Category[]) ?? []));
  }, []);

  async function save() {
    if (!editing) return;
    if (editing.id) {
      await supabase.from('parts').update({
        title: editing.title, description: editing.description, price: Number(editing.price),
        oem_code: editing.oem_code, image_url: editing.image_url, category_id: editing.category_id, in_stock: editing.in_stock,
      }).eq('id', editing.id);
    } else {
      await supabase.from('parts').insert({
        title: editing.title, description: editing.description, price: Number(editing.price),
        oem_code: editing.oem_code, image_url: editing.image_url, category_id: editing.category_id, in_stock: editing.in_stock ?? true,
      });
    }
    setEditing(null);
    const { data } = await supabase.from('parts').select('*').order('created_at', { ascending: false });
    setParts((data as Part[]) ?? []);
  }

  async function del(id: string) {
    await supabase.from('parts').delete().eq('id', id);
    setParts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Части</h2>
        <button onClick={() => setEditing({ title: '', price: 0, in_stock: true })} className="btn-red text-sm">+ Нова част</button>
      </div>

      {editing && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input value={editing.title ?? ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Заглавие" className="input-dark" />
          <input value={editing.oem_code ?? ''} onChange={(e) => setEditing({ ...editing, oem_code: e.target.value })} placeholder="OEM код" className="input-dark" />
          <input type="number" value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} placeholder="Цена" className="input-dark" />
          <input value={editing.image_url ?? ''} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} placeholder="URL на снимка" className="input-dark" />
          <select value={editing.category_id ?? ''} onChange={(e) => setEditing({ ...editing, category_id: e.target.value || null })} className="input-dark">
            <option value="">Без категория</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <label className="flex items-center gap-2 text-zinc-300 text-sm">
            <input type="checkbox" checked={editing.in_stock ?? true} onChange={(e) => setEditing({ ...editing, in_stock: e.target.checked })} className="w-5 h-5 accent-mtex-red" />
            На склад
          </label>
          <textarea value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Описание" rows={2} className="input-dark md:col-span-2" />
          <div className="md:col-span-2 flex gap-2">
            <button onClick={save} className="btn-red text-sm">Запази</button>
            <button onClick={() => setEditing(null)} className="btn-outline-blue text-sm">Отказ</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {parts.map((p) => (
          <div key={p.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
            <p className="font-semibold text-white">{p.title}</p>
            <p className="text-sm text-mtex-lightblue">{formatBgn(Number(p.price))}</p>
            <p className="text-xs text-zinc-500 mt-1">OEM: {p.oem_code ?? '—'}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setEditing(p)} className="text-xs text-mtex-lightblue hover:underline">Редактирай</button>
              <button onClick={() => del(p.id)} className="text-xs text-red-500 hover:underline">Изтрий</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VehiclesTab() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [editing, setEditing] = useState<Partial<Vehicle> | null>(null);

  useEffect(() => {
    supabase.from('vehicles').select('*').order('created_at', { ascending: false }).then(({ data }) => setVehicles((data as Vehicle[]) ?? []));
  }, []);

  async function save() {
    if (!editing) return;
    if (editing.id) {
      await supabase.from('vehicles').update({
        make: editing.make, model: editing.model, year: Number(editing.year), engine: editing.engine, gearbox: editing.gearbox, image_url: editing.image_url,
      }).eq('id', editing.id);
    } else {
      await supabase.from('vehicles').insert({
        make: editing.make, model: editing.model, year: Number(editing.year), engine: editing.engine, gearbox: editing.gearbox, image_url: editing.image_url,
      });
    }
    setEditing(null);
    const { data } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
    setVehicles((data as Vehicle[]) ?? []);
  }

  async function del(id: string) {
    await supabase.from('vehicles').delete().eq('id', id);
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Автомобили на части</h2>
        <button onClick={() => setEditing({ make: '', model: '', year: 2020 })} className="btn-red text-sm">+ Нов автомобил</button>
      </div>

      {editing && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input value={editing.make ?? ''} onChange={(e) => setEditing({ ...editing, make: e.target.value })} placeholder="Марка" className="input-dark" />
          <input value={editing.model ?? ''} onChange={(e) => setEditing({ ...editing, model: e.target.value })} placeholder="Модел" className="input-dark" />
          <input type="number" value={editing.year ?? 2020} onChange={(e) => setEditing({ ...editing, year: Number(e.target.value) })} placeholder="Година" className="input-dark" />
          <input value={editing.engine ?? ''} onChange={(e) => setEditing({ ...editing, engine: e.target.value })} placeholder="Двигател" className="input-dark" />
          <input value={editing.gearbox ?? ''} onChange={(e) => setEditing({ ...editing, gearbox: e.target.value })} placeholder="Скоростна кутия" className="input-dark" />
          <input value={editing.image_url ?? ''} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} placeholder="URL на снимка" className="input-dark" />
          <div className="md:col-span-3 flex gap-2">
            <button onClick={save} className="btn-red text-sm">Запази</button>
            <button onClick={() => setEditing(null)} className="btn-outline-blue text-sm">Отказ</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((v) => (
          <div key={v.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
            <p className="font-semibold text-white">{v.make} {v.model} ({v.year})</p>
            <p className="text-xs text-zinc-500 mt-1">{v.engine} · {v.gearbox}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setEditing(v)} className="text-xs text-mtex-lightblue hover:underline">Редактирай</button>
              <button onClick={() => del(v.id)} className="text-xs text-red-500 hover:underline">Изтрий</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BuybackTab() {
  const [reqs, setReqs] = useState<BuybackRequest[]>([]);
  useEffect(() => {
    supabase.from('buyback_requests').select('*').order('created_at', { ascending: false }).then(({ data }) => setReqs((data as BuybackRequest[]) ?? []));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Заявки за изкупуване</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reqs.map((r) => (
          <div key={r.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
            <p className="font-semibold text-white">{r.make} {r.model} ({r.year})</p>
            <p className="text-sm text-zinc-400 mt-1">Състояние: {r.condition}</p>
            <p className="text-sm text-zinc-400">{r.contact_name ?? '—'} · {r.phone ?? '—'}</p>
            {r.photos && r.photos.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {r.photos.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer">
                    <img src={url} alt="" className="w-20 h-20 object-cover rounded-md border border-zinc-700" />
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
        {reqs.length === 0 && <p className="text-zinc-400 text-center py-8">Няма заявки.</p>}
      </div>
    </div>
  );
}