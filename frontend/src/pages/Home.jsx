import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Calendar, ClipboardCheck, BarChart2, ShieldCheck,
  Check, Menu, X, LayoutDashboard, ArrowRight, ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EASE = [0.16, 1, 0.3, 1];

/* ─── Inline icons ────────────────────────────────────────────────────────── */
const GithubMark = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.07 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.6.23 2.78.11 3.07.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.27 5.68.41.35.78 1.05.78 2.12v3.14c0 .31.21.67.79.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.73 18.27.5 12 .5Z" />
  </svg>
);

/* ─── Wordmark — architectural 2×2 mark + clean wordmark ──────────────────── */
const Wordmark = ({ tone = 'dark' }) => {
  const text = tone === 'dark' ? 'text-white/90 group-hover:text-white' : 'text-on-surface/85 group-hover:text-on-surface';
  const dim  = tone === 'dark' ? 'bg-white/15' : 'bg-on-surface/15';
  return (
    <Link to="/" aria-label="Auren home" className="group inline-flex items-center gap-2.5">
      <span className="grid grid-cols-2 gap-[2px]" aria-hidden="true">
        <span className="block h-[7px] w-[7px] bg-[#cf7b35]" />
        <span className={`block h-[7px] w-[7px] ${dim}`} />
        <span className={`block h-[7px] w-[7px] ${dim}`} />
        <span className="block h-[7px] w-[7px] bg-[#cf7b35]" />
      </span>
      <span className={`text-[15px] font-medium tracking-[-0.01em] transition-colors ${text}`}>
        Auren
      </span>
    </Link>
  );
};

/* ─── Eyebrow label ───────────────────────────────────────────────────────── */
const Eyebrow = ({ children, color = 'copper' }) => {
  const dot = color === 'emerald' ? 'bg-emerald-400'
            : color === 'amber'   ? 'bg-amber-400'
            : 'bg-[#e89255]';
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] pl-2 pr-3 py-1">
      <span className="relative flex h-1.5 w-1.5">
        <span className={`absolute inset-0 rounded-full ${dot} animate-ping opacity-60`} />
        <span className={`relative h-1.5 w-1.5 rounded-full ${dot}`} />
      </span>
      <span className="text-[10.5px] font-medium tracking-[0.18em] uppercase text-white/65">
        {children}
      </span>
    </span>
  );
};

/* ─── Magnetic wrapper for CTAs ───────────────────────────────────────────── */
const Magnetic = ({ children, strength = 0.18, className = '' }) => {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    setPos({
      x: (e.clientX - (r.left + r.width / 2)) * strength,
      y: (e.clientY - (r.top + r.height / 2)) * strength,
    });
  };
  return (
    <span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
      className={`inline-block transition-transform duration-300 ease-out will-change-transform ${className}`}
    >
      {children}
    </span>
  );
};

/* ─── Buttons ─────────────────────────────────────────────────────────────── */
const PrimaryCTA = ({ to, children, compact = false, icon = true }) => (
  <Magnetic>
    <Link
      to={to}
      className={`group relative inline-flex items-center gap-2 rounded-full
                  bg-white text-[#1b1a17] font-semibold tracking-[-0.005em]
                  shadow-[0_8px_30px_-10px_rgba(255,255,255,0.4)]
                  hover:shadow-[0_14px_40px_-10px_rgba(246,217,184,0.55)]
                  active:translate-y-[0.5px] transition-[box-shadow,transform] duration-300
                  ${compact ? 'px-4 py-1.5 text-[12.5px]' : 'px-5 py-2.5 text-[13px]'}`}
    >
      <span className="pointer-events-none absolute inset-0 rounded-full
                       bg-[linear-gradient(180deg,rgba(255,255,255,0.85)_0%,transparent_45%)]
                       mix-blend-overlay opacity-70" />
      <span className="relative z-10">{children}</span>
      {icon && (
        <ArrowRight size={13} strokeWidth={2.2}
          className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5" />
      )}
    </Link>
  </Magnetic>
);

const SecondaryCTA = ({ to, children }) => (
  <Magnetic>
    <Link
      to={to}
      className="group inline-flex items-center gap-2 rounded-full border border-white/[0.12]
                 bg-white/[0.025] backdrop-blur-sm text-white/85 text-[13px] font-medium
                 px-5 py-2.5 hover:bg-white/[0.06] hover:border-white/20 hover:text-white
                 transition-colors duration-300"
    >
      {children}
      <ArrowUpRight size={13} strokeWidth={2}
        className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  </Magnetic>
);

