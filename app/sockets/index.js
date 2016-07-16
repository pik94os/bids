//Сокеты
'use strict';
const uuid = require('node-uuid');
let rooms = {},
    userIds = {};
module.exports = function(io,passportSocketIo) {
    io.on('connection', function(socket){
        // const user=socket.request.user;
        // socket.io=io;
        // if(socket.request.user.logged_in){
        //     socket.passport=passportSocketIo;
        //     passportSocketIo.filterSocketsByUser(io, function(u){
        //         if(u._id!=undefined && u._id){
        //             return u._id.toString() === user._id.toString();
        //         }
        //         return false;
        //     }).forEach(function(s){
        //         s.emit('auth', {id:user._id, socket:socket.id});
        //     });
        // }else{
        //     socket.emit('auth',{id:0});
        // }
        //
        // socket.on('connection', function(data){
        //     console.log(data);
        // });

        //список событий в виде массива (указать имя файла-обработчика)
        const events=[
            //User
            {event:'getUserInfo', access:0, comment: "получение информации о пользователе" },
            {event:'createNewUser', access:0, comment: "создание нового пользователя"},
            {event:'editUser', access:0, comment: "редактирование пользователя"},
            {event:'deleteUser', access:0, comment: "удаление пользователя"},
            {event:'getUserList', access:0, comment: "запрос списка пользователей"},
            {event:'getUser', access:0, comment: "получение информации пользователя"},
            {event:'getUserRoles', access:0, comment: "получение списка ролей пользователей"},
            {event:'user/getUserAuction', access:0, comment: "запрос списка аукционов пользователя"},
            //аукционы
            {event:'auction/create', access:0, comment: "создание аукциона"},
            {event:'auction/room', access:0, comment: "комната аукциона"},
            {event:'auction/list', access:0, comment: "получение списка аукционов"},
            {event:'auction/getLotList', access:0, comment: "получение списка лотов"},
            {event:'auction/getLot', access:0, comment: "получение одного лота"},
            {event:'createNewLotFromCSV', access:0, comment: "создание лотов из CSV"},
            {event:'auction/createLot', access:0, comment: "создание лота"},
            {event:'auction/confirmLot', access:0, comment: "подтверждение лота"},
            {event:'auction/getAuction', access:0, comment: "запрос аукциона по id"},
            {event:'auction/updateAuction', access:0, comment: "обновление аукциона"},
            // картинки
            {event:'auction/getPictureList', access:0, comment: "получение списка картинок"},
            {event:'userAuction', access:0, comment: "регистрация пользователя для аукциона"},
            //лоты
            {event:'auction/updateLot', access:0, comment: "обновление лотов"},
            {event:'auction/startAuction', access:0, comment: "запуск разыгрываемого первого лота"},
            // чат
            {event:'auction/pasteChatMessage', access:0, comment: "добавление сообщений в чат"},
            {event:'auction/getChatMessages', access:0, comment: "получение сообщений из чата определенного аукциона"}
        ];

        //цикл проходит по всем элементам массива возвращая нужное событие
        events.forEach(function(val){
            socket.on(val.event, function(data){
                if(process.env.NODE_ENV === 'development'){
                    socket.emit('debug',{title:val.comment,data:JSON.stringify(data)});                    
                }
                if(!val.access || socket.request.user.logged_in) {
                    require(`./${val.event}`)(socket, data);
                }
            });
        });

        let currentRoom, id;

        socket.on('init', function (data, fn) {
            currentRoom = (data || {}).room || uuid.v4();
            var room = rooms[currentRoom];
            if (!data) {
                rooms[currentRoom] = [socket];
                id = userIds[currentRoom] = 0;
                fn(currentRoom, id);
                console.log('Room created, with #', currentRoom);
            } else {
                if (!room) {
                    return;
                }
                userIds[currentRoom] += 1;
                id = userIds[currentRoom];
                fn(currentRoom, id);
                room.forEach(function (s) {
                    s.emit('peer.connected', { id: id });
                });
                room[id] = socket;
                console.log('Peer connected to room', currentRoom, 'with #', id);
            }
        });

        socket.on('msg', function (data) {
            var to = parseInt(data.to, 10);
            if (rooms[currentRoom] && rooms[currentRoom][to]) {
                console.log('Redirecting message to', to, 'by', data.by);
                rooms[currentRoom][to].emit('msg', data);
            } else {
                console.warn('Invalid user');
            }
        });

        socket.on('disconnect', function () {
            if (!currentRoom || !rooms[currentRoom]) {
                return;
            }
            delete rooms[currentRoom][rooms[currentRoom].indexOf(socket)];
            rooms[currentRoom].forEach(function (socket) {
                if (socket) {
                    socket.emit('peer.disconnected', { id: id });
                }
            });
        });
    });
};
