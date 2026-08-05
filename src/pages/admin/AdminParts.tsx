import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { PartsProduct, PartType, PartCondition } from '@/lib/types';
import { Upload, X, Plus, Pencil, Trash2, Eye, EyeOff, Package } from 'lucide-react';

const PART_TYPES: { value: PartType; label: string }[] = [
  { value: 'original', label: 'Оригинални' },
  { value: 'universal', label: 'Универсални' },
  { value: 'both', label: 'Оригинални и универсални' },
];

const CONDITIONS: { value: PartCondition; label: string }[] = [
  { value: 'new', label: 'Нова' },
  { value: 'used', label: 'Използвана' },
];

type EditState = Partial<PartsProduct> & { specsEntries?: { key: string; value: string }[] };

export function AdminParts() {
  const [products, setProducts] = useState<PartsProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('parts_products').select('*').order('created_at', { ascending: false });
    setProducts((data as PartsProduct[]) ?? []);
    setLoading(false);
  }

  function startNew() {
    setEditing({
      name: '', category: '', part_type: 'original', description: '', images: [], price: 0,
      is_published: false, brand: '', part_number: '', stock: 0, condition: 'new',
      make: '', model: '', year_from: null, year_to: null, engine_type: '',
      specs: null, oem_number: '', aftermarket_numbers: '',
      specsEntries: [],
    });
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
      if (!error) {
        const { data } = supabase.storage.from('parts-products').getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    setUploading(false);
    setEditing((prev) => prev ? { ...prev, images: [...(prev.images ?? []), ...urls] } : prev);
  }

  function removeImage(idx: number) {
    setEditing((prev) => prev ? { ...prev, images: (prev.images ?? []).filter((_, j) => j !== idx) } : prev);
  }

  function addSpecEntry() {
    setEditing((prev) => prev ? { ...prev, specsEntries: [...(prev.specsEntries ?? []), { key: '', value: '' }] } : prev);
  }

  function updateSpecEntry(idx: number, field: 'key' | 'value', val: string) {
    setEditing((prev) => {
      if (!prev) return prev;
      const entries = [...(prev.specsEntries ?? [])];
      entries[idx] = { ...entries[idx], [field]: val };
      return { ...prev, specsEntries: entries };
    });
  }

  function removeSpecEntry(idx: number) {
    setEditing((prev) => {
      if (!prev) return prev;
      const entries = (prev.specsEntries ?? []).filter((_, j) => j !== idx);
      return { ...prev, specsEntries: entries };
    });
  }

  function specsEntriesToObj(entries: { key: string; value: string }[] | undefined): Record<string, string> | null {
    if (!entries || entries.length === 0) return null;
    const obj: Record<string, string> = {};
    for (const e of entries) {
      if (e.key.trim()) obj[e.key.trim()] = e.value;
    }
    return Object.keys(obj).length > 0 ? obj : null;
  }

  function specsObjToEntries(specs: Record<string, string> | null | undefined): { key: string; value: string }[] {
    if (!specs) return [];
    return Object.entries(specs).map(([key, value]) => ({ key, value: String(value) }));
  }

  async function save() {
    if (!editing) return;
    const specsObj = specsEntriesToObj(editing.specsEntries);
    const payload = {
      name: editing.name,
      category: editing.category || null,
      part_type: editing.part_type ?? 'original',
      description: editing.description || null,
      images: editing.images ?? [],
      price: Number(editing.price),
      is_published: editing.is_published ?? false,
      brand: editing.brand || null,
      part_number: editing.part_number || null,
      stock: Number(editing.stock ?? 0),
      condition: editing.condition ?? 'new',
      make: editing.make || null,
      model: editing.model || null,
      year_from: editing.year_from ? Number(editing.year_from) : null,
      year_to: editing.year_to ? Number(editing.year_to) : null,
      engine_type: editing.engine_type || null,
      specs: specsObj,
      oem_number: editing.oem_number || null,
      aftermarket_numbers: editing.aftermarket_numbers || null,
    };

    if (editing.id) {
      await supabase.from('parts_products').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('parts_products').insert(payload);
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

  function editProduct(p: PartsProduct) {
    setEditing({ ...p, specsEntries: specsObjToEntries(p.specs) });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Авточасти — Продукти</h2>
        <button onClick={startNew} className="btn-red text-sm">
          <Plus className="w-4 h-4" /> Нов продукт
        </button>
      </div>

      {editing && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 md:p-6 mb-6 space-y-4">
          <h3 className="text-lg font-bold text-white">{editing.id ? 'Редактиране' : 'Нов продукт'}</h3>

          <div>
            <p className="text-sm text-mtex-lightblue font-semibold mb-2">Основна информация</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={editing.name ?? ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Име на частта *" className="input-dark" />
              <input value={editing.brand ?? ''} onChange={(e) => setEditing({ ...editing, brand: e.target.value })} placeholder="Марка (напр. Bosch)" className="input-dark" />
              <input value={editing.part_number ?? ''} onChange={(e) => setEditing({ ...editing, part_number: e.target.value })} placeholder="Номер на частта / SKU" className="input-dark" />
              <input type="number" step="0.01" value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} placeholder="Цена (EUR)" className="input-dark" />
              <input type="number" value={editing.stock ?? 0} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} placeholder="Наличност (бр.)" className="input-dark" />
              <select value={editing.condition ?? 'new'} onChange={(e) => setEditing({ ...editing, condition: e.target.value as PartCondition })} className="input-dark">
                {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <input value={editing.category ?? ''} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="Категория" className="input-dark" />
              <select value={editing.part_type ?? 'original'} onChange={(e) => setEditing({ ...editing, part_type: e.target.value as PartType })} className="input-dark">
                {PART_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <textarea value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Описание" rows={3} className="input-dark mt-3" />
          </div>

          <div>
            <p className="text-sm text-mtex-lightblue font-semibold mb-2">Съвместимост с автомобил</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <input value={editing.make ?? ''} onChange={(e) => setEditing({ ...editing, make: e.target.value })} placeholder="Марка авто (напр. BMW)" className="input-dark" />
              <input value={editing.model ?? ''} onChange={(e) => setEditing({ ...editing, model: e.target.value })} placeholder="Модел (напр. 3 Series)" className="input-dark" />
              <input type="number" value={editing.year_from ?? ''} onChange={(e) => setEditing({ ...editing, year_from: e.target.value ? Number(e.target.value) : null })} placeholder="Година от" className="input-dark" />
              <input type="number" value={editing.year_to ?? ''} onChange={(e) => setEditing({ ...editing, year_to: e.target.value ? Number(e.target.value) : null })} placeholder="Година до" className="input-dark" />
              <input value={editing.engine_type ?? ''} onChange={(e) => setEditing({ ...editing, engine_type: e.target.value })} placeholder="Двигател (напр. 2.0 TDI)" className="input-dark" />
            </div>
          </div>

          <div>
            <p className="text-sm text-mtex-lightblue font-semibold mb-2">Технически спецификации</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
              <input value={editing.oem_number ?? ''} onChange={(e) => setEditing({ ...editing, oem_number: e.target.value })} placeholder="OEM номер" className="input-dark" />
              <input value={editing.aftermarket_numbers ?? ''} onChange={(e) => setEditing({ ...editing, aftermarket_numbers: e.target.value })} placeholder="Aftermarket номера" className="input-dark" />
            </div>
            <div className="space-y-2">
              {(editing.specsEntries ?? []).map((entry, i) => (
                <div key={i} className="flex gap-2">
                  <input value={entry.key} onChange={(e) => updateSpecEntry(i, 'key', e.target.value)} placeholder="Параметър (напр. Тегло)" className="input-dark flex-1" />
                  <input value={entry.value} onChange={(e) => updateSpecEntry(i, 'value', e.target.value)} placeholder="Стойност (напр. 2.5 кг)" className="input-dark flex-1" />
                  <button type="button" onClick={() => removeSpecEntry(i)} className="text-red-500 hover:text-red-400 shrink-0 px-2">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addSpecEntry} className="text-sm text-mtex-lightblue hover:underline flex items-center gap-1">
                <Plus className="w-3 h-3" /> Добави параметър
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Снимки</label>
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-zinc-700 rounded-lg p-4 cursor-pointer hover:border-mtex-lightblue transition-colors">
              <Upload className="w-5 h-5 text-zinc-500" />
              <span className="text-sm text-zinc-400">{uploading ? 'Качване...' : 'Качете снимки'}</span>
              <input type="file" accept="image/*" multiple onChange={onImages} className="hidden" />
            </label>
            {(editing.images ?? []).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {(editing.images ?? []).map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-0.5 right-0.5 bg-black/70 rounded-full p-0.5">
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-zinc-300 text-sm">
            <input type="checkbox" checked={editing.is_published ?? false} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} className="w-5 h-5 accent-mtex-red" />
            Публикуван
          </label>

          <div className="flex gap-2">
            <button onClick={save} className="btn-red text-sm">Запази</button>
            <button onClick={() => setEditing(null)} className="btn-outline-blue text-sm">Отказ</button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-zinc-400 text-center py-8">Зареждане...</p>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400">Няма добавени продукти.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
              {p.images.length > 0 && (
                <img src={p.images[0]} alt={p.name} className="w-full aspect-square object-cover rounded-md mb-3" />
              )}
              <p className="font-semibold text-white">{p.name}</p>
              {p.brand && <p className="text-xs text-zinc-400 mt-0.5">{p.brand}</p>}
              <p className="text-xs text-mtex-lightblue mt-1">{p.category ?? 'Без категория'}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-white font-bold">{Number(p.price).toFixed(2)} €</p>
                <span className={`text-xs px-2 py-0.5 rounded ${p.condition === 'new' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {p.condition === 'new' ? 'Нова' : 'Използвана'}
                </span>
                <span className="text-xs text-zinc-500">Наличност: {p.stock}</span>
              </div>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <button onClick={() => editProduct(p)} className="text-xs text-mtex-lightblue hover:underline flex items-center gap-1">
                  <Pencil className="w-3 h-3" /> Редактирай
                </button>
                <button onClick={() => del(p.id)} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Изтрий
                </button>
                <button onClick={() => togglePublish(p)} className={`text-xs hover:underline flex items-center gap-1 ${p.is_published ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {p.is_published ? <><Eye className="w-3 h-3" /> Публикуван</> : <><EyeOff className="w-3 h-3" /> Скрит</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
