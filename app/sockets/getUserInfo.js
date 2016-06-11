/**
 * Created by Acer on 09.08.2015.
 */
'use strict';
// var User = require('../models/').User;
module.exports = function(socket,data) {
    socket.emit('userInfo', {
        'err': 0,
        doc: {
            login: +socket.request.user.logged_in
        }
    });
}