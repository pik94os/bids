/**
 * Created by Alex on 01.06.2016.
 */
'use strict';
const User = require('../models/').User;
const Role = require('../models/').Role;
const Sequelize = require('sequelize');

module.exports = function (socket, data) {
    const role=socket.request.user.roleId;
    const _offset = data.offset ? parseInt(data.offset) : 0;
    const _limit = data.limit ? parseInt(data.limit) : 0;
    let _order = [];

    if(data.sort['fio']!==undefined && data.sort['fio']){
        _order.push(['lastName', data.sort['fio']-1 ? 'DESC':'ASC']);
        _order.push(['firstName', data.sort['fio']-1 ? 'DESC':'ASC']);
        _order.push(['patronymic', data.sort['fio']-1 ? 'DESC':'ASC']);
        data.sort['fio'] = 0;
    }
    
    if(data.sort!==undefined) {
        for (var key in data.sort) {
            if(key!==null && data.sort[key]) {
                _order.push([key, data.sort[key]-1 ? 'DESC':'ASC'])
            }
        }
    }

    let where = {
        isArchive: false
    };
    if(data!=undefined){
        
        if(data.filter!==undefined){
            if(data.filter.introduce!==undefined && data.filter.introduce.trim()){
                where.introduce = {
                    $iLike : `%${data.filter.introduce.trim()}%`
                };
            }
            if(data.filter.name!==undefined && data.filter.name.trim()){
                where.$or = [
                    {firstName :{
                        $iLike : `%${data.filter.name.trim()}%`
                    }},
                    {lastName :{
                        $iLike : `%${data.filter.name.trim()}%`
                    }},
                    {patronymic :{
                        $iLike : `%${data.filter.name.trim()}%`
                    }}
                ]
            }
            if(data.filter.firstName!==undefined && data.filter.firstName.trim()) {
                where.firstName = {
                        $iLike : `%${data.filter.firstName.trim()}%`
                };
            }
            if(data.filter.lastName!==undefined && data.filter.lastName.trim()) {
                where.lastName= {
                        $iLike : `%${data.filter.lastName.trim()}%`
                };
            }
            if(data.filter.patronymic!==undefined && data.patronymic.trim()) {
                where.patronymic = {
                        $iLike : `%${data.filter.patronymic.trim()}%`
                }
            }
            if(data.filter.email!==undefined && data.filter.email.trim()){
                where.email = {
                    $iLike: `%${data.filter.email.trim()}%`
                };
            }

            if(data.filter.phone!==undefined && data.filter.phone.trim()){
                where.description = {
                    $iLike: `%${data.filter.phone.trim()}%`
                };
            }

            if(data.filter.implementing!==undefined && data.filter.implementing.trim()){
                where.description = {
                    $iLike: `%${data.filter.implementing.trim()}%`
                };
            }
        }
    }

    // Todo : право на просмотр списка пользователей
    // if(!role||role>2){
    //     socket.emit('userListSelected', {
    //         'err': 1,
    //         message: 'no access'
    //     });
    //     return false;
    // }

    if(+role===1){
        where.roleId = 2;
    }


    User.findAndCountAll({
        where: where,
        offset: _offset,
        limit: _limit,
        order: _order,
        // include: [{
        //     model: Role,
        //     where: {id: Sequelize.col('user.roleId')}
        // }]
    })
        .then(function (result) {
            socket.emit('userListSelected', {
                'err': 0,
                users: result
            });
        }).catch(function (err) {
        socket.emit('userListSelected',
            {err: 1, message: err.message}
        );
    })
};