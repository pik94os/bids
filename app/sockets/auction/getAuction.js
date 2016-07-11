/**
 * Created by emmtech on 11.07.16.
 */
'use strict';

const Auction = require('../../models/').Auction;

module.exports = function (socket, data) {
    if(!data.id) {
        socket.emit('catchAuction', {
            err: 1,
            message: 'Undefined auction identifier'
        });
        return
    }
    Auction.findById(data.id).then((data)=> {
        socket.emit('catchAuction', {
            err: 0,
            data: data
        });
    }).catch((err)=>{
        socket.emit('catchAuction', {
            err: 1,
            message: err.message
        });
    })
};