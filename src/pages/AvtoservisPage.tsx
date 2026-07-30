import { useEffect, useState } from 'react';
import { Calendar, Clock, CheckCircle2, Wrench, Cpu, Settings, Disc, type LucideIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { BeforeAfterPhoto } from '@/lib/types';

const CAPABILITIES: { icon: string; title: string; desc: string }[] = [
  { icon: 'Cpu', title: 'Компютърна диагностика', desc: 'Пълна диагностика на всички електронни системи.' },
  { icon: 'Wrench', title: 'Ремонт на двигатели', desc: 'Капитален и частичен ремонт на бензинови и дизелови двигатели.' },
  { icon: 'Settings', title: 'Трансмисия', desc: 'Ремонт и подмяна на скоростни кутии и съединители.' },
  { icon: 'Disc', title: 'Спирачни системи', desc: 'Диагностика, подмяна и прокачване на спирачки.' },
];

const ICONS: Record<string, LucideIcon> = { Cpu, Wrench, Settings, Disc };
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export function AvtoservisPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', car_model: '', problem_description: '', appointment_date: '', appointment_time: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [photos, setPhotos] = useState<BeforeAfterPhoto[]>([]);

  useEffect(() => {
    supabase.from('before_after_photos').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setPhotos((data as BeforeAfterPhoto[]) ?? []);
    });
  }, []);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Моля, въведете вашето име';
    if (!form.phone.trim()) e.phone = 'Моля, въведете телефон за връзка';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Невалиден имейл адрес';
    if (!form.car_model.trim()) e.car_model = 'Моля, въведете марка и модел';
    if (!form.appointment_date) e.appointment_date = 'Моля, изберете дата';
    if (!form.appointment_time) e.appointment_time = 'Моля, изберете час';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus('sending');
    const { error } = await supabase.from('service_bookings').insert({
      service_type: 'Автосервиз', name: form.name, phone: form.phone, email: form.email || null,
      car_model: form.car_model, problem_description: form.problem_description || null,
      appointment_date: form.appointment_date || null, appointment_time: form.appointment_time || null, status: 'pending',
    });
    if (error) setStatus('err');
    else { setStatus('ok'); setForm({ name: '', phone: '', email: '', car_model: '', problem_description: '', appointment_date: '', appointment_time: '' }); }
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <section className="pt-20 md:pt-24 pb-16 md:pb-24 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10">
          <h1 className="section-title text-white">Автосервиз</h1>
          <p className="section-sub">Професионално обслужване от сертифицирани механици</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {CAPABILITIES.map((s) => {
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
        {photos.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Галерия — Преди и След</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((p) => (
                <div key={p.id} className="card-dark p-4">
                  {p.title && <p className="text-sm font-semibold text-white mb-3">{p.title}</p>}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Преди</p>
                      {p.before_image ? <img src={p.before_image} alt="Преди" className="w-full aspect-square object-cover rounded-md" /> : <div className="w-full aspect-square bg-zinc-900 rounded-md flex items-center justify-center text-zinc-600 text-xs">Няма</div>}
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">След</p>
                      {p.after_image ? <img src={p.after_image} alt="След" className="w-full aspect-square object-cover rounded-md" /> : <div className="w-full aspect-square bg-zinc-900 rounded-md flex items-center justify-center text-zinc-600 text-xs">Няма</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="max-w-2xl mx-auto">
          <div className="bg-zinc-950 border border-mtex-darkblue/40 rounded-xl p-6">
            <h3 className="font-heading text-xl font-bold text-white mb-4">Запази час за сервиз</h3>
            {status === 'ok' ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white">Заявката е изпратена!</h3>
                <p className="text-zinc-400 mt-2">Ще се свържем с вас за потвърждение на избрания час.</p>
                <button onClick={() => setStatus('idle')} className="btn-red mt-6">Запази нов час</button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <div><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Име и фамилия" className="input-dark" />{errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}</div>
                <div><input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Телефон" className="input-dark" />{errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}</div>
                <div><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Имейл (по желание)" className="input-dark" />{errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}</div>
                <div><input required value={form.car_model} onChange={(e) => setForm({ ...form, car_model: e.target.value })} placeholder="Марка и модел на автомобила" className="input-dark" />{errors.car_model && <p className="text-red-500 text-xs mt-1">{errors.car_model}</p>}</div>
                <textarea value={form.problem_description} onChange={(e) => setForm({ ...form, problem_description: e.target.value })} placeholder="Описание на проблема" rows={3} className="input-dark" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Дата</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
                      <input type="date" min={today} value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} className="input-dark pl-10" />
                    </div>
                    {errors.appointment_date && <p className="text-red-500 text-xs mt-1">{errors.appointment_date}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Час</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
                      <select value={form.appointment_time} onChange={(e) => setForm({ ...form, appointment_time: e.target.value })} className="input-dark pl-10">
                        <option value="">Изберете час</option>
                        {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    {errors.appointment_time && <p className="text-red-500 text-xs mt-1">{errors.appointment_time}</p>}
                  </div>
                </div>
                <button type="submit" disabled={status === 'sending'} className="btn-red w-full">{status === 'sending' ? 'Изпращане...' : 'Запази час'}</button>
                {status === 'err' && <p className="text-red-500 text-sm text-center">Възникна грешка. Опитайте отново или се обадете.</p>}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}