const solver = require('./solver')

const vowels = ['A','E','I','O','U']
const consonants = [
    'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N',
    'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'
];

let frequencyMap;

exports.getVowel = function () {
    return getRandomFromArray(vowels);
};

exports.getConsonants = function () {
    return getRandomFromArray(consonants);
};

function getRandomFromArray (letterArray) {
    let repeatedLetterArray = []
    if(!frequencyMap) {
        frequencyMap = solver.getCharacterFrequency();
    }
    letterArray.forEach(letter => {
        repeatedLetterArray.push(...letter.repeat(frequencyMap.get(letter.toLocaleLowerCase())));
    })
    const randomCharacter = repeatedLetterArray[Math.floor(Math.random() * repeatedLetterArray.length)];
    console.log(randomCharacter);
    return randomCharacter;
}