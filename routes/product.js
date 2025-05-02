import express from 'express'
const router = express.Router();
import { postProduct, putProduct, getProductById, getAllProducts, putState } from '../controllers/product.js';


router.post('/', postProduct)

router.put('/:id', putProduct);

router.get('/:id', getProductById);

router.get('/', getAllProducts);

router.put('/state/:id', putState)



export default router