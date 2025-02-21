import  Router  from "router";
import { postorders } from "../controllers/orders";


const router = Router()
router.post ("/",postorders);

export default router