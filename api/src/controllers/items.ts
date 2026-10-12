import { Request, Response } from 'express';
import { z } from 'zod';
import { store } from '../data/store';
import { CATEGORIES, paramId } from '../validation';

export const createItemSchema = z
  .object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120),
    category: z.enum(CATEGORIES),
    description: z.string().trim().min(1, 'Description is required').max(2000),
    pricePerDay: z.number().positive('Price must be greater than 0').max(10000),
    deposit: z.number().min(0, 'Deposit cannot be negative').max(50000),
    location: z.string().trim().min(1, 'Location is required').max(120),
    conditionNote: z.string().trim().max(500).optional(),
    photos: z.array(z.string().url()).max(12).optional(),
  })
  .strict();

// Strict allowlist — ownerId, status, timestamps are NEVER client-settable.
export const updateItemSchema = z
  .object({
    title: z.string().trim().min(3).max(120).optional(),
    category: z.enum(CATEGORIES).optional(),
    description: z.string().trim().min(1).max(2000).optional(),
    pricePerDay: z.number().positive().max(10000).optional(),
    deposit: z.number().min(0).max(50000).optional(),
    location: z.string().trim().min(1).max(120).optional(),
    conditionNote: z.string().trim().max(500).optional(),
    photos: z.array(z.string().url()).max(12).optional(),
  })
  .strict();

const validators = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
};

export class ItemController {
  async getItems(req: Request, res: Response) {
    try {
      const page = validators.page.parse(req.query.page ?? 1);
      const limit = validators.limit.parse(req.query.limit ?? 20);
      const { items, pagination } = store.listItems({
        q: typeof req.query.q === 'string' ? req.query.q : undefined,
        category: typeof req.query.category === 'string' ? req.query.category : undefined,
        location: typeof req.query.location === 'string' ? req.query.location : undefined,
        ownerId: typeof req.query.ownerId === 'string' ? req.query.ownerId : undefined,
        includeDrafts: typeof req.query.includeDrafts === 'string' ? req.query.includeDrafts === 'true' : undefined,
        page,
        limit,
      });
      res.json({ items, pagination });
    } catch (error) {
      res.status(400).json({ error: 'Invalid query parameters' });
    }
  }

  async getItemById(req: Request, res: Response) {
    const item = store.findItem(paramId(req.params.id));
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ item });
  }

  async createItem(req: Request, res: Response) {
    try {
      const body = createItemSchema.parse(req.body);
      // TODO: auth middleware — ownerId comes from the verified JWT, never the body.
      const item = store.createItem(body, 'u_dev');
      res.status(201).json({ message: 'Item created as draft', item });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.issues });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateItem(req: Request, res: Response) {
    try {
      // TODO: verify req.user owns this item before applying the update.
      const body = updateItemSchema.parse(req.body);
      const item = store.updateItem(paramId(req.params.id), body);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json({ message: 'Item updated successfully', item });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.issues });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteItem(req: Request, res: Response) {
    // TODO: only owner or admin may delete.
    const deleted = store.deleteItem(paramId(req.params.id));
    if (!deleted) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  }

  async getAvailability(req: Request, res: Response) {
    const item = store.findItem(paramId(req.params.id));
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    const now = new Date();
    const year = Number(req.query.year ?? now.getFullYear());
    const month = Number(req.query.month ?? now.getMonth());
    const availability = store.getAvailability(item.id, Number.isFinite(year) && year >= 1970 ? year : now.getFullYear(), month);
    res.json({ availability });
  }
}