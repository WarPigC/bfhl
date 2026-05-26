import { Router, Request, Response } from 'express';
import { Ticket, ITicket } from '../models/Ticket';
import { computeDerivedFields, SLA_THRESHOLDS } from '../utils/sla';
import { isValidTransition, getTransitionError } from '../utils/transitions';

const router = Router();

// Helper: Add derived fields to a ticket document
function enrichTicket(ticket: ITicket) {
  const doc = ticket.toObject();
  const derived = computeDerivedFields({
    createdAt: doc.createdAt,
    resolvedAt: doc.resolvedAt,
    status: doc.status,
    priority: doc.priority,
  });
  return { ...doc, ...derived };
}

/**
 * POST /tickets - Create a new ticket
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject, description, customerEmail, priority } = req.body;

    const ticket = new Ticket({
      subject,
      description,
      customerEmail,
      priority,
    });

    await ticket.save();
    res.status(201).json(enrichTicket(ticket));
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      const errors: Record<string, string> = {};
      for (const field in err.errors) {
        errors[field] = err.errors[field].message;
      }
      res.status(400).json({ error: 'Validation failed', details: errors });
      return;
    }
    console.error('Error creating ticket:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /tickets/stats - Aggregate counts per status, per priority, and total breached
 * NOTE: This route must be defined BEFORE /tickets/:id to avoid route conflicts
 */
router.get('/stats', async (_req: Request, res: Response): Promise<void> => {
  try {
    const tickets = await Ticket.find();

    // Counts per status
    const statusCounts: Record<string, number> = {
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
    };

    // Counts per priority
    const priorityCounts: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };

    let breachedCount = 0;

    tickets.forEach((ticket) => {
      statusCounts[ticket.status] = (statusCounts[ticket.status] || 0) + 1;
      priorityCounts[ticket.priority] =
        (priorityCounts[ticket.priority] || 0) + 1;

      const derived = computeDerivedFields({
        createdAt: ticket.createdAt,
        resolvedAt: ticket.resolvedAt,
        status: ticket.status,
        priority: ticket.priority,
      });

      if (derived.slaBreached) {
        breachedCount++;
      }
    });

    res.json({
      total: tickets.length,
      statusCounts,
      priorityCounts,
      breachedCount,
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /tickets - List tickets with optional filters
 * Query params: ?status=open&priority=high&breached=true (combinable)
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, priority, breached } = req.query;

    // Build MongoDB query filter
    const filter: Record<string, any> = {};
    if (status && typeof status === 'string') {
      filter.status = status;
    }
    if (priority && typeof priority === 'string') {
      filter.priority = priority;
    }

    const tickets = await Ticket.find(filter).sort({ createdAt: -1 });

    let enrichedTickets = tickets.map(enrichTicket);

    // Apply breached filter (computed field, must filter in app layer)
    if (breached === 'true') {
      enrichedTickets = enrichedTickets.filter((t) => t.slaBreached);
    }

    res.json(enrichedTickets);
  } catch (err) {
    console.error('Error fetching tickets:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /tickets/:id - Update ticket status
 */
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status: newStatus } = req.body;

    if (!newStatus) {
      res.status(400).json({ error: 'Status is required' });
      return;
    }

    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(newStatus)) {
      res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
      return;
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    // Validate transition
    if (!isValidTransition(ticket.status, newStatus)) {
      res.status(400).json({
        error: getTransitionError(ticket.status, newStatus),
      });
      return;
    }

    // Handle resolvedAt
    const oldStatus = ticket.status;
    ticket.status = newStatus;

    if (newStatus === 'resolved') {
      // Moving to resolved: set resolvedAt
      ticket.resolvedAt = new Date();
    } else if (oldStatus === 'resolved' && newStatus !== 'closed') {
      // Moving BACK from resolved (not forward to closed): clear resolvedAt
      ticket.resolvedAt = null;
    }

    await ticket.save();
    res.json(enrichTicket(ticket));
  } catch (err: any) {
    if (err.name === 'CastError') {
      res.status(400).json({ error: 'Invalid ticket ID format' });
      return;
    }
    console.error('Error updating ticket:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /tickets/:id - Delete a ticket
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByIdAndDelete(id);

    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    res.json({ message: 'Ticket deleted successfully', id });
  } catch (err: any) {
    if (err.name === 'CastError') {
      res.status(400).json({ error: 'Invalid ticket ID format' });
      return;
    }
    console.error('Error deleting ticket:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
