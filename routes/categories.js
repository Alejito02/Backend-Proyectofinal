import express from 'express'
const router = express.Router();
import { postCategories, putCategories, getCategoryById, getAllCategories, putState } from "../controllers/categories.js";


router.post("/", postCategories);

router.put("/:id", putCategories);

router.get("/:id", getCategoryById);

router.get("/", getAllCategories);

router.put("/state/:id", putState);

export default router