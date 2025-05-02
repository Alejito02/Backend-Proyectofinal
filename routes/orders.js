import expres from 'express'
const router = expres.Router();
import { postOrders, putOrders, getOrderById, getAllOrders, putState} from "../controllers/orders.js";


router.post ("/", postOrders);

router.put("/:id", putOrders);

router.get("/:id", getOrderById);

router.get("/", getAllOrders);

router.put('/state/:id', putState)

export default router