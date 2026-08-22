import { Router } from 'express';
import { getExternalQuote } from '../controllers/externalController.js';

const router = Router();

// Endpoint GET para consumir la API externa
router.get('/quote', getExternalQuote);
router.get('/', getExternalQuote);

export default router;
