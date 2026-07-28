import { useState } from 'react';
import { Snowflake, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AC_SERVICES } from '@/lib/strings';

export function ACService() {
  const [form, setForm] = useState({ name: '', phone: '', vehicle: '', date: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    const { error } = await supabase.from('service_bookings').insert({
      service_type: 'Автоклиматици',
      name: form.name,
      phone: form.phone,
      vehicle_info: form.vehicle,
      preferred_date: form.date || null,
    });
    if (error) setStatus('err');
    else {
      setStatus('ok');
      setForm({ name: '', phone: '', vehicle: '', date: '' });
    }
  }

  return (
    <section id="ac-service" className="py-16 md:py-24 bg-gradient-to-b from-black via-[#031a2e] to-black relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-mtex-lightblue/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-mtex-darkblue/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-semibold uppercase tracking-wider text-mtex-lightblue border border-mtex-lightblue/40 rounded-full">
            <Snowflake className="w-4 h-4" />
            Автоклиматици
          </div>
          <h2 className="section-title text-white">Обслужване на автоклиматици</h2>
          <p className="section-sub">Професионална грижа за климатика на вашия автомобил</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-zinc-950/80 border border-mtex-lightblue/30 rounded-xl p-6 backdrop-blur">
            <h3 className="font-heading text-xl font-bold text-white mb-4">Нашите услуги</h3>
            <ul className="space-y-3">
              {AC_SERVICES.map((s) => (
                <li key={s} className="flex items-start gap-3 text-zinc-200">
                  <CheckCircle2 className="w-5 h-5 text-mtex-lightblue shrink-0 mt-0.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-zinc-950/80 border border-mtex-lightblue/30 rounded-xl p-6 backdrop-blur">
            <h3 className="font-heading text-xl font-bold text-white mb-4">Запиши час за диагностика на климатик</h3>
            <form onSubmit={submit} className="space-y-3">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Име и фамилия" className="input-dark" />
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Телефон" className="input-dark" />
              <input value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} placeholder="Автомобил" className="input-dark" />
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-dark" />
              <button type="submit" disabled={status === 'sending'} className="btn-red w-full">
                {status === 'sending' ? 'Изпращане...' : 'Запиши час за диагностика на климатик'}
              </button>
              {status === 'ok' && <p className="text-emerald-400 text-sm text-center">Заявката е изпратена!</p>}
              {status === 'err' && <p className="text-red-500 text-sm text-center">Възникна грешка. Опитайте отново.</p>}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}