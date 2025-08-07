import express from 'express';
import passport from 'passport';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);

router.post('/login', passport.authenticate('local'), loginUser);

router.get('/logout', logoutUser);

router.get('/user', getCurrentUser);

export default router;
