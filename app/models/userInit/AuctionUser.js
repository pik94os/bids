/**
 * Created by piligrim on 05.07.16.
 */
var Sequelize = require('sequelize');

var attributes = {
    number: {type: Sequelize.INTEGER, default: null},
    isArchive: {type: Sequelize.BOOLEAN, default: false}
};

module.exports.attributes = attributes;