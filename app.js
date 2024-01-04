require("dotenv").config();
require('./config/database').connect();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');

const userRouter = require('./routes/user');

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res)=>{
    res.status(200).send('<h3>Hello from backend system</h3>');
});

app.use(userRouter);

module.exports = app;