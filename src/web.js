const express = require('express');

var app = express();

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/static/index.html');
});

app.listen(process.env.PORT);