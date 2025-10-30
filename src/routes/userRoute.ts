import express from 'express';
import {
  register,
  login,
  oauthRegister,
  oauthLogin,
  getMe,
  upgradeRoleToOwner
} from '../controllers/authController';
import { verifyToken} from '../middleware/authmiddleware';


const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post("/oauth/register", oauthRegister);
router.post("/oauth/login", oauthLogin);
router.get('/me',verifyToken, getMe);
router.put("/register-owner", verifyToken, upgradeRoleToOwner);



export default router;
