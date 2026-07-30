import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { AcBooking, AcPricing } from '@/lib/types';
import { Save } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = { pending: 'Чакаща', confirmed: 'Потвърдена', cancelled: 'Отказана' };

export function AdminKlimatici() {
  const [bookings, setBookings] = useState<AcBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [pricing, setPricing] = useState<AcPricing | null>(null);
  const [pricingForm, setPricingForm] = useState({ freon_recharge: '', diagnostics: '', repair: '', other: '' });
  const [pricingSaved, setPricingSaved] = useState(false);

  useEffect(() => { loadBookings(); loadPricing(); }, []);

  async function loadBookings() {
    setLoading(true);
    const { data } = await supabase.from('ac_bookings').select('*').order('created_at', { ascending: false });
    setBookings((data as AcBooking[]) ?? []);
    setLoading(false);
  }

  async function loadPricing() {
    const { data } = await supabase.from('ac_pricing').select('*').limit(1).maybeSingle();
    if (data) {
      setPricing(data as AcPricing);
      setPricingForm({ freon_recharge: (data as AcPricing).freon_recharge ?? '', diagnostics: (data as AcPricing).diagnostics ?? '', repair: (data as AcPricing).repair ?? '', other: (data as AcPricing).other ?? '' });
    }
  }

  async function setStatus(id: string, status: string) {
    await supabase.from('ac_bookings').update({ status }).eq('id', id);
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: status as AcBooking['status'] } : b)));
  }

  async function savePricing() {
    if (pricing) {
      await supabase.from('ac_pricing').update({ freon_recharge: pricingForm.freon_recharge || null, diagnostics: pricingForm.diagnostics || null, repair: pricingForm.repair || null, other: pricingForm.other || null, updated_at: new Date().toISOString() }).eq('id', pricing.id);
    } else {
      await supabase.from('ac_pricing').insert({ freon_recharge: pricingForm.freon_recharge || null, diagnostics: pricingForm.diagnostics || null, repair: pricingForm.repair || null, other: pricingForm.other || null });
    }
    setPricingSaved(true);
    setTimeout(() => setPricingSaved(false), 3000);
    await loadPricing();
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Автоклиматици — Резервации</h2>
      {loading ? (
        <p className="text-zinc-400 text-center py-8">Зареждане...</p>
      ) : bookings.length === 0 ? (
        <p className="text-zinc-400 text-center py-8">Няма резервации за климатик.</p>
      ) : (
        <div className="space-y-3 mb-10">
          {bookings.map((b) => (
            <div key={b.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{b.name}</p>
                <p className="text-sm text-zinc-400">{b.phone} · {b.car_model}</p>
                <p className="text-xs text-mtex-lightblue mt-1">{b.service_type}</p>
                {b.appointment_date && <p className="text-xs text-zinc-500">{b.appointment_date} {b.appointment_time ? `в ${b.appointment_time}` : ''}</p>}
                {b.email && <p className="text-xs text-zinc-500">{b.email}</p>}
              </div>
              <select value={b.status} onChange={(e) => setStatus(b.id, e.target.value)} className="input-dark py-1.5 text-sm w-auto">{Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            </div>
          ))}
        </div>
      )}
      <h3 className="text-xl font-bold text-white mb-4">Цени на услугите</h3>
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 max-w-2xl space-y-3">
        <div><label className="block text-sm text-zinc-400 mb-1">Зареждане с фреон</label><input value={pricingForm.freon_recharge} onChange={(e) => setPricingForm({ ...pricingForm, freon_recharge: e.target.value })} placeholder="напр. 50 лв." className="input-dark" /></div>
        <div><label className="block text-sm text-zinc-400 mb-1">Диагностика</label><input value={pricingForm.diagnostics} onChange={(e) => setPricingForm({ ...pricingForm, diagnostics: e.target.value })} placeholder="напр. 30 лв." className="input-dark" /></div>
        <div><label className="block text-sm text-zinc-400 mb-1">Ремонт</label><input value={pricingForm.repair} onChange={(e) => setPricingForm({ ...pricingForm, repair: e.target.value })} placeholder="По запитване" className="input-dark" /></div>
        <div><label className="block text-sm text-zinc-400 mb-1">Друго</label><input value={pricingForm.other} onChange={(e) => setPricingForm({ ...pricingForm, other: e.target.value })} placeholder="По запитване" className="input-dark" /></div>
        <button onClick={savePricing} className="btn-red text-sm"><Save className="w-4 h-4" />Запази цените</button>
        {pricingSaved && <p className="text-emerald-400 text-sm">Цените са запазени!</p>}
      </div>
    </div>
  );
}