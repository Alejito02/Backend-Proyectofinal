import expres from 'express'
const router = expres.Router();
import { postOrders, putOrders, getOrderById, getAllOrders, putState} from "../controllers/orders.js";
import { orderValidations } from '../middlewares/validations.js';
import { validateFields } from '../middlewares/validateFields.js';


router.post ("/",[
    orderValidations,
    validateFields
], postOrders);

router.put("/:id",[
    orderValidations,
    validateFields
], putOrders);

router.get("/:id", getOrderById);

router.get("/", getAllOrders);

router.put('/state/:id', putState)

export default router