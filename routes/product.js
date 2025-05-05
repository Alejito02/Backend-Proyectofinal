import express from 'express'
const router = express.Router();
import { postProduct, putProduct, getProductById, getAllProducts, putState } from '../controllers/product.js';
import { validateFields } from '../middlewares/validateFields.js';
import { productValidations } from '../middlewares/validations.js';
import { validateToken } from "../middlewares/validateToken.js";
import { storage } from '../services/cloudinary.js';
import multer from 'multer';
import { parseFormData } from '../middlewares/parseFormData.js';

const upload = multer({storage})

router.post('/',[
    validateToken,
    upload.array('images',10),
    parseFormData,
    productValidations,
    validateFields,
], postProduct)

router.put('/:id',[
    validateToken,
], putProduct);

router.get('/:id',[
    validateToken
], getProductById);

router.get('/',[
], getAllProducts);

router.put('/state/:id',[
    validateToken
], putState)



export default router