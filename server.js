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
app.get('/send',(req,res) => {
    const code =codeGenerator();
    const mailOptions={
        from: "smartbrain <saied2421998@gmail.com>",
        to : req.body.email,
        subject : "Please confirm your Email account",
        html : `<div style="text-align:center;font-size: 1.25rem;font-weight:600;">
        <p style="margin-block:0;margin-block-end: 0.5rem;">
          Hello,Please enter this code in confirmation page :
        </p>
        <span style="font-size: 1.25rem;color: blue;">${code}</span>
        </div>`
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response){
     if(error){
            console.log(error);
        res.end("error");
     }else{
        res.end("sent");
         }
});
});

app.get('/verify',function(req,res){
console.log(req.protocol+":/"+req.get('host'));
if((req.protocol+"://"+req.get('host'))==("https://"+host))
{
    console.log("Domain is matched. Information is from Authentic email");
    console.log(req.query)
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