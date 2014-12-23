$(function () {
    var socket = io();

    socket.on('request', function (data) {
        console.log(data);
    });
});