
const lstm = ml5.charRNN('models/edgar_allan_poe', modelReady);

let is_element_added = false;
let is_element_init = false;
let is_mouse_over = false;

let genTextDom;
let headerDom;

let newText;

document.getElementById("originalText").addEventListener("click", function(){
    var selection = window.getSelection();
	//console.log(selection.toString());

	newText = document.createTextNode(selection.toString());
	var addedText = document.getElementById("generatedText");

	addedText.appendChild(newText);
	is_element_added = true;
	is_element_init = true;
},false);

function modelReady(){
    console.log("LSTM model loaded.");
    headerDom.html(" LSTM model loaded.", true);
    resetModel();
}

function resetModel(){
    lstm.reset();
}

function setup(){
	noCanvas();
	headerDom = select("#header");
	genTextDom = select("#generatedText");
	genTextDom.mouseOver(generate);
	genTextDom.mouseOut(stopGeneration);
}

async function generate(){
	
	if(is_element_added){
		await lstm.feed(newText);
	}

	is_mouse_over = true;

	if(is_element_init){     
    	loopRNN();
	}

}

function stopGeneration(){
	is_mouse_over = false;
}

async function loopRNN() {
  while (is_mouse_over) {
    await predict();
    is_element_added = false;
  }
}

async function predict() {
    let temperature = 0.5;
  
    let next = await lstm.predict(temperature);

    await lstm.feed(next.sample);
   
    if(next.sample=="\n"){
        //console.log(next);
        genTextDom.html("<br>",true);
    }
    genTextDom.html(next.sample,true);
}