import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const CONDITIONS = [
  { value: 'technical', label: 'Технически проблем' },
  { value: 'crashed', label: 'Катастрофирал' },
  { value: 'scrapped', label: 'За брак' },
];

export function BuybackForm() {
  const [form, setForm] = useState({ make: '', model: '', year: '', condition: 'technical', contact_name: '', phone: '', email: '' });
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 5);
    setPhotos(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');

    const photoUrls: string[] = [];
    for (const file of photos) {
      const ext = file.name.split('.').pop();
      const path = `buyback/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('buyback').upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from('buyback').getPublicUrl(path);
        photoUrls.push(data.publicUrl);
      }
    }

    const { error } = await supabase.from('buyback_requests').insert({
      make: form.make,
      model: form.model,
      year: Number(form.year),
      condition: CONDITIONS.find((c) => c.value === form.condition)?.label ?? form.condition,
      photos: photoUrls,
      contact_name: form.contact_name,
      phone: form.phone,
      email: form.email,
    });

    if (error) setStatus('err');
    else {
      setStatus('ok');
      setForm({ make: '', model: '', year: '', condition: 'technical', contact_name: '', phone: '', email: '' });
      setPhotos([]);
      setPreviews([]);
    }
  }

  return (
    <section id="buyback" className="py-16 md:py-24 bg-zinc-950/40">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <div className="text-center mb-8">
          <h2 className="section-title text-white">Изкупуване на коли за части</h2>
          <p className="section-sub">Продай автомобила си за части – Бързо оценяване и изкупуване</p>
        </div>

        <form onSubmit={submit} className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input required value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} placeholder="Марка" className="input-dark" />
            <input required value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Модел" className="input-dark" />
            <input required type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="Година" className="input-dark" />
            <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="input-dark">
              {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} placeholder="Име" className="input-dark" />
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Телефон" className="input-dark" />
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Имейл" className="input-dark" />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Снимки (до 5)</label>
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-zinc-700 rounded-lg p-6 cursor-pointer hover:border-mtex-lightblue transition-colors">
              <Upload className="w-6 h-6 text-zinc-500" />
              <span className="text-sm text-zinc-400">Качете снимки на автомобила</span>
              <input type="file" accept="image/*" multiple onChange={onFiles} className="hidden" />
            </label>
            {previews.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setPhotos((p) => p.filter((_, j) => j !== i)); setPreviews((p) => p.filter((_, j) => j !== i)); }}
                      className="absolute top-0.5 right-0.5 bg-black/70 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={status === 'sending'} className="btn-red w-full">
            {status === 'sending' ? 'Изпращане...' : 'Изпрати за оценка'}
          </button>
          {status === 'ok' && <p className="text-emerald-400 text-sm text-center">Заявката е изпратена! Ще получите оценка скоро.</p>}
          {status === 'err' && <p className="text-red-500 text-sm text-center">Възникна грешка. Опитайте отново.</p>}
        </form>
      </div>
    </section>
  );
}