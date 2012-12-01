var players = [];
var id;
var connected = false;

//var socket = io.connect('http://staunsholm.multixmas.jit.su:80/client');
var socket = io.connect('http://192.168.0.3:8101/client');

socket.on('id', function (data)
{
    id = data.id;
    connected = true;
});

socket.on('pos', function (data)
{
    posX = data.x;
    posY = data.y;
});

socket.on('players', function (data)
{
    players = data;
});

socket.on('image', function (data)
{
    var image = new Image();
    image.src = data.src;
    image.onload = function()
    {
        imageBitmap.image = image;
        imageBitmap.sourceRect = new createjs.Rectangle(data.rect[0], data.rect[1], data.rect[2], data.rect[3]);
        imageBitmap.x = stageCanvas.width/2 - data.rect[2]/2;
        imageBitmap.y = stageCanvas.height/2 - data.rect[3]/2;
    };
});

socket.on('disconnect', function ()
{
    // connection lost
    connected = false;
});