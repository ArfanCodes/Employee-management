import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Building2, Lock, Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const getStrength = (pw) => {
  if (pw.length === 0) return null;
  if (pw.length < 6)   return { label: 'Too short', color: 'bg-rose-400',   width: 'w-1/4' };
  if (pw.length < 8)   return { label: 'Weak',      color: 'bg-amber-400',  width: 'w-2/4' };
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

  const fields = [
    { name: 'name',       label: 'Full Name',              type: 'text',     icon: User,      placeholder: 'Jane Smith',          required: true  },
    { name: 'email',      label: 'Email address',          type: 'email',    icon: Mail,      placeholder: 'you@company.com',     required: true  },
    { name: 'department', label: 'Department (optional)',  type: 'text',     icon: Building2, placeholder: 'Engineering, HR…',    required: false },
  ];

  return (
    <div className="min-h-screen flex">

      {/* ── Left form panel ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex-1 flex flex-col justify-center px-8 sm:px-16 py-12 bg-white"
      >
        <div className="max-w-sm w-full mx-auto">

          <Link
            to="/"
            className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1.5 mb-8 transition-colors"
          >
            <ArrowLeft size={14} /> Back to home
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create account</h1>
            <p className="text-slate-500 text-sm mt-1.5">All new accounts are registered as Employee</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-5 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ name, label, type, icon: Icon, placeholder, required }) => (
              <div key={name}>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={type} name={name} value={form[name]}
                    onChange={handleChange} required={required}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>
            ))}

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password" value={form.password}
                  onChange={handleChange} required minLength={6}
                  placeholder="At least 6 characters"
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
              {/* Strength bar */}
              {strength && (
                <div className="mt-2">
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{strength.label}</p>
                </div>
              )}
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full gradient-bg text-white py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all hover:-translate-y-0.5 active:scale-[0.98] shadow-md shadow-indigo-200 mt-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                <>Create Account <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>

        </div>
      </motion.div>

      {/* ── Right gradient panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg flex-col justify-between p-12">
        <div />
        <div>
          <p className="text-4xl font-extrabold text-white tracking-tight">Join LeaveMS</p>
          <p className="mt-5 text-indigo-200 text-lg leading-relaxed max-w-xs">
            Set up in under a minute. Start managing leave requests immediately after signing up.
          </p>
          <ul className="mt-6 space-y-2 text-indigo-200 text-sm">
            {['Free to use', 'No credit card required', 'Instant access'].map(item => (
              <li key={item} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-300" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex gap-6 text-indigo-300 text-sm font-medium">
          <span>Secure</span><span>Fast</span><span>Reliable</span>
        </div>
      </div>

    </div>
  );
};

export default Register;
