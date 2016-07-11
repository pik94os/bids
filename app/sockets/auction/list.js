/**
 * Created by piligrim on 05.07.16.
 */
'use strict';

var Auction = require('../../models/').Auction;
let Lot = require('../../models/').Lot;
module.exports = function(socket, data) {
    let where;
    if(!data.public){
        where = {userId: socket.request.user.id};
    }
    Auction.findAll({where,
    include: Lot})
        .then(function(auctionList) {
            socket.emit('auctionList', {
                'err': 0,
                auctionList: auctionList
            });
        }).catch(function (err) {
        socket.emit('auctionList',
            {err: 1, message: err.message}
        );
    })
};