import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { PartsProduct, PartType } from '@/lib/types';
import { Upload, X, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';

const PART_TYPES: { value: PartType; label: string }[] = [
  { value: 'original', label: 'Оригинални' },
  { value: 'universal', label: 'Универсални' },
  { value: 'both', label: 'Оригинални и универсални' },
];

export function AdminParts() {
  const [products, setProducts] = useState<PartsProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<PartsProduct> | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('parts_products').select('*').order('created_at', { ascending: false });
    setProducts((data as PartsProduct[]) ?? []);
    setLoading(false);
  }

  async function onImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('parts-products').upload(path, file);
      if (!error) { const { data } = supabase.storage.from('parts-products').getPublicUrl(path); urls.push(data.publicUrl); }
    }
    setUploading(false);
    setEditing((prev) => prev ? { ...prev, images: [...(prev.images ?? []), ...urls] } : prev);
  }

  function removeImage(idx: number) {
    setEditing((prev) => prev ? { ...prev, images: (prev.images ?? []).filter((_, j) => j !== idx) } : prev);
  }

  async function save() {
    if (!editing) return;
    if (editing.id) {
      await supabase.from('parts_products').update({
        name: editing.name, category: editing.category, part_type: editing.part_type ?? 'original',
        description: editing.description, images: editing.images ?? [], price: Number(editing.price), is_published: editing.is_published,
      }).eq('id', editing.id);
    } else {
      await supabase.from('parts_products').insert({
        name: editing.name, category: editing.category, part_type: editing.part_type ?? 'original',
        description: editing.description, images: editing.images ?? [], price: Number(editing.price), is_published: editing.is_published ?? false,
      });
    }
    setEditing(null);
    await load();
  }

  async function del(id: string) {
    await supabase.from('parts_products').delete().eq('id', id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function togglePublish(p: PartsProduct) {
    await supabase.from('parts_products').update({ is_published: !p.is_published }).eq('id', p.id);
    await load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Авточасти — Продукти</h2>
        <button onClick={() => setEditing({ name: '', part_type: 'original', images: [], price: 0, is_published: false })} className="btn-red text-sm"><Plus className="w-4 h-4" /> Нов продукт</button>
      </div>
      {editing && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={editing.name ?? ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Име на частта" className="input-dark" />
            <input value={editing.category ?? ''} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="Категория" className="input-dark" />
            <select value={editing.part_type ?? 'original'} onChange={(e) => setEditing({ ...editing, part_type: e.target.value as PartType })} className="input-dark">{PART_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
            <input type="number" step="0.01" value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} placeholder="Цена (EUR)" className="input-dark" />
          </div>
          <textarea value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Описание" rows={3} className="input-dark" />
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Снимки</label>
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
          {products.map((p) => (
            <div key={p.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
              {p.images.length > 0 && <img src={p.images[0]} alt={p.name} className="w-full aspect-square object-cover rounded-md mb-3" />}
              <p className="font-semibold text-white">{p.name}</p>
              <p className="text-xs text-mtex-lightblue mt-1">{p.category ?? 'Без категория'}</p>
              <p className="text-sm text-white font-bold mt-1">{Number(p.price).toFixed(2)} €</p>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <button onClick={() => setEditing(p)} className="text-xs text-mtex-lightblue hover:underline flex items-center gap-1"><Pencil className="w-3 h-3" />Редактирай</button>
                <button onClick={() => del(p.id)} className="text-xs text-red-500 hover:underline flex items-center gap-1"><Trash2 className="w-3 h-3" />Изтрий</button>
                <button onClick={() => togglePublish(p)} className={`text-xs hover:underline flex items-center gap-1 ${p.is_published ? 'text-emerald-400' : 'text-amber-400'}`}>{p.is_published ? <><Eye className="w-3 h-3" />Публикуван</> : <><EyeOff className="w-3 h-3" />Скрит</>}</button>
              </div>
            </div>
          ))}
          {products.length === 0 && <p className="text-zinc-400 text-center py-8 col-span-full">Няма добавени продукти.</p>}
        </div>
      )}
    </div>
  );
}