/**
 * Created by piligrim on 05.07.16.
 */
'use strict';

var Auction = require('../../models/').Auction;

module.exports = function(socket, data) {

    Auction.findAll({where: {userId: socket.request.user.id}})
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