// Globals
var stageCanvas = document.getElementById("stageCanvas");
var stageContext = stageCanvas.getContext('2d');
var stage = new createjs.Stage(stageCanvas);

var text, img, puzzleImage;
var puzzleBitmaps = [];

var players = {};
var connected = false;

//var socket = io.connect('http://staunsholm.multixmas.jit.su:80/overview');
var socket = io.connect('http://172.17.2.94:8101/overview');
socket.on('players', function (data)
{
    var now = Date.now();

    for (var i = 0, l = data.length; i < l; i++)
    {
        var dataItem = data[i];

        var player = players[dataItem.id];
        if (!player)
        {
            player = players[dataItem.id] = {lastUpdate: now};

            // find an unassigned puzzleBitmap, if any available
            for (var i2 = 0, l2 = puzzleBitmaps.length; i2 < l2; i2++)
            {
                var puzzleBitmap = puzzleBitmaps[i2];
                if (!puzzleBitmap.player)
                {
                    puzzleBitmap.player = player;
                    player.puzzleBitmap = puzzleBitmap;

                    var r = puzzleBitmap.sourceRect;
                    console.log(r);
                    socket.emit("image", {id: dataItem.id, src: puzzleBitmap.image.src, rect: [r.x, r.y, r.width, r.height]});

                    break;
                }
            }
        }

        if (!player.login && dataItem.login)
        {
            text.text = "Hej " + dataItem.login +"!";
        }

        player.puzzleBitmap.x = dataItem.x;
        player.puzzleBitmap.y = dataItem.y;
        player.lastUpdate = now;

        if (dataItem.login) player.login = dataItem.login;
    }

    var cnt = 0;
    for (var i in players)
    {
        var player = players[i];
        if (!player) continue;

        if (now - player.lastUpdate > 10000)
        {
            player.puzzleBitmap.player = undefined;
            players[i] = undefined;
        }
        else
        {
            cnt++;
        }
    }
    console.log(cnt);
});

socket.on('disconnect', function ()
{
    // connection lost
    connected = false;
});

function loadAssets(callback)
{
    var loaded = 0;
    var toBeLoaded = 2;

    img = load("assets/spark1.png");
    puzzleImage = load("assets/mad_men_style.jpg")

    function load(url)
    {
        var img = new Image();
        img.onload = done;
        img.src = url;

        return img;
    }

    function done()
    {
        loaded++;
        if (loaded >= toBeLoaded)
        {
            callback();
        }
    }
}

function test()
{
    puzzleBitmaps = splitImage(puzzleImage, 8);

    text = new createjs.Text("", "36px Arial", "#fff");
    text.x = 20;
    text.y = 10;

    stage.addChild(text);

    stage.update();

    createjs.Ticker.setFPS(60);
    createjs.Ticker.addListener(window);
}

function splitImage(image, numberOfSlices)
{
    var slices = [];

    var w = image.width;
    var h = image.height;

    switch (numberOfSlices)
    {
        case 8:
            for (var y = 0; y < h; y += h/2)
            {
                for (var x = 0; x < w; x += w/4)
                {
                    var bitmap = new createjs.Bitmap(image);
                    bitmap.sourceRect = new createjs.Rectangle(x, y, w/4, h/2);
                    bitmap.x = Math.random()*w/4*3;
                    bitmap.y = Math.random()*h/2*1;

                    socket.emit("pos", {x: bitmap.x, y: bitmap.y});

                    stage.addChild(bitmap);

                    slices.push(bitmap);
                }
            }

            break;
    }

    return slices;
}

function tick(dt)
{
    stage.update();
}

loadAssets(test);
