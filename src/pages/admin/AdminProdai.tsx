import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { SellCarRequest } from '@/lib/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = { new: 'Нова', reviewed: 'Прегледана', offer_sent: 'Оферта изпратена' };

export function AdminProdai() {
  const [requests, setRequests] = useState<SellCarRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('sell_car_requests').select('*').order('created_at', { ascending: false });
    setRequests((data as SellCarRequest[]) ?? []);
    setLoading(false);
  }

  async function setStatus(id: string, status: string) {
    await supabase.from('sell_car_requests').update({ status }).eq('id', id);
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: status as SellCarRequest['status'] } : r)));
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Продай автомобил — Заявки</h2>
      {loading ? (
        <p className="text-zinc-400 text-center py-8">Зареждане...</p>
      ) : requests.length === 0 ? (
        <p className="text-zinc-400 text-center py-8">Няма подадени заявки.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="bg-zinc-950 border border-zinc-800 rounded-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold text-white">{r.make} {r.model} ({r.year ?? '—'})</p>
                  <p className="text-sm text-zinc-400">{r.contact_name} · {r.contact_phone}</p>
                  {r.engine && <p className="text-xs text-zinc-500 mt-1">Двигател: {r.engine}</p>}
                  {r.mileage != null && <p className="text-xs text-zinc-500">Пробег: {r.mileage} км</p>}
                </div>
                <div className="flex items-center gap-3">
                  <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value)} className="input-dark py-1.5 text-sm w-auto">{Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                  <button onClick={() => setExpanded(expanded === r.id ? null : r.id)} className="text-mtex-lightblue text-sm hover:underline">{expanded === r.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button>
                </div>
              </div>
              {expanded === r.id && (
                <div className="px-4 pb-4 border-t border-zinc-900 pt-3">
                  {r.condition_description && <p className="text-sm text-zinc-300 mb-3">{r.condition_description}</p>}
                  {r.contact_email && <p className="text-xs text-zinc-500 mb-3">Имейл: {r.contact_email}</p>}
                  {r.images.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {r.images.map((img, i) => (<a key={i} href={img} target="_blank" rel="noreferrer"><img src={img} alt="" className="w-24 h-24 object-cover rounded-md border border-zinc-700" /></a>))}
                    </div>
                  )}
                  <p className="text-xs text-zinc-500 mt-3">Създадена: {new Date(r.created_at).toLocaleString('bg-BG')}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}