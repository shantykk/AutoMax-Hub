import express from 'express';
import { register, login, forgotPassword, resetPassword } from '../controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword); // Optional
router.post('/reset-password', resetPassword); // Optional

export default router;