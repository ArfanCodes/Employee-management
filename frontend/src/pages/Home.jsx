import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Calendar, ClipboardCheck, BarChart2, ShieldCheck,
  Check, Menu, X, LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ─── Magnetic bento card ─────────────────────────────────────────────────── */
const BentoCard = ({ className = '', children, delay = 0 }) => {
  const ref      = useRef(null);
  const inView   = useInView(ref, { once: true, margin: '-60px' });
  const [tx, setTx] = useState({ x: 0, y: 0 });
  const leaving  = useRef(false);

  const onMove = (e) => {
    leaving.current = false;
    const r  = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width  / 2);
    const dy = e.clientY - (r.top  + r.height / 2);
    setTx({ x: dx * 0.04, y: dy * 0.04 });
  };
  const onLeave = () => {
    leaving.current = true;
    setTx({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded border border-black/5 bg-white p-10 hover:border-outline-variant/50
                  transition-colors duration-300 flex flex-col justify-between overflow-hidden ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div
        style={{
          transform: `translate(${tx.x}px, ${tx.y}px)`,
          transition: leaving.current
            ? 'transform 0.5s cubic-bezier(0.175,0.885,0.32,1.275)'
            : 'transform 0.1s ease-out',
        }}
      >
        {children}
      </div>
    </motion.div>
  );
};

/* ─── Main component ──────────────────────────────────────────────────────── */
const Home = () => {
  const { user } = useAuth();
  const [scrolled,    setScrolled]   = useState(false);
  const [mobileOpen,  setMobileOpen] = useState(false);
  const [activeSection, setActive]   = useState('');

  const dashHref = user?.role === 'admin' ? '/admin' : '/dashboard';

  /* nav shadow on scroll */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* active nav link via IntersectionObserver */
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '0px', threshold: 0.45 },
    );
    sections.forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  const navLink = (id, label) => (
    <a
      href={`#${id}`}
      className={`nav-underline text-xs font-semibold tracking-widest uppercase
                  transition-colors duration-200 pb-1
                  ${activeSection === id
                    ? 'active text-primary'
                    : 'text-on-surface-variant hover:text-primary'}`}
    >
      {label}
    </a>
  );

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans overflow-x-hidden">

      {/* ── Sticky nav ─────────────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 transition-all duration-300
        ${scrolled
          ? 'bg-surface/95 backdrop-blur-md border-b border-outline-variant/30 shadow-sm'
          : 'bg-surface/95 backdrop-blur-md border-b border-outline-variant/20'}`}
      >
        <div className="max-w-screen-xl mx-auto px-6 flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="text-xl font-bold tracking-tight text-on-surface">
            LeaveMS
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6">
            {navLink('features', 'Features')}
            {navLink('how-it-works', 'How It Works')}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link
                to={dashHref}
                className="bg-primary text-on-primary text-xs font-semibold tracking-widest uppercase
                           px-4 py-2 rounded hover:bg-primary-container transition-all duration-200
                           flex items-center gap-2 cta-shimmer"
              >
                <LayoutDashboard size={14} /> Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold tracking-widest uppercase text-on-surface-variant
                             hover:text-primary transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-on-primary text-xs font-semibold tracking-widest uppercase
                             px-4 py-2 rounded hover:scale-105 transition-transform duration-200 cta-shimmer"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded hover:bg-surface-container
                       transition-colors text-on-surface-variant"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        <div className={`md:hidden overflow-hidden transition-all duration-300
          ${mobileOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="bg-surface border-t border-outline-variant/20 px-6 py-4 flex flex-col gap-1">
            <a href="#features"    onClick={() => setMobileOpen(false)}
               className="text-sm font-medium text-on-surface-variant hover:text-primary px-3 py-3 rounded hover:bg-surface-container transition-colors">
              Features
            </a>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)}
               className="text-sm font-medium text-on-surface-variant hover:text-primary px-3 py-3 rounded hover:bg-surface-container transition-colors">
              How It Works
            </a>
            {user ? (
              <Link to={dashHref} onClick={() => setMobileOpen(false)}
                    className="mt-1 bg-primary text-on-primary text-sm font-semibold px-4 py-3 rounded text-center flex items-center justify-center gap-2">
                <LayoutDashboard size={15} /> Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}
                      className="text-sm font-medium text-on-surface-variant hover:text-primary px-3 py-3 rounded hover:bg-surface-container transition-colors">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}
                      className="mt-1 bg-primary text-on-primary text-sm font-semibold px-4 py-3 rounded text-center">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="bg-[#121212] bg-grid-dark text-inverse-on-surface pt-24 pb-32 relative overflow-hidden"
      >
        {/* Blob 1 */}
        <div
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none opacity-50 z-0 blob-1"
          style={{ background: 'radial-gradient(circle, rgba(90,103,216,0.15) 0%, transparent 70%)' }}
        />
        {/* Blob 2 */}
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none opacity-50 z-0 blob-2"
          style={{ background: 'radial-gradient(circle, rgba(90,103,216,0.15) 0%, transparent 70%)' }}
        />

        <div className="max-w-screen-xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs font-semibold tracking-[0.2em] uppercase text-secondary-fixed-dim mb-4"
          >
            Enterprise Leave Management
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white max-w-4xl mb-6
                       leading-[1.15] tracking-[-0.02em]"
          >
            {user
              ? <>Welcome back, <span className="text-primary-fixed">{user.name.split(' ')[0]}</span>.</>
              : 'Time is your most valuable asset. Manage it with intent.'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg text-secondary-fixed-dim max-w-2xl mb-10 leading-relaxed"
          >
            {user
              ? 'Your workspace is ready. Check leave status, apply for time off, or review your team.'
              : 'A high-performance leave management suite designed for quiet authority and absolute clarity. Streamline approvals, synchronise team calendars, and regain focus.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap gap-3 justify-center"
          >
            {user ? (
              <Link
                to={dashHref}
                className="bg-primary text-on-primary text-xs font-semibold tracking-widest uppercase
                           px-6 py-3 rounded hover:bg-primary-container transition-all duration-200 cta-shimmer"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-primary text-on-primary text-xs font-semibold tracking-widest uppercase
                             px-6 py-3 rounded hover:bg-primary-container transition-all duration-200 cta-shimmer"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="border border-white/20 text-white text-xs font-semibold tracking-widest uppercase
                             px-6 py-3 rounded hover:bg-white/5 transition-all duration-200"
                >
                  Sign In
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Bento features ─────────────────────────────────────────────────── */}
      <section id="features" className="py-32 bg-surface">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

            {/* Card 1 — wide */}
            <BentoCard className="md:col-span-8" delay={0}>
              <Calendar size={32} className="text-primary mb-4" />
              <h3 className="text-xl font-semibold text-on-surface mb-2 tracking-tight">
                Synchronised Team Calendars
              </h3>
              <p className="text-on-surface-variant text-sm leading-relaxed max-w-lg">
                Eliminate scheduling conflicts with a unified view of team availability.
                Integrates with your existing enterprise calendaring workflow.
              </p>
              <div className="mt-8 w-full h-44 bg-surface-container rounded border border-black/5 overflow-hidden">
                <img
                  alt="Calendar sync"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-9hpx2NqMQwHRVIse5_ah80iUd9AsK3EolZNGY85BJCiEHpgOXpJaVzxK-MOlPldBIC9I6r1NFmKtHsyqrU5mE6n_SMeGxqOKp9DccWR_DTdPI3FIppt9QAFrbD7PNVY_bX8ErBnR-hkDVbte4sdzPnap1jXz9tdpWPFWDIkT-wblA802nLAShTsKXc2pit19CPyLisvZqjm8OSQvx-DX0ZUrLA0FQSHnIAW8ifQJU68I1L9dR4R4q2TkNnYQeWo9dvBjYRpzM4lQ"
                  className="w-full h-full object-cover opacity-80 mix-blend-multiply"
                />
              </div>
            </BentoCard>

            {/* Card 2 */}
            <BentoCard className="md:col-span-4" delay={0.08}>
              <ClipboardCheck size={32} className="text-primary mb-4" />
              <h3 className="text-xl font-semibold text-on-surface mb-2 tracking-tight">
                Automated Approvals
              </h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Define routing logic. Auto-approve standard requests while flagging
                exceptions for managerial review.
              </p>
            </BentoCard>

            {/* Card 3 */}
            <BentoCard className="md:col-span-4" delay={0.16}>
              <BarChart2 size={32} className="text-primary mb-4" />
              <h3 className="text-xl font-semibold text-on-surface mb-2 tracking-tight">
                Compliance Analytics
              </h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Real-time reporting on accruals, utilisation rates, and statutory
                compliance across your organisation.
              </p>
            </BentoCard>

            {/* Card 4 — wide */}
            <BentoCard className="md:col-span-8" delay={0.24}>
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex-1">
                  <ShieldCheck size={32} className="text-primary mb-4" />
                  <h3 className="text-xl font-semibold text-on-surface mb-2 tracking-tight">
                    Enterprise-Grade Security
                  </h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Role-based access control and comprehensive audit logging ensure
                    data integrity for every request.
                  </p>
                </div>
                <div className="w-full md:w-2/5 h-36 bg-surface-container rounded border border-black/5 overflow-hidden flex-shrink-0">
                  <img
                    alt="Security"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDa13zUZZJiJSkhvc3awm0dAPiNlsmgu5kTemqwviDRRgYALn7a8var2Y-pzUQYgqgh45nzoUZy3iLlH0vn1gC_AlfVSD80yJ_dmny7VdjJs-8UKBIjQKar5spQGtBlrxpgSYqmwxNLtZaaA6WcCQ8kzNr92OVHG9tnh7rNQ1u9ywGG_g_8Y9S7mAPjeFQnSMygTfVzNSG7upTp7O3EFq6AzRDfKSLLeI_Yv8kaH0OScuKTzSVUZayWGKrhWDp9QoQ_nI7Eu4QeKS-w"
                    className="w-full h-full object-cover opacity-80 mix-blend-multiply"
                  />
                </div>
              </div>
            </BentoCard>

          </div>
        </div>
      </section>

      {/* ── Editorial split ─────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-32 bg-surface-container-low border-y border-outline-variant/20"
      >
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

            <motion.div
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-3xl font-semibold text-on-surface mb-4 tracking-tight leading-snug">
                Designed for Quiet Authority
              </h2>
              <p className="text-on-surface-variant leading-relaxed mb-6">
                We reject cluttered interfaces and arbitrary notifications. LeaveMS is
                architected to provide exactly what you need, precisely when you need it,
                and nothing more. The result is a calm, focused workspace that respects
                your time.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Zero-friction request flows',
                  'Context-aware approval routing',
                  'Immutable audit trails',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3">
                    <Check size={18} className="text-primary flex-shrink-0" />
                    <span className="text-on-surface text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="inline-block bg-primary text-on-primary text-xs font-semibold
                           tracking-widest uppercase px-5 py-2.5 rounded hover:bg-primary-container
                           transition-all duration-200 cta-shimmer"
              >
                Start for free
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="rounded border border-black/5 overflow-hidden h-96 relative"
            >
              <img
                alt="Modern office interior"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6UI_WZuJkgub24cqLvVXslNaTLWCAbhjQAjBWkhOZkqHJFBPlIB8OYQyEnp5IJk5_Ktj_6RSB-n4ZbyWGzbUxTXNv8psg7hWGwxXUnn2samL6zpYVq3sFtwGtzvYK4c6KB2jfDuhdL1aDH-c8CysNka-TrssNBJXGxdbAvZkh06o9Vt6JeEjE713biKxHsOi1wIva5-7cEN_HO7qmvLc1r-dhtk3iA_cPrfzpdnw1TIRHQNF0edrNfTwnJCxMqQMtsC96NPAcatAk"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border border-black/5 rounded pointer-events-none" />
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── CTA banner ─────────────────────────────────────────────────────── */}
      {!user && (
        <section className="bg-[#121212] bg-grid-dark text-inverse-on-surface py-24 relative overflow-hidden">
          <div className="max-w-screen-xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl font-semibold text-white mb-4 tracking-tight"
            >
              Ready to restore focus?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-secondary-fixed-dim text-lg max-w-xl mb-8 leading-relaxed"
            >
              Deploy LeaveMS across your organisation in minutes. Start managing time
              with intent.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-3 justify-center"
            >
              <Link
                to="/register"
                className="bg-primary text-on-primary text-xs font-semibold tracking-widest uppercase
                           px-6 py-3 rounded hover:bg-primary-container transition-all duration-200 cta-shimmer"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="border border-white/20 text-white text-xs font-semibold tracking-widest uppercase
                           px-6 py-3 rounded hover:bg-white/5 transition-all duration-200"
              >
                Sign In
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-surface-container-low border-t border-outline-variant/20 py-10 px-6">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xl font-bold text-on-surface tracking-tight">LeaveMS</span>
          <p className="text-sm text-on-surface-variant">
            &copy; {new Date().getFullYear()} LeaveMS Suite. All rights reserved.
          </p>
          <nav className="flex gap-6">
            <a href="#features"     className="text-xs font-semibold tracking-widest uppercase text-on-surface-variant hover:text-primary transition-colors duration-200">Features</a>
            <a href="#how-it-works" className="text-xs font-semibold tracking-widest uppercase text-on-surface-variant hover:text-primary transition-colors duration-200">How It Works</a>
            <Link to="/login"       className="text-xs font-semibold tracking-widest uppercase text-on-surface-variant hover:text-primary transition-colors duration-200">Sign In</Link>
          </nav>
        </div>
      </footer>

    </div>
  );
};

export default Home;
