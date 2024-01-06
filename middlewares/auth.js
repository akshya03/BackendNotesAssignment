const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async(req, res, next)=>{
    try {
        const token = req.cookies && req.cookies.token||req.body.token||req.header('Authorization')&& req.header('Authorization').replace('Bearer ',"");
        // const token = req.header('Authorization').replace('Bearer ',"");
        if(!token){
            throw new Error(`Login token is missing`);
        }

        const decode = await jwt.verify(token, process.env.SECRET_KEY);
        if(decode){
            req.user = decode;
            next(); 
        }else
            throw new Error(`Log in token authentication failed`);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "error occurred in login token authentication",
            error
        });
    }
}

module.exports = auth;