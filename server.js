require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs')
const bodyParser = require('body-parser');     
const {
    userSignIn,
    userRegister,
    sendEmail,
    verifyEmail,
    imagePredict,
    loadModels
}  = require('./controllers.js')

const app=express();
app.use(express.json({limit: '100mb'}));
app.use(cors());

loadModels()

app.post('/signin',(req,res)  => userSignIn(req,res))

app.post('/register',(req,res)  => userRegister(req,res))

//sending msg to email
app.post('/send',(req,res) => sendEmail(req,res) );

//email verivication
app.delete('/verify',(req,res) => verifyEmail(req,res));

app.post('/predict',(req,res) => imagePredict(req,res))


app.listen(process.env.PORT || 3001)