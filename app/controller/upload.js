/**
 * Created by piligrim on 07.07.16.
 */
'use strict';
const express = require('express');
const fs = require("fs");
const multiparty = require('multiparty');
const Lot = require('../models/').Lot;
const LotPicture = require('../models/').LotPicture;
// const Learner = require('../models/').Learner;
// const File = require('../models/').File;
// const FileSchedule= require('../models/').FileSchedule;
// const router = express.Router();

/** загрузка фотографий лотов
 * multiparty
 *https://www.npmjs.com/package/multiparty*/

exports.lotPic = function (req, res, next) {
    // создаем форму
    var form = new multiparty.Form();
    //здесь будет храниться путь с загружаемому файлу, его тип и размер
    var uploadFile = {uploadPath: '', type: '', size: 0};
    //максимальный размер файла
    var maxSize = 2 * 1024 * 1024; //2MB
    //поддерживаемые типы(в данном случае это картинки формата jpeg,jpg и png)
    var supportMimeTypes = ['image/jpg', 'image/jpeg', 'image/png'];
    //массив с ошибками произошедшими в ходе загрузки файла
    var errors = [];

    //если произошла ошибка
    form.on('error', function(err){
        if(fs.existsSync(uploadFile.path)) {
            //если загружаемый файл существует удаляем его
            fs.unlinkSync(uploadFile.path);
            console.log('error');
        }
    });

    form.on('close', function() {
        //если нет ошибок и все хорошо
        if(errors.length == 0) {
            //сообщаем что все хорошо
            res.send({
                status: 'ok', 
                text: 'Success'
            });
        }
        else {
            if(fs.existsSync(uploadFile.path)) {
                //если загружаемый файл существует удаляем его
                fs.unlinkSync(uploadFile.path);
            }
            //сообщаем что все плохо и какие произошли ошибки
            res.send({status: 'bad', errors: errors});
        }
    });

    // при поступление файла
    form.on('part', function(part) {
        //читаем его размер в байтах
        uploadFile.size = part.byteCount;
        //читаем его тип
        uploadFile.type = part.headers['content-type'];
        //путь для сохранения файла
        var fileName = Date.now() + '.jpg';
        uploadFile.path = './public/images/lot-images/' + fileName;

        //проверяем размер файла, он не должен быть больше максимального размера
        // if(uploadFile.size > maxSize) {
        //     errors.push('File size is ' + uploadFile.size + '. Limit is' + (maxSize / 1024 / 1024) + 'MB.');
        // }

        //проверяем является ли тип поддерживаемым
        if(supportMimeTypes.indexOf(uploadFile.type) == -1) {
            errors.push('Unsupported mimetype ' + uploadFile.type);
        }

        //если нет ошибок то создаем поток для записи файла
        if(errors.length == 0) {
            var out = fs.createWriteStream(uploadFile.path);
            LotPicture.update({
                //fileName:fileName
                fileName
            },{
                where:{
                    originalName:part.filename
                }
            }).then(function (result) {
                socket.emit('pictureUpdatedReport', {
                    pictureUpdatedName: result
                });
            });
            part.pipe(out);
        }
        else {
            //пропускаем
            //вообще здесь нужно как-то остановить загрузку и перейти к onclose
            part.resume();
        }
    });

    // парсим форму
    form.parse(req);


};

// загрузка и парсинг лотов из CSV
// http://csv.adaltas.com/parse/examples/
exports.lotCSV = function (req, res) {

    var csv = require('csv-parser');
    // var fs = require('fs')

    var form = new multiparty.Form();

    var data = [];
    // var uploadFile = {uploadPath: '', type: '', size: 0};

    form.on('part', function (part) {
        // uploadFile.size = part.byteCount;
        // console.log('ФАЙЛ:', uploadFile);
        // res.status(200).send(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>pong!");
        part.pipe(csv([/*'auctionName',*/ 'id', 'lotNumber', 'description', 'estimate', 'sellingPrice', 'year', 'titlePic', 'gallery'], {
            raw: true,
            separator: ','
        }))
            .on('data', function (row) {
                data.push(row);
            })
            .on('end', function () {
                res.json(data);
            });
        // res.end(data);
    });
    form.parse(req);

//     var parse = require('csv-parse');
//     require('should');
//
//     var output = [];
// // Create the parser
//     var parser = parse({delimiter: ':'});
// // Use the writable stream api
//     parser.on('readable', function(){
//         var record;
//         while (record = parser.read()) {
//             output.push(record);
//         }
//     });
// // Catch any error
//     parser.on('error', function(err){
//         console.log(err.message);
//     });
// // When we are done, test that the parsed output matched what expected
//     parser.on('finish', function(){
//         output.should.eql([
//             [ 'root','x','0','0','root','/root','/bin/bash' ],
//             [ 'someone','x','1022','1022','a funny cat','/home/someone','/bin/bash' ]
//         ]);
//     });
// // Now that setup is done, write data to the stream
//     parser.write("root:x:0:0:root:/root:/bin/bash\n");
//     parser.write("someone:x:1022:1022:a funny cat:/home/someone:/bin/bash\n");
// // Close the readable stream
//     parser.end();
};