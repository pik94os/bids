/**
 * Created by piligrim on 07.07.16.
 */
'use strict';
const express = require('express');
const fs = require("fs");
const multiparty = require('multiparty');
const Lot = require('../models/').Lot;
// const Learner = require('../models/').Learner;
// const File = require('../models/').File;
// const FileSchedule= require('../models/').FileSchedule;
// const router = express.Router();

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