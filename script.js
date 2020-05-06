
const lstm = ml5.charRNN('models/edgar_kor', modelReady);

let is_element_added = false;
let is_element_init = false;
let is_mouse_over = false;

let genTextDom;

let headerDom;

let newText;

let gen_text = "";

let count_footnote_num = 0;

document.getElementById("originalText").addEventListener("click", function(){
	//if(!is_mouse_over){
	
    var selection = window.getSelection();

	newText = document.createTextNode(selection.toString());
	//var addedText = document.getElementById("generatedText");
	var addedText = select("#generatedText");
	//genTextDom.style('font-family', 'Noto Serif KR, serif');

	count_footnote_num++;

	addedText.html("<sup>"+count_footnote_num+" </sup>"+"<span style='border: 1px solid black;'>"+selection.toString()+"</span>",true);
	

	is_element_added = true;
	is_element_init = true;
	//}
},false);

document.getElementById("originalText").addEventListener("click", function(){
	

	var offset = 0;
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);
    var start = range.startOffset;
    var end = range.endOffset;
    //console.log(selection.baseNode.parentNode.indexOf(selection.baseNode));
    //console.log(selection.baseNode.previousSibling);

    var previousNode = selection.baseNode.previousSibling;
    
    while(previousNode!=null){
	    if (previousNode.nodeType == 3) {
			offset = offset + previousNode.length;
	    }   
	    if (previousNode.nodeType == 1) {
	        offset = offset + previousNode.outerHTML.length;
	        
	        //console.log(previousNode.innerHTML);
	    }
	    previousNode = previousNode.previousSibling;
	}
    
    
	
    start = start + offset;
    end = end + offset;

    //var myValue = "@_@";
    var myElement = document.getElementById("originalText");
    myElement.innerHTML = myElement.innerHTML.substring(0, end) +
        "<sup>" + count_footnote_num + "</sup>"
        + myElement.innerHTML.substring(end, myElement.innerHTML.length);

    //console.log(start,end);
},false);



function modelReady(){
    console.log("LSTM model loaded.");
    headerDom.html(" 모델 로딩 완료.", true);
    resetModel();
}

function resetModel(){
    lstm.reset();
}

function setup(){
	noCanvas();
	headerDom = select("#header");
	genTextDom = select("#generatedText");
	//genTextDom_text = document.getElementById("generatedText");
	genTextDom.mouseOver(generate);
	//genTextDom.mousePressed(addText);
	//genTextDom.mouseOut(stopGeneration);
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

function addText(){
	var _newText = document.createTextNode(gen_text);
	var addedText = document.getElementById("generatedText");
	addedText.appendChild(_newText);
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

let prev_sample = "";

async function predict() {
    let temperature = 0.6;
  
    let next = await lstm.predict(temperature);

    await lstm.feed(next.sample);
   	

    if(next.sample=="\n"){
        //console.log(next);
        if(prev_sample=="\n"){

        }else{
        	genTextDom.html("<br>",true);
    	}
        stopGeneration();
        //gen_text += "<br>";
    }
    genTextDom.html(next.sample,true);

    prev_sample = next.sample;
    //gen_text += next.sample;

    //genTextDom_text.textContent += next.sample;
}