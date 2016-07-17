/**
 * Created by piligrim on 15.07.16.
 */
'use strict';

let Chat = require('../../models/').Chat;

module.exports = function(socket, data) {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>');
    if (!data.auctionId) {
        socket.emit('chatMessagesList',
            {err: 1, message: 'Undefined auction identifier'}
        );
        return
    }
    
    Chat.findAll({where: {auctionId: +data.auctionId}})
        .then(function(chatMessagesList) {
            socket.emit('chatMessagesList', {
                'err': 0,
                chatMessagesList: chatMessagesList
            });
        });
};