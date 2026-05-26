import React from 'react';
import type { PriorityType } from '../types/ticket';
import { PRIORITY_LABELS } from '../types/ticket';

interface FilterBarProps {
  priorityFilter?: PriorityType;
  breachedFilter?: boolean;
  onPriorityChange: (priority?: PriorityType) => void;
  onBreachedChange: (breached?: boolean) => void;
  onCreateClick: () => void;
}

export function FilterBar({
  priorityFilter,
  breachedFilter,
  onPriorityChange,
  onBreachedChange,
  onCreateClick,
}: FilterBarProps) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]"
      id="filter-bar"
    >
      <div className="flex items-center gap-4 flex-wrap">
        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="priority-filter"
            className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]"
          >
            Priority
          </label>
          <select
            id="priority-filter"
            value={priorityFilter || ''}
            onChange={(e) =>
              onPriorityChange(
                e.target.value ? (e.target.value as PriorityType) : undefined
              )
            }
            className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] text-sm outline-none focus:border-[var(--color-accent)] transition-colors cursor-pointer"
          >
            <option value="">All</option>
            {(['urgent', 'high', 'medium', 'low'] as PriorityType[]).map(
              (p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              )
            )}
          </select>
        </div>

        {/* Breached Toggle */}
        <button
          id="breached-toggle"
          onClick={() => onBreachedChange(!breachedFilter ? true : undefined)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer ${
            breachedFilter
              ? 'border-[var(--color-error)] bg-[var(--color-error-bg)] text-[var(--color-error)]'
              : 'border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-light)]'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${breachedFilter ? 'bg-[var(--color-error)]' : 'bg-[var(--color-text-secondary)]'}`} />
          SLA Breached Only
        </button>
      </div>

      {/* Create Ticket Button */}
      <button
        id="create-ticket-btn"
        onClick={onCreateClick}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, var(--color-accent), #8b5cf6)',
          boxShadow: '0 4px 15px var(--color-accent-glow)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        New Ticket
      </button>
    </div>
  );
}
