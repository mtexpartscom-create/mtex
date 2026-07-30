import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { MorgueCar } from '@/lib/types';

export function AvtomorgaPage() {
  const [cars, setCars] = useState<MorgueCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MorgueCar | null>(null);
  const [galleryIdx, setGalleryIdx] = useState(0);

  useEffect(() => {
    supabase.from('morgue_cars').select('*').eq('is_published', true).order('created_at', { ascending: false }).then(({ data }) => {
      setCars((data as MorgueCar[]) ?? []);
      setLoading(false);
    });
  }, []);

  function openGallery(car: MorgueCar) { setSelected(car); setGalleryIdx(0); }

  return (
    <section className="pt-20 md:pt-24 pb-16 md:pb-24 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10">
          <h1 className="section-title text-white">Автоморга</h1>
          <p className="section-sub">Автомобили на части — разгледайте наличните превозни средства</p>
        </div>
        {loading ? (
          <p className="text-zinc-400 text-center py-10">Зареждане...</p>
        ) : cars.length === 0 ? (
          <p className="text-zinc-400 text-center py-10">В момента няма публикувани автомобили на части.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <article key={car.id} className="card-dark flex flex-col">
                <div className="aspect-video bg-zinc-900 overflow-hidden cursor-pointer" onClick={() => openGallery(car)}>
                  {car.images.length > 0 ? (
                    <img src={car.images[0]} alt={car.model} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">Няма снимка</div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-white">{car.model}</h3>
                  <dl className="mt-3 space-y-1 text-sm text-zinc-400">
                    <div className="flex justify-between"><dt>Двигател</dt><dd className="text-zinc-200">{car.engine ?? '—'}</dd></div>
                    <div className="flex justify-between"><dt>Скоростна кутия</dt><dd className="text-zinc-200">{car.transmission ?? '—'}</dd></div>
                    <div className="flex justify-between"><dt>Година</dt><dd className="text-zinc-200">{car.year ?? '—'}</dd></div>
                    <div className="flex justify-between"><dt>Код на боя</dt><dd className="text-zinc-200">{car.color_code ?? '—'}</dd></div>
                  </dl>
                  {car.description && <p className="mt-3 text-sm text-zinc-400 line-clamp-2">{car.description}</p>}
                  {car.images.length > 1 && (
                    <button onClick={() => openGallery(car)} className="btn-red mt-4 w-full text-sm">Виж всички снимки ({car.images.length})</button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      {selected && (
        <div className="fixed inset-0 z-[80] bg-black/95 flex flex-col" onClick={() => setSelected(null)}>
          <div className="flex items-center justify-between p-4 md:p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white">{selected.model}</h3>
            <button onClick={() => setSelected(null)} className="text-zinc-400 hover:text-white text-2xl">✕</button>
          </div>
          <div className="flex-1 flex items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
            <img src={selected.images[galleryIdx]} alt={`${selected.model} ${galleryIdx + 1}`} className="max-h-[70vh] max-w-full object-contain rounded-lg" />
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
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div><dt className="text-zinc-500">Двигател</dt><dd className="text-white">{selected.engine ?? '—'}</dd></div>
              <div><dt className="text-zinc-500">Скоростна кутия</dt><dd className="text-white">{selected.transmission ?? '—'}</dd></div>
              <div><dt className="text-zinc-500">Година</dt><dd className="text-white">{selected.year ?? '—'}</dd></div>
              <div><dt className="text-zinc-500">Код на боя</dt><dd className="text-white">{selected.color_code ?? '—'}</dd></div>
            </dl>
            {selected.description && <p className="mt-4 text-zinc-300 text-sm">{selected.description}</p>}
          </div>
        </div>
      )}
    </section>
  );
}