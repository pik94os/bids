/**
 * Created by piligrim on 05.07.16.
 */
var Sequelize = require('sequelize');

var attributes = {
    username: {
        type: Sequelize.STRING
        // allowNull: false,
        // unique: true,
        // validate: {
        //     is: /^[a-z0-9@\.\_\-]+$/i,
        // }
    },
    firstName: {type: Sequelize.STRING},
    lastName: {type: Sequelize.STRING},
    patronymic: {type: Sequelize.STRING},
    email: {
        type: Sequelize.STRING,
        validate: {
            isEmail: true
        }
    },
    phone: {type: Sequelize.INTEGER},
    confirmationCode: {type: Sequelize.INTEGER},
    password: {type: Sequelize.STRING},
    salt: {type: Sequelize.STRING},
    acceptTerms: {type: Sequelize.BOOLEAN},
    receiveMessages: {type: Sequelize.BOOLEAN},
    index: {type: Sequelize.INTEGER},
    country: {type: Sequelize.STRING},
    city: {type: Sequelize.STRING},
    street: {type: Sequelize.STRING},
    house: {type: Sequelize.INTEGER},
    office: {type: Sequelize.INTEGER},
    isArchive: {type: Sequelize.BOOLEAN}
};

module.exports.attributes = attributes;