/* ─── Navigation ──────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: 'features',     label: 'Features' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'security',     label: 'Security' },
  { id: 'pricing',      label: 'Pricing' },
];

const NavBar = ({ user, dashHref }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-30% 0px -55% 0px', threshold: 0 },
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  return (
    <motion.div
      initial={{ y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:pt-4 pointer-events-none"
    >
      <header
        className={`pointer-events-auto w-full max-w-[1180px] rounded-xl border transition-all duration-500
          ${scrolled
            ? 'bg-[#1b1a17]/82 border-white/[0.09] shadow-[0_14px_50px_-18px_rgba(0,0,0,0.75)] backdrop-blur-2xl'
            : 'bg-[#23211d]/30 border-white/[0.06] backdrop-blur-md'}`}
      >
        <div className="relative flex h-14 items-center gap-3 px-3 sm:px-4">
          <Wordmark />

          {/* Center pill nav */}
          <nav
            aria-label="Main"
            className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-0.5
                       rounded-full border border-white/[0.07] bg-white/[0.025] p-1"
          >
            {NAV_ITEMS.map(({ id, label }) => {
              const isActive = active === id;
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  className="relative px-3.5 py-1.5 rounded-full text-[12.5px] font-medium
                             text-white/55 hover:text-white transition-colors duration-200"
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-white/[0.07] border border-white/[0.08]"
                    />
                  )}
                  <span className={`relative z-10 ${isActive ? 'text-white' : ''}`}>{label}</span>
                </a>
              );
            })}
          </nav>

          {/* Right cluster */}
          <div className="ml-auto hidden md:flex items-center gap-1.5">
            <a
              href="https://github.com/ArfanCodes/Employee-management"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="grid place-items-center h-8 w-8 rounded-full text-white/55
                         hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <GithubMark size={14} />
            </a>
            <span className="h-5 w-px bg-white/10 mx-1" />
            {user ? (
              <PrimaryCTA to={dashHref} compact icon={false}>
                <LayoutDashboard size={13} strokeWidth={2} />
                <span className="ml-0.5">Dashboard</span>
              </PrimaryCTA>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-[12.5px] font-medium text-white/65 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <PrimaryCTA to="/register" compact>
                  Get started
                </PrimaryCTA>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
            className="md:hidden ml-auto grid place-items-center h-9 w-9 rounded-lg
                       text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        <div
          className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300
            ${open ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="border-t border-white/[0.06] p-2 flex flex-col gap-1">
            {NAV_ITEMS.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-[14px] font-medium text-white/70
                           hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                {label}
              </a>
            ))}
            <div className="h-px bg-white/[0.06] my-1" />
            {user ? (
              <Link
                to={dashHref}
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg bg-white text-[#1b1a17]
                           text-[14px] font-semibold px-4 py-2.5"
              >
                <LayoutDashboard size={15} /> Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-[14px] font-medium text-white/70
                             hover:text-white hover:bg-white/[0.05] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="text-center rounded-lg bg-white text-[#1b1a17] text-[14px] font-semibold px-4 py-2.5"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </motion.div>
  );
};

/* ─── Hero backdrop ───────────────────────────────────────────────────────── */
const HeroBackdrop = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    {/* Base */}
    <div className="absolute inset-0 bg-[#1b1a17]" />

    {/* Fine grid with radial mask */}
    <div
      className="absolute inset-0 bg-grid-fine opacity-70"
      style={{
        WebkitMaskImage:
          'radial-gradient(ellipse 75% 60% at 50% 30%, #000 25%, transparent 85%)',
        maskImage:
          'radial-gradient(ellipse 75% 60% at 50% 30%, #000 25%, transparent 85%)',
      }}
    />

    {/* Ambient glows */}
    <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[640px] rounded-full
                    bg-[radial-gradient(ellipse_at_center,rgba(232,146,85,0.18)_0%,transparent_60%)]
                    animate-glow-pulse pointer-events-none" />
    <div className="absolute top-[35%] -left-48 w-[640px] h-[640px] rounded-full
                    bg-[radial-gradient(ellipse_at_center,rgba(207,123,53,0.12)_0%,transparent_60%)]
                    animate-float-y pointer-events-none" />
    <div className="absolute top-[15%] -right-48 w-[560px] h-[560px] rounded-full
                    bg-[radial-gradient(ellipse_at_center,rgba(168,162,153,0.07)_0%,transparent_60%)]
                    animate-float-y-rev pointer-events-none" />

    {/* Top edge tint to seat the nav */}
    <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />

    {/* Vignette bottom */}
    <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-b from-transparent to-[#1b1a17] pointer-events-none" />

    {/* Edge vignette sides */}
    <div className="absolute inset-0 pointer-events-none"
      style={{
        background:
          'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)',
      }}
    />

    {/* Noise */}
    <div className="absolute inset-0 noise-bg opacity-[0.045] mix-blend-overlay pointer-events-none" />
  </div>
);

/* ─── Hero ────────────────────────────────────────────────────────────────── */
const Hero = ({ user, dashHref }) => {
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
  };
  const item = {
    hidden: { opacity: 0, y: 22, filter: 'blur(10px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: EASE } },
  };

  return (
    <section id="hero" className="relative isolate min-h-[100svh] flex flex-col">
      <HeroBackdrop />

      <div className="relative mx-auto w-full max-w-[1180px] px-6 pt-36 sm:pt-44 pb-24 sm:pb-28 flex-1">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center text-center"
        >
          <motion.h1
            variants={item}
            className="text-[44px] sm:text-[68px] lg:text-[84px] leading-[0.96] tracking-[-0.04em]
                       font-semibold text-balance max-w-[14ch]"
          >
            {user ? (
              <>
                Welcome back,{' '}
                <span className="inline-block font-light italic pr-[0.15em] bg-gradient-to-r from-white via-white/85 to-[#f6d9b8] bg-clip-text text-transparent">
                  {user.name?.split(' ')[0] ?? 'there'}
                </span>
                .
              </>
            ) : (
              <>
                Time is your most{' '}
                <span className="inline-block font-light italic pr-[0.15em] bg-gradient-to-r from-white via-white/80 to-[#f6d9b8] bg-clip-text text-transparent">
                  valuable
                </span>{' '}
                asset.
              </>
            )}
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-7 max-w-xl text-[15.5px] sm:text-[16.5px] leading-[1.65] text-white/55 text-balance"
          >
            {user
              ? 'Your workspace is ready. Review balances, request time off, or approve pending requests with a single click.'
              : 'Manage it with intent. A high-performance leave management suite designed for quiet authority and absolute clarity — streamline approvals, sync team calendars, regain focus.'}
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-wrap gap-3 justify-center">
            {user ? (
              <PrimaryCTA to={dashHref}>Go to Dashboard</PrimaryCTA>
            ) : (
              <>
                <PrimaryCTA to="/register">Start for free</PrimaryCTA>
                <SecondaryCTA to="/login">Sign in</SecondaryCTA>
              </>
            )}
          </motion.div>

          {/* Capability strip — real features of the app */}
          <motion.div variants={item} className="mt-14 sm:mt-16 w-full max-w-4xl">
            <div className="flex items-center justify-center gap-3 mb-5">
              <span className="h-px w-10 bg-white/10" />
              <span className="text-[10px] font-medium tracking-[0.22em] uppercase text-white/35">
                Inside the app
              </span>
              <span className="h-px w-10 bg-white/10" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 rounded-2xl border border-white/[0.06]
                            bg-white/[0.015] overflow-hidden divide-x divide-y sm:divide-y-0
                            divide-white/[0.05]">
              {[
                { k: 'Self-service', v: 'Apply & cancel leave' },
                { k: 'One-click',    v: 'Approve or reject' },
                { k: 'Live status',  v: 'Pending · approved' },
                { k: 'JWT + RBAC',   v: 'Two-role security' },
              ].map(({ k, v }) => (
                <div key={v} className="px-6 py-5 text-left">
                  <div className="text-white text-[18px] sm:text-[19px] font-semibold tracking-[-0.015em]">
                    {k}
                  </div>
                  <div className="mt-1.5 text-[10.5px] font-medium tracking-[0.18em] uppercase text-white/40">
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

/* ─── Section header ──────────────────────────────────────────────────────── */
const SectionHeader = ({ eyebrow, title, lead, color = 'copper' }) => (
  <div className="mb-16 sm:mb-20 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-end">
    <div className="md:col-span-4 flex flex-col gap-5">
      <Eyebrow color={color}>{eyebrow}</Eyebrow>
      {lead && (
        <p className="text-[14.5px] leading-[1.65] text-white/45 max-w-sm">{lead}</p>
      )}
    </div>
    <h2 className="md:col-span-8 text-[34px] sm:text-[44px] lg:text-[54px] leading-[1.02]
                   tracking-[-0.035em] font-semibold text-white text-balance">
      {title}
    </h2>
  </div>
);

/* ─── Icon chip ───────────────────────────────────────────────────────────── */
const IconChip = ({ icon: Icon }) => (
  <div className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl
                  border border-white/[0.09] bg-gradient-to-b from-white/[0.05] to-white/[0.015]
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
    <Icon size={17} className="text-white/90" strokeWidth={1.6} />
  </div>
);

/* ─── Feature card with spotlight ─────────────────────────────────────────── */
const FeatureCard = ({ id, className = '', delay = 0, children }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [m, setM] = useState({ x: -200, y: -200 });

  return (
    <motion.div
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 28, filter: 'blur(10px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.7, delay, ease: EASE }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setM({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      onMouseLeave={() => setM({ x: -200, y: -200 })}
      className={`group relative scroll-mt-28 rounded-2xl overflow-hidden
                  border border-white/[0.07] bg-gradient-to-b from-white/[0.035] to-white/[0.008]
                  transition-[border-color,transform] duration-500
                  hover:border-white/[0.14] hover:-translate-y-0.5 ${className}`}
    >
      {/* Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(420px circle at ${m.x}px ${m.y}px, rgba(232,146,85,0.10), transparent 55%)`,
        }}
      />
      {/* Top inner highlight */}
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="relative h-full p-7 sm:p-9 flex flex-col">{children}</div>
    </motion.div>
  );
};

/* ─── Features ────────────────────────────────────────────────────────────── */
const Features = () => (
  <section id="features" className="relative scroll-mt-24 py-32 sm:py-40 bg-[#1b1a17]">
    <div
      className="absolute inset-0 bg-grid-xfine opacity-50 pointer-events-none"
      style={{
        WebkitMaskImage:
          'radial-gradient(ellipse 75% 65% at 50% 40%, #000 25%, transparent 85%)',
        maskImage:
          'radial-gradient(ellipse 75% 65% at 50% 40%, #000 25%, transparent 85%)',
      }}
    />
    <div className="relative mx-auto max-w-[1180px] px-6">
      <SectionHeader
        eyebrow="Features"
        lead="A compact, opinionated toolkit. No clutter — just the workflows that move time-off operations forward, on the rhythm of modern teams."
        title={
          <>
            Built for the rhythm <br className="hidden sm:block" />
            of modern teams.
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 auto-rows-fr">
        {/* Big — Calendar */}
        <FeatureCard className="md:col-span-7 md:row-span-2 min-h-[480px]" delay={0}>
          <IconChip icon={Calendar} />
          <div className="mt-7">
            <h3 className="text-[22px] font-semibold tracking-[-0.015em] text-white">
              Synchronised team calendars
            </h3>
            <p className="mt-3 text-[14.5px] leading-[1.65] text-white/55 max-w-md">
              Eliminate scheduling conflicts with a unified view of team availability.
              Integrates with your existing enterprise calendaring workflow.
            </p>
          </div>
          <div className="mt-auto pt-9">
            <div className="relative rounded-xl overflow-hidden border border-white/[0.06] bg-black/30">
              <img
                alt=""
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-9hpx2NqMQwHRVIse5_ah80iUd9AsK3EolZNGY85BJCiEHpgOXpJaVzxK-MOlPldBIC9I6r1NFmKtHsyqrU5mE6n_SMeGxqOKp9DccWR_DTdPI3FIppt9QAFrbD7PNVY_bX8ErBnR-hkDVbte4sdzPnap1jXz9tdpWPFWDIkT-wblA802nLAShTsKXc2pit19CPyLisvZqjm8OSQvx-DX0ZUrLA0FQSHnIAW8ifQJU68I1L9dR4R4q2TkNnYQeWo9dvBjYRpzM4lQ"
                className="block w-full h-56 sm:h-64 object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1b1a17] via-[#1b1a17]/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 flex items-center justify-between">
                <div className="text-[11.5px] font-medium tracking-[0.16em] uppercase text-white/60">
                  Q3 — Engineering team
                </div>
                <div className="flex -space-x-2">
                  {['#6366f1', '#a78bfa', '#22d3ee', '#10b981'].map((c, i) => (
                    <span key={i} className="h-5 w-5 rounded-full border border-[#1b1a17]"
                          style={{ background: c }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FeatureCard>

        {/* Small — Approvals */}
        <FeatureCard className="md:col-span-5 min-h-[230px]" delay={0.08}>
          <IconChip icon={ClipboardCheck} />
          <div className="mt-7">
            <h3 className="text-[20px] font-semibold tracking-[-0.015em] text-white">
              Automated approvals
            </h3>
            <p className="mt-3 text-[14px] leading-[1.65] text-white/55 max-w-sm">
              Define routing logic. Auto-approve standard requests while flagging
              exceptions for managerial review.
            </p>
          </div>
        </FeatureCard>

        {/* Small — Analytics */}
        <FeatureCard className="md:col-span-5 min-h-[230px]" delay={0.16}>
          <IconChip icon={BarChart2} />
          <div className="mt-7">
            <h3 className="text-[20px] font-semibold tracking-[-0.015em] text-white">
              Compliance analytics
            </h3>
            <p className="mt-3 text-[14px] leading-[1.65] text-white/55 max-w-sm">
              Real-time reporting on accruals, utilisation rates, and statutory
              compliance across your organisation.
            </p>
          </div>
        </FeatureCard>

        {/* Wide — Security */}
        <FeatureCard id="security" className="md:col-span-12 min-h-[280px]" delay={0.24}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center h-full">
            <div>
              <IconChip icon={ShieldCheck} />
              <h3 className="mt-7 text-[22px] font-semibold tracking-[-0.015em] text-white">
                Enterprise-grade security
              </h3>
              <p className="mt-3 text-[14.5px] leading-[1.65] text-white/55 max-w-md">
                Role-based access control and comprehensive audit logging ensure
                data integrity for every request — built on JWT and bcrypt from the ground up.
              </p>
              <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[12.5px] text-white/65">
                {['JWT authentication', 'RBAC permissions', 'Immutable audit log', 'Encrypted at rest'].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check size={12} className="text-[#e89255]" strokeWidth={2.4} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative rounded-xl overflow-hidden border border-white/[0.06] bg-black/30">
              <img
                alt=""
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDa13zUZZJiJSkhvc3awm0dAPiNlsmgu5kTemqwviDRRgYALn7a8var2Y-pzUQYgqgh45nzoUZy3iLlH0vn1gC_AlfVSD80yJ_dmny7VdjJs-8UKBIjQKar5spQGtBlrxpgSYqmwxNLtZaaA6WcCQ8kzNr92OVHG9tnh7rNQ1u9ywGG_g_8Y9S7mAPjeFQnSMygTfVzNSG7upTp7O3EFq6AzRDfKSLLeI_Yv8kaH0OScuKTzSVUZayWGKrhWDp9QoQ_nI7Eu4QeKS-w"
                className="block w-full h-64 object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#1b1a17]/60 via-transparent to-transparent" />
            </div>
          </div>
        </FeatureCard>
      </div>
    </div>
  </section>
);

/* ─── Quiet Authority split ───────────────────────────────────────────────── */
const QuietAuthority = () => (
  <section
    id="how-it-works"
    className="relative scroll-mt-24 py-32 sm:py-40 border-y border-white/[0.05] bg-[#23211d]"
  >
    <div
      className="absolute inset-0 bg-dots-fine opacity-30 pointer-events-none"
      style={{
        WebkitMaskImage: 'linear-gradient(to bottom, #000, transparent 90%)',
        maskImage: 'linear-gradient(to bottom, #000, transparent 90%)',
      }}
    />

    <div className="relative mx-auto max-w-[1180px] px-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.75, ease: EASE }}
          className="md:col-span-6"
        >
          <Eyebrow>The philosophy</Eyebrow>
          <h2 className="mt-6 text-[36px] sm:text-[48px] lg:text-[56px] leading-[1.0]
                         tracking-[-0.035em] font-semibold text-white text-balance">
            Designed for{' '}
            <span className="inline-block font-light italic pr-[0.15em] bg-gradient-to-r from-white via-white/85 to-white/45 bg-clip-text text-transparent">
              quiet authority.
            </span>
          </h2>
          <p className="mt-7 max-w-md text-[15px] leading-[1.7] text-white/55">
            We reject cluttered interfaces and arbitrary notifications. Auren is
            architected to provide exactly what you need, precisely when you need it
            — and nothing more. The result is a calm, focused workspace that respects
            your time.
          </p>

          <ul className="mt-10 space-y-5">
            {[
              { t: 'Zero-friction request flows',     d: 'Submit a request in under fifteen seconds.' },
              { t: 'Context-aware approval routing', d: 'The right manager, every time, with a full audit trail.' },
              { t: 'Immutable audit trails',         d: 'Every state change is signed, timestamped, and queryable.' },
            ].map(({ t, d }, i) => (
              <motion.li
                key={t}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.45, delay: 0.1 + i * 0.08, ease: EASE }}
                className="flex gap-3.5"
              >
                <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-md
                                 border border-white/[0.1] bg-white/[0.04]">
                  <Check size={11} className="text-[#e89255]" strokeWidth={2.4} />
                </span>
                <div>
                  <div className="text-[14.5px] font-medium text-white">{t}</div>
                  <div className="mt-0.5 text-[13px] text-white/45">{d}</div>
                </div>
              </motion.li>
            ))}
          </ul>

          <div className="mt-12">
            <PrimaryCTA to="/register">Start for free</PrimaryCTA>
          </div>
        </motion.div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, x: 28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.75, ease: EASE }}
          className="md:col-span-6 relative"
        >
          {/* Soft halo */}
          <div className="absolute -inset-10 rounded-[40px]
                          bg-[radial-gradient(ellipse_at_center,rgba(232,146,85,0.20),transparent_60%)]
                          blur-2xl pointer-events-none animate-glow-pulse" />

          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08]
                          bg-white/[0.02] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]">
            <img
              alt="Modern enterprise interior"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6UI_WZuJkgub24cqLvVXslNaTLWCAbhjQAjBWkhOZkqHJFBPlIB8OYQyEnp5IJk5_Ktj_6RSB-n4ZbyWGzbUxTXNv8psg7hWGwxXUnn2samL6zpYVq3sFtwGtzvYK4c6KB2jfDuhdL1aDH-c8CysNka-TrssNBJXGxdbAvZkh06o9Vt6JeEjE713biKxHsOi1wIva5-7cEN_HO7qmvLc1r-dhtk3iA_cPrfzpdnw1TIRHQNF0edrNfTwnJCxMqQMtsC96NPAcatAk"
              className="block w-full h-[460px] sm:h-[540px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1b1a17]/85 via-[#1b1a17]/10 to-transparent" />

            {/* Floating approval chip */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
              className="absolute bottom-6 left-6 right-6 flex items-center gap-3 rounded-xl
                         border border-white/[0.1] bg-[#23211d]/85 backdrop-blur-md p-3.5
                         shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)]"
            >
              <div className="grid place-items-center h-9 w-9 rounded-lg
                              bg-emerald-400/15 border border-emerald-400/25">
                <Check size={15} className="text-emerald-300" strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-white truncate">
                  Sarah — Annual leave approved
                </div>
                <div className="text-[11.5px] text-white/40 mt-0.5">
                  Auto-routed · 2s · Q3 calendar synced
                </div>
              </div>
              <ArrowUpRight size={14} className="text-white/40" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

/* ─── CTA banner ──────────────────────────────────────────────────────────── */
const CTABanner = () => (
  <section id="pricing" className="relative scroll-mt-24 py-28 sm:py-36 overflow-hidden">
    <div className="absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-[#1b1a17]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[960px] h-[520px] rounded-full
                      bg-[radial-gradient(ellipse_at_center,rgba(232,146,85,0.22),transparent_60%)]
                      blur-2xl animate-glow-pulse pointer-events-none" />
      <div
        className="absolute inset-0 bg-grid-xfine opacity-40 pointer-events-none"
        style={{
          WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 20%, transparent 85%)',
          maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 20%, transparent 85%)',
        }}
      />
      <div className="absolute inset-0 noise-bg opacity-[0.04] mix-blend-overlay pointer-events-none" />
    </div>

    <div className="relative mx-auto max-w-[860px] px-6 text-center">
      <Eyebrow color="emerald">Get started</Eyebrow>
      <motion.h2
        initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: EASE }}
        className="mt-7 text-[42px] sm:text-[60px] lg:text-[68px] leading-[1.0]
                   tracking-[-0.04em] font-semibold text-white text-balance"
      >
        Ready to restore{' '}
        <span className="inline-block font-light italic pr-[0.15em] bg-gradient-to-r from-white via-white/85 to-[#f6d9b8] bg-clip-text text-transparent">
          focus?
        </span>
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
        className="mt-6 mx-auto max-w-lg text-[15.5px] leading-[1.7] text-white/55"
      >
        Deploy Auren across your organisation in minutes. Free for teams under twenty
        — start managing time with intent.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55, delay: 0.18, ease: EASE }}
        className="mt-10 flex flex-wrap gap-3 justify-center"
      >
        <PrimaryCTA to="/register">Get started free</PrimaryCTA>
        <SecondaryCTA to="/login">Sign in</SecondaryCTA>
      </motion.div>
    </div>
  </section>
);

/* ─── Footer ──────────────────────────────────────────────────────────────── */
const Footer = () => (
  <footer className="relative border-t border-white/[0.06] bg-[#1b1a17]">
    <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/[0.18] to-transparent" />

    <div className="mx-auto max-w-[1180px] px-6 py-16">
      <div className="grid grid-cols-2 md:grid-cols-12 gap-10">
        <div className="col-span-2 md:col-span-5">
          <Wordmark />
          <p className="mt-5 max-w-xs text-[13.5px] leading-[1.7] text-white/45">
            A high-performance leave management suite designed for quiet authority
            and absolute clarity.
          </p>
        </div>

        <div className="md:col-span-2">
          <div className="text-[10.5px] font-medium tracking-[0.18em] uppercase text-white/35 mb-5">
            Product
          </div>
          <ul className="space-y-3 text-[13.5px]">
            <li><a href="#features"     className="text-white/65 hover:text-white transition-colors">Features</a></li>
            <li><a href="#how-it-works" className="text-white/65 hover:text-white transition-colors">How it works</a></li>
            <li><a href="#security"     className="text-white/65 hover:text-white transition-colors">Security</a></li>
            <li><a href="#pricing"      className="text-white/65 hover:text-white transition-colors">Pricing</a></li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <div className="text-[10.5px] font-medium tracking-[0.18em] uppercase text-white/35 mb-5">
            Account
          </div>
          <ul className="space-y-3 text-[13.5px]">
            <li><Link to="/login"    className="text-white/65 hover:text-white transition-colors">Sign in</Link></li>
            <li><Link to="/register" className="text-white/65 hover:text-white transition-colors">Get started</Link></li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <div className="text-[10.5px] font-medium tracking-[0.18em] uppercase text-white/35 mb-5">
            Status
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08]
                          bg-white/[0.025] px-3 py-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[12px] font-medium text-white/70">All systems operational</span>
          </div>
        </div>
      </div>

      <div className="mt-14 pt-7 border-t border-white/[0.05] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-[12px] text-white/40">
          &copy; {new Date().getFullYear()} Auren. All rights reserved.
        </div>
        <div className="flex items-center gap-4 text-[12px] text-white/45">
          <a href="https://github.com/ArfanCodes/Employee-management" target="_blank" rel="noreferrer"
             className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
            <GithubMark size={12} /> GitHub
          </a>
          <span className="h-3 w-px bg-white/10" />
          <span>Made for modern teams</span>
        </div>
      </div>
    </div>
  </footer>
);

/* ─── Page ────────────────────────────────────────────────────────────────── */
const Home = () => {
  const { user } = useAuth();
  const dashHref = user?.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <div className="min-h-screen bg-[#1b1a17] text-white font-sans antialiased overflow-x-hidden
                    selection:bg-[#b15a1c]/25 selection:text-white">
      <NavBar user={user} dashHref={dashHref} />
      <main>
        <Hero user={user} dashHref={dashHref} />
        <Features />
        <QuietAuthority />
        {!user && <CTABanner />}
      </main>
      <Footer />
    </div>
  );
};

export default Home;
