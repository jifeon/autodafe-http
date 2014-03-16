var vows = require('vows'),
    assert = require('assert'),
    http = require('http'),
    tools = require('../../../autodafe/tests/tools'),
    simpleAppPort = tools.getFreePort(),
    basicAuthAppPort = tools.getFreePort();

vows.describe('http server').addBatch({
    'simple http connection': {
        'should not fall on a start': function () {
            assert.doesNotThrow(function () {
                require('../apps/http_app').getApp({
                    port: simpleAppPort
                });
            });
        },
        'should give files from the public folder': {
            topic: function () {
                var self = this;
                http.request({
                    port: simpleAppPort,
                    path: '/test.html'
                }, function (response) {
                    self.callback(null, response);
                }).on('error', function (e) {
                    self.callback(e);
                }).end();
            },
            'with status 200': function (e, response) {
                assert.isNull(e);
                assert.equal(response.statusCode, 200);
            },
            'with content': {
                topic: function (response) {
                    var self = this;
                    response
                        .on('data', function (data) {
                            self.callback(null, data.toString());
                        })
                        .on('error', function (e) {
                            self.callback(e);
                        })
                },
                'equals to Hello World': function (e, data) {
                    assert.equal(data, 'Hello World');

                }
            }
        }
    },
    'http connection with basic auth': {
        'should not fall on a start': function () {
            assert.doesNotThrow(function () {
                require('../apps/http_app').getApp({
                    port: basicAuthAppPort,
                    basicAuth: {
                        message: 'Private zone',
                        users: {
                            user: 'pass'
                        }
                    }
                });
            });
        },
        'should not give files from the public folder without auth': {
            topic: function () {
                var self = this;
                http.request({
                    port: basicAuthAppPort,
                    path: '/test.html'
                }, function (response) {
                    self.callback(null, response);
                }).on('error', function (e) {
                    self.callback(e);
                }).end();
            },
            'with status 401': function (e, response) {
                assert.isNull(e);
                assert.equal(response.statusCode, 401);
            },
            'with content': {
                topic: function (response) {
                    var self = this;
                    response
                        .on('data', function (data) {
                            self.callback(null, data.toString());
                        })
                        .on('error', function (e) {
                            self.callback(e);
                        })
                },
                'equals to Private zone': function (e, data) {
                    assert.equal(data, 'Private zone');
                }
            }
        },
        'should give files from the public folder for authorized user': {
            topic: function () {
                var self = this;
                http.request({
                    port: basicAuthAppPort,
                    path: '/test.html',
                    auth: 'user:pass'
                }, function (response) {
                    self.callback(null, response);
                }).on('error', function (e) {
                    self.callback(e);
                }).end();
            },
            'with status 200': function (e, response) {
                assert.isNull(e);
                assert.equal(response.statusCode, 200);
            },
            'with content': {
                topic: function (response) {
                    var self = this;
                    response
                        .on('data', function (data) {
                            self.callback(null, data.toString());
                        })
                        .on('error', function (e) {
                            self.callback(e);
                        })
                },
                'equals to Hello World': function (e, data) {
                    assert.equal(data, 'Hello World');
                }
            }
        }
    }
}).export(module);