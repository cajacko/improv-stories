/**
 * Define config details not be saved in version control
 */

var config = {};

config.MySql = {
    host: '',
    user: '',
    password: '',
    database: ''
};

config.facebook = {
    clientID: '',
    clientSecret: ''
};

config.email = {
    host: '',
    port: '',
    secure: '',
    auth: {
        user: '',
        pass: ''
    }
};

module.exports = config;
