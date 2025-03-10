import Router from "router";
const router = Router();
import {postUsers, putUser, getUsers, putState, getUser} from '../controllers/users.js';


//record user
router.post("/",postUsers);


//update user
router.put("/:id",putUser)

//find user
router.get("/user/:id",getUser)

//all users
router.get("/users",getUsers)

//update status
router.put("/state/:id", putState)

export default router
