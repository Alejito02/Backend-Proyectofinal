import  Router  from "express";
const router = Router();
import { postCategorias } from "../controllers/categories.js";


router.post("/", postCategorias)




export default router