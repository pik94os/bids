/**
 * Created by Alex on 30.05.2016.
 */
'use strict';

var Auction = require('../../models/').Auction;

module.exports = function(socket, data) {
    const user = socket.request.user;

    if (!((data.name.trim()) && (+data.number))) {
        socket.emit('auctionCreated',
            {err: 1, message: 'Incorrect name or number'}
        );
        return
    }

    let auctionData = {
        name: data.name.trim()+'',
        number: +data.number,
        date: `${+data.date[2]}-${+data.date[1]}-${+data.date[0]} ${+data.date[3]}:${+data.date[4]}:00.000 +00:00`,
        userId: +data.userId,
        isArchive: false
    };

    Auction.create(auctionData)
        .then(function (auction) {
            socket.emit('auctionCreated', {
                'err': 0,
                auction: {
                    id : auction.id,
                    name : auction.name
                }
            });
        }).catch(function (err) {
        socket.emit('auctionCreated',
            {err: 1, message: err.message}
        );
    })
};