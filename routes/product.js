import express from 'express'
const router = express.Router();
import { postProduct, putProduct, getProductById, getAllProducts, putState } from '../controllers/product.js';
import { validateFields } from '../middlewares/validateFields.js';
import { productValidations } from '../middlewares/validations.js';
import { validateToken } from "../middlewares/validateToken.js";



router.post('/',[
    validateToken,
    productValidations,
    validateFields
], postProduct)

router.put('/:id',[
    validateToken,
], putProduct);

router.get('/:id',[
    validateToken
], getProductById);

router.get('/',[
    validateToken
], getAllProducts);

router.put('/state/:id',[
    validateToken
], putState)



export default router