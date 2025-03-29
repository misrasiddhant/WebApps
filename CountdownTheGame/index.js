const express = require('express')
const path = require("node:path");
const handler = require('./countdown/api/handler')
var app = express();

app.get('/', function (req, res) {
    handler.handleRoot(res);
})

app.get('/vowel', function (req, res) {
    handler.handleVowel(res);
})

app.get('/consonant', function (req, res) {
    handler.handleConsonant(res);
})

app.get('/solve', function (req, res) {
    handler.solve(req, res);
})

app.use(express.static(path.join(__dirname, 'countdown', 'ui')));

app.get('/wordgame', function (req, res) {
    res.sendFile(path.join(__dirname, 'countdown', 'ui', 'words.html'))
})

var server = app.listen(3000, function () {
    console.log('Server started on port 3000');
})
