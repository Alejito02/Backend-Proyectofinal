import jwt from 'jsonwebtoken';
import { usersModel } from '../models/users.js';
const generateJwt = (userID) => {
    const payload = {userID}
    return jwt.sign(payload,process.env.SECRETORPRIVATEKEY,{expiresIn:'24h'})
}


const validateToken = async (req, res, next)=>{
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(' ')[1];
    if(!token){
        return res.status(401).json({
            msg: "Request without Token"
        })
    }
    try {
        const {userID} = jwt.verify(token, process.env.SECRETORPRIVATEKEY)
        let user = await usersModel.findById(userID);
        if(!user){
            throw new Error ("invalid token")
        }
        next()

    } catch (error) {
        res.status(401).json({
            msg:error.message
        })
        console.log(error);
    }
}

export {generateJwt,validateToken}