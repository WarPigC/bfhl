import React, { useState } from 'react';
import { CreateTicketData, PriorityType, PRIORITY_LABELS, ApiError } from '../types/ticket';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTicketData) => Promise<void>;
}

export function CreateTicketModal({ isOpen, onClose, onSubmit }: CreateTicketModalProps) {
  const [formData, setFormData] = useState<CreateTicketData>({
    subject: '',
    description: '',
    customerEmail: '',
    priority: 'medium',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please provide a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({ subject: '', description: '', customerEmail: '', priority: 'medium' });
      setErrors({});
      onClose();
    } catch (err: any) {
      if (err.details) {
        setErrors(err.details);
      } else {
        setErrors({ _form: err.error || 'Failed to create ticket' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const priorityColors: Record<PriorityType, string> = {
    low: 'var(--color-priority-low)',
    medium: 'var(--color-priority-medium)',
    high: 'var(--color-priority-high)',
    urgent: 'var(--color-priority-urgent)',
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-bg-modal)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      id="create-ticket-modal"
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-2xl"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Create New Ticket</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)] transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors._form && (
            <div className="p-3 rounded-lg border border-[var(--color-error)] bg-[var(--color-error-bg)] text-[var(--color-error)] text-sm">
              {errors._form}
            </div>
          )}

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Brief summary of the issue"
              className={`w-full px-4 py-2.5 rounded-lg border bg-[var(--color-bg-card)] text-[var(--color-text-primary)] text-sm outline-none transition-colors placeholder:text-[var(--color-text-secondary)] ${
                errors.subject ? 'border-[var(--color-error)]' : 'border-[var(--color-border)] focus:border-[var(--color-accent)]'
              }`}
            />
            {errors.subject && (
              <p className="mt-1 text-xs text-[var(--color-error)]">{errors.subject}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of the issue"
              className={`w-full px-4 py-2.5 rounded-lg border bg-[var(--color-bg-card)] text-[var(--color-text-primary)] text-sm outline-none transition-colors resize-none placeholder:text-[var(--color-text-secondary)] ${
                errors.description ? 'border-[var(--color-error)]' : 'border-[var(--color-border)] focus:border-[var(--color-accent)]'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-[var(--color-error)]">{errors.description}</p>
            )}
          </div>

          {/* Customer Email */}
          <div>
            <label htmlFor="customerEmail" className="block text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
              Customer Email
            </label>
            <input
              id="customerEmail"
              name="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={handleChange}
              placeholder="customer@example.com"
              className={`w-full px-4 py-2.5 rounded-lg border bg-[var(--color-bg-card)] text-[var(--color-text-primary)] text-sm outline-none transition-colors placeholder:text-[var(--color-text-secondary)] ${
                errors.customerEmail ? 'border-[var(--color-error)]' : 'border-[var(--color-border)] focus:border-[var(--color-accent)]'
              }`}
            />
            {errors.customerEmail && (
              <p className="mt-1 text-xs text-[var(--color-error)]">{errors.customerEmail}</p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['low', 'medium', 'high', 'urgent'] as PriorityType[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, priority: p }))}
                  className={`px-3 py-2 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    formData.priority === p
                      ? 'scale-[1.03]'
                      : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-light)]'
                  }`}
                  style={
                    formData.priority === p
                      ? {
                          borderColor: priorityColors[p],
                          backgroundColor: `${priorityColors[p]}20`,
                          color: priorityColors[p],
                        }
                      : undefined
                  }
                >
                  {PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] text-sm font-medium hover:border-[var(--color-border-light)] hover:text-[var(--color-text-primary)] transition-all duration-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent), #8b5cf6)',
                boxShadow: '0 4px 15px var(--color-accent-glow)',
              }}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Ticket'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
