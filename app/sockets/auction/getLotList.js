/**
 * Created by piligrim on 06.07.16.
 */
'use strict';

var Lot = require('../../models/').Lot;

module.exports = function(socket, data) {
    if (!data.auctionId) {
        socket.emit('lotList',
            {err: 1, message: 'Undefined auction identifier'}
        );
        return
    }
    Lot.findAll({where: {auctionId: data.auctionId}})
        .then(function(lotList) {
            socket.emit('lotList', {
                'err': 0,
                lotList: lotList
            });
        }).catch(function (err) {
        socket.emit('lotList',
            {err: 1, message: err.message}
        );
    })
};