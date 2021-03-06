'use strict';
var app = require('express')();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    //TODO el archivo index.html debería incluir los componentes necesarios para manejar types customizados... cuando esa funcionalidad esté disponible
    res.sendfile('index.html', {"root": __dirname+"/../web"});
});

/* Los recursos js, css, etc se exponen en la ruta /public/XXX y se deben guardar en el directorio
* client/public/, aceptando subdirectorios.
* Se limitan las extensiones válidas para seguridad (?), 
* Para otros tipos de archivos, se debe agregar extensiones nuevas en el route de express o bien quitar esta restricción
*/
app.get('/public/*.(js|css|html|jsx|jpg|eot|svg|ttf|woff)', function(req, res){
    var filePaths = req.url.split('/');
    var dirname = "/../web/public/" + filePaths.slice(filePaths.indexOf("public")+1, filePaths.length-1).join("/");
    res.sendfile(filePaths.pop(), {"root": __dirname+dirname});
});

//Allows to remotely receive events:
app.post('/log', bodyParser.json({limit: '50mb'}), function(req, res, next) {
    io.emit('request-new', req.body);
    res.status(204).end();
});

io.on('connection', function(socket){
    console.log('A user connected');
});

//TODO parametrizar puerto
http.listen(3000, function(){
  console.log('Listening on http://localhost:3000');
});

exports.server = io;