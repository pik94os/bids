/**
 * Created by emmtech on 16.07.16.
 */
'use strict';

var Bid = require('../../models/').Bid;

module.exports = function(socket, data) {
    if (!data.auctionId) {
        socket.emit('bidList',
            {err: 1, message: 'Undefined auction identifier'}
        );
        return
    }
    let where = {isArchive: false};
    let select = {where};

    Bid.findAll({
        select
    }).then((bid)=>{
        socket.emit('bidList', {
            bids: bid
        });
    }).catch((err)=>{
        socket.emit('bidList', {
            err: 1,
            message: err.message
        });
    })
};