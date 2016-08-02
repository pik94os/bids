'use strict';

module.exports = function (socket, passportSocketIo, io) {
    const AuctionUser = require('../models').AuctionUser;
    let user = socket.request.user;
    if(socket.request.user.logged_in) {
        let usrs = passportSocketIo.filterSocketsByUser(io, function (u) {
            if (u.id != undefined && u.id) {
                return u.id.toString() === user.id.toString();
            }
            return false;
        });
        console.log('>>>>>>users>>>>>>', usrs.length, user.id);
        if(!usrs.length){
            AuctionUser.findOne({
                where: {
                    userId: user.id
                }
            }).then((auction)=> {
                console.log('>>>>>>auction>>>>>>', usrs.length, user.id);

            })
        }
    }
};