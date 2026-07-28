import { ShieldCheck, Truck, Package, Cpu, type LucideIcon } from 'lucide-react';
import { TRUST_ITEMS } from '@/lib/strings';

const ICONS: Record<string, LucideIcon> = { ShieldCheck, Truck, Package, Cpu };

export function TrustBar() {
  return (
    <section className="bg-zinc-950 border-y border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TRUST_ITEMS.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-mtex-darkblue/20 border border-mtex-darkblue/50 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-mtex-lightblue" />
                </div>
                <p className="text-sm font-medium text-zinc-200 leading-snug">{item.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}