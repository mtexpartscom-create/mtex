import { useState } from 'react';
import { Cpu, Wrench, Settings, Disc, type LucideIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SERVICE_CAPABILITIES } from '@/lib/strings';

const ICONS: Record<string, LucideIcon> = { Cpu, Wrench, Settings, Disc };

export function CarService() {
  const [form, setForm] = useState({ name: '', phone: '', vehicle: '', date: '', notes: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    const { error } = await supabase.from('service_bookings').insert({
      service_type: 'Автосервиз',
      name: form.name,
      phone: form.phone,
      vehicle_info: form.vehicle,
      preferred_date: form.date || null,
      notes: form.notes,
    });
    if (error) setStatus('err');
    else {
      setStatus('ok');
      setForm({ name: '', phone: '', vehicle: '', date: '', notes: '' });
    }
  }

  return (
    <section id="service" className="py-16 md:py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10">
          <h2 className="section-title text-white">Автосервиз</h2>
          <p className="section-sub">Професионално обслужване от сертифицирани механици</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SERVICE_CAPABILITIES.map((s) => {
              const Icon = ICONS[s.icon];
              return (
                <div key={s.title} className="card-dark p-5">
                  <div className="w-12 h-12 rounded-lg bg-mtex-darkblue/20 border border-mtex-darkblue/50 flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-mtex-lightblue" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{s.title}</h3>
                  <p className="mt-1 text-sm text-zinc-400">{s.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-zinc-950 border border-mtex-darkblue/40 rounded-xl p-6">
            <h3 className="font-heading text-xl font-bold text-white mb-4">Запази час за сервиз</h3>
            <form onSubmit={submit} className="space-y-3">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Име и фамилия" className="input-dark" />
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Телефон" className="input-dark" />
              <input value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} placeholder="Автомобил (марка, модел, година)" className="input-dark" />
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-dark" />
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Описание на проблема" rows={3} className="input-dark" />
              <button type="submit" disabled={status === 'sending'} className="btn-red w-full">
                {status === 'sending' ? 'Изпращане...' : 'Запази час'}
              </button>
              {status === 'ok' && <p className="text-emerald-400 text-sm text-center">Заявката е изпратена! Ще се свържем с вас за потвърждение.</p>}
              {status === 'err' && <p className="text-red-500 text-sm text-center">Възникна грешка. Опитайте отново или се обадете.</p>}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}