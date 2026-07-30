import { useEffect, useMemo, useState } from 'react';
import { Search, ShoppingCart, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { PartsProduct, PartType } from '@/lib/types';

const PART_TYPE_LABELS: Record<PartType, string> = { original: 'Оригинални', universal: 'Универсални', both: 'Оригинални и универсални' };

export function AvtoChastiPage() {
  const [products, setProducts] = useState<PartsProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [selected, setSelected] = useState<PartsProduct | null>(null);
  const [galleryIdx, setGalleryIdx] = useState(0);

  useEffect(() => {
    supabase.from('parts_products').select('*').eq('is_published', true).order('created_at', { ascending: false }).then(({ data }) => {
      setProducts((data as PartsProduct[]) ?? []);
      setLoading(false);
    });
  }, []);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [products]);

  const filtered = products.filter((p) => {
    if (activeCat && p.category !== activeCat) return false;
    if (activeType && p.part_type !== activeType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q) || (p.category ?? '').toLowerCase().includes(q);
    }
    return true;
  });

  function openGallery(product: PartsProduct) { setSelected(product); setGalleryIdx(0); }

  return (
    <section className="pt-20 md:pt-24 pb-16 md:pb-24 bg-zinc-950/40 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10">
          <h1 className="section-title text-white">Авточасти</h1>
          <p className="section-sub">Онлайн магазин за качествени авточасти</p>
        </div>
        <div className="max-w-2xl mx-auto mb-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Търсене на част..." className="input-dark pl-12" aria-label="Търсене" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <aside className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 h-fit lg:sticky lg:top-24">
            <h3 className="font-heading text-lg font-semibold text-white mb-3">Категории</h3>
            <button onClick={() => setActiveCat(null)} className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeCat === null ? 'bg-mtex-darkblue/30 text-mtex-lightblue' : 'text-zinc-300 hover:bg-zinc-900'}`}>Всички категории</button>
            <div className="mt-1 space-y-1">
              {categories.map((c) => (
                <button key={c} onClick={() => setActiveCat(c)} className={`flex items-center gap-1 w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeCat === c ? 'bg-mtex-darkblue/30 text-mtex-lightblue' : 'text-white hover:bg-zinc-900'}`}>
                  <ChevronRight className="w-3 h-3" />{c}
                </button>
              ))}
            </div>
            <h3 className="font-heading text-lg font-semibold text-white mt-6 mb-3">Тип част</h3>
            <button onClick={() => setActiveType(null)} className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeType === null ? 'bg-mtex-darkblue/30 text-mtex-lightblue' : 'text-zinc-300 hover:bg-zinc-900'}`}>Всички типове</button>
            <div className="mt-1 space-y-1">
              {Object.entries(PART_TYPE_LABELS).map(([key, label]) => (
                <button key={key} onClick={() => setActiveType(key)} className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeType === key ? 'bg-mtex-darkblue/30 text-mtex-lightblue' : 'text-white hover:bg-zinc-900'}`}>{label}</button>
              ))}
            </div>
          </aside>
          <div>
            {loading ? (
              <p className="text-zinc-400 text-center py-10">Зареждане...</p>
            ) : filtered.length === 0 ? (
              <p className="text-zinc-400 text-center py-10">Няма намерени части.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((p) => (
                  <article key={p.id} className="card-dark flex flex-col">
                    <div className="aspect-square bg-zinc-900 overflow-hidden cursor-pointer" onClick={() => openGallery(p)}>
                      {p.images.length > 0 ? (
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">Няма снимка</div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-base font-semibold text-white leading-snug">{p.name}</h3>
                      {p.category && <p className="mt-1 text-xs text-mtex-lightblue">{p.category}</p>}
                      <p className="mt-1 text-xs text-zinc-500">{PART_TYPE_LABELS[p.part_type]}</p>
                      {p.description && <p className="mt-2 text-sm text-zinc-400 line-clamp-2">{p.description}</p>}
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-xl font-bold text-white">{Number(p.price).toFixed(2)} €</span>
                      </div>
                      <div className="mt-4">
                        <button onClick={() => openGallery(p)} className="btn-red w-full text-sm"><ShoppingCart className="w-4 h-4" />Виж детайли</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {selected && (
        <div className="fixed inset-0 z-[80] bg-black/95 flex flex-col" onClick={() => setSelected(null)}>
          <div className="flex items-center justify-between p-4 md:p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white">{selected.name}</h3>
            <button onClick={() => setSelected(null)} className="text-zinc-400 hover:text-white text-2xl">✕</button>
          </div>
          <div className="flex-1 flex items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
            {selected.images.length > 0 ? (
              <img src={selected.images[galleryIdx]} alt={`${selected.name} ${galleryIdx + 1}`} className="max-h-[60vh] max-w-full object-contain rounded-lg" />
            ) : (
              <p className="text-zinc-500">Няма снимка</p>
            )}
          </div>
          {selected.images.length > 1 && (
            <div className="p-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-2 overflow-x-auto justify-center pb-2">
                {selected.images.map((img, i) => (
                  <button key={i} onClick={() => setGalleryIdx(i)} className={`w-20 h-20 rounded-md overflow-hidden border-2 shrink-0 transition-all ${i === galleryIdx ? 'border-mtex-lightblue' : 'border-zinc-700 opacity-60'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="p-4 max-w-3xl mx-auto w-full" onClick={(e) => e.stopPropagation()}>
            <p className="text-mtex-lightblue text-sm">{selected.category ?? 'Без категория'}</p>
            <p className="text-zinc-500 text-xs">{PART_TYPE_LABELS[selected.part_type]}</p>
            <p className="mt-2 text-2xl font-bold text-white">{Number(selected.price).toFixed(2)} €</p>
            {selected.description && <p className="mt-3 text-zinc-300 text-sm">{selected.description}</p>}
          </div>
        </div>
      )}
    </section>
  );
}