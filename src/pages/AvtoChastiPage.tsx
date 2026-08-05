import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ShoppingCart, ChevronRight, SlidersHorizontal, X, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/lib/cart';
import type { PartsProduct, PartType, PartCondition } from '@/lib/types';

const PART_TYPE_LABELS: Record<PartType, string> = {
  original: 'Оригинални',
  universal: 'Универсални',
  both: 'Оригинални и универсални',
};

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'brand';

export function AvtoChastiPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<PartsProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const { add } = useCart();

  const search = searchParams.get('q') ?? '';
  const activeCat = searchParams.get('cat');
  const activeType = searchParams.get('type');
  const activeCondition = searchParams.get('cond') ?? '';
  const makeFilter = searchParams.get('make') ?? '';
  const modelFilter = searchParams.get('model') ?? '';
  const yearFilter = searchParams.get('year') ?? '';
  const engineFilter = searchParams.get('engine') ?? '';
  const minPrice = searchParams.get('min') ?? '';
  const maxPrice = searchParams.get('max') ?? '';
  const sortBy = (searchParams.get('sort') ?? 'newest') as SortOption;

  useEffect(() => {
    supabase
      .from('parts_products')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProducts((data as PartsProduct[]) ?? []);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [products]);

  const makes = useMemo(() => {
    const set = new Set(products.map((p) => p.make).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [products]);

  const models = useMemo(() => {
    const filtered = makeFilter ? products.filter((p) => p.make === makeFilter) : products;
    const set = new Set(filtered.map((p) => p.model).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [products, makeFilter]);

  const engines = useMemo(() => {
    const set = new Set(products.map((p) => p.engine_type).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [products]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  }

  function clearAll() {
    setSearchParams({}, { replace: true });
  }

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (activeCat && p.category !== activeCat) return false;
      if (activeType && p.part_type !== activeType) return false;
      if (activeCondition && p.condition !== activeCondition) return false;
      if (makeFilter && p.make !== makeFilter) return false;
      if (modelFilter && p.model !== modelFilter) return false;
      if (engineFilter && p.engine_type !== engineFilter) return false;
      if (yearFilter) {
        const y = Number(yearFilter);
        if (p.year_from && y < p.year_from) return false;
        if (p.year_to && y > p.year_to) return false;
      }
      if (minPrice && Number(p.price) < Number(minPrice)) return false;
      if (maxPrice && Number(p.price) > Number(maxPrice)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q) ||
          (p.category ?? '').toLowerCase().includes(q) ||
          (p.brand ?? '').toLowerCase().includes(q) ||
          (p.part_number ?? '').toLowerCase().includes(q) ||
          (p.oem_number ?? '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });

    result = result.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc': return Number(a.price) - Number(b.price);
        case 'price_desc': return Number(b.price) - Number(a.price);
        case 'brand': return (a.brand ?? '').localeCompare(b.brand ?? '');
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [products, activeCat, activeType, activeCondition, makeFilter, modelFilter, yearFilter, engineFilter, minPrice, maxPrice, search, sortBy]);

  function handleAddToCart(e: React.MouseEvent, p: PartsProduct) {
    e.preventDefault();
    e.stopPropagation();
    add(p);
    setToast(`${p.name} е добавен в количката`);
    setTimeout(() => setToast(null), 2500);
  }

  const hasActiveFilters = !!(search || activeCat || activeType || activeCondition || makeFilter || modelFilter || yearFilter || engineFilter || minPrice || maxPrice);

  return (
    <section className="pt-20 md:pt-24 pb-16 md:pb-24 bg-zinc-950/40 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-8">
          <h1 className="section-title text-white">Авточасти</h1>
          <p className="section-sub">Онлайн магазин за качествени авточасти</p>
        </div>

        <div className="max-w-2xl mx-auto mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => updateParam('q', e.target.value)}
            placeholder="Търсене по име, марка, номер, OEM..."
            className="input-dark pl-12"
            aria-label="Търсене"
          />
        </div>

        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="btn-outline-blue w-full text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showFilters ? 'Скрий филтрите' : 'Покажи филтрите'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block bg-zinc-950 border border-zinc-800 rounded-xl p-4 h-fit lg:sticky lg:top-24`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-semibold text-white">Филтри</h3>
              {hasActiveFilters && (
                <button onClick={clearAll} className="text-xs text-red-500 hover:underline">Изчисти</button>
              )}
            </div>

            <div className="mb-5">
              <label className="block text-xs text-zinc-400 mb-1.5">Сортирай по</label>
              <select value={sortBy} onChange={(e) => updateParam('sort', e.target.value)} className="input-dark text-sm">
                <option value="newest">Най-нови</option>
                <option value="price_asc">Цена (възходящ)</option>
                <option value="price_desc">Цена (низходящ)</option>
                <option value="brand">Марка (А-Я)</option>
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-xs text-zinc-400 mb-1.5">Категория</label>
              <select value={activeCat ?? ''} onChange={(e) => updateParam('cat', e.target.value)} className="input-dark text-sm">
                <option value="">Всички категории</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-xs text-zinc-400 mb-1.5">Тип част</label>
              <select value={activeType ?? ''} onChange={(e) => updateParam('type', e.target.value)} className="input-dark text-sm">
                <option value="">Всички типове</option>
                {Object.entries(PART_TYPE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-xs text-zinc-400 mb-1.5">Състояние</label>
              <select value={activeCondition} onChange={(e) => updateParam('cond', e.target.value)} className="input-dark text-sm">
                <option value="">Всички</option>
                <option value="new">Нови</option>
                <option value="used">Използвани</option>
              </select>
            </div>

            <div className="mb-5">
              <p className="text-xs text-zinc-400 mb-1.5">Съвместимост с автомобил</p>
              <div className="space-y-2">
                <select value={makeFilter} onChange={(e) => { updateParam('make', e.target.value); updateParam('model', ''); }} className="input-dark text-sm">
                  <option value="">Всички марки</option>
                  {makes.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={modelFilter} onChange={(e) => updateParam('model', e.target.value)} className="input-dark text-sm" disabled={!makeFilter}>
                  <option value="">Всички модели</option>
                  {models.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <input type="number" value={yearFilter} onChange={(e) => updateParam('year', e.target.value)} placeholder="Година" className="input-dark text-sm" />
                <select value={engineFilter} onChange={(e) => updateParam('engine', e.target.value)} className="input-dark text-sm">
                  <option value="">Всички двигатели</option>
                  {engines.map((en) => <option key={en} value={en}>{en}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs text-zinc-400 mb-1.5">Цена (EUR)</p>
              <div className="flex gap-2">
                <input type="number" value={minPrice} onChange={(e) => updateParam('min', e.target.value)} placeholder="От" className="input-dark text-sm" />
                <input type="number" value={maxPrice} onChange={(e) => updateParam('max', e.target.value)} placeholder="До" className="input-dark text-sm" />
              </div>
            </div>
          </aside>

          <div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden animate-pulse">
                    <div className="aspect-square bg-zinc-900" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-zinc-800 rounded w-3/4" />
                      <div className="h-3 bg-zinc-800/60 rounded w-1/2" />
                      <div className="h-6 bg-zinc-800/80 rounded w-1/3 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400">Няма намерени части. Опитайте да промените филтрите.</p>
                {hasActiveFilters && (
                  <button onClick={clearAll} className="btn-outline-blue mt-4 text-sm">Изчисти филтрите</button>
                )}
              </div>
            ) : (
              <>
                <p className="text-sm text-zinc-500 mb-4">{filtered.length} {filtered.length === 1 ? 'резултат' : 'резултата'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map((p) => (
                    <Link key={p.id} to={`/parts/${p.id}`} className="card-dark flex flex-col group">
                      <div className="aspect-square bg-zinc-900 overflow-hidden">
                        {p.images.length > 0 ? (
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            <Package className="w-10 h-10" />
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="text-base font-semibold text-white leading-snug group-hover:text-mtex-lightblue transition-colors">{p.name}</h3>
                        {p.brand && <p className="mt-1 text-xs text-zinc-400">{p.brand}</p>}
                        <p className="mt-1 text-xs text-zinc-500">{PART_TYPE_LABELS[p.part_type]}</p>
                        {p.description && <p className="mt-2 text-sm text-zinc-400 line-clamp-2">{p.description}</p>}
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded ${p.condition === 'new' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {p.condition === 'new' ? 'Нова' : 'Използвана'}
                          </span>
                          {p.stock > 0 ? (
                            <span className="text-xs text-zinc-500">На склад: {p.stock}</span>
                          ) : (
                            <span className="text-xs text-red-500">Изчерпан</span>
                          )}
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                          <span className="text-xl font-bold text-white">{Number(p.price).toFixed(2)} €</span>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={(e) => handleAddToCart(e, p)}
                            disabled={p.stock === 0}
                            className="btn-red flex-1 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            В количката
                          </button>
                          <Link to={`/parts/${p.id}`} className="btn-outline-blue text-sm px-4">
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg fade-up">
          {toast}
        </div>
      )}
    </section>
  );
}
