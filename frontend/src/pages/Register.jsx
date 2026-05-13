import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Building2, Lock, Eye, EyeOff, ArrowRight, UserPlus, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ease = [0.16, 1, 0.3, 1];

const getStrength = (pw) => {
  if (pw.length === 0) return null;
  if (pw.length < 6)   return { label: 'Too short', color: 'bg-rose-500',    width: 'w-1/4' };
  if (pw.length < 8)   return { label: 'Weak',      color: 'bg-amber-400',   width: 'w-2/4' };
  if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return { label: 'Medium', color: 'bg-yellow-400', width: 'w-3/4' };
  return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
};

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
            Join LeaveMS
          </h1>
          <p className="text-white/50 text-lg leading-relaxed mb-10">
            Set up in under a minute. Start managing your leave requests
            the moment you sign up.
          </p>

          <div className="space-y-4 border-t border-white/10 pt-8">
            <div className="flex items-center gap-3">
              <UserPlus size={18} className="text-inverse-primary flex-shrink-0" />
              <span className="text-white/60 text-sm">Free employee account, instant access</span>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles size={18} className="text-inverse-primary flex-shrink-0" />
              <span className="text-white/60 text-sm">No credit card required</span>
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
            <h2 className="text-2xl font-semibold text-white tracking-tight">Create Account</h2>
            <p className="text-white/40 text-sm mt-1">All new accounts are registered as Employee</p>
          </div>

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

            {/* Full Name */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.30, ease }}
            >
              <label htmlFor="name"
                className="block text-xs font-semibold tracking-widest uppercase text-white/50 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <input
                  id="name" type="text" name="name"
                  value={form.name} onChange={handleChange} required
                  placeholder="Jane Smith"
                  className="w-full bg-black/20 border border-white/10 rounded-lg
                             pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20
                             focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20
                             transition-colors duration-200"
                />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.37, ease }}
            >
              <label htmlFor="email"
                className="block text-xs font-semibold tracking-widest uppercase text-white/50 mb-2">
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

            {/* Department */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.44, ease }}
            >
              <label htmlFor="department"
                className="block text-xs font-semibold tracking-widest uppercase text-white/50 mb-2">
                Department <span className="text-white/25 normal-case tracking-normal font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Building2 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <input
                  id="department" type="text" name="department"
                  value={form.department} onChange={handleChange}
                  placeholder="Engineering, HR…"
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
              transition={{ duration: 0.4, delay: 0.51, ease }}
            >
              <label htmlFor="password"
                className="block text-xs font-semibold tracking-widest uppercase text-white/50 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  name="password" value={form.password}
                  onChange={handleChange} required minLength={6}
                  placeholder="At least 6 characters"
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
              {/* Strength bar */}
              {strength && (
                <div className="mt-2">
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                  </div>
                  <p className="text-xs text-white/30 mt-1">{strength.label}</p>
                </div>
              )}
            </motion.div>

            {/* Submit */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.58, ease }}
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
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
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
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-inverse-primary hover:text-white transition-colors duration-200 font-semibold"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
