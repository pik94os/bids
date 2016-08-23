/**
 * Created by piligrim on 6/8/16.
 */
'use strict';
const Role = require('../models/').Role;

module.exports = function (socket, data) {
    const role = socket.request.user.roleId;

    // если текущий пользователь админ
    if (role === 2) {
        Role.findAll({where: {id: {$gt: 2}}})
            .then(function (result) {
                socket.emit('rolesSelected', {
                    'err': 0,
                    roles: result
                });
            }).catch(function (err) {
            socket.emit('rolesSelected',
                {err: 1, message: err.message}
            );
        });
    }
};