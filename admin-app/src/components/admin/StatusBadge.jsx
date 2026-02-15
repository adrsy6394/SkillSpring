'use client';

import { CheckCircle, Clock, XCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const configs = {
    pending: {
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      ring: 'ring-amber-500/20',
      icon: Clock,
      label: 'Pending'
    },
    approved: {
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      ring: 'ring-emerald-500/20',
      icon: CheckCircle,
      label: 'Approved'
    },
    rejected: {
      color: 'text-red-600',
      bg: 'bg-red-50',
      ring: 'ring-red-500/20',
      icon: XCircle,
      label: 'Rejected'
    },
    draft: {
      color: 'text-gray-600',
      bg: 'bg-gray-50',
      ring: 'ring-gray-500/20',
      icon: Clock,
      label: 'Draft'
    }
  };

  const config = configs[status] || configs.draft;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ring-1 ${config.bg} ${config.color} ${config.ring}`}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </span>
  );
}

