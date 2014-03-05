var vows = require('vows'),
    assert = require('assert'),
    http = require('http');

vows.describe('http server').addBatch({
    'should not fall on a start': function () {
        assert.doesNotThrow(function () {
            require('../apps/simple_http_test');
        });
    },
    'should give files from the public folder': {
        topic: function () {
            http.get({
                port: 3000,
                path: '/test.html'
            }, this.callback).on('error', this.callback);
        },
        'with status 200': function (e, response) {
            assert.isNull(e);
            assert.equal(response.status, 200);
        },
        'with right content': function (e, response) {
            console.dir(response);

        }
    }
}).export(module);