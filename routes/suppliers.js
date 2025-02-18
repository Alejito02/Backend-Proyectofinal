import Router from "router"
const router = Router();
import { postSuppliers } from "../controllers/suppliers.js";

//registrar proovedores

router.post("/", postSuppliers)


export default router;