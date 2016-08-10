/**
 * Created by emmtech on 16.07.16.
 */
'use strict';

const Bid = require('../../models/').Bid;
const User = require('../../models').User;
const Lot = require('../../models').Lot;
module.exports = function(socket, data) {
    if (!data.auctionId) {
        socket.emit('bidList',
            {err: 1, message: 'Undefined auction identifier'}
        );
        return
    }
    let include = [{model: User, attributes: ['id', 'firstName', 'lastName', 'patronymic']},
        {model: Lot}];
    Bid.findAll({
        where: {
            lotId: data.lotId
        },
        order: [['id', 'DESC']],
        include
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