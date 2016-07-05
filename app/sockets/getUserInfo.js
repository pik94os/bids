/**
 * Created by Acer on 09.08.2015.
 */
'use strict';
// var User = require('../models/').User;
// возвращает залогиненого пользователя
module.exports = function(socket,data) {
    socket.emit('userInfo', {
        'err': 0,
        doc: {
            loggedIn: +socket.request.user.logged_in,
            login: socket.request.user.username,
            id: +socket.request.user.id,
            password: socket.request.user.password,
            firstName: socket.request.user.firstName,
            lastName: socket.request.user.lastName,
            patronymic: socket.request.user.lastName,
            email: socket.request.user.email,
            phone: socket.request.user.phone,
            confirmationCode: socket.request.user.confirmationCode,
            receiveMessages: socket.request.user.receiveMessages
        }
    });
};