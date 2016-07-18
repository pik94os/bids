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
            where: {$and:[{
                id: +lot.auctionId
            },['auctions.start IS NULL']]}
        }).then((auction)=> {
            lot.isPlayOut = true;
            return lot.save().then(()=> {
                socket.to('auction:' + lot.auctionId).emit('auctionRun', {});
                socket.emit('auctionStart', {
                    err: 0,
                    data: lot
                });
                return Auction.update({
                    isClose: null
                }, {
                    where: {id: +lot.auctionId}
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