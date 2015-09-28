const express = require('express');
const redis = require('redis');

var app = express();
var cache = redis.createClient();

cache.select(process.env.REDIS_DB);

app.get('/notify/:userId', function (req, res) {
    var userId = req.params.userId;

    var payload = JSON.stringify({
        message: 'Hello World (' + (Math.random()) + ')'
    });

    cache.publish('user.' + userId, payload);
    res.json({ result: 'OK' });
});

app.listen(process.env.PORT);