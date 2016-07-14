/**
 * Created by emmtech on 14.07.16.
 */

'use strict';

const Lot = require('../../models').Lot;

module.exports = function (socket, data) {
    Lot.findOne({
        where: {id: data.id}
    }).then((result)=> {
        result.isPlayOut = true;
        return result.save().then(()=>{
            socket.emit('auctionStart',{
                err: 0,
                data: result
            });
        }).catch((err)=>{
            socket.emit('auctionStart',{
                err: 1,
                message: err.message
            });
        })
    }).catch((err)=>{
        socket.emit('auctionStart',{
            err: 1,
            message: err.message
        });
    })
};