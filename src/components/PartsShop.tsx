import { useEffect, useMemo, useState } from 'react';
import { Search, ShoppingCart, Phone, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { applyDiscount, formatBgn, b2bDiscountActive, B2B_DISCOUNT, COMPANY_PHONE } from '@/lib/pricing';
import type { Category, Part } from '@/lib/types';

interface PartsShopProps {
  onCartClick: () => void;
}

export function PartsShop({ onCartClick }: PartsShopProps) {
  const [parts, setParts] = useState<Part[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const { add } = useCart();
  const { profile } = useAuth();
  const hasDiscount = b2bDiscountActive(profile);

  useEffect(() => {
    Promise.all([
      supabase.from('parts').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('sort_order'),
    ]).then(([p, c]) => {
      setParts((p.data as Part[]) ?? []);
      setCategories((c.data as Category[]) ?? []);
      setLoading(false);
    });
  }, []);

  const tree = useMemo(() => {
    const roots = categories.filter((c) => !c.parent_id).sort((a, b) => a.sort_order - b.sort_order);
    return roots.map((r) => ({
      ...r,
      children: categories.filter((c) => c.parent_id === r.id).sort((a, b) => a.sort_order - b.sort_order),
    }));
  }, [categories]);

  const filtered = parts.filter((p) => {
    if (activeCat && p.category_id !== activeCat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        (p.oem_code ?? '').toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <section id="parts" className="py-16 md:py-24 bg-zinc-950/40">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10">
          <h2 className="section-title text-white">Каталог авточасти</h2>
          <p className="section-sub">Търсете по ключова дума или OEM номер</p>
        </div>

        {hasDiscount && (
          <div className="mb-6 max-w-3xl mx-auto bg-emerald-500/10 border border-emerald-500/40 rounded-lg px-4 py-3 text-center text-emerald-300 font-semibold">
            Активна B2B отстъпка — {Math.round(B2B_DISCOUNT * 100)}% върху всички цени
          </div>
        )}

        <div className="max-w-2xl mx-auto mb-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Търсене по част или OEM номер..."
            className="input-dark pl-12"
            aria-label="Търсене"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <aside className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 h-fit lg:sticky lg:top-24">
            <h3 className="font-heading text-lg font-semibold text-white mb-3">Категории</h3>
            <button
              onClick={() => setActiveCat(null)}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeCat === null ? 'bg-mtex-darkblue/30 text-mtex-lightblue' : 'text-zinc-300 hover:bg-zinc-900'}`}
            >
              Всички части
            </button>
            <div className="mt-1 space-y-1">
              {tree.map((r) => (
                <div key={r.id}>
                  <button
                    onClick={() => setActiveCat(r.id)}
                    className={`flex items-center gap-1 w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeCat === r.id ? 'bg-mtex-darkblue/30 text-mtex-lightblue' : 'text-white hover:bg-zinc-900'}`}
                  >
                    {r.name}
                  </button>
                  {r.children.length > 0 && (
                    <div className="ml-3 pl-3 border-l border-zinc-800">
                      {r.children.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setActiveCat(c.id)}
                          className={`flex items-center gap-1 w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${activeCat === c.id ? 'text-mtex-lightblue' : 'text-zinc-400 hover:text-zinc-200'}`}
                        >
                          <ChevronRight className="w-3 h-3" />
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>

          <div>
            {loading ? (
              <p className="text-zinc-400 text-center py-10">Зареждане...</p>
            ) : filtered.length === 0 ? (
              <p className="text-zinc-400 text-center py-10">Няма намерени части. Изпратете запитване по-долу.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((p) => {
                  const finalPrice = applyDiscount(Number(p.price), profile);
                  return (
                    <article key={p.id} className="card-dark flex flex-col">
                      <div className="aspect-square bg-zinc-900 overflow-hidden">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">Няма снимка</div>
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="text-base font-semibold text-white leading-snug">{p.title}</h3>
                        {p.description && <p className="mt-1 text-sm text-zinc-400 line-clamp-2">{p.description}</p>}
                        {p.oem_code && (
                          <p className="mt-2 text-xs text-mtex-lightblue font-mono">OEM: {p.oem_code}</p>
                        )}
                        <div className="mt-3 flex items-baseline gap-2">
                          <span className="text-xl font-bold text-white">{formatBgn(finalPrice)}</span>
                          {hasDiscount && (
                            <span className="text-sm text-zinc-500 line-through">{formatBgn(Number(p.price))}</span>
                          )}
                        </div>
                        <div className="mt-4 flex flex-col gap-2">
                          <button onClick={() => { add(p); onCartClick(); }} className="btn-red w-full text-sm">
                            <ShoppingCart className="w-4 h-4" />
                            Добави в количката
                          </button>
                          <a href={`tel:${COMPANY_PHONE.replace(/\s/g, '')}`} className="btn-green w-full text-sm">
                            <Phone className="w-4 h-4" />
                            Бърза поръчка по телефона
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}