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
               return data
}


module.exports = {
	db,
	smtpTransport,
	checkPass
}
