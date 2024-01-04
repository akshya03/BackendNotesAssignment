const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const auth = require('../middlewares/auth');
const Note = require('../models/note');

const router = new express.Router();

// 1. create a new user account
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

// 2. login to existing user account and receive an access token
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

//3. get list of all notes for authenticated user
router.get('/api/notes', auth, async(req, res)=>{
    const {user_id} = req.user;
    const notes = await Note.find({owner_id: user_id});
    res.status(200).json({
        notes: notes
    });
});

//4. get a note by ID for authenticated user
router.get('/api/notes/:id', auth, async(req, res)=>{
    try {
        const {user_id} = req.user;
	    const note_id =  req.params.id;
	    console.log(`note id:${note_id} looking in user_id:${user_id}`);
	    const {note} = await Note.findOne({_id:note_id});
        if(!note)
            throw new Error(`Note ID not found`);
        res.status(201).json({
            success: true,
            note: note
        });
} catch (error) {
	res.status(401).json({
        success: false,
        message: `Error occurred when finding Note using Note_ID for user_id:user_id`,
        error: error
    });
}

});


//5. create a new note for authenticated user
router.post('/api/notes', auth, async(req, res)=>{
    try {
	    const {user_id} = req.user;
	    // const userObj = await User.findOne({_id: user_id});
	    // const note = req.body;
	    // console.log(`notes text:${note}`)
	    // userObj.notes.push(note);
	    // userObj.save();
        // res.status(201).send('Note saved successfully');

        const note = await Note.create({
            note: req.body.note,
            owner_id: user_id
        });
} catch (error) {
    console.log(error);
	res.status(401).send(error);
}
    
});

//6. update existing note by ID
router.put('/api/notes/:id', auth, async(req, res)=>{
    try {
	    const {user_id} = req.user;
        const {note_id, newNote} = req.body;
        const filter = {_id: note_id};
        const update = {note: newNote};

        const {note} = await Note.findOne({_id:note_id});
        if(!note)
            throw new Error(`Note ID not found`);
        if(user_id!=note.owner_id)
            throw new Error(`User is not logged in for this note_id`);

        let doc = await Note.findOneAndUpdate(filter, update,{
            new: true
        });

        console.log(`Updated note:${await Note.findOne({_id: note_id})}`)
        res.status(201).json({
            success: true,
            message: "Note updated successfully"
        });
	    // userObj.notes.push(note);
	    // userObj.save();
} catch (error) {
    console.log(error);
	res.status(401).send(error);
}



    
});
module.exports = router;