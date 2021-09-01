const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const Clarifai = require('clarifai');
const {db,smtpTransport,checkPass,validatePass,codeGenerator} = require('./functions')
const app1 = new Clarifai.App({
    apiKey: 'aa5f028272e1463088b19faa78ebb744'
});





const app=express();

app.use(cors());
app.use(bodyParser.json())
app.enable('trust proxy')
app.get('/',(req,res)  => {
     res.send('working!')
})

//start
app.post('/send',(req,res) => {
    const code =codeGenerator();
    const mailOptions={
        from: "smartbrain <admin@smartbrain>",
        to : req.body.email,
        subject : "Please confirm your Email account",
        html : `<div style="text-align:center;font-size:20px;font-weight:600;">
        <p>
          Hello,Please enter this code in confirmation page :
        </p>
        <span style="font-size: 20px;color: blue;font-weight:800;">${code}</span>
        </div>`
    }

    smtpTransport.sendMail(mailOptions, (error, response) => {
     if(error){
        res.json("error while sending email");
     }
     else{
        db('codes').insert({
          email : req.body.email,
          code: code
        }).then(() => res.json('code sent Successfully'))
     }
});
});

app.delete('/verify',(req,res) => {
    db('codes').select('*').where('code','=',req.body.code)
    .then(data => console.log)
    .then(() => res.json('email verified.'))
    .catch(err => res.status(400).json('incorrect code.'))
});

//end
app.post('/signin',(req,res)  => {
           if(Object.values(req.body).includes("")){
             return res.json('please complete all the fields')
           }
           db('login').select('*').where('email','=',req.body.email)
           .then(data => {
            const isValid= bcrypt.compareSync(req.body.password, data[0].hash);
            if (isValid){
             return db('users').select('*').where('email','=',req.body.email)
              .then(user => {
                return res.json(user[0])
              })
            }
            else {
               res.status(400).json('password is wrong')
            }
           })
           .catch(error => res.status(400).json(`email is wrong or you don't have an account`))
})

app.post('/register',(req,res)  => {

               if(Object.values(req.body).includes("")){
                return res.json('please complete all the fields')
               }

               const {email,name,password} = req.body;
               if(!validatePass(password)){
                 return res.status(400).json(
                     `
                      password should be at least: eight characters ,one upercase letter ,one lowercase letter 
                      and one number

                     `
                 )
               }
               checkPass(password).then( isValid => {
                    if(!isValid){
                       return res.status(400).json('password is already existed')  
                    }
                    else {
                         const hash = bcrypt.hashSync(password, 10);
                           db.transaction( trx => {
                              trx('login').insert({
                                   email : email,
                                   hash : hash
                              })
                              .returning("*")
                              .catch(error => res.status(400).json(`email is already existed`))
                              .then( data => {
                                     return trx('users').insert({
                                        id: data[0].id,
                                        email:data[0].email,
                                        name: name,
                                        joined: new Date()
                                     })
                                     .returning('*')
                                     .catch(error => res.status(400).json(`username is already existed`))
                                     .then(user => res.json(user[0]))
                                     
                              })
                              .then(trx.commit)
                              .catch(trx.rollback)

                           })
                           .catch(error => 
                           res.status(400).json(`you can't register now,server is geting maintance`))                      
                    }
                }) 
   
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

/*app.post('/test',(req,res)  => {
      db('login').select('*').then(console.log)
      res.json('success')
})*/
app.get('/test',(req,res) => {
 
      
  res.send(validatePass('Saied1998'))
    
})

app.listen(process.env.PORT || 3001)