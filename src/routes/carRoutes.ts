import express from 'express';
import { getCars, postCar, getCar } from '../controllers/carController';
import { authenticate } from '../middleware/authmiddleware';

const router = express.Router();

router.get('/', authenticate, getCars);
router.post('/', authenticate, postCar);
router.get('/:id', authenticate, getCar);

export default router;