'use strict';
const User = require('../models/').User;

module.exports = function (socket, data) {
    if (!data.userId) {
        socket.emit('passwordChecked',
            {err: 1, message: 'Undefined user identifier'}
        );
        return
    }

    User.findById(data.userId)
        .then(function(user) {
            if (user.password == data.password) {
                socket.emit('passwordChecked', {
                    'err': 0, message: 'Success'
                });
            } else {
                socket.emit('passwordChecked',
                    {err: 1, message: 'Wrong password'}
                );
            }
        }).catch(function (err) {
        socket.emit('passwordChecked',
            {err: 1, message: err.message}
        );
    })
};