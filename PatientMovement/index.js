$(document).ready(function(){
    init(120, 5);
    setDiv();
    animateDiv();
});

function makeNewPosition(){

    // Get viewport dimensions (remove the dimension of the div)
    const h = $(window).height() - 50;
    const w = $(window).width() - 50;

    const nh = Math.floor(Math.random() * h);
    const nw = Math.floor(Math.random() * w);

    return [nh,nw];

}

// function distance(elem1, elem2){
//
// 	console.log(elem1.top)
//     const x1 = elem1.top;
//     const x2 = elem2.top;
//
//     const y1 = elem1.left;
//     const y2 = elem2.left;
//
//     //document.getElementById("text").innerHTML = dist
// 	return Math.sqrt(Math.abs(x2 - x1) / Math.abs(y2 - y1))
// }

function setDiv(){

    const p = document.getElementsByName("patient");

    for(let i=0; i<p.length; i++){
        const newq = makeNewPosition();
        $(p[i]).css({top: newq[0], left: newq[1]});
    }


}

function distance(x1,x2,y1,y2){
    return Math.sqrt(Math.abs(x2 - x1) + Math.abs(y2 - y1))
}

function animateDiv(){

    var p = document.getElementsByName("patient")

    for(let i = 0; i<p.length; i++){
        const newq = makeNewPosition();
        $(p[i]).animate({ top: newq[0], left: newq[1] }, 8000, function(){
            animateDiv();
        });
    }

    for(i = 0; i<p.length; i++){
        for(let j=i+1; j<p.length; j++){
            const x = $(p[i]).position();
            const y = $(p[j]).position();
            const dist = distance(x.top, y.top, x.left, y.left);
            console.log($(p[i]).attr('id') + "  -  "+$(p[j]).attr('id') + " -> " + dist)
            if(dist < 10){
                if(p[i].className === "infected" || p[j].className === "infected" ){
                    console.log(p[j].id + "infected")
                    p[i].className = "infected"
                    p[j].className = "infected"
                }
            }
        }
    }

    document.getElementById("text").innerHTML = "Infected " + $('.infected').length

}

function init(numPatients, infectedPatients){
    if(infectedPatients > numPatients){
        alert("Infected patients cannot be greater than total patients");
    }
    for (let i = 0; i < numPatients; i++) {
        console.log("Creating patient"+i);
        let patient_div = document.createElement("div");
        patient_div.id = "patient" + i;
        patient_div.setAttribute("name", "patient");
        if(infectedPatients > 0){
            patient_div.className = "infected";
            --infectedPatients;
        } else {
            patient_div.className = "healthy";
        }

        document.body.appendChild(patient_div);
    }
}