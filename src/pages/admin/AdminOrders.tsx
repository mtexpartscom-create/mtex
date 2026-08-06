import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatBgn } from '@/lib/pricing';
import type { Order, OrderItem, OrderStatus } from '@/lib/types';
import { Package, Phone, MapPin, Calendar, ChevronDown, ChevronUp, Trash2, ShoppingCart } from 'lucide-react';

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Нова',
  sent: 'Изпратена',
  done: 'Завършена',
  cancelled: 'Отказана',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'bg-amber-500/20 text-amber-400',
  sent: 'bg-blue-500/20 text-blue-400',
  done: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

export function AdminOrders() {
  const [orders, setOrders] = useState<(Order & { items?: OrderItem[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  }

  async function loadItems(orderId: string) {
    const { data } = await supabase.from('order_items').select('*').eq('order_id', orderId);
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, items: (data as OrderItem[]) ?? [] } : o));
  }

  function toggleExpand(orderId: string) {
    if (expandedId === orderId) {
      setExpandedId(null);
    } else {
      setExpandedId(orderId);
      const order = orders.find((o) => o.id === orderId);
      if (order && !order.items) loadItems(orderId);
    }
  }

  async function updateStatus(orderId: string, status: OrderStatus) {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
  }

  async function delOrder(orderId: string) {
    await supabase.from('order_items').delete().eq('order_id', orderId);
    await supabase.from('orders').delete().eq('id', orderId);
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  }

  const filtered = filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus);

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Поръчки</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'all' ? 'bg-mtex-red text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'}`}
          >
            Всички ({orders.length})
          </button>
          {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === s ? 'bg-mtex-red text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'}`}
            >
              {STATUS_LABELS[s]} ({statusCounts[s] ?? 0})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-zinc-400 text-center py-8">Зареждане...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400">Няма поръчки.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div key={order.id} className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleExpand(order.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-zinc-900/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                    <span className="text-white font-semibold truncate">{order.customer_name}</span>
                    <span className="text-mtex-lightblue font-bold">{formatBgn(Number(order.total))}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {order.phone}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {order.city} — {order.ekont_office}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(order.created_at).toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                {expandedId === order.id ? <ChevronUp className="w-5 h-5 text-zinc-500 shrink-0" /> : <ChevronDown className="w-5 h-5 text-zinc-500 shrink-0" />}
              </button>

              {expandedId === order.id && (
                <div className="border-t border-zinc-800 p-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-1">
                      <Package className="w-4 h-4" /> Продукти в поръчката
                    </h4>
                    {order.items ? (
                      order.items.length > 0 ? (
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between bg-zinc-900 rounded-lg p-3 text-sm">
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{item.title}</p>
                                <p className="text-zinc-500 text-xs">{item.quantity} бр. × {formatBgn(Number(item.price))}</p>
                              </div>
                              <p className="text-white font-bold ml-3">{formatBgn(Number(item.price) * item.quantity)}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-zinc-500 text-sm">Зареждане на продуктите...</p>
                      )
                    ) : (
                      <p className="text-zinc-500 text-sm">Зареждане на продуктите...</p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-zinc-300 mb-2">Промяна на статус</h4>
                    <div className="flex gap-2 flex-wrap">
                      {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(order.id, s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${order.status === s ? STATUS_COLORS[s] + ' border border-current' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'}`}
                        >
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => delOrder(order.id)}
                      className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Изтрий поръчката
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
