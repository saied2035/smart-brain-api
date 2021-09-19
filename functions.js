const nodemailer = require("nodemailer")
const bcrypt = require('bcrypt');
const knex = require('knex');

 const loadModels= async () => {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk('./model'),
  await faceapi.nets.ageGenderNet.loadFromDisk('./model'),
  await faceapi.nets.faceExpressionNet.loadFromDisk('./model')
 }
 const db = knex({
  client: 'pg',
  connection: {
	  connectionString: process.env.DATABASE_URL,
	  ssl: {
	    rejectUnauthorized: false
	  }
  }
});
const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "saied2421998@gmail.com",
        pass: "JSisthebest2021"
    }
});
const checkEmailIfExist = async (email) => {
        const check = await db('users').select('email').where('email','=',email)
        return check.length ?
           true
        :
           false
}
const checkMsgIfSent = async (email) => {
        const check = await db('codes').select('code').where('email','=',email)
        return check.length ?
           true
        :
           false
}
const checkPass = async (pass) => {
               data = await db('login').select('hash')
               const existedPasswords = data.filter((user) => {
               	   return bcrypt.compareSync(pass,user.hash) === true
               }) 
              
               return existedPasswords.length ?
                  false   
               :
                  true
}
const validatePass= (pass) => {
      const check = /(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])^[a-zA-Z][a-zA-Z0-9]{8,}$/
      return check.test(pass)
}

const codeGenerator = () => {
    const characters = 'abcd7efg95hi2jklm8n0opq1rstuv6wxyz';
    let result = ""
    const charactersLength = characters.length;

    for ( let i = 0; i < 6 ; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }  
    return result
}


module.exports = {
	db,
	smtpTransport,
  checkEmailIfExist,
  checkMsgIfSent,
	checkPass,
  validatePass,
  codeGenerator,
  loadModels
}
