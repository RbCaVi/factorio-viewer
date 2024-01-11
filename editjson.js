function accordionclick() {
  /* Toggle between adding and removing the "active" class,
    to highlight the button that controls the panel */
  this.classList.toggle("jsonaccordionactive");

  /* Toggle between hiding and showing the active panel */
  let panel = this.nextElementSibling;
  if (panel.style.display === "block") {
    panel.style.display = "none";
  } else {
    panel.style.display = "block";
  }
}

let types=["object","number","string","array","literal"];

function moveupclick(){
  moveup(this.parentElement.parentElement);
}

function movedownclick(){
  movedown(this.parentElement.parentElement);
}

function deleteclick(){
  deletepart(this.parentElement.parentElement);
}

function moveup(element){
  if(element==element.parentElement.firstChild){
    return;
  }
  element.previousElementSibling.before(element.parentElement.removeChild(element));
}

function movedown(element){
  if(element==element.parentElement.lastChild){
    return;
  }
  element.nextElementSibling.after(element.parentElement.removeChild(element));
}

function deletepart(element){
  element.parentElement.removeChild(element);
}


function makepart(type){
  let outerdiv=document.createElement("div");
  let div=document.createElement("div");
  div.classList.add("json"+type);
  div.classList.add("json");
  if(type=="object"){
    let addbutton=document.createElement("button");
    //addbutton.classList.toggle("add");
    addbutton.addEventListener("click", addkeyclick);
    addbutton.textContent="add";
    div.append(addbutton);
    let typeinput=document.createElement("select");
    for(let i=0;i<types.length;i++){
      let option=document.createElement("option");
      option.value=types[i];
      option.text=types[i];
      typeinput.append(option);
    }
    div.append(typeinput);
  }else if(type=="array"){
    let addbutton=document.createElement("button");
    //addbutton.classList.toggle("add");
    addbutton.addEventListener("click", additemclick);
    addbutton.textContent="add";
    div.append(addbutton);
    let typeinput=document.createElement("select");
    for(let i=0;i<types.length;i++){
      let option=document.createElement("option");
      option.value=types[i];
      option.text=types[i];
      typeinput.append(option);
    }
    div.append(typeinput);
  }else if(type=="number"){
    let span=document.createElement("span");
    span.classList.add("json"+type);
    span.classList.add("json");
    let valueinput=document.createElement("input");
    valueinput.type = "text";
    span.append(valueinput);
    return span;
  }else if(type=="string"){
    let span=document.createElement("span");
    span.classList.add("json"+type);
    span.classList.add("json");
    let valueinput=document.createElement("input");
    valueinput.type = "text";
    span.append("\"",valueinput,"\"");
    return span;
  }else if(type=="literal"){
    let span=document.createElement("span");
    span.classList.add("json"+type);
    span.classList.add("json");
    let valueinput=document.createElement("select");
    let literals=["null","true","false"];
    for(let i=0;i<literals.length;i++){
      let option=document.createElement("option");
      option.value=literals[i];
      option.text=literals[i];
      valueinput.append(option);
    }
    span.append(valueinput);
    return span;
  }
    
  div.style.display = "none";

  let accordionbutton=document.createElement("button");
  accordionbutton.classList.add("jsonaccordion");
  accordionbutton.addEventListener("click", accordionclick);
  outerdiv.append(accordionbutton,div);
  return outerdiv;
}

function makekeyoptions(){
  let span=document.createElement("span");
  let keyinput=document.createElement("input");
  span.append(keyinput);
  let deletebutton=document.createElement("button");
  deletebutton.addEventListener("click", deleteclick);
  span.append(deletebutton);
  deletebutton.textContent="delete";
  return span;
}

function makeitemoptions(){
  let span=document.createElement("span");
  let upbutton=document.createElement("button");
  upbutton.textContent="up";
  upbutton.addEventListener("click", moveupclick);
  span.append(upbutton);
  let downbutton=document.createElement("button");
  downbutton.textContent="down";
  downbutton.addEventListener("click", movedownclick);
  span.append(downbutton);
  let deletebutton=document.createElement("button");
  deletebutton.textContent="delete";
  deletebutton.addEventListener("click", deleteclick);
  span.append(deletebutton);
  return span;
}

