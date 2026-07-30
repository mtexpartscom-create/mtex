import { useEffect, useState } from 'react';
import { Snowflake, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { AcPricing } from '@/lib/types';

const AC_SERVICE_TYPES = ['Зареждане с фреон', 'Диагностика', 'Ремонт', 'Друго'];
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export function AvtoklimaticiPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', car_model: '', service_type: '', appointment_date: '', appointment_time: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [pricing, setPricing] = useState<AcPricing | null>(null);

  useEffect(() => {
    supabase.from('ac_pricing').select('*').limit(1).maybeSingle().then(({ data }) => { setPricing(data as AcPricing | null); });
  }, []);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Моля, въведете вашето име';
    if (!form.phone.trim()) e.phone = 'Моля, въведете телефон за връзка';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Невалиден имейл адрес';
    if (!form.car_model.trim()) e.car_model = 'Моля, въведете марка и модел';
    if (!form.service_type) e.service_type = 'Моля, изберете вид услуга';
    if (!form.appointment_date) e.appointment_date = 'Моля, изберете дата';
    if (!form.appointment_time) e.appointment_time = 'Моля, изберете час';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus('sending');
    const { error } = await supabase.from('ac_bookings').insert({
      name: form.name, phone: form.phone, email: form.email || null, car_model: form.car_model,
      service_type: form.service_type, appointment_date: form.appointment_date || null,
      appointment_time: form.appointment_time || null, status: 'pending',
    });
    if (error) setStatus('err');
    else { setStatus('ok'); setForm({ name: '', phone: '', email: '', car_model: '', service_type: '', appointment_date: '', appointment_time: '' }); }
  }

  const today = new Date().toISOString().split('T')[0];
  const hasPricing = pricing && (pricing.freon_recharge || pricing.diagnostics || pricing.repair || pricing.other);

  return (
    <section className="pt-20 md:pt-24 pb-16 md:pb-24 bg-gradient-to-b from-black via-[#031a2e] to-black min-h-screen relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-mtex-lightblue/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-mtex-darkblue/20 rounded-full blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-semibold uppercase tracking-wider text-mtex-lightblue border border-mtex-lightblue/40 rounded-full">
            <Snowflake className="w-4 h-4" />Автоклиматици
          </div>
          <h1 className="section-title text-white">Обслужване на автоклиматици</h1>
          <p className="section-sub">Професионална грижа за климатика на вашия автомобил</p>
        </div>
        <div className="max-w-3xl mx-auto mb-10 text-zinc-300 space-y-3">
          <p>Предлагаме пълно обслужване на автоклиматични системи за всички марки автомобили. Нашите услуги включват:</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-3"><Snowflake className="w-5 h-5 text-mtex-lightblue shrink-0 mt-0.5" /><span>Зареждане с фреон (R134a и HFO-1234yf)</span></li>
            <li className="flex items-start gap-3"><Snowflake className="w-5 h-5 text-mtex-lightblue shrink-0 mt-0.5" /><span>Диагностика за течове с вакуум или UV оцветител</span></li>
            <li className="flex items-start gap-3"><Snowflake className="w-5 h-5 text-mtex-lightblue shrink-0 mt-0.5" /><span>Ремонт и подмяна на компресори, радиатори и маркучи</span></li>
          </ul>
        </div>
        <div className="max-w-2xl mx-auto mb-12">
          <h2 className="text-xl font-bold text-white mb-4 text-center">Цени на услугите</h2>
          <div className="bg-zinc-950/80 border border-mtex-lightblue/30 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-zinc-800"><td className="py-4 px-5 text-zinc-300">Зареждане с фреон</td><td className="py-4 px-5 text-right text-white font-semibold">{hasPricing && pricing!.freon_recharge ? pricing!.freon_recharge : 'По запитване'}</td></tr>
                <tr className="border-b border-zinc-800"><td className="py-4 px-5 text-zinc-300">Диагностика</td><td className="py-4 px-5 text-right text-white font-semibold">{hasPricing && pricing!.diagnostics ? pricing!.diagnostics : 'По запитване'}</td></tr>
                <tr className="border-b border-zinc-800"><td className="py-4 px-5 text-zinc-300">Ремонт</td><td className="py-4 px-5 text-right text-white font-semibold">{hasPricing && pricing!.repair ? pricing!.repair : 'По запитване'}</td></tr>
                <tr><td className="py-4 px-5 text-zinc-300">Друго</td><td className="py-4 px-5 text-right text-white font-semibold">{hasPricing && pricing!.other ? pricing!.other : 'По запитване'}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="bg-zinc-950/80 border border-mtex-lightblue/30 rounded-xl p-6 backdrop-blur">
            <h3 className="font-heading text-xl font-bold text-white mb-4">Запиши час за обслужване на климатик</h3>
            {status === 'ok' ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white">Заявката е изпратена!</h3>
                <p className="text-zinc-400 mt-2">Ще се свържем с вас за потвърждение.</p>
                <button onClick={() => setStatus('idle')} className="btn-red mt-6">Запиши нов час</button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <div><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Име и фамилия" className="input-dark" />{errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}</div>
                <div><input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Телефон" className="input-dark" />{errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}</div>
                <div><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Имейл (по желание)" className="input-dark" />{errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}</div>
                <div><input required value={form.car_model} onChange={(e) => setForm({ ...form, car_model: e.target.value })} placeholder="Марка и модел" className="input-dark" />{errors.car_model && <p className="text-red-500 text-xs mt-1">{errors.car_model}</p>}</div>
                <div><select required value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })} className="input-dark"><option value="">Изберете вид услуга</option>{AC_SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}</select>{errors.service_type && <p className="text-red-500 text-xs mt-1">{errors.service_type}</p>}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className="block text-sm text-zinc-400 mb-1">Дата</label><div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" /><input type="date" min={today} value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} className="input-dark pl-10" /></div>{errors.appointment_date && <p className="text-red-500 text-xs mt-1">{errors.appointment_date}</p>}</div>
                  <div><label className="block text-sm text-zinc-400 mb-1">Час</label><div className="relative"><Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" /><select value={form.appointment_time} onChange={(e) => setForm({ ...form, appointment_time: e.target.value })} className="input-dark pl-10"><option value="">Изберете час</option>{TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>{errors.appointment_time && <p className="text-red-500 text-xs mt-1">{errors.appointment_time}</p>}</div>
                </div>
                <button type="submit" disabled={status === 'sending'} className="btn-red w-full">{status === 'sending' ? 'Изпращане...' : 'Запиши час'}</button>
                {status === 'err' && <p className="text-red-500 text-sm text-center">Възникна грешка. Опитайте отново.</p>}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}