/**
 * Created by Alex on 31.05.2016.
 */
'use strict';
const User = require('../models/').User;

module.exports = function(socket, data) {
    if (!data.id) {
        socket.emit('userChanged',
            {err: 1, message: 'Undefined user identifier'}
        );
        return
    }

    if (!(data.username && data.password)) {
        socket.emit('userChanged',
            {err: 1, message: 'Incorrect username or password'}
        );
        return
    }

    User.findById(+data.id).then(
        function(user) {
            user.username = data.username;
            user.email = data.email;
            user.firstName = data.firstName;
            user.lastName = data.lastName;
            user.patronymic = data.patronymic;
            user.phone = data.phone;
            user.introduce = data.introduce;
            user.implementing = data.implementing;
            user.numberOfClasses = data.numberOfClasses;
            user.password = data.password;

            return user.save().then(function(user){
                socket.emit('userChanged', {
                    'err': 0,
                    user: {
                        userId : user.id,
                        username: user.username
                    }
                });
            }).catch(function (err) {
                socket.emit('userChanged',
                    {err: 1, message: err.message}
                );
            })
        }).catch(function (err) {
            socket.emit('userChanged',
                {err: 1, message: err.message}
            );
        })
};