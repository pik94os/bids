/**
 * Created by piligrim on 15.07.16.
 */
'use strict';
let Chat = require('../../models/').Chat;

module.exports = function(socket, data) {
    if (!data.auctionId) {
        socket.emit('lotList',
            {err: 1, message: 'Undefined auction identifier'}
        );
        return
    }
    
    let _chatData = {
        userId: data.userId,
        auctionId: data.auctionId,
        message: data.chatMessage
    };

    Chat.create(_chatData);
};