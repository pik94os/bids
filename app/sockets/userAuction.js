/**
 * Created by emmtech on 11.07.16.
 */

'use strict';
const AuctionUser = require('../models/').AuctionUser;

module.exports = function (socket, data) {
    if(!data.userId) {
        socket.emit('auctionUser', {
            err: 1,
            message: 'not userId'
        });
        return
    }
    AuctionUser.create({
        userId: data.userId,
        auctionId: data.auctionId
    }).then(()=>{
        socket.emit('auctionUser',{});
    })
};