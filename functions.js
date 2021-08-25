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

const checkPass = (pass) => {
               db('login').select('hash').then( data => {
                   const existedPasswords= data.filter( user => {
               	     return bcrypt.compareSync(pass,user.hash) === true
               	   })
               	   console.log(existedPasswords)
               	   return existedPasswords
               })
              
}


module.exports = {
	db,
	smtpTransport,
	checkPass
}
