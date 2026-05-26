import React from 'react';
import { TicketStats } from '../types/ticket';

interface StatsStripProps {
  stats: TicketStats | null;
  loading: boolean;
}

export function StatsStrip({ stats, loading }: StatsStripProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6" id="stats-strip">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-4 border border-[var(--color-border)] bg-[var(--color-bg-card)]"
            style={{
              background: 'linear-gradient(90deg, var(--color-bg-card) 25%, var(--color-bg-card-hover) 50%, var(--color-bg-card) 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          >
            <div className="h-4 w-16 rounded bg-[var(--color-border)] mb-2" />
            <div className="h-8 w-12 rounded bg-[var(--color-border)]" />
          </div>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      label: 'Total',
      value: stats.total,
      color: 'var(--color-accent)',
      bgColor: 'var(--color-accent-glow)',
    },
    {
      label: 'Open',
      value: stats.statusCounts.open,
      color: 'var(--color-status-open)',
      bgColor: 'var(--color-info-bg)',
    },
    {
      label: 'In Progress',
      value: stats.statusCounts.in_progress,
      color: 'var(--color-status-in-progress)',
      bgColor: 'var(--color-warning-bg)',
    },
    {
      label: 'Resolved',
      value: stats.statusCounts.resolved,
      color: 'var(--color-status-resolved)',
      bgColor: 'var(--color-success-bg)',
    },
    {
      label: 'Closed',
      value: stats.statusCounts.closed,
      color: 'var(--color-status-closed)',
      bgColor: '#78909c15',
    },
    {
      label: 'SLA Breached',
      value: stats.breachedCount,
      color: 'var(--color-error)',
      bgColor: 'var(--color-error-bg)',
      pulse: stats.breachedCount > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6" id="stats-strip">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="rounded-xl p-4 border border-[var(--color-border)] transition-all duration-200 hover:border-[var(--color-border-light)] hover:scale-[1.02]"
          style={{
            background: `linear-gradient(135deg, var(--color-bg-card) 0%, ${item.bgColor} 100%)`,
            animation: item.pulse ? 'pulse-glow 2s infinite' : undefined,
          }}
        >
          <p className="text-xs font-medium tracking-wider uppercase text-[var(--color-text-secondary)] mb-1">
            {item.label}
          </p>
          <p
            className="text-2xl font-bold"
            style={{ color: item.color }}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
