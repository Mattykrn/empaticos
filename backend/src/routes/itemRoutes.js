import { Router } from 'express';
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
} from '../controllers/itemController.js';
import {
  createItemValidator,
  updateItemValidator,
  itemIdValidator
} from '../validators/itemValidator.js';

const router = Router();

// GET /$1
router.get('/', getItems);

// GET /$1/:id
router.get('/:id', itemIdValidator, getItemById);

// POST /$1
router.post('/', createItemValidator, createItem);

// PUT /$1/:id
router.put('/:id', updateItemValidator, updateItem);

// DELETE /$1/:id
router.delete('/:id', itemIdValidator, deleteItem);

export default router;
