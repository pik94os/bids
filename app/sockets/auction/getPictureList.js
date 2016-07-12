/**
 * Created by piligrim on 11.07.16.
 */
'use strict';
var LotPicture = require('../../models/').LotPicture;

module.exports = function(socket, data) {
    let where = {
        isArchive : false
    };
    if(+data.lotId){
        where.lotId = +data.lotId
    }

    LotPicture.findAll({
        where
    }).then(function (result) {
        socket.emit('pictureList', {
            'err': 0,
            pictureList: result
        });
    }).catch(function (err) {
        socket.emit('pictureList',
            {err: 1, message: err.message}
        );
    });
};