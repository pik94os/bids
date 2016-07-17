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
    // Auction.findAll({where: {id: data.id, isArchive: false}}).then((data)=> {
    Auction.findById(data.id).then((data)=> {
        socket.emit('catchAuction', {
            err: 0,
            data: data
        });
        socket.join('auction:' + data.id);
    }).catch((err)=>{
        socket.emit('catchAuction', {
            err: 1,
            message: err.message
        });
    })
};