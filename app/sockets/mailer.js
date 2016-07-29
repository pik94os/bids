/**
 * Created by piligrim on 27.07.16.
 */

// npm install nodemailer
// npm install nodemailer-smtp-transport
// npm install nodemailer-dkim --save

'use strict';

var nodemailer = require("nodemailer");
// var smtpTransport = require('nodemailer-smtp-transport');

module.exports = function (socket, data) {
    // var nodemailer = require('../lib/nodemailer');

// Create a SMTP transporter object
    var transporter = nodemailer.createTransport({
        pool: true,
        // service: 'mail.art-bid.ru',
        host: 'mail.art-bid.ru',
        port: 25,
        secure: false,
        auth: {
            user: 'noreply@art-bid.ru',
            pass: 'qwertyuiop,'
        },
        tls: {
            rejectUnauthorized: false
        },
        logger: true, // log to console
        debug: true // include SMTP traffic in the logs
    }, {
        // default message fields

        // sender info
        from: 'noreply@art-bid.ru',
        // from: 'Sender Name <noreply@art-bid.ru>',
        headers: {
            'X-Laziness-level': 1000 // just an example header, no need to use this
        }
    });

    console.log('SMTP Configured');

// Mock message queue. In reality you would be fetching messages from some external queue
    var messages = [{
        to: '"Receiver Name"' + '<' + data.receiverMailer +'>',
        subject: data.subjectMailer, //
        text: data.textMailer,
        html: data.htmlMailer
    }];

// send mail only if there are free connection slots available
    transporter.on('idle', function () {
        // if transporter is idling, then fetch next message from the queue and send it
        while (transporter.isIdle() && messages.length) {
            console.log('Sending Mail');
            transporter.sendMail(messages.shift(), function (error, info) {
                if (error) {
                    console.log('Error occurred');
                    console.log(error.message);
                    return;
                }
                console.log('Message sent successfully!');
                console.log('Server responded with "%s"', info.response);
            });
        }
    });
};

