import { useState } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function InquiryForm() {
  const [form, setForm] = useState({ name: '', phone: '', part_description: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    const { error } = await supabase.from('inquiries').insert({
      name: form.name,
      phone: form.phone,
      part_description: form.part_description,
    });
    if (error) setStatus('err');
    else {
      setStatus('ok');
      setForm({ name: '', phone: '', part_description: '' });
    }
  }

  return (
    <section id="inquiry" className="py-16 md:py-20 bg-zinc-950/40">
      <div className="max-w-2xl mx-auto px-4 md:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-semibold uppercase tracking-wider text-mtex-lightblue border border-mtex-lightblue/40 rounded-full">
          <Search className="w-4 h-4" />
          Не намирате вашата част?
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Изпратете запитване</h2>
        <p className="text-zinc-400 mb-6">Опишете нужната част и ние ще я намерим за вас.</p>

        <form onSubmit={submit} className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-3 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Име" className="input-dark" />
            <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Телефон" className="input-dark" />
          </div>
          <textarea required value={form.part_description} onChange={(e) => setForm({ ...form, part_description: e.target.value })} placeholder="Опишете частта (марка, модел, OEM номер...)" rows={4} className="input-dark" />
          <button type="submit" disabled={status === 'sending'} className="btn-red w-full">
            {status === 'sending' ? 'Изпращане...' : 'Изпрати запитване'}
          </button>
          {status === 'ok' && <p className="text-emerald-400 text-sm text-center">Запитването е изпратено! Ще се свържем с вас.</p>}
          {status === 'err' && <p className="text-red-500 text-sm text-center">Възникна грешка. Опитайте отново.</p>}
        </form>
      </div>
    </section>
  );
}