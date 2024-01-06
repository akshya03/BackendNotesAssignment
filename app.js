require("dotenv").config();
require('./config/database').connect();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const userRouter = require('./routes/user');
const noteRouter = require('./routes/note');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.get('/', (req, res)=>{
    res.status(200).send('<h3>Hello from backend system</h3>');
});

app.use(userRouter);
app.use(noteRouter);

module.exports = app;