var http = require('http');

var _enabled = false;
var _config = {};

function init(config) {
	_config = config || {};
	if (!_config.host) {
		_config.host = '127.0.0.1';
	}
	if (!_config.port) {
		_config.port = 3000;
	}
	
	_enabled = true;
	
	console.log('Request inspector client enabled!', _config);
}

function logRequest(request, callback) {
	if (_enabled) {
		
		//TODO validar request?
		
		var config = {
			host: _config.host,
			port: _config.port
		};

		var bodyString = JSON.stringify(request);

		var headers = {
			'Content-length': Buffer.byteLength(bodyString),
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		};

		var options = {
			host: config.host,
			port: config.port,
			path: '/log',
			method: 'POST',
			headers: headers
		};
		var req = http.request(options);

		//TODO necesario??	
		/* This is to turn off automatic http error instrumentation of new relic
		 *  Check outbound.js in new relic's module that wrapps each req and adds
		 * a listener of errors to add to the transaction
		 */
		req.removeAllListeners('error');

		//TODO necesario??
		//process.namespaces.MELI.bindEmitter(req);

		req.on('response', function(res) {

			//bind this event emitter to CLS to keep the context alive
			//necesario??
			if (process.namespaces && process.namespaces.MELI) {
				process.namespaces.MELI.bindEmitter(res);
			}

			res.setEncoding('utf-8');

			var responseString = '';

			res.on('data', function(data) {
				responseString += data;
			});

			res.on('end', function() {

				if (res.statusCode >= 200 && res.statusCode < 300) {
					return callback(undefined, responseString);
				} else {
					return callback({message: responseString || 'Undefined error!', 
									 statusCode: res.statusCode});
				}
			});
		});

		req.on('error', function(error) {
				return callback({
					body: error,
					statusCode: 503
				});
		});

		req.on('timeout', function() {
			req.abort();

			return callback({
				message: 'Timeout!',
				statusCode: 504
			});
		});

		req.setTimeout(1000);

		req.write(new Buffer(bodyString, 'utf8').toString());
		req.end();
	} else {
		return callback({message: 'Client not started! Use init() first'});
	}
}

module.exports = {
	logRequest: logRequest,
	init: init
};