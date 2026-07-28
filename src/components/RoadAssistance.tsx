import { Phone } from 'lucide-react';
import { ROAD_ASSIST_ITEMS } from '@/lib/strings';
import { COMPANY_PHONE } from '@/lib/pricing';

export function RoadAssistance() {
  return (
    <section id="road-assist" className="py-16 md:py-24 bg-black relative">
      <div className="absolute inset-0 bg-gradient-to-r from-mtex-red/10 via-transparent to-mtex-red/10" />
      <div className="relative max-w-5xl mx-auto px-4 md:px-6">
        <div className="bg-zinc-950 border-2 border-mtex-red/40 rounded-2xl p-6 md:p-10">
          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-bold uppercase tracking-wider text-white bg-mtex-red rounded-full">
              24/7
            </span>
            <h2 className="text-3xl md:text-4xl font-bold uppercase text-white text-balance">
              Денонощна Пътна Помощ – Бърза реакция и сигурност на пътя
            </h2>
          </div>

          <ul className="max-w-3xl mx-auto space-y-3 mb-8">
            {ROAD_ASSIST_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-zinc-200">
                <span className="w-2 h-2 rounded-full bg-mtex-red mt-2 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="flex justify-center">
            <a
              href={`tel:${COMPANY_PHONE.replace(/\s/g, '')}`}
              className="pulse-ring inline-flex items-center justify-center gap-3 bg-mtex-red text-white font-heading text-lg md:text-xl font-bold uppercase px-8 md:px-12 py-5 rounded-xl hover:brightness-110 transition-all min-h-[56px]"
            >
              <Phone className="w-6 h-6 animate-pulse" />
              Позвъни за Пътна Помощ
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}