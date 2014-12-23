var cls = require('continuation-local-storage');
var NAMESPACE = 'mobile-request-inspector';

var createContext = function(req, res, next) {

    var namespace = cls.getNamespace(NAMESPACE);

    namespace.bindEmitter(req);
    namespace.bindEmitter(res);

    return namespace.run(function() {
        namespace.set('req_uuid', req.uuid);
        return next();
    });
};

var set = function(key, value) {
    var namespace = cls.getNamespace(NAMESPACE);
    if (namespace) {
        namespace.set(key, value);
    }
};

var get = function(key) {
    return cls.getNamespace(NAMESPACE) && cls.getNamespace(NAMESPACE).get(key);
};

exports.createContext = createContext;
exports.get = get;
exports.set = set;