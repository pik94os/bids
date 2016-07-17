'use strict';
const Auction = require('../../models').Auction;
module.exports = function (socket, data) {
    Auction.update({
        webcam: data.name
    }, {
        where: {id: +data.auctionId}
    }).then((auction)=> {
        lot.isPlayOut = true;
        return lot.save().then(()=> {
            socket.to('auction:' + (+data.auctionId)).emit('webcam', {name: data.name});
        });
    });
};