import {createaccordion,fromjson as accordionfromjson} from "./accordion.js";
import {fromjson} from "./editjson.js";
import {makeiconURL} from "./image.js";

// https://stackoverflow.com/questions/384286/how-do-you-check-if-a-javascript-object-is-a-dom-object
function isElement(element) {
  return element instanceof Element || element instanceof HTMLDocument;  
}

function addstyles(element,styles){
  // styles is {style name:style value}
  for(let [key,value] of Object.entries(styles)){
    element.style[key]=value;
  }
}

function addclasses(element,classes){
  // classes is [class...]
  for(let c of classes){
    element.classList.add(c);
  }
}

function addprops(element,props){
  // props is {prop:value...}
  for(let [prop,value] of props.entries()){
    element[prop]=value;
  }
}

class Renderer{
  constructor(){
    this.renderers={};
  }

  setoptions(options){
    this.options = options;
  }

  // renderer(this,structure,contents,options)

  render(structure,options){
    if (options == undefined) {
      options = this.options;
    }
    let out;
    if(typeof structure=="string"||typeof structure=="number"||isElement(structure)){
      return structure;
    }
    let contents=structure.contents?.flat().map((x)=>this.render(x,options));
    if(structure.type in this.renderers){
      let renderer=this.renderers[structure.type];
      out=renderer(this,structure,contents,options);
    }else{
      let container=document.createElement(structure.type);
      container.append(...contents);
      out=container;
    }
    if("classes" in structure){
      addclasses(out,structure.classes);
    }
    if("styles" in structure){
      addstyles(out,structure.styles);
    }
    if("props" in structure){
      addprops(out,structure.props);
    }
    if("onclick" in structure&&structure.onclick){
      out.addEventListener("click",()=>{
        structure.onclick(out);
      });
    }
    return out;
  }
}

export {addstyles,addclasses,Renderer};