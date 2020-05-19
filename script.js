
const lstm = ml5.charRNN('models/edgar_kor', modelReady);

let is_element_added = false;
let is_element_init = false;

let create_text = false;

let genTextDom;
let headerDom;
let loadingDom;

let newText;
let conjunctionText;

let gen_text = "";

let count_footnote_num = 0;

let cx1,cy1,cx2,cy2;
let wnum = 16;

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
let orDOM = document.getElementById("originalText");
let selectedDOM;
//let is_selectedDOM_new = false;
document.getElementById("originalText").addEventListener("click", function(){
	if(!create_text){

    	var offset = 0;
        var selection = window.getSelection();  
        var range = selection.getRangeAt(0);
        selectedDOM = range.getBoundingClientRect();
        prev_scroll_pos = orDOM.scrollTop;
        //is_selectedDOM_new = true;
        var start = range.startOffset;
        var end = range.endOffset;
        //if(range.fo)
        //console.log(range.endContainer.nextSibling.tagName);
        //console.log(start,end);
        //console.log(selection.baseNode.parentNode.indexOf(selection.baseNode));
        var selectionHTML;
        var is_sup_included = false;
        //console.log(range.cloneContents());
        let div = document.createElement("div");
        div.appendChild(range.cloneContents());
        selectionHTML = div.innerHTML;
        //console.log(div.innerHTML);
        //------> check if there is sup tag
        //console.log(div.getElementsByTagName("SUP"));
        if( div.getElementsByTagName("SUP").length>0){
            is_sup_included = true;
            alert("선택된 텍스트에 이미 각주가 포함되어 있습니다.");
        }

        if(range.endContainer.nextSibling){
            if(range.endContainer.nextSibling.tagName=="SUP"){
                is_sup_included = true;
                alert("선택된 텍스트에 이미 각주가 포함되어 있습니다.");
            }
        }

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
        var rnNum = Math.floor(Math.random()*conjunction_string.length);

        conjunctionText = conjunction_string[rnNum];

        var str_data = selection.toString() + " " + conjunction_string[rnNum] + " ";

        //console.log(str_data);

        newText = document.createTextNode(str_data);
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
            check_nxt_tag != "SUP" &&
            is_sup_included == false
            ){

            count_footnote_num++;

            //var rnNum = Math.floor(Math.random()*conjunction_string.length);
            //conjunctionText = conjunction_string[rnNum];
            addedText.html("<sup id=" + "'_" + count_footnote_num + "'" + 
                "class='foot_num'" +
                ">" +
                count_footnote_num +
                " </sup>"+
                "<span class='footnote'>"+
                selection.toString() +
                "</span>" + " " + conjunctionText + " "
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

            //console.log(newText);
            generate();
        }
    }

    
},false);

//add scroll interaction to superscript
let scroll_el;
let should_scroll = false;
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
        //var scroll_pos = counter_el.offsetTop-counter_el.parentElement.offsetTop;
        //genElement.scrollTop = scroll_pos-75;
        scroll_el = counter_el;
        should_scroll = true;
    }

    if(el.parentElement.id=="generatedText"){
        
        var counter_el = orElement.querySelector("#"+el.id);
        //var scroll_pos = counter_el.offsetTop-counter_el.parentElement.offsetTop;
        //orElement.scrollTop = scroll_pos-75;
        scroll_el = counter_el;
        should_scroll = true;
    }
});

function scrollTo(el){
    let scrollpos = el.offsetTop - el.parentElement.offsetTop;
    if(abs((scrollpos-75)-el.parentElement.scrollTop)>1.){
        el.parentElement.scrollTop += ((scrollpos-75)-el.parentElement.scrollTop)*0.1;
    }else{
        should_scroll = false;
    }
}

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
	let cnv = createCanvas(windowWidth, windowHeight);
    cnv.parent("canvasContainer");
    loadingDom = select("#loading");
	headerDom = select("#header");
	genTextDom = select("#generatedText");
    loadStrings('conjunctions.txt', prepareString);
	//genTextDom_text = document.getElementById("generatedText");
	//genTextDom.mouseOver(generate);
	//genTextDom.mousePressed(addText);
	//genTextDom.mouseOut(stopGeneration);

    cx1 = (floor(random(wnum))+0.5)*width/wnum;
    cy1 = (floor(random(wnum))+0.5)*height/wnum;
    cx2 = (floor(random(wnum))+0.5)*width/wnum;
    cy2 = (floor(random(wnum))+0.5)*height/wnum;
}

