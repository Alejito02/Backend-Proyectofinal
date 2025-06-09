import express from "express";
import { getListarTodos, postCrear, putState  } from "../controllers/favorites.js";

const router = express.Router();

router.post('/create', postCrear);
router.get('/list/:userId', getListarTodos);
router.put('/state/:favoriteId', putState)

export default router;