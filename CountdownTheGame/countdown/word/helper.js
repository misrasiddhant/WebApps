const vowels = ['A','E','I','O','U']
const consonants = [
    'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N',
    'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'
];

exports.getVowel = function () {
    return getRandomFromArray(vowels);
};

exports.getConsonants = function () {
    return getRandomFromArray(consonants);
};

function getRandomFromArray (letterArray) {
    const randomCharacter = letterArray[Math.floor(Math.random() * letterArray.length)];
    console.log(randomCharacter);
    return randomCharacter;
}