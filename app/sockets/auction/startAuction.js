/**
 * Created by emmtech on 14.07.16.
 */

'use strict';

const Lot = require('../../models').Lot;
const Auction = require('../../models').Auction;
module.exports = function (socket, data) {
    Lot.findOne({
        where: {id: data.id}
    }).then((lot)=> {
        return Auction.update({
            start: new Date()
        }, {
            where: {id: +lot.auctionId}
        }).then((auction)=> {
            lot.isPlayOut = true;
            return lot.save().then(()=> {
                socket.to('auction:' + lot.auctionId).emit('auctionRun', {});
                socket.emit('auctionStart', {
                    err: 0,
                    data: lot
                });
            });
        });
    }).catch((err)=>{
        socket.emit('auctionStart',{
            err: 1,
            message: err.message
        });
    })
};