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
    let attributes = [];
        if(data.userAuction) {
            attributes = ["firstName", "lastName", "patronymic",'id']
        } else {
            attributes = ["id", "username"]
        }
    Auction.findById(data.id,{
        include:[{
            model: Lot,
            attributes: ["id", "isPlayOut", "isSold"],
            order: '"number" ASC'
        },
            {
             model: User,
             attributes: attributes,
             order: '"id" DESC'
            }
        ]
    }).then(function(auction) {
            socket.emit('room', {
                 err: 0,
                 auction: auction
            });
        socket.join('auction:' + data.id);
        }).catch(function (err) {
        socket.emit('room',
            {err: 1, message: err.message}
        );
    })
};