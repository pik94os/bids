/**
 * Created by emmtech on 16.07.16.
 */
'use strict';
let Auction = require('../../models/').Auction;

module.exports = function(socket, data) {

    if(!data.id){
        socket.emit('auctionUpdate', {
            err: 1,
            message: 'not id'
        });
        return
    }
    Auction.findOne({
        where: {
            id: data.auctionId
        }
    }).then(()=>{
         return Auction.update({
        date: data.date},
        {
                 where: {id: +data.id}
        }).then((action)=>{
             socket.to('auction:' + (+action)).emit('auctionDate', {
                date: data.date
             });
         })
    }).catch((err)=>{
        socket.emit('auctionUpdate', {
            err: 1,
            message: err.message
        });
    })
};
