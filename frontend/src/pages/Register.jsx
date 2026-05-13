import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Building2, Lock, Eye, EyeOff, ArrowRight, UserPlus, Zap } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ease = [0.16, 1, 0.3, 1];

const getStrength = (pw) => {
  if (pw.length === 0) return null;
  if (pw.length < 6)   return { label: 'Too short', color: 'bg-rose-400',    width: 'w-1/4' };
  if (pw.length < 8)   return { label: 'Weak',      color: 'bg-amber-400',   width: 'w-2/4' };
  if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw))
                       return { label: 'Medium',    color: 'bg-amber-300',   width: 'w-3/4' };
  return                       { label: 'Strong',   color: 'bg-emerald-400', width: 'w-full' };
};

/* ─── Shared ambient backdrop ──────────────────────────────────────────────── */
const AmbientBackdrop = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-[#1b1a17]" />
    <div
      className="absolute inset-0 bg-grid-fine opacity-30"
      style={{
        WebkitMaskImage:
          'radial-gradient(ellipse 80% 65% at 50% 50%, #000 25%, transparent 80%)',
        maskImage:
          'radial-gradient(ellipse 80% 65% at 50% 50%, #000 25%, transparent 80%)',
      }}
    />
    {/* Warm glow — upper left (mirrored vs Login so the two pages feel like twins) */}
    <div
      className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full
                 bg-[radial-gradient(ellipse_at_center,rgba(232,146,85,0.18)_0%,transparent_60%)]
                 animate-glow-pulse pointer-events-none"
    />
    <div
      className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full
                 bg-[radial-gradient(ellipse_at_center,rgba(207,123,53,0.10)_0%,transparent_60%)]
                 animate-float-y pointer-events-none"
    />
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 50%, rgba(0,0,0,0.55) 100%)',
      }}
    />
    <div className="absolute inset-0 noise-bg opacity-[0.05] mix-blend-overlay pointer-events-none" />
  </div>
);

const CornerBrackets = () => (
  <>
    <span className="pointer-events-none absolute -top-2 -left-2 h-4 w-4 border-l border-t border-[#cf7b35]/35" />
    <span className="pointer-events-none absolute -top-2 -right-2 h-4 w-4 border-r border-t border-[#cf7b35]/35" />
    <span className="pointer-events-none absolute -bottom-2 -left-2 h-4 w-4 border-l border-b border-[#cf7b35]/35" />
    <span className="pointer-events-none absolute -bottom-2 -right-2 h-4 w-4 border-r border-b border-[#cf7b35]/35" />
  </>
);

const BackToAuren = ({ className = '' }) => (
  <Link to="/" className={`group inline-flex items-center gap-2.5 w-fit ${className}`}>
    <span className="text-white/35 group-hover:text-white/70 transition-colors text-[12px]">←</span>
    <span className="grid grid-cols-2 gap-[2px]" aria-hidden="true">
      <span className="block h-[6px] w-[6px] bg-[#cf7b35]" />
      <span className="block h-[6px] w-[6px] bg-white/15" />
      <span className="block h-[6px] w-[6px] bg-white/15" />
      <span className="block h-[6px] w-[6px] bg-[#cf7b35]" />
    </span>
    <span className="text-[12.5px] font-medium tracking-[-0.005em] text-white/40 group-hover:text-white/85 transition-colors">
      Auren
    </span>
  </Link>
);

