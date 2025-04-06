const util = require("../utility");
const largeNumbers = [25, 50, 75, 100, 25, 50, 75, 100, 25, 50, 75, 100]

exports.getSmallNumber = function() {
    return Math.floor(Math.random() * 10);
}

exports.getLargeNumber = function() {
    return util.getRandomItem(largeNumbers);
}

exports.generateExpression = function(numbers) {
    let total ;
    let expressionList=[];
    let itemCount = numbers.length;
    for (let i = 1; i <= itemCount; i++) {
        let index = Math.floor(Math.random() * numbers.length);
        let randomInt =  numbers[index];
        numbers.splice(index,1);
        if(!total) {
            total = randomInt;
            expressionList.push(total);
            continue;
        }
        let opList = ["+","*"];
        if (total > randomInt) {opList.push("-");}
        if (total % 2 === 0) {opList.push("+");}
        let op = util.getRandomItem(opList);
        expressionList.push(op);
        switch(op) {
            case "+": total = total+randomInt;
            break;
            case "-": total = total - randomInt;
            break;
            case "*": total = total * randomInt;
            break;
            case "/": total = total / randomInt;
            break;
        }
        expressionList.push(randomInt);
    }
    expressionList.push("=");
    expressionList.push(total);
    return expressionList;
}