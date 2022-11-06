const SibApiV3Sdk = require('sib-api-v3-sdk');
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
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.EMAIL_API_KEY;
const client = new SibApiV3Sdk.TransactionalEmailsApi();
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
	client,
  checkEmailIfExist,
  checkMsgIfSent,
	checkPass,
  validatePass,
  codeGenerator
}
