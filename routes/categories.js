import express from 'express'
const router = express.Router();
import { categoryValidations } from '../middlewares/validations.js';
import { validateFields } from '../middlewares/validateFields.js';
import { postCategories, putCategories, getCategoryById, getAllCategories, putState } from "../controllers/categories.js";
import { validateToken } from "../middlewares/validateToken.js";



router.post("/",[
    validateToken,
    categoryValidations,
    validateFields
], postCategories);

router.put("/:id",[
    validateToken,
], putCategories);

router.get("/:id",[
    validateToken
], getCategoryById);

router.get("/", getAllCategories);

router.put("/state/:id",[
    validateToken
], putState);

export default router