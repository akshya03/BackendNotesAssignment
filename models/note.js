const mongoose = require('mongoose');
const { Schema } = mongoose;
const jwt = require('jsonwebtoken');

const noteSchema = new mongoose.Schema({
    note:{
        type: String,
        required: true
    },
    owner_id:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sharedWith_id:[{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
    
}, {
    timestamps: true
});

module.exports = mongoose.model('Note', noteSchema);