import express from 'express'
const router = express.Router();
import { postProduct, putProduct, getProductById, getAllProducts, putState } from '../controllers/product.js';
import { validateFields } from '../middlewares/validateFields.js';
import { productValidations } from '../middlewares/validations.js';


router.post('/',[
    productValidations,
    validateFields
], postProduct)

router.put('/:id',[
    productValidations,
    validateFields
], putProduct);

router.get('/:id', getProductById);

router.get('/', getAllProducts);

router.put('/state/:id', putState)



export default router