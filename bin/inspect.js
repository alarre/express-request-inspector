#!/usr/bin/env node
var open = require('opener');
var path = require('path');
var fork = require('child_process').fork;

//FIXME REPENSAR CONFIG, TOMAR DE PARAMETROS, ETC:
var config = {server: {args: {port: 3000}},
              script: {args: {}}
             };

module.exports = main;

//FIXME ????
if (require.main == module) {
  main();
}

function main() {
    console.log('main');
    _startInspector(function(err) {
        if (err) {
          console.error('Error _startInspector: '+err);
          process.exit(1);
        }
        
        _startScript(function(err2) {
            if (err2) {
                console.error('Error _startScript: '+err2);
                process.exit(2);
            }
        });
                     
         //FIXME Leer de config:            
        open('http://localhost:3000');
    });
}

function _startInspector(callback) {

    var inspectorServerProcess = fork(
        require.resolve(__dirname + '/../lib/server.js'),
        config.server.args,
        {silent: true}
    );

    process.on('exit', function() {
        console.log('Exiting inspectorServerProcess...');
        inspectorServerProcess.kill();
    });
    
    callback();
}
    
function _startScript(callback) {
    //FIXME leer de params de entrada:
    var script = path.resolve(process.cwd(), 'start_debug.js');
    //FIXME pasarle parámetros del propio script:
    var scriptProcess = fork(script, config.script.args);
    
    scriptProcess.on('exit', function() {
        process.exit(); 
    });
    callback();
}