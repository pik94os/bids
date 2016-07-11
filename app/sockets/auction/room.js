'use strict';
const Auction = require('../../models/').Auction;
const Lot = require('../../models/').Lot;
const LotPicture = require('../../models/').LotPicture;

module.exports = function(socket, data) {
    if (!data.id) {
        socket.emit('room',
            {err: 1, message: 'Undefined auction identifier'}
        );
        return
    }

    Auction.findById(+data.id/*,{
        include:[{
            model:Lot,
            limit:10,
            include: [{
                model: LotPicture
            }]
        }]
    }*/)
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