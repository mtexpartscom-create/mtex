import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ServiceBookingNew, BeforeAfterPhoto } from '@/lib/types';
import { Upload, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = { pending: 'Чакаща', confirmed: 'Потвърдена', cancelled: 'Отказана' };

export function AdminServis() {
  const [bookings, setBookings] = useState<ServiceBookingNew[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [photos, setPhotos] = useState<BeforeAfterPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [newPhoto, setNewPhoto] = useState({ title: '', before_image: '', after_image: '' });

  useEffect(() => { loadBookings(); loadPhotos(); }, []);

  async function loadBookings() {
    setLoading(true);
    const { data } = await supabase.from('service_bookings').select('*').order('created_at', { ascending: false });
    setBookings((data as ServiceBookingNew[]) ?? []);
    setLoading(false);
  }

  async function loadPhotos() {
    const { data } = await supabase.from('before_after_photos').select('*').order('created_at', { ascending: false });
    setPhotos((data as BeforeAfterPhoto[]) ?? []);
  }

  async function setStatus(id: string, status: string) {
    await supabase.from('service_bookings').update({ status }).eq('id', id);
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: status as ServiceBookingNew['status'] } : b)));
  }

  async function onPhotoUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('before-after').upload(path, file);
    if (!error) { const { data } = supabase.storage.from('before-after').getPublicUrl(path); setNewPhoto((prev) => ({ ...prev, [type === 'before' ? 'before_image' : 'after_image']: data.publicUrl })); }
    setUploading(false);
  }

  async function savePhoto() {
    await supabase.from('before_after_photos').insert({ title: newPhoto.title || null, before_image: newPhoto.before_image || null, after_image: newPhoto.after_image || null });
    setNewPhoto({ title: '', before_image: '', after_image: '' });
    await loadPhotos();
  }

  async function delPhoto(id: string) {
    await supabase.from('before_after_photos').delete().eq('id', id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Автосервиз — Резервации</h2>
      {loading ? (
        <p className="text-zinc-400 text-center py-8">Зареждане...</p>
      ) : bookings.length === 0 ? (
        <p className="text-zinc-400 text-center py-8">Няма резервации.</p>
      ) : (
        <div className="space-y-3 mb-10">
          {bookings.map((b) => (
            <div key={b.id} className="bg-zinc-950 border border-zinc-800 rounded-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold text-white">{b.name}</p>
                  <p className="text-sm text-zinc-400">{b.phone} · {b.car_model ?? '—'}</p>
                  {b.appointment_date && <p className="text-xs text-mtex-lightblue mt-1">{b.appointment_date} {b.appointment_time ? `в ${b.appointment_time}` : ''}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <select value={b.status ?? 'pending'} onChange={(e) => setStatus(b.id, e.target.value)} className="input-dark py-1.5 text-sm w-auto">{Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                  <button onClick={() => setExpanded(expanded === b.id ? null : b.id)} className="text-mtex-lightblue text-sm hover:underline">{expanded === b.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button>
                </div>
              </div>
              {expanded === b.id && (
                <div className="px-4 pb-4 border-t border-zinc-900 pt-3 text-sm text-zinc-300 space-y-1">
                  {b.email && <p>Имейл: {b.email}</p>}
                  {b.problem_description && <p>Проблем: {b.problem_description}</p>}
                  <p>Тип: {b.service_type}</p>
                  <p>Създадена: {new Date(b.created_at).toLocaleString('bg-BG')}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <h3 className="text-xl font-bold text-white mb-4">Галерия Преди/След</h3>
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input value={newPhoto.title} onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })} placeholder="Заглавие (по желание)" className="input-dark" />
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Снимка "Преди"</label>
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-zinc-700 rounded-lg p-3 cursor-pointer hover:border-mtex-lightblue transition-colors">
              <Upload className="w-4 h-4 text-zinc-500" /><span className="text-xs text-zinc-400">{uploading ? 'Качване...' : 'Преди'}</span>
              <input type="file" accept="image/*" onChange={(e) => onPhotoUpload(e, 'before')} className="hidden" />
            </label>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Снимка "След"</label>
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-zinc-700 rounded-lg p-3 cursor-pointer hover:border-mtex-lightblue transition-colors">
              <Upload className="w-4 h-4 text-zinc-500" /><span className="text-xs text-zinc-400">{uploading ? 'Качване...' : 'След'}</span>
              <input type="file" accept="image/*" onChange={(e) => onPhotoUpload(e, 'after')} className="hidden" />
            </label>
          </div>
        </div>
        <button onClick={savePhoto} className="btn-red text-sm mt-3"><Plus className="w-4 h-4" />Добави</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((p) => (
          <div key={p.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
            {p.title && <p className="text-sm font-semibold text-white mb-2">{p.title}</p>}
            <div className="grid grid-cols-2 gap-2">
              {p.before_image && <img src={p.before_image} alt="Преди" className="w-full aspect-square object-cover rounded-md" />}
              {p.after_image && <img src={p.after_image} alt="След" className="w-full aspect-square object-cover rounded-md" />}
            </div>
            <button onClick={() => delPhoto(p.id)} className="text-xs text-red-500 hover:underline flex items-center gap-1 mt-2"><Trash2 className="w-3 h-3" />Изтрий</button>
          </div>
        ))}
        {photos.length === 0 && <p className="text-zinc-400 text-center py-4 col-span-full">Няма добавени снимки.</p>}
      </div>
    </div>
  );
}