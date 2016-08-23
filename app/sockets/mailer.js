/**
 * Created by piligrim on 27.07.16.
 */

// npm install nodemailer
// npm install nodemailer-smtp-transport
// npm install nodemailer-dkim --save

'use strict';

var mailSender = require("../mailSender");

module.exports = function (socket, data) {
    // console.log('>)))))))))))))))))))');
    // console.log(data);
    mailSender.send(data,(err) => {
        if(err){
            console.log('Error occurred');
            console.log(error.message);
        }
    })
};

