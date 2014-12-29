$(function () {
    //TODO Y EL PUERTO?!
    var socket = io();

    socket.on('request-new', function (data) {
        console.log(data);
    });
});