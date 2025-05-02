import express from 'express'
import { postInventory, putInventory, getInventoryByType, getAllInventory } from '../controllers/inventory.js';
import { inventoryValidations } from '../middlewares/validations.js';
import { validateFields } from '../middlewares/validateFields.js';
const router = express.Router()


router.post('/movements',[
    inventoryValidations,
    validateFields
],postInventory);

router.put('/movements/:id',[
    inventoryValidations,
    validateFields
], putInventory);

router.get('/movements', getInventoryByType)

router.get('/movements' , getAllInventory)



export default router