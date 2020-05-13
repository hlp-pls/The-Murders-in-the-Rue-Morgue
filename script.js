
const lstm = ml5.charRNN('models/edgar_kor', modelReady);

let is_element_added = false;
let is_element_init = false;

let create_text = false;

let genTextDom;
let headerDom;
let loadingDom;

let newText;

let gen_text = "";

let count_footnote_num = 0;

//multilingual.js with jquery
$(document).ready(function(e){
    $("#originalText").multilingual([
      "en", "num", {
        className: "ml-parentheses",
        charset: '()'
      }, "punct"
    ]);
  });

//add text to #generatedText
//add footnote number to correct position
document.getElementById("originalText").addEventListener("click", function(){
	if(!create_text){

    	var offset = 0;
        var selection = window.getSelection();
        var range = selection.getRangeAt(0);
        var start = range.startOffset;
        var end = range.endOffset;
        //console.log(start,end);
        //console.log(selection.baseNode.parentNode.indexOf(selection.baseNode));
        var selectionHTML;

        //console.log(range.cloneContents());
        let div=document.createElement("div");
        div.appendChild(range.cloneContents());
        selectionHTML = div.innerHTML;
        console.log(div.innerHTML);
        div.remove();

        var previousNode = range.endContainer.previousSibling;
        //console.log(selection);//, previousNode.parentElement.className);
        var cl_name = range.endContainer.parentElement.className;

        //console.log(selection.focusNode.parentNode.previousSibling);

        if(previousNode==null){
            if(cl_name=="ml-punct"||
                cl_name=="ml-en"||
                cl_name=="ml-num"||
                cl_name=="ml-parentheses"||
                cl_name=="indent"){
                //console.log(selection.focusNode.parentNode.previousSibling);
                previousNode = range.endContainer.parentNode.previousSibling;
            }

        }

        while(previousNode!=null){
            //console.log(previousNode.nodeType);
    	    if (previousNode.nodeType == 3) {
                //if (previousNode.className)
    			offset = offset + previousNode.length;
                if(cl_name=="ml-punct"||
                    cl_name=="ml-en"||
                    cl_name=="ml-num"||
                    cl_name=="ml-parentheses"||
                    cl_name=="indent"){
                    offset = offset + range.endContainer.parentNode.outerHTML.length;
                    cl_name = previousNode.parentElement.className;

                }
    	    }   
    	    if (previousNode.nodeType == 1) {
    	        offset = offset + previousNode.outerHTML.length;
    	        
    	        //console.log(previousNode.innerHTML);
    	    }

    	    previousNode = previousNode.previousSibling;
            if(previousNode==null){
                //console.log(cl_name);
                if(cl_name=="ml-punct"||
                    cl_name=="ml-en"||
                    cl_name=="ml-num"||
                    cl_name=="ml-parentheses"||
                    cl_name=="indent"){
                    //console.log(selection.focusNode.parentNode.previousSibling);
                    previousNode = range.endContainer.parentNode.previousSibling;    
                }
            }

    	}
        
        //console.log(selection.focusNode.parentNode.tagName);
    	
        start = start + offset;
        end = end + offset;
        var myElement = document.getElementById("originalText");
        //console.log(selection.focusNode.textContent);
        //console.log(myElement.innerHTML.substring(end-1, end));
        var checkStr = range.endContainer.textContent;

        if( checkStr=="."||
            checkStr==")"||
            myElement.innerHTML.substring(end-1, end)==" "||
            checkStr=="\n"||
            checkStr==","
            ){
            //console.log("done");
            end -= 1;
        }

        newText = document.createTextNode(selection.toString());
        //var addedText = document.getElementById("generatedText");
        var addedText = select("#generatedText");

        var check_nxt_tag = "";

        if(selection.focusNode.parentNode.nextSibling!=null){
            check_nxt_tag = range.endContainer.parentNode.nextSibling.tagName;
        }
        //console.log(selection.focusNode.parentNode.nextSibling);
        //console.log(check_nxt_tag);
        //console.log(selection.focusNode);

        if( selection.toString()!="" &&
            selection.toString()!=" " &&
            selection.toString()!="\n" &&
            selection.focusNode.parentNode.tagName!="SUP" &&
            check_nxt_tag != "SUP"
            ){

            count_footnote_num++;

            var rnNum = Math.floor(Math.random()*conjunction_string.length);

            addedText.html("<sup id=" + "'_" + count_footnote_num + "'" + 
                "class='foot_num'" +
                ">" +
                count_footnote_num +
                " </sup>"+
                "<span class='footnote'>"+
                selectionHTML +
                "</span>" + " " + conjunction_string[rnNum] + " "
                ,true);
            
            is_element_added = true;
            is_element_init = true;
            
            myElement.innerHTML = myElement.innerHTML.substring(0, end) +
                "<sup id=" + "'_" + count_footnote_num + "'" +
                "class='foot_num'" + 
                ">" + 
                count_footnote_num + 
                "</sup>"
                + myElement.innerHTML.substring(end, myElement.innerHTML.length);

            generate();
        }
    }

    
},false);

