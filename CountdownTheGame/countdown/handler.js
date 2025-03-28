var wordHandler = require("./word/helper");

function okResponse(response, message){
    response.writeHead(200, {'Content-Type': 'application/json'});
    let data ={
        'message': message,
    }
    response.write(JSON.stringify(data));
    response.end();
}

exports.handleVowel = (res) => {
    let v = wordHandler.getVowel();
    okResponse(res, v);
}
exports.handleConsonant = (res) => {
    let c = wordHandler.getConsonants();
    okResponse(res, c);
}

exports.handleRoot = function (res) {
    okResponse(res, "healthy");
}
