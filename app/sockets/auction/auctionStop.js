/**
 * Created by emmtech on 17.07.16.
 */
'use strict';

const Auction = require('../../models/').Auction;

module.exports = function (socket, data) {
    if(socket.request.user.roleId !== 3 && !socket.request.user.id) {
        return false
    } else {
        if (!data.id) {
            socket.emit('stopAuction', {
                err: 1,
                message: 'Not id auction'
            });
            return
        }
        Auction.update({
            isClose: new Date()
        }, {
            where: {
                id: data.id
            }
        }).then(()=> {
            socket.emit('stopAuction', {
                err: 0,
                stop: true
            });
            socket.to('auction:' + data.id).emit('stopAuction')
        }).catch((err)=> {
            socket.emit('stopAuction', {
                err: 1,
                message: err.message
            });
        });
    }
};