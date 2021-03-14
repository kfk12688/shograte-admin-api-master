var nodemailer = require('nodemailer');
const key = require("../config/keys");

async function sendMail(from,to, subject,content){

var smtpEmail=key.smtpEmail;
var smtpPassword=key.smtpPassword;


let mailTransporter = nodemailer.createTransport({ 
    service: 'gmail', 
    auth: { 
        user: smtpEmail, 
        pass: smtpPassword
    } 
}); 
  
let mailDetails = { 
    from: from,
    to: to,
    subject: subject,
    html: content
};

var result = await mailTransporter.sendMail(mailDetails);

//check if message send or not\
if(result.messageId){

    console.log('Success'); 

    return {
        success:true,
        message:"Email send successfully"
    } 
    

}else{

    console.log('Error Occurs'); 

    return {
        success:false,
        message:"Email could not send.Please try again."
    } 
    
}


// mailTransporter.sendMail(mailDetails, function(err, data) { 
//     if(err) { 
       
//         console.log('Error Occurs'); 
//         return {
//             success:false,
//             message:"Email could not send.Please try again."
//         } 
//     } else {         

//         console.log('Success'); 

//         return {
//             success:true,
//             message:"Email send successfully"
//         } 
//     } 
// });


}


module.exports = {
    sendMail
};