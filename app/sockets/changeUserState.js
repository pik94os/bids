'use strict';

module.exports = function (socket, passportSocketIo, io, state) {
    const AuctionUser = require('../models').AuctionUser;
    // const User = require('../models').User;
    let user = socket.request.user;
    if(socket.request.user.logged_in) {
        let usrs = passportSocketIo.filterSocketsByUser(io, function (u) {
            if (u.id != undefined && u.id) {
                return u.id.toString() === user.id.toString();
            }
            return false;
        });
        if(!usrs.length || state!==1){
            AuctionUser.findOne({
                where: {
                    userId: user.id
                }
            }).then((auction)=> {
                socket.to('auction:' + (+auction.auctionId)).emit('changeUserState');
                if(auction.isArchive) {
                    user.state = 2
                } else {
                    user.state = state;
                }
                return user.save();
            }).catch(()=> {
                socket.emit('userDisconnect', {err: 1, message: 'ERROR: user banner'})
            })
        }
    }
};