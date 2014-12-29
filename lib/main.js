var _server;

exports.logRequest = function(request) {
    _checkServerStatus(); 
    _server.emit('request-new', request);
};

exports.start = function() {
    _server = require(__dirname +'/server.js').server;
};

function _checkServerStatus() {
    //TODO fijarse mejor server status...
    if (!_server) {
        throw new Error('Server not started!');
    } 
}



//TODO permitir definir types customizados!!!!!
/*
var DEFAULT_ACCEPTED_TYPES  = ['request-data', 'log', 'http-calls'];
var accepted_types = DEFAULT_ACCEPTED_TYPES;

var accepted_types_arr;//hacer array de los types.id en el start??

exports.addHandledType = function() {}

//TODO se puede implementar agregar data a un requestId existente.
//Por ejemplo, loguear un request básico e ir mandando data a lo largo de su... vida
exports.addData = function(typeId, data) {
    //TODO verificar server iniciado?
    if (accepted_types_arr.indexOf(typeId) === 0) {
        throw new Error('Type '+typeId+' not supported! Accepted: '+accepted_types);
    }

};
*/