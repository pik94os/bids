/**
 * Created by Alex on 31.05.2016.
 */
var User = require('../../models/').User;

Events : {
    function _checkNameAndPassword(socket, data, eventName) {
        var _correct = ((data.userName) && (data.password));
        if (!_correct) {
            socket.emit(eventName,
                {err: 1, message: 'Incorrect username or password'}
            );
        }
    }
    
    function createNewUser(socket, data) {
        if (!_checkNameAndPassword(socket, data, 'userCreated')) {
            return
        }

        User.create({username: data.userName, password: data.password, firstname: data.firstname})
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
    }
}

if (module) {
    module.exports = Events
}