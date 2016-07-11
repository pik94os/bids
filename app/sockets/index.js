//Сокеты
'use strict';
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
            //аукционы
            {event:'auction/create', access:0, comment: "создание аукциона"},
            {event:'auction/room', access:0, comment: "комната аукциона"},
            {event:'auction/list', access:0, comment: "получение списка аукционов"},
            {event:'auction/getLotList', access:0, comment: "получение списка лотов"},
            {event:'auction/getLot', access:0, comment: "получение одного лота"},
            {event:'createNewLotFromCSV', access:0, comment: "создание лотов из CSV"},
            {event:'auction/createLot', access:0, comment: "создание лота"},
            {event:'auction/confirmLot', access:0, comment: "подтверждение лота"},
            {event:'auction/getAuction', access:0, comment: "запрос аукциона по id"}
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

        socket.on('disconnect', function () {

        });
    });
};