function addkey(element,key,content){
  let newtypeinput=element.lastChild.lastChild;
  let addbutton=newtypeinput.previousElementSibling;

  let options=makekeyoptions();
  if(key!=undefined){
    options.firstElementChild.value=key;
  }
  if(!content){
    options.append(newtypeinput.value);
  }else{
    let div=content.querySelector(".json")||content;
    for(let i=0;i<types.length;i++){
      if(div.classList.contains("json"+types[i])){
        options.append(types[i]);
        break;
      }
    }
  }

  if(!content){
    content=makepart(newtypeinput.value);
  }

  let br=document.createElement("br");
    
  let div=document.createElement("div");
  div.append(options,content,br);

  addbutton.before(div);
  return content;
}

function additem(element,content){
  let newtypeinput=element.lastChild.lastChild;
  let addbutton=newtypeinput.previousElementSibling;

  let options=makeitemoptions();
  if(!content){
    options.append(newtypeinput.value);
  }else{
    let div=content.querySelector(".json")||content;
    for(let i=0;i<types.length;i++){
      if(div.classList.contains("json"+types[i])){
        options.append(types[i]);
        break;
      }
    }
  }

  if(!content){
    content=makepart(newtypeinput.value);
  }

  let br=document.createElement("br");
    
  let div=document.createElement("div");
  div.append(options,content,br);

  addbutton.before(div);
  return content;
}

function addkeyclick(){
  addkey(this.parentElement.parentElement);
}

function additemclick(){
  additem(this.parentElement.parentElement);
}

function getjson(element){
  element.classList.add("root");
  if(element.classList.contains("jsonnumber")){
    let input=element.querySelector("span.root>input");
    element.classList.remove("root");
    return JSON.stringify(parseFloat(input.value));
  }
  if(element.classList.contains("jsonstring")){
    let input=element.querySelector("span.root>input");
    element.classList.remove("root");
    return JSON.stringify(input.value);
  }
  if(element.classList.contains("jsonliteral")){
    let input=element.querySelector("span.root>select");
    element.classList.remove("root");
    return JSON.stringify(JSON.parse(input.value));
  }
  if(element.lastChild.classList.contains("jsonarray")){
    let out=[];
    let divs=element.querySelectorAll("div.root>div.json>div");
    for (let i = 0; i < divs.length; i++) {
      let div=divs[i];
      let value=getjson(div.firstChild.nextElementSibling);
      out.push(value);
    }
    element.classList.remove("root");
    return "["+out.join(",")+"]";
  }
  if(element.lastChild.classList.contains("jsonobject")){
    let out=[];
    let divs=element.querySelectorAll("div.root>div.json>div");
    for (let i = 0; i < divs.length; i++) {
      let div=divs[i];
      let key=div.firstChild.querySelector("span>input").value;
      let value=getjson(div.firstChild.nextElementSibling);
      out.push(JSON.stringify(key)+":"+value);
    }
    element.classList.remove("root");
    return "{"+out.join(",")+"}";
  }
  element.classList.remove("root");
}

function fromjson(data){
  let div;
  switch(typeof data){
  case "string":
    div=makepart("string");
    div.querySelector("input").value=data;
    return div;
  case "number":
    div=makepart("number");
    div.querySelector("input").value=data;
    return div;
  case "boolean":
    div=makepart("literal");
    div.querySelector("select").value=JSON.stringify(data);
    return div;
  case "object":
    if (!data){
      div=makepart("literal");
      div.querySelector("select").value="null";
      return div;
    }
    if(Array.isArray(data)){
      div=makepart("array");
      for(let i=0;i<data.length;i++) {
        additem(div,fromjson(data[i]));
      }
      return div;
    }
    div=makepart("object");
    for(let key in data){
      addkey(div,key,fromjson(data[key]));
    }
    return div;
  default:
    div=makepart("literal");
    div.querySelector("select").value="null";
    return div;
  }
}

export {getjson,fromjson};