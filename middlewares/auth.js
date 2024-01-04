const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async(req, res, next)=>{
    console.log(`Req.cookies: ${req.cookies}`);

    const token = req.cookies.token||req.body.token||req.header('Authorization').replace('Bearer ',"");
    // const token = req.header('Authorization').replace('Bearer ',"");
    if(!token){
        return res.status(403).send('Token is missing');
    }
    console.log(`Token: ${token}`);
    try {
        const decode =await jwt.verify(token, process.env.SECRET_KEY);
        console.log(`decode: ${decode}`);
        if(decode){
            req.user = decode;
            next(); 
        }else
            res.status(400).json({
                error:"token verification authentication failed"
            });
    } catch (error) {
        return res.status(400).json({error});
    }
}

module.exports = auth;