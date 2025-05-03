import express from 'express'
import { validateToken } from '../middlewares/validateToken.js';
const router = express.Router();

import { sendEmail } from '../services/sendEmail.js';

router.post("/",[
    validateToken
], sendEmail);

export default router