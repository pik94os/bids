/**
 * Created by Alex on 01.06.2016.
 */
'use strict';
var User = require('../models/').User;

module.exports = function(socket, data) {
    if (!data.userId) {
        socket.emit('userSelected',
            {err: 1, message: 'Undefined user identifier'}
        );
        return
    }

    User.findById(data.userId)
        .then(function(user) {
            socket.emit('userSelected', {
                'err': 0,
                user: user
            });
        }).catch(function (err) {
        socket.emit('userSelected',
            {err: 1, message: err.message}
        );
    })
};
