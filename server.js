const express = require('express');
const nodemailer = require("nodemailer")
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const knex = require('knex');

const Clarifai = require('clarifai');

const app1 = new Clarifai.App({
    apiKey: 'aa5f028272e1463088b19faa78ebb744'
});

 const db = knex({
  client: 'pg',
  connection: {
    connectionString : process.env.DATABASE_URL,
    ssl : false
  }
});

const smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "saied2421998@gmail.com",
        pass: "saied1998"
    }
});
let rand,mailOptions,host,link;


//start

app.get('/send',function(req,res){
        rand=Math.floor((Math.random() * 100) + 54);
    host=req.get('host');
    link="http://"+req.get('host')+"/verify?id="+rand;
    mailOptions={
        to : req.query.to,
        subject : "Please confirm your Email account",
        html : "Hello,Please Click on the link to verify your email."+link+">Click here to verify"
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response){
     if(error){
            console.log(error);
        res.end("error");
     }else{
            console.log("Message sent: " + response.message);
        res.end("sent");
         }
});
});

app.get('/verify',function(req,res){
console.log(req.protocol+":/"+req.get('host'));
if((req.protocol+"://"+req.get('host'))==("http://"+host))
{
    console.log("Domain is matched. Information is from Authentic email");
    if(req.query.id==rand)
    {
        console.log("email is verified");
        res.end("Email "+mailOptions.to+" is been Successfully verified");
    }
    else
    {
        console.log("email is not verified");
        res.end("Bad Request");
    }
}
else
{
    res.end("Request is from unknown source");
}
});

//end
const app=express();

app.use(cors());
app.use(bodyParser.json())
app.get('/',(req,res)  => {
     res.send('working!')
})


app.post('/signin',(req,res)  => {
           db('login').select('*').where('email','=',req.body.email)
           .then(data => {
            const isValid= bcrypt.compareSync(req.body.password, data[0].hash);
            if (isValid){
             return db('users').select('*').where('email','=',req.body.email)
              .then(user => {
                res.json(user[0])
              })
            }
            else {
               res.status(400).json('password is wrong')
            }
           })
           .catch(error => res.status(400).json(`email is wrong or you don't have an account`))
})

app.post('/register',(req,res)  => {
               const {email,name,password} = req.body;
               const hash = bcrypt.hashSync(password, 10);
                 db.transaction( trx => {
                    trx('login').insert({
                         email : email,
                         hash : hash
                    })
                    .returning('email')
                    .then( registerEmail => {
                           return trx('users').insert({
                              email:registerEmail[0],
                              name: name,
                              joined: new Date()
                           })
                           .returning('*')
                           .then(user => res.json(user[0]))
                    })
                    .then(trx.commit)
                    .catch(trx.rollback)

                 })
                 .catch(error => res.status(400).json('error register'))   
})

app.post('/predict',(req,res)  => {
            app1.models
            .predict(
              Clarifai.FACE_DETECT_MODEL,
              req.body.text      
            )
            .then(data => res.json(data))
            .catch(error => res.status(400).json(true))
})

app.listen(process.env.PORT || 3001)