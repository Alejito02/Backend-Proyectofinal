import Router from "router";
const router = Router();
import {postUsers} from '../controllers/users.js';
//registrar user

router.post("/",postUsers);






export default router
