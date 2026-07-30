import { useState } from 'react';
import { Upload, X, CheckCircle2, HandCoins } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function ProdaiAvtomobilPage() {
  const [form, setForm] = useState({ make: '', model: '', year: '', engine: '', mileage: '', condition_description: '', contact_name: '', contact_phone: '', contact_email: '' });
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setPhotos((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => prev.filter((_, j) => j !== idx));
    setPreviews((prev) => prev.filter((_, j) => j !== idx));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.make.trim()) e.make = 'Моля, въведете марка';
    if (!form.model.trim()) e.model = 'Моля, въведете модел';
    if (!form.year.trim()) e.year = 'Моля, въведете година';
    if (!form.contact_name.trim()) e.contact_name = 'Моля, въведете име';
    if (!form.contact_phone.trim()) e.contact_phone = 'Моля, въведете телефон';
    if (form.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) e.contact_email = 'Невалиден имейл';
    if (photos.length < 1) e.photos = 'Моля, качете поне 1 снимка';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus('sending');
    const imageUrls: string[] = [];
    for (const file of photos) {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from('sell-car').upload(path, file);
      if (!upErr) { const { data } = supabase.storage.from('sell-car').getPublicUrl(path); imageUrls.push(data.publicUrl); }
    }
    const { error } = await supabase.from('sell_car_requests').insert({
      make: form.make, model: form.model, year: form.year ? Number(form.year) : null, engine: form.engine || null,
      mileage: form.mileage ? Number(form.mileage) : null, condition_description: form.condition_description || null,
      images: imageUrls, contact_name: form.contact_name, contact_phone: form.contact_phone, contact_email: form.contact_email || null, status: 'new',
    });
    if (error) setStatus('err');
    else {
      setStatus('ok');
      setForm({ make: '', model: '', year: '', engine: '', mileage: '', condition_description: '', contact_name: '', contact_phone: '', contact_email: '' });
      setPhotos([]); setPreviews([]);
    }
  }

  return (
    <section className="pt-20 md:pt-24 pb-16 md:pb-24 bg-black min-h-screen">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-semibold uppercase tracking-wider text-mtex-lightblue border border-mtex-lightblue/40 rounded-full">
            <HandCoins className="w-4 h-4" />Продай автомобила си
          </div>
          <h1 className="section-title text-white">Получи оферта за твоя автомобил</h1>
          <p className="section-sub">Бързо и лесно — изпрати ни информация и снимки и получи оферта</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-white mb-3">Как работи?</h3>
          <ol className="space-y-2 text-sm text-zinc-300">
            <li className="flex gap-3"><span className="text-mtex-red font-bold">1.</span> Попълнете формата с данни за автомобила и качете снимки.</li>
            <li className="flex gap-3"><span className="text-mtex-red font-bold">2.</span> Наш екип преглежда вашата заявка и снимки.</li>
            <li className="flex gap-3"><span className="text-mtex-red font-bold">3.</span> Получавате оферта за изкупуване в кратък срок.</li>
          </ol>
        </div>
        {status === 'ok' ? (
          <div className="bg-zinc-950 border border-emerald-500/40 rounded-xl p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white">Заявката е изпратена!</h3>
            <p className="text-zinc-400 mt-2">Ще получите оферта скоро на посочения телефон или имейл.</p>
            <button onClick={() => setStatus('idle')} className="btn-red mt-6">Изпрати нова заявка</button>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><input required value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} placeholder="Марка" className="input-dark" />{errors.make && <p className="text-red-500 text-xs mt-1">{errors.make}</p>}</div>
              <div><input required value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Модел" className="input-dark" />{errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}</div>
              <div><input required type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="Година" className="input-dark" />{errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}</div>
              <input value={form.engine} onChange={(e) => setForm({ ...form, engine: e.target.value })} placeholder="Двигател (тип + обем)" className="input-dark" />
              <input type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} placeholder="Пробег (км)" className="input-dark sm:col-span-2" />
            </div>
            <textarea value={form.condition_description} onChange={(e) => setForm({ ...form, condition_description: e.target.value })} placeholder="Описание на състоянието" rows={3} className="input-dark" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div><input required value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} placeholder="Име" className="input-dark" />{errors.contact_name && <p className="text-red-500 text-xs mt-1">{errors.contact_name}</p>}</div>
              <div><input required value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} placeholder="Телефон" className="input-dark" />{errors.contact_phone && <p className="text-red-500 text-xs mt-1">{errors.contact_phone}</p>}</div>
              <div><input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} placeholder="Имейл" className="input-dark" />{errors.contact_email && <p className="text-red-500 text-xs mt-1">{errors.contact_email}</p>}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Снимки (минимум 1)</label>
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-zinc-700 rounded-lg p-6 cursor-pointer hover:border-mtex-lightblue transition-colors">
                <Upload className="w-6 h-6 text-zinc-500" /><span className="text-sm text-zinc-400">Качете снимки на автомобила</span>
                <input type="file" accept="image/*" multiple onChange={onFiles} className="hidden" />
              </label>
              {errors.photos && <p className="text-red-500 text-xs mt-1">{errors.photos}</p>}
              {previews.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {previews.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removePhoto(i)} className="absolute top-0.5 right-0.5 bg-black/70 rounded-full p-0.5"><X className="w-3 h-3 text-white" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" disabled={status === 'sending'} className="btn-red w-full">{status === 'sending' ? 'Изпращане...' : 'Изпрати за оценка'}</button>
            {status === 'err' && <p className="text-red-500 text-sm text-center">Възникна грешка. Опитайте отново.</p>}
          </form>
        )}
      </div>
    </section>
  );
}