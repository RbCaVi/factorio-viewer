function accordionclick() {
    /* Toggle between adding and removing the "active" class,
    to highlight the button that controls the panel */
    this.classList.toggle("jsonaccordionactive");

    /* Toggle between hiding and showing the active panel */
    var panel = this.nextElementSibling;
    if (panel.style.display === "block") {
        panel.style.display = "none";
    } else {
        panel.style.display = "block";
    }
};

var types=['object','number','string','array','literal'];

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
    var outerdiv=document.createElement('div');
    var div=document.createElement('div');
    div.classList.add("json"+type);
    div.classList.add("json");
    if(type=='object'){
            var addbutton=document.createElement('button');
            //addbutton.classList.toggle("add");
            addbutton.addEventListener("click", addkeyclick);
            addbutton.textContent='add';
        div.append(addbutton);
            var typeinput=document.createElement('select');
            for(var i=0;i<types.length;i++){
                var option=document.createElement('option');
                option.value=types[i];
                option.text=types[i];
                typeinput.append(option);
            }
        div.append(typeinput);
    }else if(type=='array'){
            var addbutton=document.createElement('button');
            //addbutton.classList.toggle("add");
            addbutton.addEventListener("click", additemclick);
            addbutton.textContent='add';
        div.append(addbutton);
            var typeinput=document.createElement('select');
            for(var i=0;i<types.length;i++){
                var option=document.createElement('option');
                option.value=types[i];
                option.text=types[i];
                typeinput.append(option);
            }
        div.append(typeinput);
    }else if(type=='number'){
        var div=document.createElement('span');
        div.classList.add("json"+type);
        div.classList.add("json");
            var valueinput=document.createElement('input');
            valueinput.type = "text";
        div.append(valueinput);
        return div;
    }else if(type=='string'){
        var div=document.createElement('span');
        div.classList.add("json"+type);
        div.classList.add("json");
            var valueinput=document.createElement('input');
            valueinput.type = "text";
        div.append('"',valueinput,'"');
        return div;
    }else if(type=='literal'){
        var div=document.createElement('span');
        div.classList.add("json"+type);
        div.classList.add("json");
        var valueinput=document.createElement('select');
        var literals=['null','true','false'];
        for(var i=0;i<literals.length;i++){
            var option=document.createElement('option');
            option.value=literals[i];
            option.text=literals[i];
            valueinput.append(option);
        }
        div.append(valueinput);
        return div;
    }
    
    div.style.display = "none";

    var accordionbutton=document.createElement('button');
    accordionbutton.classList.add("jsonaccordion");
    accordionbutton.addEventListener("click", accordionclick);
    outerdiv.append(accordionbutton,div);
    return outerdiv;
}

function makekeyoptions(){
    var span=document.createElement('span');
    var keyinput=document.createElement('input');
    span.append(keyinput);
    var deletebutton=document.createElement('button');
    deletebutton.addEventListener("click", deleteclick);
    span.append(deletebutton);
    deletebutton.textContent='delete';
    return span;
}

function makeitemoptions(){
    var span=document.createElement('span');
    var upbutton=document.createElement('button');
    upbutton.textContent='up';
    upbutton.addEventListener("click", moveupclick);
    span.append(upbutton);
    var downbutton=document.createElement('button');
    downbutton.textContent='down';
    downbutton.addEventListener("click", movedownclick);
    span.append(downbutton);
    var deletebutton=document.createElement('button');
    deletebutton.textContent='delete';
    deletebutton.addEventListener("click", deleteclick);
    span.append(deletebutton);
    return span;
}

function addkey(element,key,content){
    var newtypeinput=element.lastChild.lastChild;
    var addbutton=newtypeinput.previousElementSibling;

    var options=makekeyoptions();
    if(key!=undefined){
        options.firstElementChild.value=key;
    }
    if(!content){
        options.append(newtypeinput.value);
    }else{
        var div=content.querySelector('.json')||content;
        for(var i=0;i<types.length;i++){
            if(div.classList.contains('json'+types[i])){
                options.append(types[i]);
                break;
            }
        }
    }

    if(!content){
        var content=makepart(newtypeinput.value);
    }

    var br=document.createElement('br');
    
    var div=document.createElement('div');
    div.append(options,content,br);

    addbutton.before(div);
    return content;
}

function additem(element,content){
    var newtypeinput=element.lastChild.lastChild;
    var addbutton=newtypeinput.previousElementSibling;

    var options=makeitemoptions();
    if(!content){
        options.append(newtypeinput.value);
    }else{
        var div=content.querySelector('.json')||content;
        for(var i=0;i<types.length;i++){
            if(div.classList.contains('json'+types[i])){
                options.append(types[i]);
                break;
            }
        }
    }

    if(!content){
        var content=makepart(newtypeinput.value);
    }

    var br=document.createElement('br');
    
    var div=document.createElement('div');
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
    if(element.classList.contains('jsonnumber')){
        var input=element.querySelector('span.root>input');
        element.classList.remove("root");
        return JSON.stringify(parseFloat(input.value));
    }
    if(element.classList.contains('jsonstring')){
        var input=element.querySelector('span.root>input');
        element.classList.remove("root");
        return JSON.stringify(input.value);
    }
    if(element.classList.contains('jsonliteral')){
        var input=element.querySelector('span.root>select');
        element.classList.remove("root");
        return JSON.stringify(JSON.parse(input.value));
    }
    if(element.lastChild.classList.contains('jsonarray')){
        var out=[];
        var divs=element.querySelectorAll('div.root>div.json>div');
        for (var i = 0; i < divs.length; i++) {
            var div=divs[i];
            var value=getjson(div.firstChild.nextElementSibling);
            out.push(value);
        }
        element.classList.remove("root");
        return '['+out.join(',')+']';
    }
    if(element.lastChild.classList.contains('jsonobject')){
        var out=[];
        var divs=element.querySelectorAll('div.root>div.json>div');
        for (var i = 0; i < divs.length; i++) {
            var div=divs[i];
            var key=div.firstChild.querySelector('span>input').value;
            var value=getjson(div.firstChild.nextElementSibling);
            out.push(JSON.stringify(key)+':'+value);
        }
        element.classList.remove("root");
        return '{'+out.join(',')+'}';
    }
    element.classList.remove("root");
}

function fromjson(data){
    switch(typeof data){
        case "string":
            var div=makepart('string');
            div.querySelector('input').value=data;
            return div;
        case "number":
            var div=makepart('number');
            div.querySelector('input').value=data;
            return div;
        case "boolean":
            var div=makepart('literal');
            div.querySelector('select').value=JSON.stringify(data);
            return div;
        case "object":
            if (!data){
                var div=makepart('literal');
                div.querySelector('select').value='null';
                return div;
            }
            if(Array.isArray(data)){
                var div=makepart('array');
                for(var i=0;i<data.length;i++) {
                    additem(div,fromjson(data[i]));
                }
                return div;
            }
            var div=makepart('object');
            for(var key in data){
                addkey(div,key,fromjson(data[key]));
            }
            return div;
        default:
            var div=makepart('literal');
            div.querySelector('select').value='null';
            return div;
    }
}

export {getjson,fromjson};