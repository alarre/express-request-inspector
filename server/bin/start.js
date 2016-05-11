#!/usr/bin/env node

var open = require('opener');
var fork = require('child_process').fork;

//FIXME REPENSAR CONFIG, TOMAR DE PARAMETROS DESDE INPUT, ETC:
var config = {server: {args: {port: 3000}},
              script: {args: {}}
             };

module.exports = main;

//FIXME ????
if (require.main == module) {
  main();
}

function main() {
    _startInspector(function(err) {
        if (err) {
          console.error('Error _startInspector: '+err);
          process.exit(1);
        }
		
		//FIXME Leer de config:            
		//TODO Posta es necesario esperar unos ms para abrir la url???
		
		//TODO ABRIR SI NO HAY USUARIOS CONECTADOS
		setTimeout(open.bind(undefined, 'http://localhost:'+config.server.args.port), 500);
              
    });
}

function _startInspector(callback) {

    var inspectorServerProcess = fork(
        require.resolve(__dirname + '/../lib/main.js'),
        config.server.args,
        {silent: true}
    );

    process.on('exit', function() {
        console.log('Exiting inspectorServerProcess...');
        inspectorServerProcess.kill();
    });
    
    callback();
}