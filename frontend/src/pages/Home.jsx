import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ShieldCheck, ArrowRight, CheckCircle, Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: Calendar,
    title: 'Apply in Minutes',
    description: 'Submit a leave request in seconds — choose the type, pick dates, add a reason. Done.',
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50',
  },
  {
    icon: Clock,
    title: 'Real-Time Status',
    description: 'Every request is tracked from submission to decision. No more wondering if your leave was seen.',
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50',
  },
  {
    icon: ShieldCheck,
    title: 'Centralized Admin Control',
    description: 'Admins see all requests in one place, approve or reject with a reason, and keep audit history.',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
  },
];

const Home = () => {
  const { user }                         = useAuth();
  const [scrolled, setScrolled]          = useState(false);
  const [mobileOpen, setMobileOpen]      = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dashboardHref = user?.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-[0_1px_24px_0_rgba(99,102,241,0.08)] border-b border-slate-100'
          : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <Calendar size={15} className="text-white" />
              </div>
              <span className="text-[15px] font-bold tracking-tight text-slate-900">
                Leave<span className="gradient-text">MS</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              <a
                href="#features"
                className="text-sm text-slate-500 hover:text-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-100/70 transition-all font-medium"
              >
                Features
              </a>
              <div className="w-px h-4 bg-slate-200 mx-1" />
              {user ? (
                <Link
                  to={dashboardHref}
                  className="ml-1 text-sm gradient-bg text-white px-4 py-2.5 rounded-xl font-semibold hover:opacity-90 hover:shadow-lg hover:shadow-indigo-200/60 hover:-translate-y-px transition-all duration-200 flex items-center gap-1.5"
                >
                  <LayoutDashboard size={14} /> Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100/70 transition-all font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="ml-1 text-sm gradient-bg text-white px-4 py-2.5 rounded-xl font-semibold hover:opacity-90 hover:shadow-lg hover:shadow-indigo-200/60 hover:-translate-y-px transition-all duration-200 flex items-center gap-1.5"
                  >
                    Get Started <ArrowRight size={14} />
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile hamburger */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer — always rendered, slides in/out */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-1 shadow-xl shadow-slate-100">
            <a
              href="#features"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 px-3 py-3 rounded-xl hover:bg-indigo-50 transition-colors"
            >
              Features
            </a>
            {user ? (
              <Link
                to={dashboardHref}
                onClick={() => setMobileOpen(false)}
                className="mt-1 text-sm gradient-bg text-white px-4 py-3 rounded-xl font-semibold text-center hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <LayoutDashboard size={15} /> Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-slate-600 hover:text-indigo-600 px-3 py-3 rounded-xl hover:bg-indigo-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="mt-1 text-sm gradient-bg text-white px-4 py-3 rounded-xl font-semibold text-center hover:opacity-90 transition-opacity"
                >
                  Get Started →
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-28 text-center relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-white">
        {/* Subtle background orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-indigo-100/50 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          {user ? (
            /* ── Logged-in hero ── */
            <>
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Signed in as {user.name}
              </div>
              <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight max-w-3xl">
                Welcome back,{' '}
                <span className="gradient-text">{user.name.split(' ')[0]}</span>
              </h1>
              <p className="mt-6 text-slate-500 text-lg max-w-xl leading-relaxed">
                Your leave management dashboard is ready. Check your requests, apply for leave, or review your history.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <Link
                  to={dashboardHref}
                  className="inline-flex items-center gap-2 gradient-bg text-white px-7 py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-200"
                >
                  <LayoutDashboard size={16} /> Go to Dashboard
                </Link>
              </div>
            </>
          ) : (
            /* ── Guest hero ── */
            <>
              <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight max-w-3xl">
                Manage staff leave{' '}
                <span className="gradient-text">with clarity</span>
              </h1>
              <p className="mt-6 text-slate-500 text-lg max-w-xl leading-relaxed">
                One platform for employees to request leave and administrators to review,
                approve, and track every decision — no spreadsheets required.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 gradient-bg text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-200"
                >
                  Get Started <ArrowRight size={16} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap justify-center gap-5 text-sm text-slate-500">
                {['No setup required', 'Works on any device', 'Secure & private'].map(item => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-emerald-500" />
                    {item}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="border-t border-slate-100 bg-slate-50 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-12">
            Everything included
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description, iconColor, iconBg }) => (
              <div
                key={title}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon size={22} className={iconColor} />
                </div>
                <h3 className="text-slate-900 font-semibold text-base mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 py-6 text-center text-sm text-slate-400">
        &copy; 2026 Arfan. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
