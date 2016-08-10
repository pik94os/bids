'use strict';

module.exports = function (socket, passportSocketIo, io, state) {
    const AuctionUser = require('../models').AuctionUser;
    const Lot = require('../models').Lot;
    let auction_id;
    let lot_id;
    if(socket.handshake.query.loc){
        if(socket.handshake.query.loc.indexOf('/auction')+1){
            auction_id = getParameterByName('auctionId',socket.handshake.query.loc);
        }
        if(socket.handshake.query.loc.indexOf('/room')+1){
            auction_id = getParameterByName('auctionId',socket.handshake.query.loc);
        }
        if(socket.handshake.query.loc.indexOf('/auction-leading')+1){
            auction_id = getParameterByName('auctionId',socket.handshake.query.loc);
        }
        if(socket.handshake.query.loc.indexOf('/lot')+1){
            lot_id = getParameterByName('lotId',socket.handshake.query.loc);
        }
        if(lot_id){
            Lot.findById(+lot_id).then( (lot)=> socket.join('auction:' + lot.auctionId) );
        }else{
            socket.join('auction:' + auction_id);
        }
    }


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

function getParameterByName(name, url) {
    if (!url) return false;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}