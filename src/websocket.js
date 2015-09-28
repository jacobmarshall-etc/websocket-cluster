const Server = require('ws').Server;
const redis = require('redis');

var cache = redis.createClient();
var server = new Server({ port: process.env.PORT });
var serverId = process.env.ID;
var userIds = [];
var userListeners = [];
var userListenerIds = {};

cache.select(process.env.REDIS_DB);

server.on('connection', function onServerConnection (socket) {
    var userId, listener;

    socket.on('message', function onSocketMessage (message) {
        var payload = JSON.parse(message);

        switch (payload.type) {
            case 'auth':
                handleAuthMessage(payload);
                break;
        }
    });

    socket.on('close', function onSocketClose () {
        if (listener) {
            removeUserListener(listener);
        }
    });

    function handleAuthMessage (payload) {
        userId = payload.userId;

        listener = addUserListener(userId, function handleListener (payload) {
            sendMessage(payload);
        });

        socket.send(JSON.stringify({
            type: 'auth-callback',
            userId: userId
        }));
    }

    function sendMessage (payload) {
        socket.send(JSON.stringify({
            type: 'message',
            message: payload.message
        }));
    }
});

function getUserListeners (userId) {
    return userListeners.filter(function (listener) {
        return listener.userId === userId;
    });
}

function addUserListener (userId, callback) {
    if ( ! (userId in userListenerIds)) {
        userListenerIds[userId] = 0;
    }

    if (userListenerIds[userId] === 0) {
        cache.subscribe('user.' + userId);
    }

    var listener = {
        userId: userId,
        callback: callback
    };

    userListeners.push(listener);
    userListenerIds[userId]++;

    return listener;
}

function removeUserListener (listener) {
    var userId = listener.userId;

    userListeners.splice(userListeners.indexOf(listener), 1);
    userListenerIds[userId]--;

    if ( ! userListenerIds[userId]) {
        cache.unsubscribe('user.' + userId);
    }
}

function handleUserListener (userId, payload) {
    if (userListenerIds[userId]) {
        getUserListeners(userId).forEach(function (listener) {
            listener.callback(payload);
        });
    }
}

cache.on('message', function handlePupSubEvent (channel, message) {
    var user = channel.match(/^user\.(.*)$/); // [_, userId]
    var payload = JSON.parse(message);

    if (user) {
        handleUserListener(user[1], payload);
    }
});