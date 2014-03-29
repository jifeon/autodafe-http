var autodafe = require('autodafe');

module.exports = {
    getApp: function (httpConfig) {
        var app = autodafe.config({
            basePath: __dirname,
            silent: true,

            components: {
                http: httpConfig
            }
        });

        var component = new autodafe.Component({
            name: 'test'
        });

        component.processRequest = function (request, callback) {
            if (request.getPath() == '/action') {
                var params = request.getParams();
                request.end(params['param1'] + ',' + params['param2']);
            }
            callback();
        };

        app.load(component);
    }
};