const nodemailer = require("nodemailer")
const bcrypt = require('bcrypt');
/*const jimp = require('jimp')*/
const knex = require('knex');

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
        pass: "saied1998"
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

/*const resizeImage = async (image,imageWidth) => {
              const readImage = await jimp.read(image)
              await readImage.resize(Math.round(0.28*req.body.imageWidth),jimp.AUTO)
              
}*/

module.exports = {
	db,
	smtpTransport,
  checkEmailIfExist,
  checkMsgIfSent,
	checkPass,
  validatePass,
  codeGenerator
}
