import express from 'express';
import {
  register,
  login,
  oauthcallback,
  getMe,
  upgradeRoleToOwner
} from '../controllers/authController';
import { verifyToken} from '../middleware/authmiddleware';


const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/callback', oauthcallback);
router.get('/me',verifyToken, getMe);
router.post('/register-owner',verifyToken, upgradeRoleToOwner);



export default router;
