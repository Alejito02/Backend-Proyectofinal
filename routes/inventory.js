import express from 'express'
import { postInventory, putInventory, getInventoryByType, getAllInventory } from '../controllers/inventory.js';
const router = express.Router()

router.post('/movements',postInventory);

router.put('/movements/:id', putInventory);

router.get('/movements', getInventoryByType)

router.get('/movements' , getAllInventory)



export default router