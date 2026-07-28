import { Phone, MapPin, Clock, MessageCircle } from 'lucide-react';
import { COMPANY_PHONE } from '@/lib/pricing';
import { WORKING_HOURS } from '@/lib/strings';

export function Contacts() {
  const address = 'ул. Индустриална 12, София, България';
  const viberUrl = `https://viber.me/${COMPANY_PHONE.replace(/[\s+]/g, '')}`;
  const whatsappUrl = `https://wa.me/${COMPANY_PHONE.replace(/[\s+]/g, '')}`;

  return (
    <section id="contacts" className="py-16 md:py-24 bg-zinc-950/40">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10">
          <h2 className="section-title text-white">Контакти</h2>
          <p className="section-sub">Свържете се с нас по всяко време</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="card-dark p-5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg bg-mtex-darkblue/20 border border-mtex-darkblue/50 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-mtex-lightblue" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Адрес</h3>
                <p className="text-zinc-400 text-sm">{address}</p>
              </div>
            </div>

            <div className="card-dark p-5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg bg-mtex-darkblue/20 border border-mtex-darkblue/50 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-mtex-lightblue" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Телефон</h3>
                <a href={`tel:${COMPANY_PHONE.replace(/\s/g, '')}`} className="text-zinc-400 text-sm hover:text-mtex-lightblue">{COMPANY_PHONE}</a>
              </div>
            </div>

            <div className="card-dark p-5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg bg-mtex-darkblue/20 border border-mtex-darkblue/50 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-mtex-lightblue" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">Работно време</h3>
                <ul className="text-sm text-zinc-400 space-y-1">
                  {WORKING_HOURS.map((w) => (
                    <li key={w.day} className="flex justify-between gap-4">
                      <span>{w.day}</span>
                      <span className="text-zinc-200">{w.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <a href={viberUrl} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-[#7360F2] text-white font-semibold py-3 rounded-md hover:brightness-110 transition-all min-h-[48px]">
                <MessageCircle className="w-5 h-5" />
                Viber
              </a>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold py-3 rounded-md hover:brightness-110 transition-all min-h-[48px]">
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </a>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border border-zinc-800 min-h-[400px]">
            <iframe
              title="Карта"
              src="https://www.google.com/maps?q=Sofia%20Bulgaria&output=embed"
              className="w-full h-full min-h-[400px] grayscale invert"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-900 py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
        <p className="text-sm text-zinc-500">© MTEX Parts. Всички права запазени.</p>
      </div>
    </footer>
  );
}