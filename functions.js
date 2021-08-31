const nodemailer = require("nodemailer")
const bcrypt = require('bcrypt');
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
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
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
	checkPass,
  validatePass,
  codeGenerator
}
