const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { Int32 } = require('mongodb');

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        default: null,
        required: true
    },
    email:{
        type: String,
        unique: true,
        required: [true, 'Please provide a unique email address']
    },
    password:{
        type: String,
        required: [true, 'Please provide a password']
    },
    token:{
        type: String
    },
    notes:[{
        note:{
            type: String
        }
    }]
}, {
    timestamps: true
});

userSchema.methods.getAuthToken = function(){
    const user = this;
    console.log(user);
    const token = jwt.sign(
        {user_id: user._id, email: user.email},
        process.env.SECRET_KEY,
        {
            expiresIn:"2h"
        }
    );
    // console.log(`token generated:${token}`);
    // console.log(`Token decoded:${}`);
    return token;
};




module.exports = mongoose.model('User', userSchema);