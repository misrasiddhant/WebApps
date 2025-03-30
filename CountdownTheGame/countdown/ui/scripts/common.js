function generateLetterPanel(domId, count){
    console.log(count)
    let element = document.getElementById(domId);
    for (let i = 1; i <= count; i++) {
        const item = document.createElement("div");
        item.className = "panel-item letter";
        item.id = "panel_item_" + i;
        item.textContent = "";
        element.appendChild(item);
    }
}

function generateNumberPanel(domId, count){
    console.log(count)
    let element = document.getElementById(domId);
    for (let i = 1; i <= count; i++) {
        const item = document.createElement("div");
        item.className = "panel-item number";
        item.id = domId + "_panel_item_" + i;
        item.textContent = "";
        element.appendChild(item);
    }
}