//add scroll interaction to superscript
document.addEventListener('click',function(e){
    var selector = ".foot_num";
    var el = e.target;
    // Check if it matches our previously defined selector
    if (!el.matches(selector)) {
      return;
    }
    // The method logic
    //alert(el.id+" : "+el.parentElement.id);


    //console.log(el.offsetTop,el.parentElement.offsetTop);

    var orElement = document.getElementById("originalText");
    var genElement = document.getElementById("generatedText");
    
    if(el.parentElement.id=="originalText"){
        
        var counter_el = genElement.querySelector("#"+el.id);
        //alert(counter_el.id+" : "+counter_el.parentElement.id);
        var scroll_pos = counter_el.offsetTop-counter_el.parentElement.offsetTop;
        genElement.scrollTop = scroll_pos-75;
    }

    if(el.parentElement.id=="generatedText"){
        
        var counter_el = orElement.querySelector("#"+el.id);
        var scroll_pos = counter_el.offsetTop-counter_el.parentElement.offsetTop;
        orElement.scrollTop = scroll_pos-75;
    }
});


function modelReady(){
    console.log("LSTM model loaded.");
    loadingDom.remove();
    //headerDom.html(" 모델 로딩 완료.", true);
    resetModel();
}

function resetModel(){
    lstm.reset();
}

let conjunction_string = "";

function prepareString(result){
    console.log("conjunctions.txt loaded");
    conjunction_string = result + "";
    //console.log(result);
    conjunction_string = split(conjunction_string," ");
    console.log(conjunction_string);
}

function setup(){
	noCanvas();
    loadingDom = select("#loading");
	headerDom = select("#header");
	genTextDom = select("#generatedText");
    loadStrings('conjunctions.txt', prepareString);
	//genTextDom_text = document.getElementById("generatedText");
	//genTextDom.mouseOver(generate);
	//genTextDom.mousePressed(addText);
	//genTextDom.mouseOut(stopGeneration);
}

function draw(){
    
}

function mousePressed(){
    if(create_text){
        stopGeneration();
        genTextDom.html(".<br>",true);
    }
}

async function generate(){

	if(is_element_added){
		await lstm.feed(newText);
        create_text = true;
	}

	if(create_text){     
    	loopRNN();
    }

}

function stopGeneration(){
	create_text = false;
}

async function loopRNN() {
  while (create_text) {
    await predict();
    is_element_added = false;
  }
}

let prev_sample = "";

async function predict() {
    let temperature = 0.5;
  
    let next = await lstm.predict(temperature);
    await lstm.feed(next.sample);
   	
    if(create_text){

        if(next.sample=="\n"){
            //console.log(next);
            if(prev_sample!="."){
            	genTextDom.html(".",true);
        	}
            genTextDom.html("<br>",true);
            stopGeneration();
        }else if(next.sample=="."){
            genTextDom.html(next.sample,true);
            genTextDom.html("<br>",true);
            stopGeneration();
        }else{
            genTextDom.html(next.sample,true);
        }
        prev_sample = next.sample;
    }
}