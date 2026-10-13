import express from 'express';
import { ItemController } from '../controllers/items';
import { optionalAuth, requireAuth, requireVerified } from '../middleware/auth';

const router = express.Router();
const itemController = new ItemController();

// GET /items — public browse; optional auth reveals the caller's own drafts
router.get('/', optionalAuth, itemController.getItems);

// GET /items/:id — public
router.get('/:id', itemController.getItemById);

// GET /items/:id/availability — public
router.get('/:id/availability', itemController.getAvailability);

// POST /items — verified owners only; ownerId is taken from the token
router.post('/', requireAuth, requireVerified, itemController.createItem);

// PATCH /items/:id — owner (or admin) only
router.patch('/:id', requireAuth, requireVerified, itemController.updateItem);

// DELETE /items/:id — owner (or admin) only
router.delete('/:id', requireAuth, requireVerified, itemController.deleteItem);

export default router;
