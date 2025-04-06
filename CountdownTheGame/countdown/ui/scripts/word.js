let counter = 1;

async function getData(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();
        console.log(json);
        return json.message
    } catch (error) {
        console.error(error.message);
    }
}

async function generateLetter(type){
    if(counter>9){return;}
    document.getElementById("panel_item_" + counter).textContent = await getData("/letter?type=" + type);
    counter = counter + 1;
}
async function generateVowel() {

    document.getElementById("panel_item_" + counter).textContent = await getData("/vowel");
    counter = counter + 1;
}

async function generateConsonant() {

    document.getElementById("panel_item_" + counter).textContent = await getData("/consonant");
    counter = counter + 1;
}

async function solve(inputPanel, outputPanel) {
    let inputTextBoxes = document.getElementById(inputPanel).children
    let letters = [];
    for (let j = 1; j < inputTextBoxes.length; j++) {
        letters.push(inputTextBoxes[j].textContent);
    }
    console.log(letters);
    let solution = await getData("/solve?word=" + letters.join(""));
    console.log(solution);
    solution = solution.split("");

    let outputTextBoxes = document.getElementById(outputPanel).children

    for (let j = 0; j < solution.length && j < outputTextBoxes.length -1; j++) {
        outputTextBoxes[j + 1].textContent = solution[j];
    }
}

function wordReset() {
    let items = document.getElementsByClassName("letter");
    for (let i = 0; i < items.length; i++) {
        items[i].textContent = "";
    }
    counter = 1;
}