var Sequelize = require('sequelize');

var attributes = {
    // поля пользователя
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
    phone: {type: Sequelize.STRING},
    confirmationCode: {type: Sequelize.INTEGER},
    password: {type: Sequelize.STRING},
    salt: {type: Sequelize.STRING},
    
    // поля аукционного дома
    index: {type: Sequelize.INTEGER},
    country: {type: Sequelize.STRING},
    city: {type: Sequelize.STRING},
    street: {type: Sequelize.STRING},
    house: {type: Sequelize.INTEGER},
    office: {type: Sequelize.INTEGER},

    // поля кредитной карты
    typeOfCard: {type: Sequelize.STRING},
    icon: {type: Sequelize.STRING},
    image: {type: Sequelize.STRING},
    numberOfCard: {type: Sequelize.INTEGER},
    nameOfCardHolder: {type: Sequelize.STRING},
    month: {type: Sequelize.INTEGER},
    year: {type: Sequelize.INTEGER},
    cardCode: {type: Sequelize.INTEGER},

    // прочее
    acceptTerms: {type: Sequelize.BOOLEAN},
    receiveMessages: {type: Sequelize.BOOLEAN},
    isArchive: {type: Sequelize.BOOLEAN},
    state: {type: Sequelize.INTEGER, default: null}
};

var options = {
    freezeTableName: true,
    setterMethods: {
        setPassword: function (value) {
            this.setDataValue('password', value);
            this.setDataValue('salt', Math.round((new Date().valueOf() * Math.random())) + '');
        },

        setRole: function (value) {
            this.setDataValue('UserID', value);
        }
    }
};

module.exports.attributes = attributes;
module.exports.options = options;