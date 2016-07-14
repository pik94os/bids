/**
 * Created by emmtech on 14.07.16.
 */

'use strict';

const Lot = require('../../models').Lot;

module.exports = function (socket, data) {
    Lot.findOne({
        where: {id: data.id}
    }).then((lot)=> {
        return Auction.update({
            start: new Date
        }, {
            where: {id: data.id}
        }).then(()=> {
            lot.isPlayOut = true;
            return lot.save().then(()=> {
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