var io = require('socket.io').listen(8101, {
    "log level": 3
})

var players = [];

// client server
io.of("/client").on('connection', function (socket)
{
    var player = {
        socket: socket,
        x: 160,
        y: 160,
        lastUpdate: Date.now(),
        dirty: 1
    };

    players.push(player);

    socket.emit('id', socket.id);

    socket.on('u', function (data)
    {
        player.x = data[0];
        player.y = data[1];
        player.dirty = 1;

        player.lastUpdate = Date.now();
    });

    socket.on('login', function (data)
    {
        player.login = data;
        player.dirty = 4;

        player.lastUpdate = Date.now();
    });

    socket.on('disconnect', function ()
    {
        console.log("removed player");

        for (var i = 0, l = players.length; i < l; i++)
        {
            if (players[i] === player)
            {
                players.splice(i, 1);
                break;
            }
        }
    });
});

// overview server
io.of("/overview").on('connection', function (socket)
{
    var update = setInterval(function()
    {
        var playersData = []
        for (var i = 0, l = players.length; i < l; i++)
        {
            var player = players[i];
            if (player.dirty > 3)
            {
                playersData.push({x: player.x, y: player.y, login: player.login, id: player.socket.id});
            }
            else if (player.dirty > 0)
            {
                playersData.push({x: player.x, y: player.y});
            }
            player.dirty = 0;
        }

        if (playersData.length > 0)
        {
            socket.emit('players', playersData);
        }
    }, 33);

    socket.on('image', function (data)
    {
        for (var i = 0, l = players.length; i < l; i++)
        {
            var player = players[i];
            if (player.socket.id === data.id)
            {
                player.socket.emit("image", {src: data.src, rect: data.rect});
                break;
            }
        }
    });

    socket.on('pos', function (data)
    {
        for (var i = 0, l = players.length; i < l; i++)
        {
            var player = players[i];
            if (player.socket.id === data.id)
            {
                player.socket.emit("pos", data);
                break;
            }
        }
    });

    socket.on('disconnect', function()
    {
        clearInterval(update);
    });
});
