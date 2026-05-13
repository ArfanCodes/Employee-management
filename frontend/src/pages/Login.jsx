import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Building2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ease = [0.16, 1, 0.3, 1];

const Login = () => {
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [waking, setWaking]     = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setWaking(false);
    setLoading(true);

    const attemptLogin = async (attempt = 1) => {
      try {
        const res = await api.post('/auth/login', form);
        login(res.data.user, res.data.token);
      } catch (err) {
        const isNetworkError = !err.response;
        if (isNetworkError && attempt < 4) {
          setWaking(true);
          await new Promise(r => setTimeout(r, 6000));
          return attemptLogin(attempt + 1);
        }
        setWaking(false);
        setError(
          isNetworkError
            ? 'Server could not be reached after several attempts. Please try again in a moment.'
            : err.response?.data?.message || 'Login failed. Please try again.'
        );
      }
    };

    await attemptLogin();
    setLoading(false);
    setWaking(false);
  };

  return (
    <div className="min-h-screen flex bg-[#121212] bg-grid-dark">

      {/* ── Left branding panel ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease }}
        className="hidden md:flex flex-1 flex-col justify-between px-16 py-12 relative"
      >
        {/* Back link */}
        <Link
          to="/"
          className="text-xs font-semibold tracking-widest uppercase text-white/40
                     hover:text-white/80 transition-colors duration-200 w-fit"
        >
          ← LeaveMS
        </Link>

        {/* Brand copy */}
        <div className="max-w-sm">
          <h1 className="text-5xl font-semibold text-white tracking-tight mb-6">
            LeaveMS
          </h1>
          <p className="text-white/50 text-lg leading-relaxed mb-10">
            Enterprise-grade suite for managing workforce availability with
            precision and quiet authority.
          </p>

          <div className="space-y-4 border-t border-white/10 pt-8">
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-inverse-primary flex-shrink-0" />
              <span className="text-white/60 text-sm">Secure &amp; Encrypted Infrastructure</span>
            </div>
            <div className="flex items-center gap-3">
              <Building2 size={18} className="text-inverse-primary flex-shrink-0" />
              <span className="text-white/60 text-sm">Built for enterprise teams</span>
            </div>
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="flex gap-8 text-white/25 text-xs font-semibold tracking-widest uppercase">
          <span>Secure</span>
          <span>Fast</span>
          <span>Reliable</span>
        </div>
      </motion.div>

      {/* ── Right form panel ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 md:px-16 relative z-10">

        {/* Mobile back link */}
        <div className="md:hidden w-full max-w-[440px] mb-8">
          <Link
            to="/"
            className="text-xs font-semibold tracking-widest uppercase text-white/40
                       hover:text-white/70 transition-colors duration-200"
          >
            ← LeaveMS
          </Link>
        </div>

        {/* Glassmorphism card */}
        <motion.div
          initial={{ opacity: 0, y: 32, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0,  filter: 'blur(0px)'  }}
          transition={{ duration: 0.55, delay: 0.15, ease }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-10
                     w-full max-w-[440px] shadow-2xl shadow-black/50"
        >
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white tracking-tight">Sign In</h2>
            <p className="text-white/40 text-sm mt-1">Access your secure workspace</p>
          </div>

          {/* Waking banner */}
          {waking && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-500/10 border border-amber-400/30 text-amber-300
                         px-4 py-3 rounded-lg mb-6 text-sm font-medium flex items-center gap-2.5"
            >
              <span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              Server is waking up from sleep, please wait…
            </motion.div>
          )}

          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-400/30 text-red-300
                         px-4 py-3 rounded-lg mb-6 text-sm font-medium"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35, ease }}
            >
              <label
                htmlFor="email"
                className="block text-xs font-semibold tracking-widest uppercase
                           text-white/50 mb-2"
              >
                Work Email
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <input
                  id="email" type="email" name="email"
                  value={form.email} onChange={handleChange} required
                  placeholder="name@company.com"
                  className="w-full bg-black/20 border border-white/10 rounded-lg
                             pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20
                             focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20
                             transition-colors duration-200"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.42, ease }}
            >
              <label
                htmlFor="password"
                className="block text-xs font-semibold tracking-widest uppercase
                           text-white/50 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  name="password" value={form.password}
                  onChange={handleChange} required
                  placeholder="••••••••"
                  className="w-full bg-black/20 border border-white/10 rounded-lg
                             pl-10 pr-11 py-3 text-sm text-white placeholder:text-white/20
                             focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20
                             transition-colors duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30
                             hover:text-white/60 transition-colors"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.49, ease }}
              type="submit"
              disabled={loading}
              className="w-full bg-white text-[#121212] py-3.5 px-4 rounded-lg
                         text-xs font-semibold tracking-widest uppercase
                         flex items-center justify-center gap-2
                         hover:bg-inverse-on-surface disabled:opacity-40
                         transition-all duration-200 group mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#121212] border-t-transparent rounded-full animate-spin" />
                  {waking ? 'Waking server…' : 'Signing in…'}
                </>
              ) : (
                <>
                  Continue to Workspace
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-0.5 transition-transform duration-200"
                  />
                </>
              )}
            </motion.button>

          </form>

          {/* Footer */}
          <p className="text-center text-xs text-white/30 mt-7">
            No account?{' '}
            <Link
              to="/register"
              className="text-inverse-primary hover:text-white transition-colors duration-200 font-semibold"
            >
              Register here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
