/**
 * Created by emmtech on 16.07.16.
 */
'use strict';
let Auction = require('../../models/').Auction;

module.exports = function(socket, data) {
    if(socket.request.user.roleId !== 5 && !socket.request.user.id) {
        return false
    } else {
        if (!data.id) {
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
        }).then(()=> {
            return Auction.update({
                    date: data.date
                },
                {
                    where: {id: +data.id}
                }).then(()=> {
                socket.to('auction:' + (+data.id)).emit('auctionDate', {
                    date: data.date
                });
            })
        }).catch((err)=> {
            socket.emit('auctionUpdate', {
                err: 1,
                message: err.message
            });
        })
    }
};
