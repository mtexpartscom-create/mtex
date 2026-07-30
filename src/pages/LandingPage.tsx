import { Link } from 'react-router-dom';
import { Car, ShoppingCart, Wrench, Snowflake, HandCoins, PhoneCall, type LucideIcon } from 'lucide-react';
import { SERVICE_CARDS } from '@/lib/strings';
import { COMPANY_PHONE } from '@/lib/pricing';

const ICONS: Record<string, LucideIcon> = { Car, ShoppingCart, Wrench, Snowflake, HandCoins, PhoneCall };

export function LandingPage() {
  return (
    <>
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/380628/pexels-photo-380628.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="Автосервиз MTEX" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 w-full">
          <div className="max-w-3xl fade-up">
            <span className="inline-block px-3 py-1 mb-5 text-xs font-semibold uppercase tracking-wider text-mtex-lightblue border border-mtex-lightblue/40 rounded-full">Авточасти втора употреба &middot; Автосервиз &middot; Пътна помощ</span>
            <h1 className="text-4xl md:text-6xl font-bold uppercase text-white leading-[1.05] text-balance">Професионални автомобилни услуги на едно място</h1>
            <p className="mt-5 text-lg md:text-xl text-mtex-lightblue font-medium text-balance">Автоморга, авточасти, автосервиз, автоклиматици, изкупуване и пътна помощ — всичко за вашия автомобил.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link to="/avto-chasti" className="btn-red text-base">Онлайн магазин</Link>
              <Link to="/avtoservis" className="btn-outline-blue text-base">Запази час за сервиз</Link>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-16 md:py-24 bg-black">
        <div className="max-w-5xl mx-auto px-4 md:px-6 text-center">
          <h2 className="section-title text-white">За нас</h2>
          <p className="text-mtex-lightblue font-medium mb-4">MTEX Parts</p>
          <div className="space-y-4 text-zinc-300 leading-relaxed max-w-3xl mx-auto">
            <p>MTEX Parts е специализиран автомобилен център, който обединява всичко необходимо за вашия автомобил на едно място. От качествени авточасти втора употреба до професионален автосервиз и денонощна пътна помощ.</p>
            <p>С над 10 000 налични части, собствен автосервиз и сертифицирани механици, предлагаме комплексни решения за всеки автомобил. Гарантираме качество, бързо обслужване и коректно отношение към всеки клиент.</p>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div><p className="font-heading text-3xl font-bold text-mtex-red">10k+</p><p className="text-xs text-zinc-400 uppercase">Части на склад</p></div>
            <div><p className="font-heading text-3xl font-bold text-mtex-lightblue">6</p><p className="text-xs text-zinc-400 uppercase">Услуги</p></div>
            <div><p className="font-heading text-3xl font-bold text-white">24/7</p><p className="text-xs text-zinc-400 uppercase">Пътна помощ</p></div>
          </div>
        </div>
      </section>

      <section id="services" className="py-16 md:py-24 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="section-title text-white">Нашите услуги</h2>
            <p className="section-sub">Изберете услугата, която ви интересува</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICE_CARDS.map((card) => {
              const Icon = ICONS[card.icon];
              return (
                <div key={card.title} className="card-dark p-6 flex flex-col">
                  <div className="w-14 h-14 rounded-xl bg-mtex-darkblue/20 border border-mtex-darkblue/50 flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-mtex-lightblue" />
                  </div>
                  <h3 className="text-xl font-bold text-white font-heading mb-2">{card.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-5 flex-1">{card.description}</p>
                  <Link to={card.route} className="btn-red w-full text-sm">{card.button}</Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="contacts" className="py-16 md:py-24 bg-black">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h2 className="section-title text-white">Контакти</h2>
          <p className="section-sub">Свържете се с нас по всяко време</p>
          <div className="flex flex-col items-center gap-4 mt-6">
            <a href={`tel:${COMPANY_PHONE.replace(/\s/g, '')}`} className="flex items-center gap-3 text-2xl font-bold text-white hover:text-mtex-lightblue transition-colors">
              <PhoneCall className="w-7 h-7 text-mtex-red" />{COMPANY_PHONE}
            </a>
            <p className="text-zinc-400">ул. Индустриална 12, София, България</p>
          </div>
        </div>
      </section>
    </>
  );
}