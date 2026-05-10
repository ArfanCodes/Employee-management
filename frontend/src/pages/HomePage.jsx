import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Apply in Minutes',
    description:
      'Employees can submit leave requests with type, dates, and a reason — no paperwork, no email chains.',
  },
  {
    title: 'Real-Time Status',
    description:
      'Track every request from submission to decision. Know instantly when a leave is approved or rejected.',
  },
  {
    title: 'Centralized Admin Control',
    description:
      'Admins review all pending requests, approve or reject with a reason, and monitor the whole team from one dashboard.',
  },
];

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Top Nav ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-bold text-blue-700 tracking-tight">LeaveMS</span>
          <nav className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm bg-blue-700 text-white px-4 py-1.5 rounded hover:bg-blue-800 transition-colors font-medium"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <span className="inline-block text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full mb-5 uppercase tracking-wider">
          Staff Leave Management
        </span>

        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight max-w-2xl">
          Manage staff leave&nbsp;
          <span className="text-blue-700">with clarity</span>
        </h1>

        <p className="mt-5 text-gray-500 text-lg max-w-xl leading-relaxed">
          A single platform for employees to request leave and for administrators
          to review, approve, and track every request — no spreadsheets required.
        </p>

        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link
            to="/register"
            className="bg-blue-700 text-white px-6 py-2.5 rounded font-medium hover:bg-blue-800 transition-colors text-sm"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-t border-gray-100 px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-10">
            What&apos;s included
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {features.map(({ title, description }) => (
              <div
                key={title}
                className="bg-white border border-gray-200 rounded-lg p-6"
              >
                <div className="w-8 h-1 bg-blue-700 rounded mb-4" />
                <h3 className="text-gray-900 font-semibold text-base mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} LeaveMS. All rights reserved.
      </footer>
    </div>
  );
};

export default HomePage;
