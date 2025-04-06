const fs = require('node:fs');
const readline = require('readline');
const path = require('path');

let word_map = new Map();
let character_key_map = new Map();

function getKey(word){
    let letters = [... new Set(word.split(''))];
    letters.sort();
    return letters.join('');
}

function loadWords() {
    const file = readline.createInterface({
        input: fs.createReadStream(path.join(__dirname,'..','..','..', 'resources','data','wordlist.10000.txt')),
        output: process.stdout,
        terminal: false
    });

    file.on('line', (word) => {
        let key = getKey(word);
        if (word_map.has(key)) {
            let words = word_map.get(key);
            words.push(word);
        } else {
            word_map.set(key, [word]);
            for (let j = 0; j < key.length; j++) {
                let c = key[j]
                if (character_key_map.has(key[j])) {
                    let keyList = character_key_map.get(c);
                    keyList.push(key);
                } else {
                    character_key_map.set(c, [key]);
                }
            }
        }
    });
}

loadWords()

exports.getCharacterFrequency = function(){
    console.log('getCharacterFrequency');
    let characterWordCountMap = new Map();
    let max= 0;
    character_key_map.entries().forEach((entry) => {
        let count = entry.length;
        characterWordCountMap.set(entry[0], count);
        max = max > count ? max : count;
    })
    console.log(characterWordCountMap);
    characterWordCountMap.entries().forEach((entry) => {
        let ratio = Math.ceil((entry[1] / max) * 10);
        characterWordCountMap.set(entry[0], ratio);
    })
    console.log(characterWordCountMap);
    return characterWordCountMap;
};

exports.getMapsForWord = function(input){

    console.log(input);

    let key = getKey(input);

    let wordMapKeys = []

    for (let i = 0; i < key.length; i++) {
        let mapKeys = character_key_map.get(key[i]);
        mapKeys = mapKeys.flatMap(_key => {
            for (let j = 0; j < _key.length; j++) {
                let c = _key[j];
                if(key.indexOf(c) === -1){
                    return [];
                }
            }
            return _key;
        });
        wordMapKeys.push(...mapKeys);
    }
    wordMapKeys = [...new Set(wordMapKeys)]
    console.log(wordMapKeys);

    let theLongestWord = "";

    for (let i = 0; i < wordMapKeys.length; i++) {
        let words = word_map.get(wordMapKeys[i]);
        words = words.flatMap(
            _word=> {
                let inputAsArray = input.split("");
                for (let j = 0; j < _word.length; j++) {
                    let c = _word[j];
                    let index = inputAsArray.indexOf(c);
                    if (index !== -1) {
                        inputAsArray.splice(index, 1);
                    } else {
                        return [];
                    }
                }
                return _word;
            }
        )
        for (let j = 0; j < words.length; j++) {
            let word = words[j];
            if (word.length > theLongestWord.length){
                theLongestWord = word;
            }
        }
    }
    return theLongestWord;
}





