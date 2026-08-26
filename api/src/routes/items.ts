import express from 'express';
import { ItemController } from '../controllers/items';

const router = express.Router();
const itemController = new ItemController();

// GET /items
router.get('/', itemController.getItems);

// GET /items/:id
router.get('/:id', itemController.getItemById);

// POST /items
router.post('/', itemController.createItem);

// PATCH /items/:id
router.patch('/:id', itemController.updateItem);

// DELETE /items/:id
router.delete('/:id', itemController.deleteItem);

// GET /items/:id/availability
router.get('/:id/availability', itemController.getAvailability);

export default router;
