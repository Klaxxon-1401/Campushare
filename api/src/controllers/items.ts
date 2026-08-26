import { Request, Response } from 'express';
import { z } from 'zod';

// Validation schemas
const createItemSchema = z.object({
  title: z.string().min(1).max(120),
  category: z.enum(['academic', 'clothing', 'electronics', 'fitness', 'other']),
  description: z.string().min(1).max(2000),
  pricePerDay: z.number().positive().max(10000),
  deposit: z.number().positive().max(50000),
  location: z.string().min(1).max(120),
});

// Strict allowlist — ownerId, status, timestamps are NEVER client-settable
const updateItemSchema = z
  .object({
    title: z.string().min(1).max(120).optional(),
    category: z.enum(['academic', 'clothing', 'electronics', 'fitness', 'other']).optional(),
    description: z.string().min(1).max(2000).optional(),
    pricePerDay: z.number().positive().max(10000).optional(),
    deposit: z.number().positive().max(50000).optional(),
    location: z.string().min(1).max(120).optional(),
  })
  .strict(); // reject unknown keys outright

export class ItemController {
  async getItems(req: Request, res: Response) {
    try {
      const { q, category, location, page = 1, limit = 20 } = req.query;
      
      // TODO: Implement Firestore query
      
      // Mock response
      res.json({
        items: [
          {
            id: '1',
            title: 'Chemistry Lab Coat (Size M)',
            category: 'academic',
            pricePerDay: 3,
            deposit: 10,
            location: 'North Campus',
            status: 'published',
          },
        ],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: 1,
          pages: 1,
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getItemById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // TODO: Implement Firestore get
      
      // Mock response
      res.json({
        item: {
          id,
          title: 'Chemistry Lab Coat (Size M)',
          category: 'academic',
          description: 'Lab coat used for chemistry labs. Good condition.',
          pricePerDay: 3,
          deposit: 10,
          location: 'North Campus',
          status: 'published',
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createItem(req: Request, res: Response) {
    try {
      const body = createItemSchema.parse(req.body);
      
      // TODO: Implement Firestore create
      
      res.status(201).json({
        message: 'Item created successfully',
        item: {
          id: 'new-item-id',
          ...body,
          status: 'draft',
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.issues });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateItem(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // TODO: verify req.user owns this item before applying update
      const body = updateItemSchema.parse(req.body);

      // TODO: Implement Firestore update (write only validated fields)

      res.json({
        message: 'Item updated successfully',
        item: {
          id,
          ...body,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.issues });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // TODO: Implement Firestore delete
      
      res.json({
        message: 'Item deleted successfully',
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAvailability(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { month, year } = req.query;
      
      // TODO: Implement Firestore query for availability
      
      res.json({
        availability: [
          { date: '2026-01-15', state: 'open' },
          { date: '2026-01-16', state: 'booked' },
          { date: '2026-01-17', state: 'open' },
        ],
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
