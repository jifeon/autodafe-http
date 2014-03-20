var autodafe = require('../../autodafe'),
    s = autodafe.sprintf,
    _ = autodafe._,
    fs = require('fs'),
    path = require('path'),
    url = require('url'),
    http = require('http'),
    contentTypes = require('./contentTypes');

/**
 * @class HTTPRequest
 * @extends AtdClass
 * @param {object} options
 * @param {http.ServerRequest} request
 * @param {http.ServerResponse} response
 * @param {HTTPConnection} connection todo: remove
 *
 */
var HTTPRequest = module.exports = autodafe.AtdClass.extend(/**@lends HTTPRequest*/{
    /**
     * @protected
     */
    _props: function () {
        this._super();

        /**
         * @type {http.ServerRequest}
         * @private
         */
        this._originRequest = this._options.request;

        /**
         * @type {http.ServerResponse}
         * @private
         */
        this._originResponse = this._options.response;
//        this._connection = this._options.connection;

        //todo: bad way, cause base path served in two places
        this._basePath = this._options.basePath;

        /**
         * // one year
         * @type {number}
         * @private
         */
        this._cacheMaxAge = 31536000;

        this._cookie = [];

        //todo: test to option
        this._publicFolderPath = path.resolve(this._basePath, this._options.publicFolderPath || 'public');

//        this._sid = null;
//        this.post_form = null;


        /**
         * HTTP method "post", "delete", "get", "update", etc.
         * @type {string}
         * @private
         */
        this._method = this._originRequest.method.toLowerCase();

        /**
         * @type {?string}
         */
//        this._host = this._originRequest.headers.host || '';

        /**
         * @type {String}
         */
        this._url = this._originRequest.url;

        /**
         * @type {Object}
         */
        this._parsedUrl = url.parse(this._url, true, true);

//        this.type = this._method;
//        if (!params.action) {
//            this.action = this.parsed_url.pathname;
//        }
//        if (!params.params) {
//            this.params = this.parsed_url.query;
//        }
    },

    /**
     * @protected
     * @constructs
     */
    _init: function () {
        this._super();

//        this._initSession();
        this._processRequest();
    },

//    _initSession: function () {
//        var sid = this._sid || this.get_cookie('autodafe_sid');
//
//        if (!sid) {
//            sid = String.unique();
//            this.set_cookie('autodafe_sid', sid);
//        }
//
//        return sid;
//    },

    _processRequest: function () {
//        this._originRequest.once('close', this._onClose.bind(this));

        switch (this._method) {
//            case 'post':
//                this._processPost();
//                break;

            default:
                this._processGet();
                break;
        }

//        this.log( 'Message has been received from %s. Session id - `%s`'.format( this.class_name, this.get_session_id() ) );
//
//        this.emit( 'receive_request', request );
//        this.connection.emit( 'receive_request', request, this );
//
//        try {
//            this.app.router.route( request );
//        }
//        catch ( e ) {
//            this.send_error( e );
//        }
    },

    _onClose: function () {
//        this.log('%s is disconnected ( session id=%s )'.format(this.class_name, this.get_session_id()));
//
//        this.emit('stop');
    },


//    _receive_post: function (query) {
//        var this = this;
//
//        this._.post_form = new formidable.IncomingForm;
//        this.post_form.uploadDir = this.connection.upload_dir;
//        this.post_form.keepExtensions = true;
//        try {
//            this.post_form.parse(this.request, function (e, fields, files) {
//                if (e) {
//                    return this.send_error(e);
//                }
//
//                query.params = Object.merge(fields, files);
//
//                if (this.connected) {
//                    HTTPClient.parent.receive.call(this, query);
//                }
//                else {
//                    this.on('connect', HTTPClient.parent.receive.bind(this, query));
//                }
//            });
//        }
//        catch (e) {
//            this.send_error(e);
//        }
//    },

    /**
     * @private
     */
    _processGet: function () {
        // check root folder: /folder/path/to/file
//        var matches = /^\/(.*?)(\/(.*))?$/.exec(query.parsed_url.pathname);
//        var folder = this.connection.get_root_folder(matches && matches[1] || '');
//        if (folder != null) {
        this._sendFile(path.join(this._publicFolderPath, this._url));
//        }

//        if (this.connected) {
//            HTTPClient.parent.receive.call(this, query);
//        }
//        else {
//            this.on('connect', HTTPClient.parent.receive.bind(this, query));
//        }
    },

    /**
     * Finishes the response
     * @param {string|Buffer} [data]
     * @param {string} [encoding]
     */
    end: function (data, encoding) {
        this._originResponse.end(data, encoding);
//        this.stop();
    },


//    get_cookie: function (name) {
//        return cookie.read(this.request.headers.cookie, name);
//    },
//
//
//    set_cookie: function (name, value, days) {
//        this._cookie.push(cookie.make(name, value, days));
//        try {
//            this.response.setHeader("Set-Cookie", this._cookie);
//        } catch (e) {
//            this.log(e);
//        }
//    },
//
//
//    send: function (data) {
//        HTTPClient.parent.send.call(this, data);
//        this.end(data, 'utf8');
//    },
//

    /**
     * @param {string} filePath
     * @private
     */
    _sendFile: function (filePath) {
        fs.stat(filePath, this._sendFileIfItIsModified.bind(this, filePath));
    },

    /**
     * @param {string} filePath
     * @param {?Error} e if fstat for filePath is crashed
     * @param {object} stats see {@link fs.stat}
     * @private
     * todo: tests
     */
    _sendFileIfItIsModified: function (filePath, e, stats) {
        if (e) {
            // todo: not only 404
            this._sendError(e, 404);
            return;
        }

        var cacheTime = new Date(this._originRequest.headers['if-modified-since']);
        if (cacheTime.getTime() == stats.mtime.getTime()) {
//            this.log('304. File `%s` not modified ( session id=%s )'.format(filePath, this.get_session_id()));
            this._originResponse.writeHead(304, {
                'Cache-Control': 'max-age=' + this._cacheMaxAge
            });

            this.end();
            return;
        }

        fs.readFile(filePath, "binary", this._sendFileContent.bind(this, filePath, stats));
    },

    /**
     * @param {string} filePath
     * @param {fs.stats} stats
     * @param {Error} e
     * @param {Buffer} fileContent
     * @private
     */
    _sendFileContent: function (filePath, stats, e, fileContent) {
        if (e) {
            // todo: 403 or 500?
            this._sendError(e, 403);
            return;
        }

//        this.log('Send file `%s` to http client ( session id=%s )'.format(filePath, this.get_session_id()));
//        this.emit('send_file', file);

        var fileExt = path.extname(filePath);
        var type = contentTypes[fileExt.toLowerCase().substr(1)] || '';

//        if (!type) {
//            this.log('Unknown file type of file `%s`'.format(filePath), 'warning');
//        }

        this._originResponse.writeHead(200, {
            'Content-Type': type,
            'Cache-Control': 'max-age=' + this._cacheMaxAge,
            'Last-Modified': stats.mtime.toUTCString()
        });

        this.end(fileContent, "binary");
    },

    /**
     * @param {string|Error} e
     * @param {number} number
     * @private
     */
    _sendError: function (e, number) {
        if (typeof e == 'string') {
            e = new Error(e);
        }
        number = number || 500;

//        this.log( e && e.stack || e, 'warning' );
//
//        this.emit( 'send_error', e );
//

//        this.log('Error %s by address `%s`'.format(e.number, this.request.url), 'warning');
        this._originResponse.statusCode = number;

//        try {
//            var query = this.create_request({
//                action: e.number,
//                request: this.request
//            });
//
//            this.app.router.route(query);
//        }
//        catch (err) {
            this.end(s('<h1>Error %s. %s</h1>', number, http.STATUS_CODES[ number ] || ''), 'utf8');
//        }
    },

    /**
     * @public
     * @param {string} url
     * todo: tests
     */
    redirect: function (url) {
        this.response.writeHead(302, {Location: url});
        this.end();
    }
});