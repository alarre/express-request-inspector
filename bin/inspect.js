#!/usr/bin/env node
/*
* No es utilizado!!!!
* La intención era ofrecer una línea de comando para levantar el inspector sin tener que 
* agregar el .start() en la app destino (que sería recibido por parámetro)
* Es igual a cómo se comporta el node_inspector
* Sin embargo al levantar el server en otro proceso no es visible para la app destino, y no puede emitir los eventos
* para IO. Posiblemente exista una solución elegante? 
* Por ahora se desactiva este feature...
*/
console.log('No implementado! Ver comentario en ./bin/inspect.js');

/*
var open = require('opener');
var path = require('path');
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
            //FIXME Leer de config:            
            //TODO POsta es necesario esperar unos ms para abrir la url???
            setTimeout(open.bind(undefined, 'http://localhost:'+config.server.args.port), 500);
        });
                    
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
    var script = path.resolve(process.cwd(), 'start.js');
    //FIXME pasarle parámetros del propio script:
    var scriptProcess = fork(script, config.script.args);
    
    scriptProcess.on('exit', function() {
        process.exit(); 
    });
    callback();
}
*/