const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const auth = require('../middlewares/auth');

const router = new express.Router();

router.post('/api/auth/signup', async(req, res)=>{
    try {
        console.log('In signup route');
        const {username, email, password} = req.body;
    
        if(!(username && email && password))
            res.status(400).send('All fields are required');
        
        const existingUser = await User.findOne({email: email});
        if(existingUser){
            // console.log(`email:${email} already exists`);
            res.status(401).send('User already exists');
            throw new Error(`email:${email} already exists`);
        }
    
        const myEncPassword = await bcrypt.hash(password, 10);
    
        const user = await User.create({
            username,
            email: email.toLowerCase(),
            password: myEncPassword
        });
    
        const token = user.getAuthToken();
        user.token = token;
    
        user.password = undefined;
    
        // res.status(201).json(user).send('Account created successfully');
        // res.status(200).json({
        //     message: 'Account created successfully',
        //     success: true,
        //     user: user
        // });
        const options = {
            expires: new Date(Date.now()+2*24*60*60*1000),
            httpOnly: true
        }

        res.status(200).cookie('token', token, options).json({
            success: true,
            // token,
            user
        });
    } catch (error) {
        console.log('In signup catch block');
        console.log(error);
    }
});


router.post('api/auth/login', async(req, res)=>{
    try {
	const {email, password} = req.body;
	    
	    if(!(email && password)){
            res.status(400).send("Either email or password is not entered");
            throw new Error(`Either email or password is not entered`);
        }
	        
	    const user = await User.findOne({email});
	
	    if(user && (await bcrypt.compare(password, user.password))){
	        const token = user.getAuthToken();
	        user.token = token;
	        user.password = undefined;
	
	        const options = {
	            expires: new Date(Date.now()+2*24*60*60*1000),
	            httpOnly: true
	        }
	
	        res.status(200).cookie('token', token, options).json({
	            success: true,
	            token,
	            user
	        });
	    }else
	        res.status(400).json({
                "message": "Entered email or password is incorrect",
                "success": false
            });
} catch (error) {
	console.log(error);
    res.status(500).json({'message':'FAILED', error});
} 
});

router.get('/api/notes', auth, async(req, res)=>{
    const {user_id} = req.user;
    const {username, notes} = await User.findOne({_id: user_id});
    res.status(200).json({
        username: username,
        notes: notes
    });
});

router.post('/api/notes', auth, async(req, res)=>{
    try {
	    const {user_id} = req.user;
	    const userObj = await User.findOne({_id: user_id});
	    const note = req.body;
	    console.log(`notes text:${note}`)
	    userObj.notes.push(note);
	    userObj.save();
        res.status(201).send('Note saved successfully');
} catch (error) {
    console.log(error);
	res.status(401).send(error);
}
    
});

module.exports = router;