const Register = () => {
  const [form, setForm]         = useState({ name: '', email: '', password: '', department: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const navigate                = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.user, res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(form.password);

  return (
    <div className="min-h-screen flex relative overflow-hidden text-white font-sans antialiased">
      <AmbientBackdrop />

      {/* Vertical architectural hairline divider (desktop only) */}
      <div className="hidden md:block absolute left-1/2 top-[12%] bottom-[12%] w-px
                      bg-gradient-to-b from-transparent via-white/[0.07] to-transparent pointer-events-none" />
      <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                      w-1.5 h-1.5 rounded-full bg-[#cf7b35]/60 pointer-events-none" />

      {/* ── Left brand panel ─────────────────────────────────────────────── */}
      <motion.aside
        initial={{ opacity: 0, x: -28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.65, ease }}
        className="hidden md:flex flex-1 flex-col justify-between px-14 lg:px-20 py-14 relative"
      >
        <BackToAuren />

        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <span className="h-px w-8 bg-[#cf7b35]/55" />
            <span className="text-[10px] font-medium tracking-[0.22em] uppercase text-white/40">
              Create account
            </span>
          </div>

          <h1 className="text-[60px] lg:text-[76px] leading-[0.94] tracking-[-0.04em] font-medium text-white text-balance">
            Begin with{' '}
            <span className="inline-block font-light italic pr-[0.15em]
                             bg-gradient-to-r from-white via-white/85 to-[#f6d9b8]
                             bg-clip-text text-transparent">
              intent.
            </span>
          </h1>

          <p className="mt-7 max-w-sm text-[14.5px] leading-[1.75] text-white/45">
            Set up your Auren workspace in under a minute. Start managing time
            off the moment you sign up — no setup overhead, no clutter.
          </p>

          <div className="mt-12 mb-7 flex items-center gap-3">
            <span className="h-px w-8 bg-white/[0.09]" />
            <span className="text-[10px] font-medium tracking-[0.22em] uppercase text-white/30">
              Included
            </span>
            <span className="h-px flex-1 bg-white/[0.06]" />
          </div>

          <ul className="space-y-5">
            {[
              { icon: UserPlus, t: 'Instant employee account', s: 'Apply, track, and cancel leave from day one' },
              { icon: Zap,      t: 'No setup overhead',         s: 'Free for individual employees · no card' },
            ].map(({ icon: Icon, t, s }) => (
              <li key={t} className="flex items-start gap-3.5">
                <div className="mt-[2px] grid place-items-center h-7 w-7 rounded-md
                                border border-white/[0.09] bg-white/[0.03]">
                  <Icon size={13} className="text-[#e89255]" strokeWidth={1.6} />
                </div>
                <div>
                  <div className="text-[13.5px] font-medium text-white/85 tracking-[-0.005em]">{t}</div>
                  <div className="mt-0.5 text-[12px] text-white/40">{s}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Numbered architectural pillars */}
        <div className="grid grid-cols-3 gap-px border-t border-white/[0.06] pt-7">
          {[
            { n: '01', l: 'Self-service', s: 'Apply · cancel' },
            { n: '02', l: 'Live status',  s: 'Pending · approved' },
            { n: '03', l: 'Audited',      s: 'Every action logged' },
          ].map(({ n, l, s }) => (
            <div key={n} className="pr-4">
              <div className="text-[10px] font-medium tracking-[0.24em] uppercase text-[#cf7b35]/75">{n}</div>
              <div className="mt-2 text-[12.5px] font-medium text-white/80 tracking-[-0.005em]">{l}</div>
              <div className="mt-0.5 text-[11px] text-white/35">{s}</div>
            </div>
          ))}
        </div>
      </motion.aside>

      {/* ── Right form panel ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-14 md:px-14 lg:px-20 relative z-10">

        <div className="md:hidden w-full max-w-[440px] mb-10">
          <BackToAuren />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
          transition={{ duration: 0.7, delay: 0.15, ease }}
          className="relative w-full max-w-[440px]"
        >
          <CornerBrackets />

          <div className="absolute -inset-6 rounded-[28px]
                          bg-[radial-gradient(ellipse_at_center,rgba(232,146,85,0.10),transparent_60%)]
                          blur-2xl pointer-events-none" />

          <div className="relative rounded-2xl border border-white/[0.08]
                          bg-white/[0.025] backdrop-blur-2xl
                          px-9 sm:px-11 py-11
                          shadow-[0_30px_80px_-30px_rgba(0,0,0,0.75)]">

            <div className="absolute inset-x-9 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            {/* Heading */}
            <div className="mb-9">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="h-px w-6 bg-[#cf7b35]/65" />
                <span className="text-[10px] font-medium tracking-[0.22em] uppercase text-white/45">
                  Create account
                </span>
              </div>
              <h2 className="text-[26px] font-medium tracking-[-0.02em] text-white">
                Set up your workspace
              </h2>
              <p className="mt-1.5 text-white/40 text-[13.5px] leading-relaxed">
                All new accounts start as Employee.
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 px-3.5 py-3 rounded-lg
                           bg-rose-500/[0.08] border border-rose-400/25 text-rose-200 text-[13px] font-medium"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Name */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.28, ease }}>
                <label htmlFor="name"
                  className="block text-[10px] font-medium tracking-[0.22em] uppercase text-white/45 mb-2.5">
                  Full name
                </label>
                <div className="relative">
                  <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" strokeWidth={1.8} />
                  <input id="name" type="text" name="name"
                    value={form.name} onChange={handleChange} required
                    placeholder="Jane Smith"
                    className="field-dark w-full rounded-lg bg-[#23211d]/55 border border-white/[0.08]
                               pl-10 pr-3.5 py-3 text-[14px] text-white placeholder:text-white/25
                               focus:outline-none focus:bg-[#23211d]/80 focus:border-[#cf7b35]/50
                               focus:ring-[3px] focus:ring-[#cf7b35]/[0.12]
                               transition-[background-color,border-color,box-shadow] duration-200" />
                </div>
              </motion.div>

              {/* Email */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.34, ease }}>
                <label htmlFor="email"
                  className="block text-[10px] font-medium tracking-[0.22em] uppercase text-white/45 mb-2.5">
                  Work email
                </label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" strokeWidth={1.8} />
                  <input id="email" type="email" name="email"
                    value={form.email} onChange={handleChange} required
                    placeholder="name@company.com"
                    className="field-dark w-full rounded-lg bg-[#23211d]/55 border border-white/[0.08]
                               pl-10 pr-3.5 py-3 text-[14px] text-white placeholder:text-white/25
                               focus:outline-none focus:bg-[#23211d]/80 focus:border-[#cf7b35]/50
                               focus:ring-[3px] focus:ring-[#cf7b35]/[0.12]
                               transition-[background-color,border-color,box-shadow] duration-200" />
                </div>
              </motion.div>

              {/* Department */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.4, ease }}>
                <label htmlFor="department"
                  className="flex items-center justify-between text-[10px] font-medium tracking-[0.22em] uppercase text-white/45 mb-2.5">
                  <span>Department</span>
                  <span className="text-white/25 normal-case tracking-normal font-normal text-[11px]">Optional</span>
                </label>
                <div className="relative">
                  <Building2 size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" strokeWidth={1.8} />
                  <input id="department" type="text" name="department"
                    value={form.department} onChange={handleChange}
                    placeholder="Engineering, HR…"
                    className="field-dark w-full rounded-lg bg-[#23211d]/55 border border-white/[0.08]
                               pl-10 pr-3.5 py-3 text-[14px] text-white placeholder:text-white/25
                               focus:outline-none focus:bg-[#23211d]/80 focus:border-[#cf7b35]/50
                               focus:ring-[3px] focus:ring-[#cf7b35]/[0.12]
                               transition-[background-color,border-color,box-shadow] duration-200" />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.46, ease }}>
                <label htmlFor="password"
                  className="block text-[10px] font-medium tracking-[0.22em] uppercase text-white/45 mb-2.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" strokeWidth={1.8} />
                  <input id="password"
                    type={showPass ? 'text' : 'password'}
                    name="password" value={form.password}
                    onChange={handleChange} required minLength={6}
                    placeholder="At least 6 characters"
                    className="field-dark w-full rounded-lg bg-[#23211d]/55 border border-white/[0.08]
                               pl-10 pr-11 py-3 text-[14px] text-white placeholder:text-white/25
                               focus:outline-none focus:bg-[#23211d]/80 focus:border-[#cf7b35]/50
                               focus:ring-[3px] focus:ring-[#cf7b35]/[0.12]
                               transition-[background-color,border-color,box-shadow] duration-200" />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30
                               hover:text-white/65 transition-colors">
                    {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                {strength && (
                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="h-[3px] flex-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                    </div>
                    <span className="text-[10.5px] tracking-[0.16em] uppercase text-white/40 w-12 text-right">
                      {strength.label}
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Submit */}
              <motion.button
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.54, ease }}
                type="submit" disabled={loading}
                className="group relative w-full mt-3 py-3.5 px-4 rounded-lg
                           bg-white text-[#1b1a17]
                           text-[11.5px] font-semibold tracking-[0.2em] uppercase
                           flex items-center justify-center gap-2.5
                           shadow-[0_10px_30px_-12px_rgba(255,255,255,0.35)]
                           hover:shadow-[0_14px_44px_-10px_rgba(246,217,184,0.5)]
                           active:translate-y-[1px]
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-[box-shadow,transform] duration-300"
              >
                <span className="pointer-events-none absolute inset-0 rounded-lg
                                 bg-[linear-gradient(180deg,rgba(255,255,255,0.55)_0%,transparent_55%)]
                                 mix-blend-overlay opacity-60" />
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#1b1a17] border-t-transparent rounded-full animate-spin" />
                    <span className="relative z-10">Creating</span>
                  </>
                ) : (
                  <>
                    <span className="relative z-10">Create account</span>
                    <ArrowRight size={12} strokeWidth={2.4}
                      className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
              <p className="text-[12.5px] text-white/40">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-white/85 hover:text-white font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
