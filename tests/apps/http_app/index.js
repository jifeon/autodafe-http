var autodafe = require('autodafe');

module.exports = {
    getApp: function (httpConfig) {
        return autodafe.config({
            basePath: __dirname,
            silent: true,

            components: {
                http: httpConfig
            }
        });
    }
};