import { useState } from 'react';
import { X, User, Building2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import type { UserRole } from '@/lib/types';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>('b2c');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [uicEik, setUicEik] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  function reset() {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setCompanyName('');
    setUicEik('');
    setError(null);
    setInfo(null);
    setShowPassword(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (password.length < 6) {
      setError('Паролата трябва да е поне 6 символа.');
      return;
    }

    setSubmitting(true);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
      } else {
        reset();
        onClose();
      }
    } else {
      const meta: Record<string, string> = { role, full_name: fullName, phone };
      if (role === 'b2b') {
        meta.company_name = companyName;
        meta.uic_eik = uicEik;
      }
      const { error } = await signUp(email, password, meta);
      if (error) {
        setError(error);
      } else {
        setInfo(
          role === 'b2b'
            ? 'Регистрацията е изпратена! B2B акаунтите изискват одобрение от администратор. Можете да влезете след одобрение.'
            : 'Регистрацията е успешна! Можете да влезете с вашите данни.'
        );
        setMode('login');
      }
    }

    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl font-bold text-white">
            {mode === 'login' ? 'Вход в профила' : 'Регистрация'}
          </h2>
          <button onClick={onClose} aria-label="Затвори" className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {info && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm text-emerald-400">
            {info}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRole('b2c')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    role === 'b2c' ? 'bg-mtex-darkblue/30 text-mtex-lightblue border border-mtex-darkblue' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                  }`
                >
                  <User className="w-4 h-4" /> Частно лице
                </button>
                <button
                  type="button"
                  onClick={() => setRole('b2b')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    role === 'b2b' ? 'bg-mtex-darkblue/30 text-mtex-lightblue border border-mtex-darkblue' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                  }`
                >
                  <Building2 className="w-4 h-4" /> Фирма (B2B)
                </button>
              </div>

              <div>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Име и фамилия"
                  className="input-dark"
                />
              </div>
              <div>
                <input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Телефон"
                  className="input-dark"
                />
              </div>

              {role === 'b2b' && (
                <>
                  <div>
                    <input
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Име на фирмата"
                      className="input-dark"
                    />
                  </div>
                  <div>
                    <input
                      required
                      value={uicEik}
                      onChange={(e) => setUicEik(e.target.value)}
                      placeholder="ЕИК / ДДС номер"
                      className="input-dark"
                    />
                  </div>
                </>
              )}
            </>
          )}

          <div>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Имейл"
              className="input-dark"
            />
          </div>
          <div className="relative">
            <input
              required
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Парола"
              className="input-dark pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-red w-full"
          >
            {submitting ? 'Изчакайте...' : mode === 'login' ? 'Вход' : 'Регистрация'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-zinc-400">
          {mode === 'login' ? (
            <>
              Нямате профил?{' '}
              <button
                onClick={() => { setMode('register'); reset(); }}
                className="text-mtex-lightblue hover:underline font-medium"
              >
                Регистрирайте се
              </button>
            </>
          ) : (
            <>
              Имате профил?{' '}
              <button
                onClick={() => { setMode('login'); reset(); }}
                className="text-mtex-lightblue hover:underline font-medium"
              >
                Вход
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}