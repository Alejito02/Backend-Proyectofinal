import Router from "router";
const router = Router();
import {postUsers, putUser, getUsers, putState, getUser} from '../controllers/users.js';
import { userValidations } from "../middlewares/validations.js";
import { validateFields } from "../middlewares/validateFields.js";


//record user
router.post("/",[
    userValidations,
    validateFields
],postUsers);

//update user
router.put("/:id",[
    userValidations,
    validateFields
],putUser)

//find user
router.get("/user/:id",getUser)

//all users
router.get("/users",getUsers)

//update status
router.put("/state/:id", putState)

export default router
