import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Calendar, Clock, ShieldCheck, ArrowRight, CheckCircle,
  Menu, X, LayoutDashboard, Zap, Users, FileText, Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ── Mock product preview shown in hero ─────────────────────────────── */
const MockPreview = () => (
  <div className="bg-white rounded-2xl shadow-2xl shadow-indigo-300/30 border border-slate-200/80 p-5 w-full">
    <div className="flex items-center justify-between mb-5">
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Leave Overview</p>
        <p className="text-base font-bold text-slate-900 mt-0.5">This Month</p>
      </div>
      <div className="w-9 h-9 gradient-bg rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
        <Calendar size={15} className="text-white" />
      </div>
    </div>

    <div className="grid grid-cols-3 gap-3 mb-5">
      {[
        { label: 'Approved', n: 12, num: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
        { label: 'Pending',  n: 4,  num: 'text-amber-600',   bg: 'bg-amber-50',   dot: 'bg-amber-500'   },
        { label: 'Rejected', n: 2,  num: 'text-rose-500',    bg: 'bg-rose-50',    dot: 'bg-rose-500'    },
      ].map(({ label, n, num, bg, dot }) => (
        <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
          <p className={`text-xl font-extrabold ${num}`}>{n}</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            <p className="text-xs text-slate-500 font-medium">{label}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="space-y-2.5">
      {[
        { name: 'Sarah K.',  type: 'Annual Leave',   days: '5 days', status: 'Approved', statusColor: 'text-emerald-600 bg-emerald-50' },
        { name: 'James M.',  type: 'Sick Leave',     days: '2 days', status: 'Pending',  statusColor: 'text-amber-600 bg-amber-50'   },
        { name: 'Priya L.',  type: 'Maternity',      days: '90 days',status: 'Approved', statusColor: 'text-emerald-600 bg-emerald-50' },
      ].map(({ name, type, days, status, statusColor }) => (
        <div key={name} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
          <div className="w-7 h-7 gradient-bg rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            {name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">{name} · {type}</p>
            <p className="text-[11px] text-slate-400">{days}</p>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor}`}>{status}</span>
        </div>
      ))}
    </div>

    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
      <Bell size={12} className="text-indigo-400" />
      <p className="text-[11px] text-slate-400">2 requests awaiting your review</p>
      <span className="ml-auto w-4 h-4 bg-indigo-600 rounded-full text-white text-[9px] font-bold flex items-center justify-center">2</span>
    </div>
  </div>
);

/* ── Step card for "how it works" ────────────────────────────────────── */
const Step = ({ n, title, desc, delay }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center text-center"
    >
      <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-indigo-200 mb-4">
        {n}
      </div>
      <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed max-w-[200px]">{desc}</p>
    </motion.div>
  );
};

/* ── Feature card ────────────────────────────────────────────────────── */
const FeatureCard = ({ icon: Icon, title, desc, gradient, delay }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group"
    >
      <div className={`w-12 h-12 ${gradient} rounded-2xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={22} className="text-white" />
      </div>
      <h3 className="text-slate-900 font-bold text-base mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
};

/* ── Main component ──────────────────────────────────────────────────── */
const Home = () => {
  const { user }            = useAuth();
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dashboardHref = user?.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">

      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-[0_1px_24px_0_rgba(99,102,241,0.10)] border-b border-slate-100'
          : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <Calendar size={15} className="text-white" />
              </div>
              <span className="text-[15px] font-bold tracking-tight text-slate-900">
                Leave<span className="gradient-text">MS</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <a href="#features" className="text-sm text-slate-500 hover:text-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-100/70 transition-all font-medium">Features</a>
              <a href="#how-it-works" className="text-sm text-slate-500 hover:text-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-100/70 transition-all font-medium">How it works</a>
              <div className="w-px h-4 bg-slate-200 mx-1" />
              {user ? (
                <Link to={dashboardHref} className="ml-1 text-sm gradient-bg text-white px-4 py-2.5 rounded-xl font-semibold hover:opacity-90 hover:shadow-lg hover:shadow-indigo-200/60 hover:-translate-y-px transition-all duration-200 flex items-center gap-1.5">
                  <LayoutDashboard size={14} /> Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100/70 transition-all font-medium">Sign In</Link>
                  <Link to="/register" className="ml-1 text-sm gradient-bg text-white px-4 py-2.5 rounded-xl font-semibold hover:opacity-90 hover:shadow-lg hover:shadow-indigo-200/60 hover:-translate-y-px transition-all duration-200 flex items-center gap-1.5">
                    Get Started <ArrowRight size={14} />
                  </Link>
                </>
              )}
            </nav>

            <button className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-600" onClick={() => setMobileOpen(o => !o)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-1 shadow-xl shadow-slate-100">
            <a href="#features" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-slate-600 hover:text-indigo-600 px-3 py-3 rounded-xl hover:bg-indigo-50 transition-colors">Features</a>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-slate-600 hover:text-indigo-600 px-3 py-3 rounded-xl hover:bg-indigo-50 transition-colors">How it works</a>
            {user ? (
              <Link to={dashboardHref} onClick={() => setMobileOpen(false)} className="mt-1 text-sm gradient-bg text-white px-4 py-3 rounded-xl font-semibold text-center flex items-center justify-center gap-2">
                <LayoutDashboard size={15} /> Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-slate-600 hover:text-indigo-600 px-3 py-3 rounded-xl hover:bg-indigo-50 transition-colors">Sign In</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="mt-1 text-sm gradient-bg text-white px-4 py-3 rounded-xl font-semibold text-center">Get Started →</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative px-6 py-20 md:py-28 overflow-hidden">
        {/* Background mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/40 pointer-events-none" />
        <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-gradient-to-br from-indigo-200/30 to-violet-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-80px] left-[-80px] w-[400px] h-[400px] bg-gradient-to-tr from-indigo-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">
          {user ? (
            /* ── Logged-in hero ── */
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex-1 text-center lg:text-left"
              >
                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Signed in as {user.name}
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                  Welcome back,{' '}
                  <span className="gradient-text">{user.name.split(' ')[0]}</span>
                </h1>
                <p className="mt-5 text-slate-500 text-lg max-w-lg leading-relaxed mx-auto lg:mx-0">
                  Your leave management dashboard is ready. Check your requests, apply for leave, or review your history.
                </p>
                <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
                  <Link to={dashboardHref} className="inline-flex items-center gap-2 gradient-bg text-white px-7 py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-200">
                    <LayoutDashboard size={16} /> Go to Dashboard
                  </Link>
                  <a href="#features" className="inline-flex items-center gap-2 border border-slate-200 text-slate-700 px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors">
                    Explore Features
                  </a>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="flex-1 w-full max-w-sm lg:max-w-none"
              >
                <MockPreview />
              </motion.div>
            </div>
          ) : (
            /* ── Guest hero ── */
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex-1 text-center lg:text-left"
              >
                <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                  <Zap size={11} className="fill-indigo-600" /> Built for modern teams
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                  Manage staff leave{' '}
                  <span className="gradient-text">with clarity</span>
                </h1>
                <p className="mt-5 text-slate-500 text-lg max-w-lg leading-relaxed mx-auto lg:mx-0">
                  One platform where employees request leave and admins approve, reject, and track every decision — no spreadsheets, no confusion.
                </p>
                <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
                  <Link to="/register" className="inline-flex items-center gap-2 gradient-bg text-white px-7 py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-200">
                    Get Started Free <ArrowRight size={15} />
                  </Link>
                  <Link to="/login" className="inline-flex items-center gap-2 border border-slate-200 bg-white text-slate-700 px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors shadow-sm">
                    Sign In
                  </Link>
                </div>
                <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-5 text-sm text-slate-500">
                  {['No setup required', 'Works on any device', 'Secure & private'].map(item => (
                    <span key={item} className="flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-emerald-500" /> {item}
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="flex-1 w-full max-w-sm lg:max-w-none"
              >
                <MockPreview />
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <section className="border-y border-slate-100 bg-white py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '< 2 min', label: 'To submit a request' },
            { value: 'Real-time', label: 'Status updates'       },
            { value: '99.9%',    label: 'Uptime monitored'      },
            { value: '2 roles',  label: 'Employee & Admin'      },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-extrabold gradient-text">{value}</p>
              <p className="text-slate-500 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="bg-slate-50 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Everything your team needs</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">From applying for leave to admin approvals — all in one clean interface.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: FileText,   title: 'Apply in Minutes',        desc: 'Pick type, dates, and reason. Submitted instantly.',          gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-600', delay: 0 },
              { icon: Clock,      title: 'Real-Time Status',        desc: 'Track every request from pending to decision, live.',          gradient: 'bg-gradient-to-br from-violet-500 to-violet-600', delay: 0.1 },
              { icon: ShieldCheck,title: 'Admin Control',           desc: 'Approve or reject with a reason. Full audit trail.',           gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',  delay: 0.2 },
              { icon: Users,      title: 'Team Overview',           desc: 'Admins see every employee and request in one place.',          gradient: 'bg-gradient-to-br from-rose-500 to-pink-600',     delay: 0.3 },
            ].map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-white px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Up and running in 3 steps</h2>
          </div>
          <div className="relative grid md:grid-cols-3 gap-10">
            {/* Connector line */}
            <div className="hidden md:block absolute top-6 left-[17%] right-[17%] h-px bg-gradient-to-r from-indigo-200 via-violet-200 to-indigo-200" />
            <Step n="1" title="Create your account"     desc="Register in seconds with your name, email, and department."    delay={0}    />
            <Step n="2" title="Submit a leave request"  desc="Pick the leave type, select dates, add a reason, and send."    delay={0.15} />
            <Step n="3" title="Get a decision"          desc="Admin reviews and approves or rejects. You're notified instantly." delay={0.3}  />
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      {!user && (
        <section className="px-6 py-10 bg-slate-50">
          <div className="max-w-3xl mx-auto">
            <div className="gradient-bg rounded-3xl px-8 py-12 text-center relative overflow-hidden shadow-2xl shadow-indigo-300/30">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 60%), radial-gradient(circle at 80% 20%, white 0%, transparent 50%)' }} />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">Ready to ditch the spreadsheets?</h2>
                <p className="text-indigo-200 mb-8 text-base">Join your team on LeaveMS — it takes less than a minute.</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link to="/register" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-7 py-3.5 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg">
                    Get Started Free <ArrowRight size={15} />
                  </Link>
                  <Link to="/login" className="inline-flex items-center gap-2 border border-white/30 text-white px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors">
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 py-8 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
              <Calendar size={13} className="text-white" />
            </div>
            <span className="text-sm font-bold text-slate-700">Leave<span className="gradient-text">MS</span></span>
          </div>
          <p className="text-sm text-slate-400 text-center">&copy; 2026 Arfan. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-slate-400 hover:text-slate-700 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-slate-400 hover:text-slate-700 transition-colors">How it works</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