function windowResized(){
    cnv = resizeCanvas(windowWidth,windowHeight);
}

let prev_scroll_pos;

function draw(){
    clear();
    //let x = width * 0.6;
    //let y = 75;
    //fill(0);
    //rect(x,y,width*0.1,height-150);

    if(should_scroll){
        scrollTo(scroll_el);
    }
    /*
    if(lstm_state){
        for(let i=0; i<wnum; i++){
            for(let j=0; j<wnum; j++){
                let w = width/wnum;
                let h = height/wnum;
                let x = i * w;
                let y = j * h;

                let index = i + j * wnum;
                let c = lstm_state[0][index];
                fill(c*255);
                rect(x,y,w,h);
            }
        }
    }
    */
    let sx = 0;
    let sy = 0;
    let ex = 0;
    let ey = 0;

    if(last_pos&&last_pos.parentElement){
        let x = last_pos.offsetLeft + last_pos.parentElement.offsetLeft;
        let y = 7 + last_pos.offsetTop + last_pos.parentElement.offsetTop - last_pos.parentElement.scrollTop;
        if(x!=0&&y!=0&&y>75){
            ex = x;
            ey = y;
        }
    }

    if(last_footNum&&last_footNum.parentElement){
        let x = 3.5 + last_footNum.offsetLeft + last_footNum.parentElement.offsetLeft;
        let y = 6 + last_footNum.offsetTop + last_footNum.parentElement.offsetTop - last_footNum.parentElement.scrollTop;
        if(x!=0&&y!=0){
            sx = x;
            sy = y;
        }
    }

    if(selectedDOM){
        let x = selectedDOM.x;
        let y = selectedDOM.y - (orDOM.scrollTop - prev_scroll_pos);
        //if(!is_selectedDOM_new) y = y - (orDOM.scrollTop);
        let w = selectedDOM.width;
        let h = selectedDOM.height;
        strokeWeight(2);
        fill(255,255,0);
        rect(x,y,w,h,4);
        
    }

    if(sx!=0&&sy!=0&&ex!=0&&ey!=0){
        strokeWeight(2);
        fill(255,255,0);
        ellipse(ex,ey,20,20);
        ellipse(sx,sy,20,20);
        //ellipse(cx1,cy1,10,10);
        //ellipse(cx2,cy2,10,10);

        strokeWeight(2);
        noFill();
        beginShape();
        //vertex(ex,ey);
        //vertex(cx2,cy2);
        //vertex(cx1,cy1);
        vertex(sx,sy);
        bezierVertex(cx1,cy1,cx2,cy2,ex,ey);
        endShape();
    }
    //console.log(last_footNum);
}

/*
function mousePressed(){
    if(create_text){
        stopGeneration();
        genTextDom.html(".<br>",true);
    }
}
*/

async function generate(){

	if(is_element_added){
        //console.log(newText);
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
let last_pos;
let last_footNum;
let lstm_state;

async function predict() {
    let temperature = 0.5;
  
    let next = await lstm.predict(temperature);
    await lstm.feed(next.sample);
   	//----> add wrapper to added text
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
            genTextDom.html("<span class = 'trackPrediction'>"+next.sample+"</span>",true);
        }
        prev_sample = next.sample;

        let pos = document.getElementsByClassName("trackPrediction");
        last_footNum = document.getElementById('originalText').querySelector("#_"+count_footnote_num);
        last_pos = pos[pos.length-1];
        //console.log(last_pos.parentElement.previousSibling);

    }

    cx1 = (floor(random(wnum))+0.5)*width/wnum;
    cy1 = (floor(random(wnum))+0.5)*height/wnum;
    cx2 = (floor(random(wnum))+0.5)*width/wnum;
    cy2 = (floor(random(wnum))+0.5)*height/wnum;
    //lstm_state = await lstm.state.h[1];
    //lstm_state = lstm_state.arraySync();
    //console.log(lstm_state);

    //console.log(last_pos.offsetTop,last_pos.offsetLeft);
}

