const {db,client,checkEmailIfExist,checkPass,validatePass
       ,codeGenerator,checkMsgIfSent} = require('./functions')
const SibApiV3Sdk = require('sib-api-v3-sdk');       
const bcrypt = require('bcrypt');
const jimp = require('jimp')
const {loadImage,Canvas, Image, ImageData} = require('canvas')
const faceapi = require('@vladmandic/face-api');
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

 const loadModels= async () => {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk('./model'),
  await faceapi.nets.ageGenderNet.loadFromDisk('./model'),
  await faceapi.nets.faceExpressionNet.loadFromDisk('./model')
 }

const userSignIn= (req,res) => {
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
           .catch(error => {
           	res.status(400).json(`email is wrong or you don't have an account`)})	
}

const userRegister = (req,res) => {
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
}

const sendEmail= async (req,res) => {

    const code =codeGenerator();
    const exist = await checkEmailIfExist(req.body.email)
    const msgSent = await checkMsgIfSent(req.body.email)
    if(msgSent){
      return res.status(400).json(`we sent you code before.Check your email.`)
    }
    if(!exist){
      return res.status(400).json(`this email has no account.`)
    }
    let mailOptions = new SibApiV3Sdk.SendSmtpEmail();
    mailOptions = {
        sender: {email: 'saied2421998@gmail.com', name: 'smartbrain' },
        to: [{ email: req.body.email }],
        subject: "Confirmation mail for smartbrain",
        htmlContent: `<div style="text-align:center;font-size:20px;font-weight:600;">
        <p>
          Hello, Please enter this code in confirmation page :
        </p>
        <span style="font-size: 20px;color: blue;font-weight:800;">${code}</span>
        </div>`,
        "MessageStream": "outbound"
    }

    client.sendTransacEmail(mailOptions)
    .then(response =>  {
        db('codes').insert({
          email : req.body.email,
          code: code
        }).then(() => res.json('code sent Successfully'))
    }).catch(error => res.status(400).json("error while sending email"))
}

const verifyEmail= (req,res) => {
    db('codes').select('*').where('code','=',req.body.code)
    .then(data => {
      if(data[0].code){
        return db('users').where('email','=',data[0].email)
               .update({
                 verified: true
               })
               .then(() => 
                       db('codes').where('code','=',req.body.code).del()
                       .then(() => 
                                db('users').select('*').where('email','=',data[0].email)
                                .then(user => res.json(user[0])) 
                            )
                    )


      }
      else{
        return res.status(400).json('incorrect code')
      }
    })
    .catch(err => res.status(400).json('incorrect code.'))
}

const imagePredict = async (req,res) =>{

            let receviedImage = req.body.text
            if(!req.body.text.includes('http') || !req.body.text.includes('https')){
                receviedImage = Buffer.from(req.body.text,"base64")
            }
            let readImage = null
            try {
              readImage = await jimp.read(receviedImage)
            }
            catch {
              res.json({ error: 'Unsupported Image Type. Supported types are bmp, gif, jpeg, jpg, png, and tiff' })
              return;
            }  
            readImage.getBuffer(jimp.MIME_PNG,  async (err, buffer) => {
                      const image =  await loadImage(buffer)
                      const detection = await faceapi.detectSingleFace(image).withFaceExpressions()
                                                     .withAgeAndGender()
                      if(detection===undefined){
                         res.json({})  
                      }
                      else{
                        res.json(detection)
                      } 
              })
}
module.exports ={
	userSignIn,
    userRegister,
    sendEmail,
    verifyEmail,
    imagePredict,
    loadModels
}