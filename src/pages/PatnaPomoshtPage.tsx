import { Phone, PhoneCall, MapPin, Clock, Truck, Battery, Wrench, Zap } from 'lucide-react';
import { COMPANY_PHONE } from '@/lib/pricing';

const SERVICES = [
  { icon: Truck, title: 'Репатриране', desc: 'Теглене и превоз на катастрофирали, повредени или блокирали автомобили, джипове и бусове.' },
  { icon: Battery, title: 'Подаване на ток', desc: 'Пускане на автомобил чрез подаване на електроенергия при изтощена батерия.' },
  { icon: Wrench, title: 'Смяна на гуми', desc: 'Смяна на пробита или спукана гума на място или транспортиране до най-близкия сервиз.' },
  { icon: Zap, title: 'Доставка на гориво', desc: 'Доставка на гориво при празен резервоар на пътя.' },
];

export function PatnaPomoshtPage() {
  const phoneLink = `tel:${COMPANY_PHONE.replace(/\s/g, '')}`;
  return (
    <section className="pt-20 md:pt-24 pb-16 md:pb-24 bg-black min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-r from-mtex-red/10 via-transparent to-mtex-red/10" />
      <div className="relative max-w-5xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 mb-4 text-xs font-bold uppercase tracking-wider text-white bg-mtex-red rounded-full">24/7</span>
          <h1 className="text-3xl md:text-5xl font-bold uppercase text-white text-balance">Денонощна Пътна Помощ</h1>
          <p className="mt-4 text-lg text-mtex-lightblue font-medium">Бърза реакция и сигурност на пътя — цяла България</p>
        </div>
        <div className="flex justify-center mb-12">
          <a href={phoneLink} className="pulse-ring inline-flex items-center justify-center gap-4 bg-mtex-red text-white font-heading text-2xl md:text-3xl font-bold uppercase px-12 md:px-16 py-6 md:py-8 rounded-2xl hover:brightness-110 transition-all min-h-[72px]">
            <PhoneCall className="w-8 h-8 animate-pulse" />ПОЗВЪНИ
          </a>
        </div>
        <div className="text-center mb-12">
          <a href={phoneLink} className="inline-flex items-center gap-3 text-3xl md:text-4xl font-bold text-white hover:text-mtex-lightblue transition-colors">
            <Phone className="w-8 h-8 text-mtex-red" />{COMPANY_PHONE}
          </a>
        </div>
        <div className="bg-zinc-950 border-2 border-mtex-red/40 rounded-2xl p-6 md:p-8 mb-10">
          <div className="flex items-center gap-3 mb-4"><MapPin className="w-6 h-6 text-mtex-red" /><h2 className="text-xl font-bold text-white">Покритие</h2></div>
          <p className="text-zinc-300 text-lg">Предлагаме пътна помощ на цялата територия на България, 24 часа в денонощието, 7 дни в седмицата. Независимо къде се намирате, нашият екип ще реагира бързо и професионално.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="card-dark p-5 flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-mtex-red/20 border border-mtex-red/40 flex items-center justify-center shrink-0"><Icon className="w-6 h-6 text-mtex-red" /></div>
                <div><h3 className="text-lg font-semibold text-white">{s.title}</h3><p className="mt-1 text-sm text-zinc-400">{s.desc}</p></div>
              </div>
            );
          })}
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
          <Clock className="w-6 h-6 text-mtex-lightblue" />
          <div><h3 className="font-semibold text-white">Работно време</h3><p className="text-sm text-zinc-400">Денонощно — 24 часа, 7 дни в седмицата, без почивни дни</p></div>
        </div>
      </div>
    </section>
  );
}