/**
 * Created by piligrim on 08.07.16.
 */
var Sequelize = require('sequelize');

var attributes = {
    // roleName: {
    //     type: Sequelize.STRING,
    //     allowNull: false,
    //     unique: true,
    //     validate: {
    //         is: /^[a-z0-9\_\-]+$/i
    //     }
    // },

    originalName: {type: Sequelize.STRING},
    fileName: {type: Sequelize.STRING},
    isArchive: {type: Sequelize.BOOLEAN}
};

module.exports.attributes = attributes;
// module.exports.options = options;
