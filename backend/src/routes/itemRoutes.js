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

// GET /api/items -> Obtener todos los registros
router.get('/', getItems);

// GET /api/items/:id -> Obtener registro por ID validando formato MongoID
router.get('/:id', itemIdValidator, getItemById);

// POST /api/items -> Crear nuevo registro aplicando validaciones de express-validator
router.post('/', createItemValidator, createItem);

// PUT /api/items/:id -> Actualizar registro por ID aplicando validaciones
router.put('/:id', updateItemValidator, updateItem);

// DELETE /api/items/:id -> Eliminar registro por ID validando formato MongoID
router.delete('/:id', itemIdValidator, deleteItem);

export default router;
