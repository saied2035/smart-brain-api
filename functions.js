const nodemailer = require("nodemailer")

const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "saied2421998@gmail.com",
        pass: "saied1998"
    }
});



module.exports = {
	smtpTransport
}
