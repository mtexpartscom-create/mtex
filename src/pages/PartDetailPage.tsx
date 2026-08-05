import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, Package, Minus, Plus, Check, Truck, Shield, Wrench } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/lib/cart';
import type { PartsProduct } from '@/lib/types';

const PART_TYPE_LABELS: Record<string, string> = {
  original: 'Оригинални',
  universal: 'Универсални',
  both: 'Оригинални и универсални',
};

export function PartDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<PartsProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState(false);
  const { add } = useCart();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from('parts_products')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
        } else {
          setProduct(data as PartsProduct);
        }
        setLoading(false);
      });
  }, [id]);

  function handleAddToCart() {
    if (!product) return;
    for (let i = 0; i < qty; i++) add(product);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  }

  if (loading) {
    return (
      <section className="pt-20 md:pt-24 pb-16 min-h-screen bg-zinc-950/40">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
            <div className="aspect-square bg-zinc-900 rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 bg-zinc-800 rounded w-3/4" />
              <div className="h-4 bg-zinc-800/60 rounded w-1/2" />
              <div className="h-6 bg-zinc-800/80 rounded w-1/3" />
              <div className="h-32 bg-zinc-800/40 rounded" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (notFound || !product) {
    return (
      <section className="pt-20 md:pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 mb-4">Частта не е намерена.</p>
          <Link to="/avto-chasti" className="btn-red text-sm">Обратно към магазина</Link>
        </div>
      </section>
    );
  }

  const inStock = product.stock > 0;
  const specsEntries = product.specs ? Object.entries(product.specs) : [];

  return (
    <section className="pt-20 md:pt-24 pb-16 md:pb-24 min-h-screen bg-zinc-950/40">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Назад към магазина
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="aspect-square bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
              {product.images.length > 0 ? (
                <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                  <Package className="w-16 h-16" />
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-md overflow-hidden shrink-0 border-2 transition-colors ${activeImage === i ? 'border-mtex-lightblue' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{product.name}</h1>
            {product.brand && <p className="text-mtex-lightblue mt-1">{product.brand}</p>}

            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className={`text-sm px-3 py-1 rounded ${product.condition === 'new' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {product.condition === 'new' ? 'Нова' : 'Използвана'}
              </span>
              <span className="text-sm text-zinc-400">{PART_TYPE_LABELS[product.part_type] ?? product.part_type}</span>
              {product.category && <span className="text-sm text-zinc-400">• {product.category}</span>}
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-white">{Number(product.price).toFixed(2)} €</span>
              {inStock ? (
                <span className="text-sm text-emerald-400 flex items-center gap-1"><Check className="w-4 h-4" /> На склад ({product.stock})</span>
              ) : (
                <span className="text-sm text-red-500">Изчерпан</span>
              )}
            </div>

            {product.description && (
              <p className="mt-4 text-zinc-300 leading-relaxed">{product.description}</p>
            )}

            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center border border-zinc-700 rounded-md">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors" disabled={!inStock}>
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-white">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="w-10 h-10 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors" disabled={!inStock}>
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="btn-red flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                {inStock ? 'Добави в количката' : 'Изчерпан'}
              </button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center text-center gap-1 bg-zinc-900/50 rounded-lg p-3">
                <Truck className="w-5 h-5 text-mtex-lightblue" />
                <span className="text-xs text-zinc-400">Бърза доставка</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1 bg-zinc-900/50 rounded-lg p-3">
                <Shield className="w-5 h-5 text-mtex-lightblue" />
                <span className="text-xs text-zinc-400">14 дни тест</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1 bg-zinc-900/50 rounded-lg p-3">
                <Wrench className="w-5 h-5 text-mtex-lightblue" />
                <span className="text-xs text-zinc-400">Гаранция</span>
              </div>
            </div>
          </div>
        </div>

        {(product.make || product.model || product.year_from || product.engine_type) && (
          <div className="mt-10 bg-zinc-950 border border-zinc-800 rounded-xl p-6">
            <h2 className="font-heading text-xl font-bold text-white mb-4">Съвместимост с автомобил</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.make && <div><p className="text-xs text-zinc-500">Марка</p><p className="text-white font-medium">{product.make}</p></div>}
              {product.model && <div><p className="text-xs text-zinc-500">Модел</p><p className="text-white font-medium">{product.model}</p></div>}
              {(product.year_from || product.year_to) && (
                <div>
                  <p className="text-xs text-zinc-500">Години</p>
                  <p className="text-white font-medium">{product.year_from ?? '?'} – {product.year_to ?? '?'}</p>
                </div>
              )}
              {product.engine_type && <div><p className="text-xs text-zinc-500">Двигател</p><p className="text-white font-medium">{product.engine_type}</p></div>}
            </div>
          </div>
        )}

        {(specsEntries.length > 0 || product.oem_number || product.part_number || product.aftermarket_numbers) && (
          <div className="mt-6 bg-zinc-950 border border-zinc-800 rounded-xl p-6">
            <h2 className="font-heading text-xl font-bold text-white mb-4">Технически спецификации</h2>
            <table className="w-full">
              <tbody>
                {product.part_number && (
                  <tr className="border-b border-zinc-800">
                    <td className="py-2 text-sm text-zinc-400 w-1/3">Номер на частта (SKU)</td>
                    <td className="py-2 text-sm text-white font-mono">{product.part_number}</td>
                  </tr>
                )}
                {product.oem_number && (
                  <tr className="border-b border-zinc-800">
                    <td className="py-2 text-sm text-zinc-400">OEM номер</td>
                    <td className="py-2 text-sm text-white font-mono">{product.oem_number}</td>
                  </tr>
                )}
                {product.aftermarket_numbers && (
                  <tr className="border-b border-zinc-800">
                    <td className="py-2 text-sm text-zinc-400">Aftermarket номера</td>
                    <td className="py-2 text-sm text-white font-mono">{product.aftermarket_numbers}</td>
                  </tr>
                )}
                {specsEntries.map(([key, value]) => (
                  <tr key={key} className="border-b border-zinc-800">
                    <td className="py-2 text-sm text-zinc-400">{key}</td>
                    <td className="py-2 text-sm text-white">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg fade-up">
          Добавено в количката!
        </div>
      )}
    </section>
  );
}
