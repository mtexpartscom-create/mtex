import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { MorgueCar } from '@/lib/types';
import { Upload, X, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';

export function AdminMorgue() {
  const [cars, setCars] = useState<MorgueCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<MorgueCar> | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('morgue_cars').select('*').order('created_at', { ascending: false });
    setCars((data as MorgueCar[]) ?? []);
    setLoading(false);
  }

  async function onImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 10);
    if (files.length === 0) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('morgue-cars').upload(path, file);
      if (!error) { const { data } = supabase.storage.from('morgue-cars').getPublicUrl(path); urls.push(data.publicUrl); }
    }
    setUploading(false);
    setEditing((prev) => prev ? { ...prev, images: [...(prev.images ?? []), ...urls].slice(0, 10) } : prev);
  }

  function removeImage(idx: number) {
    setEditing((prev) => prev ? { ...prev, images: (prev.images ?? []).filter((_, j) => j !== idx) } : prev);
  }

  async function save() {
    if (!editing) return;
    if (editing.id) {
      await supabase.from('morgue_cars').update({
        model: editing.model, engine: editing.engine, transmission: editing.transmission,
        year: editing.year ? Number(editing.year) : null, color_code: editing.color_code,
        description: editing.description, images: editing.images ?? [], is_published: editing.is_published,
      }).eq('id', editing.id);
    } else {
      await supabase.from('morgue_cars').insert({
        model: editing.model, engine: editing.engine, transmission: editing.transmission,
        year: editing.year ? Number(editing.year) : null, color_code: editing.color_code,
        description: editing.description, images: editing.images ?? [], is_published: editing.is_published ?? false,
      });
    }
    setEditing(null);
    await load();
  }

  async function del(id: string) {
    await supabase.from('morgue_cars').delete().eq('id', id);
    setCars((prev) => prev.filter((c) => c.id !== id));
  }

  async function togglePublish(car: MorgueCar) {
    await supabase.from('morgue_cars').update({ is_published: !car.is_published }).eq('id', car.id);
    await load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Автоморга — Автомобили на части</h2>
        <button onClick={() => setEditing({ model: '', images: [], is_published: false })} className="btn-red text-sm"><Plus className="w-4 h-4" /> Нов автомобил</button>
      </div>
      {editing && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={editing.model ?? ''} onChange={(e) => setEditing({ ...editing, model: e.target.value })} placeholder="Модел" className="input-dark" />
            <input value={editing.engine ?? ''} onChange={(e) => setEditing({ ...editing, engine: e.target.value })} placeholder="Двигател" className="input-dark" />
            <input value={editing.transmission ?? ''} onChange={(e) => setEditing({ ...editing, transmission: e.target.value })} placeholder="Скоростна кутия" className="input-dark" />
            <input type="number" value={editing.year ?? ''} onChange={(e) => setEditing({ ...editing, year: Number(e.target.value) })} placeholder="Година" className="input-dark" />
            <input value={editing.color_code ?? ''} onChange={(e) => setEditing({ ...editing, color_code: e.target.value })} placeholder="Код на боя" className="input-dark" />
          </div>
          <textarea value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Описание" rows={3} className="input-dark" />
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Снимки (до 10)</label>
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-zinc-700 rounded-lg p-4 cursor-pointer hover:border-mtex-lightblue transition-colors">
              <Upload className="w-5 h-5 text-zinc-500" /><span className="text-sm text-zinc-400">{uploading ? 'Качване...' : 'Качете снимки'}</span>
              <input type="file" accept="image/*" multiple onChange={onImages} className="hidden" />
            </label>
            {(editing.images ?? []).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {(editing.images ?? []).map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-0.5 right-0.5 bg-black/70 rounded-full p-0.5"><X className="w-3 h-3 text-white" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <label className="flex items-center gap-2 text-zinc-300 text-sm">
            <input type="checkbox" checked={editing.is_published ?? false} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} className="w-5 h-5 accent-mtex-red" />Публикуван
          </label>
          <div className="flex gap-2">
            <button onClick={save} className="btn-red text-sm">Запази</button>
            <button onClick={() => setEditing(null)} className="btn-outline-blue text-sm">Отказ</button>
          </div>
        </div>
      )}
      {loading ? (
        <p className="text-zinc-400 text-center py-8">Зареждане...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cars.map((car) => (
            <div key={car.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
              {car.images.length > 0 && <img src={car.images[0]} alt={car.model} className="w-full aspect-video object-cover rounded-md mb-3" />}
              <p className="font-semibold text-white">{car.model}</p>
              <p className="text-xs text-zinc-500 mt-1">{car.engine} · {car.transmission} · {car.year}</p>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <button onClick={() => setEditing(car)} className="text-xs text-mtex-lightblue hover:underline flex items-center gap-1"><Pencil className="w-3 h-3" />Редактирай</button>
                <button onClick={() => del(car.id)} className="text-xs text-red-500 hover:underline flex items-center gap-1"><Trash2 className="w-3 h-3" />Изтрий</button>
                <button onClick={() => togglePublish(car)} className={`text-xs hover:underline flex items-center gap-1 ${car.is_published ? 'text-emerald-400' : 'text-amber-400'}`}>{car.is_published ? <><Eye className="w-3 h-3" />Публикуван</> : <><EyeOff className="w-3 h-3" />Скрит</>}</button>
              </div>
            </div>
          ))}
          {cars.length === 0 && <p className="text-zinc-400 text-center py-8 col-span-full">Няма добавени автомобили.</p>}
        </div>
      )}
    </div>
  );
}