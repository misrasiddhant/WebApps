const express = require('express')
const handler = require('./countdown/handler')
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

var server = app.listen(3000, function () {
    console.log('Server started on port 3000');
})
