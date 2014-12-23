
var DEFAULT_ACCEPTED_TYPES  = ['request-data', 'log', 'http-calls'];
var _server;

//TODO permitir definir types customizados!!!!!
var accepted_types = DEFAULT_ACCEPTED_TYPES;

var accepted_types_arr;//hacer array de los types.id en el start??

exports.addData = function(typeId, data) {
    //TODO verificar server iniciado?
    if (accepted_types_arr.indexOf(type) === 0) {
        throw new Error('Type '+type+' not supported! Accepted: '+accepted_types);
    }
    if (!_server) {
        throw new Error('Server not started!');
    }
    
    
};

exports.logRequest = function(request) {
    if (!_server) {
        throw new Error('Server not started!');
    }
};

exports.start = function() {
    _server = require(__dirname +'/server.js').server;
};