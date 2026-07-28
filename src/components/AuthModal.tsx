import { useState } from 'react';
import { X, User, Building2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'b2c' | 'b2b'>('b2c');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [uicEik, setUicEik] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) setError(error);
      else onClose();
    } else {
      const meta: Record<string, string> = { role, full_name: fullName, phone };
      if (role === 'b2b') {
        meta.company_name = companyName;
        meta.uic_eik = uicEik;
      }
      const { error } = await signUp(email, password, meta);
      if (error) setError(error);
      else {
        setInfo(
          role === 'b2b'
            ? 'Регистрацията е изпратена! B2B акаунтите изискват одобрение от администратор. Можете да влезете след одобрение.'
            : 'Регистрацията е успешна! Можете да влезете с вашите данни.'
        );
        setMode('login');
      }
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 relative fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="Затвори" className="absolute top-4 right-4 text-zinc-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-heading text-2xl font-bold text-white mb-1">
          {mode === 'login' ? 'Вход' : 'Регистрация'}
        </h2>
        <p className="text-sm text-zinc-400 mb-5">
          {mode === 'login' ? 'Влезте във вашия профил' : 'Създайте нов профил'}
        </p>

        {mode === 'register' && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              onClick={() => setRole('b2c')}
              className={`flex items-center justify-center gap-2 py-3 rounded-md border-2 transition-all ${role === 'b2c' ? 'border-mtex-lightblue bg-mtex-lightblue/10 text-white' : 'border-zinc-700 text-zinc-400'}`}
            >
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">Клиент (B2C)</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('b2b')}
              className={`flex items-center justify-center gap-2 py-3 rounded-md border-2 transition-all ${role === 'b2b' ? 'border-mtex-lightblue bg-mtex-lightblue/10 text-white' : 'border-zinc-700 text-zinc-400'}`}
            >
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-medium">Автосервиз (B2B)</span>
            </button>
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' && (
            <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Име и фамилия" className="input-dark" />
          )}
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Имейл" className="input-dark" />
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Парола" className="input-dark" />
          {mode === 'register' && (
            <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Телефон" className="input-dark" />
          )}
          {mode === 'register' && role === 'b2b' && (
            <>
              <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Име на фирмата" className="input-dark" />
              <input required value={uicEik} onChange={(e) => setUicEik(e.target.value)} placeholder="БУЛСТАТ / ЕИК" className="input-dark" />
            </>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {info && <p className="text-emerald-400 text-sm">{info}</p>}

          <button type="submit" disabled={loading} className="btn-red w-full">
            {loading ? 'Изчакайте...' : mode === 'login' ? 'Вход' : 'Регистрация'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-400">
          {mode === 'login' ? 'Нямате профил? ' : 'Вече имате профил? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); setInfo(null); }}
            className="text-mtex-lightblue font-semibold hover:underline"
          >
            {mode === 'login' ? 'Регистрирай се' : 'Вход'}
          </button>
        </p>
      </div>
    </div>
  );
}