/**
 * Created by Alex on 30.05.2016.
 */
'use strict';

var User = require('../models/').User;

module.exports = function(socket, data) {
    const role = socket.request.user.roleId;
    // Todo : Использовать право createUser
    // if ((!role) || (role > 2)){
    //     socket.emit('userCreated', {
    //         'err': 1,
    //         message: 'no access for role = ' + role
    //     });
    //     return false;
    // }

    var _userName = data.email.split('@')[0];
    
    if (!((_userName) && (data.password))) {
        socket.emit('userCreated',
            {err: 1, message: 'Incorrect username or password'}
        );
        return
    }

    let _userData = {
        username : _userName,
        email : data.email,
        firstName : data.firstName,
        lastName : data.lastName,
        patronymic : data.patronymic,
        phone : data.phone,
        introduce : data.introduce,
        implementing : data.implementing,
        numberOfClasses : data.numberOfClasses,
        password : data.password,
        isArchive : false,
        roleId: data.roleId
    };
    if(role===1){
        _userData.roleId = 2;
    }
    
    User.create(_userData)
        .then(function (user) {
            socket.emit('userCreated', {
                'err': 0,
                newUser: {
                    userId : user.id,
                    username: user.username
                }
            });
        }).catch(function (err) {
        socket.emit('userCreated',
            {err: 1, message: err.message}
        );
    })
};