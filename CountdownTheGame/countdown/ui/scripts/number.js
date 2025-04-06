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

async function getNumber(type)
{   if(counter > 5){return;}
    document.getElementById("number-selection-panel_panel_item_" + counter).textContent = await getData("/number?type="+type);
    counter = counter + 1;
}

async function solve(inputPanel, outputPanel) {
    let inputTextBoxes = document.getElementById(inputPanel).children
    let letters = [];
    for (let j = 1; j < inputTextBoxes.length; j++) {
        letters.push(inputTextBoxes[j].textContent);
    }
    console.log(letters);
    let solution = await getData("/solve?number=" + letters.join(","));
    console.log(solution);

    let outputTextBox = document.getElementById(outputPanel).children[1]
    outputTextBox.textContent = solution[solution.length-1];
}

function numberReset() {
    let items = document.getElementsByClassName("letter");
    for (let i = 0; i < items.length; i++) {
        items[i].textContent = "";
    }
    counter = 1;
}