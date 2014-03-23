var autodafe = require('../../autodafe'),
    http = require('http'),
    httpAuth = require('http-auth'),
    HTTPRequest = require('./HTTPRequest');

/**
 * HTTPConnection is a component that provides access to the application through the HTTP protocol
 * @class HTTPConnection
 * @extends Component
 * @param {number} [options.port=80] Port for http server
 * @param {string} [options.uploadPath='/tmp'] Path to upload files, related to {@link Application._basePath} or root of
 * your system if path is preceded by the slash todo: not implemented
 * @param {object} [options.basicAuth] options for basic HTTP authentication
 * @param {string} [options.basicAuth.message] The message will be shown if user is not authorized; if not specified
 * {@link HTTPConnection._defaultBasicAuthMessage} will be used
 * @param {object.<string, string>} [options.basicAuth.users={}] object that contained allowed user names as keys and
 * them passwords as values
 */
var HTTPConnection = module.exports = autodafe.Component.extend(/**@lends HTTPConnection*/{
    /**
     * @protected
     * @type {string}
     */
    _name: 'http',

    /**
     * @protected
     * @type {Function}
     */
    _RequestConstructor: HTTPRequest,

    /**
     * @protected
     */
    _props: function () {
        this._super();

        /**
         * The port for http server
         * @type {number}
         * @private
         * @default 80
         */
        this._port = this._options.port || 80;

        /**
         * The absolute path to directory for file uploading
         * @type {string}
         * @private
         */
//        this._uploadPath = this._options.uploadPath || '/tmp';

        /**
         * @type {http.Server}
         * @see <a href="http://nodejs.org/docs/latest/api/http.html#http.Server">http.Server in node docs</a>
         * @private
         */
        this._server = null;

        /**
         * @type {?object}
         * @private
         */
        this._basicAuth = null;

        /**
         * Default message for not passed basic HTTP authentication
         * @type {string}
         * @private
         * @defaults "Not authorized"
         */
        this._defaultBasicAuthMessage = 'Not authorized';
    },

    /**
     * @constructs
     * @private
     */
    _init: function () {
        this._super();

        this._initBasicAuth(this._options.basicAuth);
        this._initServer();
    },

    /**
     * @param {{message:?string, users:object.<string, string>}} [basicAuthOptions]
     * @private
     */
    _initBasicAuth: function (basicAuthOptions) {
        if (!basicAuthOptions) {
            return;
        }

        this.log('Enable basic HTTP authentication');
        var message = basicAuthOptions.message || this._defaultBasicAuthMessage,
            users = basicAuthOptions.users,
            usersWithPasswords = [];

        for (var user in users) {
            if (users.hasOwnProperty(user)) {
                usersWithPasswords.push(user + ':' + users[user]);
            }
        }

//        this._basicAuth = httpAuth.basic({
//            authRealm: message,
//            authList: usersWithPasswords
//        });
        this.log('Basic HTTP authentication is enabled for following users:', Object.keys(users).join(', '), 'info');
    },

    /**
     * @private
     */
    _initServer: function () {
        this._server = http.createServer()
            .listen(this._port)
            .on('request', this._onServerRequest.bind(this))
            .on('close', this._onServerClose.bind(this))
            .on('error', this._onServerError.bind(this));

        this.log('HTTP server started at port', this._port, 'info');
    },

    /**
     * @listens http.Server#request
     * @param {http.ServerRequest} request
     * @param {http.ServerResponse} response
     * @private
     */
    _onServerRequest: function (request, response) {
        var options = {
            request: request,
            response: response,
            basePath: this._app.getBasePath()
        };
        if (this._basicAuth) {
            this._basicAuth.apply(request, response, this._createRequest.bind(this, options));
        }
        else {
            this._createRequest(options);
        }
    },

    /**
     * @param {Request} request
     * @param {Callback} callback
     * @public
     * todo: invoke default process request automatically
     */
    processRequest: function (request, callback) {
        if (request.getType() == this.getName()) {
            request.process(callback);
        }
        callback();
    },

    _onServerError: function (e) {
        console.log(e);
    },

    /**
     * @listens http.Server#close
     * @param {number} errorNumber
     * @private
     */
    _onServerClose: function (errorNumber) {
        this._server.off('request').off('close');
        this.emit('close', errorNumber);
    },

    /**
     * Closes the server
     */
    close: function () {
        this._server.close();
    }
});