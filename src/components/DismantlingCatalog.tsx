import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Vehicle } from '@/lib/types';

const MAKES = ['Volkswagen', 'BMW', 'Audi', 'Mercedes-Benz', 'Opel', 'Toyota', 'Ford', 'Peugeot'];

export function DismantlingCatalog() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [fMake, setFMake] = useState('');
  const [fModel, setFModel] = useState('');
  const [fYear, setFYear] = useState('');

  useEffect(() => {
    supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setVehicles((data as Vehicle[]) ?? []);
        setLoading(false);
      });
  }, []);

  const models = useMemo(() => {
    const set = new Set(vehicles.filter((v) => !fMake || v.make === fMake).map((v) => v.model));
    return Array.from(set).sort();
  }, [vehicles, fMake]);

  const filtered = vehicles.filter((v) => {
    if (fMake && v.make !== fMake) return false;
    if (fModel && v.model !== fModel) return false;
    if (fYear && String(v.year) !== fYear) return false;
    return true;
  });

  return (
    <section id="dismantling" className="py-16 md:py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10">
          <h2 className="section-title text-white">Автомобили на части</h2>
          <p className="section-sub">Активно разкомплектувани автомобили — изпратете запитване за конкретна част</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 md:p-5 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select value={fMake} onChange={(e) => { setFMake(e.target.value); setFModel(''); }} className="input-dark" aria-label="Марка">
            <option value="">Всички марки</option>
            {MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={fModel} onChange={(e) => setFModel(e.target.value)} className="input-dark" aria-label="Модел" disabled={!fMake}>
            <option value="">Всички модели</option>
            {models.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <input
            type="number"
            value={fYear}
            onChange={(e) => setFYear(e.target.value)}
            placeholder="Година"
            className="input-dark"
            aria-label="Година"
          />
        </div>

        {loading ? (
          <p className="text-zinc-400 text-center py-10">Зареждане...</p>
        ) : filtered.length === 0 ? (
          <p className="text-zinc-400 text-center py-10">Няма намерени автомобили по избраните критерии.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((v) => (
              <article key={v.id} className="card-dark flex flex-col">
                <div className="aspect-video bg-zinc-900 overflow-hidden">
                  {v.image_url ? (
                    <img src={v.image_url} alt={`${v.make} ${v.model}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">Няма снимка</div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-white">{v.make} {v.model}</h3>
                  <dl className="mt-3 space-y-1 text-sm text-zinc-400">
                    <div className="flex justify-between"><dt>Година</dt><dd className="text-zinc-200">{v.year}</dd></div>
                    <div className="flex justify-between"><dt>Двигател</dt><dd className="text-zinc-200">{v.engine ?? '—'}</dd></div>
                    <div className="flex justify-between"><dt>Скоростна кутия</dt><dd className="text-zinc-200">{v.gearbox ?? '—'}</dd></div>
                  </dl>
                  <a
                    href={`#inquiry`}
                    className="btn-red mt-5 w-full text-sm"
                  >
                    Запитване за части от тази кола
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}