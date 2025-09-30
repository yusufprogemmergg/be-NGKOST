import express from 'express';
import {
  register,
  login,
  oauthcallback,
} from '../controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/callback', oauthcallback);



export default router;
