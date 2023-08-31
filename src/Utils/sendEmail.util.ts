import nodemailer from 'nodemailer';

import Logger from '../Config/logger';

// export function sendEmail(to: string, subject: string, message: string, id: string){

//     //console.log(process.env.SENDER_EMAIL);
//     const transporter = nodemailer.createTransport({
//         host: 'smtp.office365.com',
//         port: 587,
//         secure: false, // true for 465, false for other ports
//         requireTLS:true,
//         auth: {
//           user: process.env.SENDER_EMAIL, // generated ethereal user
//           pass: process.env.SENDER_PASSWORD//SENDER_PASSWORD, // generated ethereal password
//         },
//         // connectionTimeout: 10000,
//         // debug: true
//     });

//     const mailOption = {

//             from: `"Fred Foo 👻" <${process.env.SENDER_EMAIL}>`, 
//             to: to, 
//             subject: subject, 
//             text: subject,
//             html:message  
//     }


//     transporter.sendMail(mailOption, (err, _)=>{

//         if(err){

//             console.log(err);      
//             Logger.error(`This User id: (${id}) email: (${to}) an error occurred While a Sign up confirmation email was being sent.`);
//         }
//         else{

//             Logger.info(`This User email: (${to}) was been sent Successfully.`);
//         }

//     });



// }


// ------------------ sql -------------------------

export function sendEmail(to: string, subject: string, message: string, id: number) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        requireTLS: true,
        auth: {
            user: process.env.SENDER_EMAIL, // generated ethereal user
            pass: process.env.SENDER_PASSWORD//SENDER_PASSWORD, // generated ethereal password
        },
    });
    const mailOption = {
        from: `"Fred Foo 👻" <${process.env.SENDER_EMAIL}>`,
        to: to,
        subject: subject,
        text: subject,
        html: message
    }
    transporter.sendMail(mailOption, (err, _) => {
        if (err) {
            console.log(err);
            Logger.error(`This User id: (${id}) email: (${to}) an error occurred While a Sign up confirmation email was being sent.`);
        }
        else {
            Logger.info(`This User email: (${to}) was been sent Successfully.`);
        }
    });
};