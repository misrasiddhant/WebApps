const wordHandler = require("./word/helper");
const {getMapsForWord} = require("./word/solver");
const numberHandler = require("./number/helper");
function okResponse(response, message){
    response.writeHead(200, {'Content-Type': 'application/json'});
    let data ={
        'message': message,
    }
    response.write(JSON.stringify(data));
    response.end();
}

function badRequest(response, message){
    response.writeHead(400, {'Content-Type': 'application/json'});
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

exports.getRandomSmallNumber = (res)=>{
    let n = numberHandler.getSmallNumber();
    okResponse(res, n);
}

exports.getRandomLargeNumber = (res)=>{
    let n = numberHandler.getLargeNumber();
    okResponse(res, n);
}

exports.solve = (req, res) => {

    let word = req.query.word;
    if(word){
        let solution = getMapsForWord(word.toLocaleLowerCase());
        return okResponse(res, solution.toLocaleUpperCase());
    }

    let number = req.query.number;
    if (number) {
        let numberList = number.split(',').flatMap(x => Number(x));

        return okResponse(res, numberHandler.generateExpression(numberList));
    }

    return badRequest(res, "word or numbers parameter missing");

}

exports.handleRoot = function (res) {
    okResponse(res, "healthy");
}

exports.handleBadRequest = (res, message) => {
    badRequest(res, message);
}
