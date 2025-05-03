import express from 'express'
import { postInventory, putInventory, getInventoryByType, getAllInventory } from '../controllers/inventory.js';
import { inventoryValidations } from '../middlewares/validations.js';
import { validateFields } from '../middlewares/validateFields.js';
import { validateToken } from '../middlewares/validateToken.js';
const router = express.Router()


router.post('/',[
    validateToken,
    inventoryValidations,
    validateFields
],postInventory);

router.put('/:id',[
    validateToken,
], putInventory);

router.get('/movements',[
    validateToken
], getInventoryByType)

router.get('/' , getAllInventory)



export default router