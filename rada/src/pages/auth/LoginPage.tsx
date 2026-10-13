import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Cloud, FlaskConical, Lock, Phone } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';

export default function LoginPage() {
  const { login, demoMode, setDemoMode } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(phone, password);
      const target = user.role === 'member' ? '/member'
        : user.role === 'admin' ? '/admin'
        : user.role === 'treasurer' ? '/treasurer'
        : user.role === 'secretary' ? '/secretary'
        : user.role === 'vice-secretary' ? '/vice-secretary'
        : user.role === 'chairperson' ? '/chairperson'
        : user.role === 'office' ? '/office'
        : '/super-admin';
      navigate(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { role: 'Member', phone: '0700 000 001' },
    { role: 'Admin', phone: '0700 000 002' },
    { role: 'Treasurer', phone: '0700 000 003' },
    { role: 'Secretary', phone: '0700 000 004' },
    { role: 'Chairperson', phone: '0700 000 005' },
    { role: 'Super Admin', phone: '0700 000 006' },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-primary-950 px-4 py-6 sm:px-6 sm:py-10">
      <div className="relative z-10 flex min-h-[calc(100vh-3rem)] items-center justify-center sm:min-h-[calc(100vh-5rem)]">
        <section className="w-full max-w-[448px] rounded-[28px] border border-white/20 bg-[linear-gradient(rgba(5,35,82,0.6),rgba(5,35,82,0.6)),url('/images/image%20copy%202.png')] bg-cover bg-center p-6 shadow-2xl shadow-primary-950/50 backdrop-blur-md sm:p-9">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="inline-flex items-center gap-2.5 text-white">
              <img src="/images/image%20copy%203.png" alt="KHWWC logo" className="h-10 w-10 rounded-full object-cover bg-white shadow-sm" />
              <span>
                <span className="block text-sm font-bold leading-tight">KHWWC</span>
                <span className="block text-[10px] font-medium leading-tight text-white/75">Kirinyaga Healthcare Workers Welfare</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setDemoMode(!demoMode)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/35 px-2.5 py-1.5 text-[10px] font-semibold text-white/85 transition-colors hover:border-white hover:text-white"
              title={demoMode ? 'Switch to production mode' : 'Switch to demo mode'}
            >
              {demoMode ? <FlaskConical size={12} /> : <Cloud size={12} />}
              {demoMode ? 'Demo' : 'Live'}
            </button>
          </div>

          <div className="mt-10 text-center sm:mt-12">
            <h1 className="text-[30px] font-bold tracking-tight text-white sm:text-[34px]">Welcome back</h1>
            <p className="mt-2 text-sm leading-6 text-white/80">Sign in to access your KHWWC account</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-error-200 bg-error-50 p-3.5 text-sm text-error-700">
                <AlertCircle size={17} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-white/90">Phone number</span>
              <span className="relative block">
                <Phone size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="0700 000 000"
                  className="w-full rounded-xl border border-white/45 bg-white/90 px-4 py-3.5 pl-11 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-500 focus:border-white focus:ring-4 focus:ring-white/30"
                  required
                  autoFocus
                  autoComplete="tel"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-white/90">Password</span>
              <span className="relative block">
                <Lock size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-white/45 bg-white/90 px-4 py-3.5 pl-11 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-500 focus:border-white focus:ring-4 focus:ring-white/30"
                  required
                  autoComplete="current-password"
                />
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 hover:shadow-primary-600/30 focus:outline-none focus:ring-4 focus:ring-primary-500/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Signing in...</>
              ) : (
                <>Sign in <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {demoMode && (
            <div className="mt-7 rounded-xl border border-white/20 bg-black/15 p-3.5">
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-white/75">Demo access</p>
              <div className="grid grid-cols-2 gap-1.5">
                {demoAccounts.map(account => (
                  <button
                    key={account.phone}
                    type="button"
                    onClick={() => { setPhone(account.phone); setPassword('demo123'); }}
                    className="rounded-lg px-2.5 py-2 text-left text-xs text-white/85 transition-colors hover:bg-white/15 hover:text-white"
                  >
                    <span className="block font-semibold">{account.role}</span>
                    <span className="block text-[10px] text-white/60">{account.phone}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!demoMode && (
            <p className="mt-6 rounded-xl border border-white/20 bg-black/15 px-3 py-2.5 text-center text-xs text-white/85">
              Live mode uses your account and current welfare records.
            </p>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-white/25 pt-5 text-xs text-white/65">
            <Link to="/" className="transition-colors hover:text-white">← Back to website</Link>
            <span>© 2026 KHWWC</span>
          </div>
        </section>
      </div>
    </main>
  );
}
