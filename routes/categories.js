import express from 'express'
const router = express.Router();
import { categoryValidations } from '../middlewares/validations.js';
import { validateFields } from '../middlewares/validateFields.js';
import { postCategories, putCategories, getCategoryById, getAllCategories, putState } from "../controllers/categories.js";


router.post("/",[
    categoryValidations,
    validateFields
], postCategories);

router.put("/:id",[
    categoryValidations,
    validateFields
], putCategories);

router.get("/:id", getCategoryById);

router.get("/", getAllCategories);

router.put("/state/:id", putState);

export default router