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

app.get('/letter', function (req, res) {
    let type = req.query.type;
    if(type === 'vowel')
        handler.handleVowel(res);
    else if (type === 'consonant')
        handler.handleConsonant(res);
    else
        handler.handleBadRequest(res, "Invalid query string value. Accepted values are 'vowel' or 'consonant'.")
})
app.get('/number', function (req, res) {
    let type = req.query.type;
    if(type === 'large')
        handler.getRandomLargeNumber(res);
    else if (type === 'small')
        handler.getRandomSmallNumber(res);
    else
        handler.handleBadRequest(res, "Invalid query string value. Accepted values are 'small' or 'large'.")
})


app.get('/solve', function (req, res) {
    handler.solve(req, res);
})

app.get('/wordgame', function (req, res) {
    res.sendFile(path.join(__dirname, 'countdown', 'ui', 'words.html'))
})

app.get('/numbergame', function (req, res) {
    res.sendFile(path.join(__dirname, 'countdown', 'ui', 'numbers.html'))
})

app.use(express.static(path.join(__dirname, 'countdown', 'ui')));

var server = app.listen(3000, function () {
    console.log('Server started on port 3000');
})
