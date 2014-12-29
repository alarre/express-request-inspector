var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    console.log(__dirname);
    res.sendFile('index.html', {"root": __dirname+"/client"});
});

//TODO retornar archivo compuesto por los types aceptados:
app.get('/client.js', function(req, res){
    console.log(__dirname);
    res.sendFile('client.js', {"root": __dirname+"/client"});
});

io.on('connection', function(socket){
    console.log('a user connected');
    //socket.on('chat message', function(msg){
    //    io.emit('chat message', msg);
    //});
});

//TODO parametrizar puerto
http.listen(3000, function(){
  console.log('listening on *:3000');
});

exports.server = io;