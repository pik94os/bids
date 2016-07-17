/**
 * Created by piligrim on 05.07.16.
 */
var Sequelize = require('sequelize');

var attributes = {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    number: {type: Sequelize.INTEGER},
    webcam: {type: Sequelize.INTEGER},
    date: {type: Sequelize.DATE},
    start: {type: Sequelize.DATE},
    isArchive: {type: Sequelize.BOOLEAN}
};

module.exports.attributes = attributes;
// module.exports.options = options;