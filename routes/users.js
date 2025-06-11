import Router from "router";
const router = Router();
import {login, postUsers, putUser, getUsers, putState, getUser, updatePassword,checkPhoneNumberExistence} from '../controllers/users.js';
import { userValidations } from "../middlewares/validations.js";
import { validateFields } from "../middlewares/validateFields.js";
import { validateToken } from "../middlewares/validateToken.js";


router.post("/login",login)

router.post("/",[
    userValidations,
    validateFields
],postUsers);

router.put("/password", updatePassword)

router.put("/:id",[
    validateToken,
],putUser)

router.get("/check-phone/:phone",checkPhoneNumberExistence)

router.get("/:id",[
    validateToken
],getUser)

router.get("/",[
    validateToken
],getUsers)

router.put("/state/:id",[
    validateToken
], putState)

export default router
