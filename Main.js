// Globals
var stageCanvas = document.createElement("canvas");
stageCanvas.width = window.innerWidth;
stageCanvas.height = window.innerHeight;
document.body.appendChild(stageCanvas);

var stageContext = stageCanvas.getContext('2d');
var stage = new createjs.Stage(stageCanvas);

var minX = -50, maxX = 1024-50;
var minY = -50, maxY = 768-50;

var posX = 100, posY = 100;

var text, img;
var imageBitmap;

function test()
{
    text = new createjs.Text("connecting", "16px Arial", "#fff");
    stage.addChild(text);

    imageBitmap = new createjs.Bitmap();
    stage.addChild(imageBitmap);

    var startX, startY;

    stageCanvas.addEventListener("touchstart", function (e)
    {
        var touches = e.changedTouches;
        if (touches.length < 1) return;

        startX = touches[0].pageX;
        startY = touches[0].pageY;
    }, false);

    stageCanvas.addEventListener("touchmove", function (e)
    {
        e.preventDefault();

        var touches = e.changedTouches;
        if (touches.length < 1) return;

        var dx = touches[0].pageX - startX;
        var dy = touches[0].pageY - startY;
        posX += dx * dx / (dx < 0 ? -10 : 10);
        posY += dy * dy / (dy < 0 ? -10 : 10);
        startX = touches[0].pageX;
        startY = touches[0].pageY;

        if (posX < minX) posX = minX;
        else if (posX > maxX) posX = maxX;
        if (posY < minY) posY = minY;
        else if (posY > maxY) posY = maxY;

        if (connected)
        {
            socket.emit("u", [posX|0, posY|0]);
        }
    }, false);

    stage.update();

    createjs.Ticker.setFPS(60);
    createjs.Ticker.addListener(window);
}

function tick(dt)
{
    text.text = "";

    stage.update();
}

function showImage()
{
    var imageBitmap = new createjs.Bitmap(image);
    imageBitmap.sourceRect = new createjs.Rectangle(200, 200, 200, 200);
    stage.addChild(imageBitmap);
}

test();
