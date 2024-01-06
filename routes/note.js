const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const auth = require('../middlewares/auth');
const Note = require('../models/note');

const router = new express.Router();

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
    const {user_id} = req.user;
	const note_id =  req.params.id;
    try {
        
	    const {note} = await Note.findOne({_id:note_id, owner_id:user_id});
        if(!note)
            throw new Error(`Note ID not found`);
        res.status(201).json({
            success: true,
            note: note
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: `Error occurred when finding Note using Note_ID:${note_id} in logged-in user_id:${user_id}`,
            error
        });
    }

});

//5. create a new note for authenticated user
router.post('/api/notes', auth, async(req, res)=>{
    try {
	    const {user_id} = req.user;
        const note = await Note.create({
            note: req.body.note,
            owner_id: user_id
        });
        res.status(201).json({
            success: true,
            message: `Note save successfully for user_id:${user_id}`
        })
    } catch (error) {
        console.log(error);
        res.status(401).json({
            success: false,
            message: `Unable to add note to logged in user_id:${user_id}`,
            error
        });
    }
});

//6. update existing note by ID
router.put('/api/notes/:id', auth, async(req, res)=>{
    try {
	    const {user_id} = req.user;
        const note_id = req.params.id;
        const filter = {_id: note_id};
        const update = {note: req.body.newNote};
        console.log(`note_id:${note_id}`);
        const note = await Note.findOne({_id:note_id});
        if(!note)
            throw new Error(`Note ID not found`);
        if(user_id!=note.owner_id)
            throw new Error(`User is not logged in for this note_id`);

        let doc = await Note.findOneAndUpdate(filter, update,{
            new: true
        });

        res.status(201).json({
            success: true,
            message: "Note updated successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(401).json({
            success: false,
            message:"Note update FAILED",
            error
        });
    }
});

//7. delete existing note by ID
router.delete('/api/notes/:id', auth, async(req, res)=>{
    try {
	    const {user_id} = req.user;
        const note_id = req.params.id;

        const note = await Note.findOne({_id:note_id});
        if(!note)
            throw new Error(`Note ID not found`);
        if(user_id!=note.owner_id)
            throw new Error(`User is not logged in for this note_id`);

        await Note.deleteOne({_id:note_id});
        res.status(201).json({
            success: true,
            message: "Note deleted successfully"
        });
	    // userObj.notes.push(note);
	    // userObj.save();
    } catch (error) {
        console.log(error);
        res.status(401).json({
            success: false, 
            error
        });
    }
});

//8. share note with another user
router.post('/api/notes/:id/share', auth, async(req, res)=>{
    console.log(`In note share route`);
    try {
	    const {user_id} = req.user;
        const note_id = req.params.id;
        const {shareWithUserEmail} = req.body;
        const {shareWithUser_id} = await Note.findOne({email: shareWithUserEmail});
        const noteObj = await Note.findOne({_id: note_id});
        if(!note)
            throw new Error(`Note ID not found`);
        if(user_id!=note.owner_id)
            throw new Error(`User is not logged in for this note_id`);
        if (!shareWithUser_id)
            throw new Error(`User not found with email:${shareWithUserEmail}`);
        noteObj.sharedWith_id.push(shareWithUser_id);
        noteObj.save();

        res.status(201).json({
            success: true,
            message: "Note shared successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(401).json({
            success: false,
            message:"Note share FAILED",
            error
        });
    }
});

module.exports = router;