const express = require('express');
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
    host : '127.0.0.1',
    user : 'postgres',
    password : 'saied1998',
    database : 'smartbrain'
  }
});
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
              .catch(error => res.status(400).json('error longing in'))
            }
            else {
               res.status(400).json('error longing in')
            }
           })
           .catch(error => res.status(400).json('error longing in'))
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