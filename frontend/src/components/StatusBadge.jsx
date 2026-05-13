const config = {
  pending: {
    pill:  'bg-amber-50/80 border-amber-200/45 text-amber-800',
    dot:   'bg-amber-500',
    label: 'Pending',
  },
  approved: {
    pill:  'bg-emerald-50/80 border-emerald-200/45 text-emerald-800',
    dot:   'bg-emerald-500',
    label: 'Approved',
  },
  rejected: {
    pill:  'bg-rose-50/80 border-rose-200/45 text-rose-800',
    dot:   'bg-rose-500',
    label: 'Rejected',
  },
  cancelled: {
    pill:  'bg-surface-container/70 border-outline-variant/35 text-on-surface-variant',
    dot:   'bg-on-surface-variant/40',
    label: 'Cancelled',
  },
};

const StatusBadge = ({ status }) => {
  const c = config[status] ?? config.cancelled;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-[3px] rounded-md
                  text-[11px] font-medium tracking-[-0.005em] border ${c.pill}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};

export default StatusBadge;
