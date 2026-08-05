import { useEffect, useState } from 'react';
import { X, Trash2, ShoppingCart, CheckCircle2, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { applyDiscount, formatBgn, b2bDiscountActive, B2B_DISCOUNT } from '@/lib/pricing';
import type { EcontCity, EcontOffice } from '@/lib/types';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, productItems, total, remove, setQty, clear } = useCart();
  const { profile, session } = useAuth();
  const [cities, setCities] = useState<EcontCity[]>([]);
  const [offices, setOffices] = useState<EcontOffice[]>([]);
  const [cityId, setCityId] = useState('');
  const [officeId, setOfficeId] = useState('');
  const [name, setName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [gdpr, setGdpr] = useState(false);
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');

  const hasDiscount = b2bDiscountActive(profile);

  useEffect(() => {
    supabase.from('econt_cities').select('*').order('sort_order').then(({ data }) => {
      setCities((data as EcontCity[]) ?? []);
    });
  }, []);

  useEffect(() => {
    if (!cityId) { setOffices([]); setOfficeId(''); return; }
    supabase.from('econt_offices').select('*').eq('city_id', cityId).order('sort_order').then(({ data }) => {
      setOffices((data as EcontOffice[]) ?? []);
      setOfficeId('');
    });
  }, [cityId]);

  const allItems = [
    ...items.map((i) => ({
      id: i.part.id,
      name: i.part.title,
      price: applyDiscount(Number(i.part.price), profile),
      quantity: i.quantity,
      image: i.part.image_url,
      stock: 99,
      isProduct: false,
    })),
    ...productItems.map((i) => ({
      id: i.product.id,
      name: i.product.name,
      price: applyDiscount(Number(i.product.price), profile),
      quantity: i.quantity,
      image: i.product.images[0] ?? null,
      stock: i.product.stock,
      isProduct: true,
    })),
  ];

  const discountedTotal = allItems.reduce((s, i) => s + i.quantity * i.price, 0);
  const totalCount = allItems.length;

  async function submitOrder(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    const city = cities.find((c) => c.id === cityId);
    const office = offices.find((o) => o.id === officeId);
    const { data: orderData, error: orderErr } = await supabase.from('orders').insert({
      user_id: session?.user.id ?? null,
      customer_name: name,
      phone,
      city: city?.name ?? '',
      ekont_office: office ? `${office.name}${office.address ? ` - ${office.address}` : ''}` : '',
      total: discountedTotal,
      status: 'new',
    }).select().single();

    if (orderErr || !orderData) { setStatus('err'); return; }

    const orderItems = [
      ...items.map((i) => ({
        order_id: orderData.id,
        part_id: i.part.id,
        title: i.part.title,
        price: applyDiscount(Number(i.part.price), profile),
        quantity: i.quantity,
      })),
      ...productItems.map((i) => ({
        order_id: orderData.id,
        part_id: i.product.id,
        title: i.product.name,
        price: applyDiscount(Number(i.product.price), profile),
        quantity: i.quantity,
      })),
    ];
    const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
    if (itemsErr) { setStatus('err'); return; }

    setStatus('ok');
    clear();
    setStep('cart');
    setCityId(''); setOfficeId(''); setName(''); setPhone(''); setGdpr(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <aside
        className="relative w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full flex flex-col fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-mtex-red" />
            {step === 'cart' ? 'Количка' : 'Оформяне на поръчка'}
          </h2>
          <button onClick={onClose} aria-label="Затвори" className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </header>

        {status === 'ok' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
            <h3 className="text-xl font-bold text-white">Поръчката е изпратена!</h3>
            <p className="text-zinc-400 mt-2">Ще се свържем с вас за потвърждение.</p>
            <button onClick={onClose} className="btn-red mt-6">Затвори</button>
          </div>
        ) : totalCount === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <Package className="w-12 h-12 text-zinc-600 mb-3" />
            <p className="text-zinc-400 mb-4">Количката е празна.</p>
            <Link to="/avto-chasti" onClick={onClose} className="btn-red text-sm">Разгледай части</Link>
          </div>
        ) : step === 'cart' ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {hasDiscount && (
                <p className="text-xs text-emerald-400 font-semibold text-center">Активна B2B отстъпка {Math.round(B2B_DISCOUNT * 100)}%</p>
              )}
              {allItems.map((i) => (
                <div key={i.id} className="flex gap-3 bg-zinc-900 rounded-lg p-3">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-zinc-800 shrink-0">
                    {i.image ? (
                      <img src={i.image} alt={i.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-zinc-600" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white line-clamp-2">{i.name}</p>
                    <p className="text-sm text-mtex-lightblue mt-0.5">{i.isProduct ? `${i.price.toFixed(2)} €` : formatBgn(i.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => setQty(i.id, i.quantity - 1)} className="w-8 h-8 rounded bg-zinc-800 text-white">-</button>
                      <span className="text-sm text-white w-6 text-center">{i.quantity}</span>
                      <button onClick={() => setQty(i.id, Math.min(i.quantity + 1, i.stock || 99))} className="w-8 h-8 rounded bg-zinc-800 text-white">+</button>
                      <button onClick={() => remove(i.id)} className="ml-auto text-zinc-500 hover:text-red-500" aria-label="Премахни">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <footer className="p-5 border-t border-zinc-800 space-y-3">
              <div className="flex justify-between text-lg font-bold text-white">
                <span>Общо:</span>
                <span>{formatBgn(discountedTotal)}</span>
              </div>
              <button onClick={() => setStep('checkout')} className="btn-red w-full">Към оформяне на поръчка</button>
            </footer>
          </>
        ) : (
          <form onSubmit={submitOrder} className="flex-1 overflow-y-auto p-4 space-y-3">
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Име и Фамилия" className="input-dark" />
            <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Телефон" className="input-dark" />
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Изберете град</label>
              <select required value={cityId} onChange={(e) => setCityId(e.target.value)} className="input-dark">
                <option value="">— Изберете град —</option>
                {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Изберете офис на Еконт</label>
              <select required value={officeId} onChange={(e) => setOfficeId(e.target.value)} className="input-dark" disabled={!cityId}>
                <option value="">— Изберете офис —</option>
                {offices.map((o) => <option key={o.id} value={o.id}>{o.name}{o.address ? ` - ${o.address}` : ''}</option>)}
              </select>
            </div>
            <label className="flex items-start gap-2 text-sm text-zinc-300">
              <input type="checkbox" required checked={gdpr} onChange={(e) => setGdpr(e.target.checked)} className="mt-1 w-5 h-5 accent-mtex-red" />
              <span>Съгласен съм с обработката на лични данни съгласно GDPR.</span>
            </label>
            <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-zinc-800">
              <span>Общо:</span>
              <span>{formatBgn(discountedTotal)}</span>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep('cart')} className="btn-outline-blue flex-1 text-sm">Назад</button>
              <button type="submit" disabled={status === 'sending'} className="btn-red flex-1 text-sm">
                {status === 'sending' ? 'Изпращане...' : 'Изпрати поръчката'}
              </button>
            </div>
            {status === 'err' && <p className="text-red-500 text-sm text-center">Възникна грешка. Опитайте отново.</p>}
          </form>
        )}
      </aside>
    </div>
  );
}
