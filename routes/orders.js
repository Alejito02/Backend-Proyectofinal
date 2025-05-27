import expres from 'express'
const router = expres.Router();
import { postOrders, putOrders, getOrderById, getAllOrders, putState, getConvertPesosToDollars} from "../controllers/orders.js";
import { orderValidations } from '../middlewares/validations.js';
import { validateFields } from '../middlewares/validateFields.js';
import { validateToken } from '../middlewares/validateToken.js';


router.post('/convertCurrency', getConvertPesosToDollars)


router.post ("/",[
    validateToken,
    orderValidations,
    validateFields
], postOrders);

router.put("/:id",[
    validateToken,
], putOrders);


router.get("/:id",[
    validateToken
], getOrderById);

router.get("/",[
    validateToken
], getAllOrders);

router.put('/state/:id',[
    validateToken
], putState)


export default router