'use strict';
const Auction = require('../../models/').Auction;
const Lot = require('../../models/').Lot;
const LotPicture = require('../../models/').LotPicture;
const User = require('../../models/').User;

module.exports = function(socket, data) {
    if (!data.id) {
        socket.emit('room',
            {err: 1, message: 'Undefined auction identifier'}
        );
        return
    }

    Auction.findById(data.id, {
        include:[{
            model: Lot,
            attributes: ["id", "isPlayOut", "isSold"]
        },
            {
             model: User,
             attributes: ["id"]
            }
        ]
    })
        .then(function(auction) {
            socket.emit('room', {
                 err: 0,
                 auction: auction
            });
        }).catch(function (err) {
        socket.emit('room',
            {err: 1, message: err.message}
        );
    })
};