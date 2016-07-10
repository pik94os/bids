'use strict';
const Auction = require('../../models/').Auction;

module.exports = function(socket, data) {
    if (!data.id) {
        socket.emit('room',
            {err: 1, message: 'Undefined auction identifier'}
        );
        return
    }

    Auction.findById(+data.id)
        .then(function(auction) {
            socket.emit('room', {
                'err': 0,
                auction
            });
        }).catch(function (err) {
        socket.emit('room',
            {err: 1, message: err.message}
        );
    })
};