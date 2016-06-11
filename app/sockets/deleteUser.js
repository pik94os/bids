/**
 * Created by Alex on 01.06.2016.
 */
'use strict';
var User = require('../models/').User;

module.exports = function(socket, data) {
    const role=socket.request.user.roleId;
    if (!data.id) {
        socket.emit('userDeleted',
            {err: 1, message: 'Undefined user identifier'}
        );
        return
    }

    // Todo : право на удаление пользователей
    // if(!role||role>2){
    //     socket.emit('userDeleted', {
    //         'err': 1,
    //         message: 'no access'
    //     });
    //     return false;
    // }

    User.findById(+data.id).then(
        function(user) {
            user.isArchive = true;

            return user.save().then(function(user){
                socket.emit('userDeleted', {
                    'err': 0,
                    user: {
                        userId : user.id,
                        username: user.username
                    }
                });
            }).catch(function (err) {
                socket.emit('userDeleted',
                    {err: 1, message: err.message}
                );
            })
        }).catch(function (err) {
        socket.emit('userDeleted',
            {err: 1, message: err.message}
        );
    })
};