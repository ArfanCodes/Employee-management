import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm]             = useState({ email: '', password: '' });
  const [showPass, setShowPass]     = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const navigate                    = useNavigate();

  // Navigate once auth state is committed (also handles already-logged-in)
  useEffect(() => {
    if (!authLoading && user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left gradient panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg flex-col justify-between p-12">
        <Link
          to="/"
          className="text-indigo-200 hover:text-white text-sm flex items-center gap-1.5 transition-colors w-fit"
        >
          <ArrowLeft size={14} /> Back to home
        </Link>

        <div>
          <p className="text-4xl font-extrabold text-white tracking-tight">LeaveMS</p>
          <blockquote className="mt-5 text-indigo-200 text-lg leading-relaxed max-w-xs">
            "Managing leave has never been this simple. Our whole team is finally on the same page."
          </blockquote>
          <p className="mt-3 text-indigo-300 text-sm font-semibold">— HR Manager, TechCorp</p>
        </div>

        <div className="flex gap-6 text-indigo-300 text-sm font-medium">
          <span>Secure</span>
          <span>Fast</span>
          <span>Reliable</span>
        </div>
      </div>

      {/* ── Right form panel ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex-1 flex flex-col justify-center px-8 sm:px-16 py-12 bg-white"
      >
        <div className="max-w-sm w-full mx-auto">

          <Link
            to="/"
            className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1.5 mb-8 lg:hidden transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-slate-500 text-sm mt-1.5">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-5 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="email" name="email" value={form.email}
                  onChange={handleChange} required
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password" value={form.password}
                  onChange={handleChange} required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all placeholder:text-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="w-full gradient-bg text-white py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all hover:-translate-y-0.5 active:scale-[0.98] shadow-md shadow-indigo-200 mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
              Register here
            </Link>
          </p>


        </div>
      </motion.div>
    </div>
  );
};

export default Login;
