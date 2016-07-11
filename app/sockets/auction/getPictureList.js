/**
 * Created by piligrim on 11.07.16.
 */
'use strict';
var LotPicture = require('../../models/').LotPicture;

module.exports = function(socket, data) {
    LotPicture.findAll({include: []}).then(function (result) {
        socket.emit('pictureList', {
            'err': 0,
            pictureList: result
        });
    })
};