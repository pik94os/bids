/**
 * Created by piligrim on 07.07.16.
 */
'use strict';

const Lot = require('../models/userInit').Lot;

module.exports = function (socket, data) {

    let myCount = {
        renewedRows: 0,
        createdRows: 0
    };
    let usernameCSVArray = [];
    data.CSVParsedFile.forEach(function (row) {
        usernameCSVArray.push(row.username);
    });
    let where = {
        // isArchive: false,
        username: {$in: usernameCSVArray}
    };
    
    

    // User.findAll({where}).then(function (result) {
    //     let _insert = [];
    //     let updated;
    //     let allUpdatesSuccess=[];
    //     data.CSVParsedFile.every(function (row) {
    //         let _userData = {
    //             username: row.username,
    //             email: row.email,
    //             firstName: row.firstName,
    //             lastName: row.lastName,
    //             patronymic: row.patronymic,
    //             phone: row.phone,
    //             introduce: row.introduce,
    //             // implementing: row.implementing,
    //             // numberOfClasses : row.numberOfClasses,
    //             password: row.password,
    //             isArchive: false,
    //             roleId: data.roleId
    //         };
    //         let isNew = result.every(function (user) {
    //             if (user.username === _userData.username) {
    //                 if (+data.importParams > 1) {
    //                     let key;
    //                     for (key in _userData) {
    //                         user[key] = _userData[key];
    //                     }
    //                     allUpdatesSuccess.push(user.save().then(function (createdUser) {
    //                         if (_userData.roleId == 4){
    //                             return Learner.findOne({where: {userId: createdUser.id}}).then(function (learner) {
    //                                 if(learner==null){
    //                                     return Learner.create({
    //                                         isArchive:false,
    //                                         userId: +createdUser.id,
    //                                         classId: +data.classSelected
    //                                     });
    //                                 }
    //                                 learner.classId = +data.classSelected;
    //                                 myCount.renewedRows++;
    //                                 return learner.save();
    //
    //                             })
    //                         }
    //                         myCount.renewedRows++;
    //                     }));
    //                 }
    //                 return false;
    //             }
    //             return true;
    //         });
    //         if (isNew) {
    //             _userData.schoolId = +socket.request.user.schoolId;
    //             _insert.push(_userData);
    //         }
    //         return true;
    //     });
    //     updated = Promise.all(allUpdatesSuccess);
    //     if (+data.importParams == 3 || _insert.length < 1) {
    //         updated.then(function (d) {
    //             socket.emit("createCSVReport",myCount);
    //         });
    //         return false;
    //     }
    //     let createdUsers=[];
    //     _insert.every(function (userData) {
    //         if (userData !== null) {
    //             createdUsers.push(User.create(userData).then(function (createdUser) {
    //                 myCount.createdRows++;
    //                 if (userData.roleId == 4){
    //                     return Learner.create({
    //                         isArchive:false,
    //                         userId: +createdUser.id,
    //                         classId: +data.classSelected
    //                     });
    //                 }
    //
    //             }))
    //         }
    //         return true;
    //     });
    //     Promise.all([...createdUsers, updated]).then(function () {
    //         socket.emit('createCSVReport', myCount);
    //     });
    //
    // });

};