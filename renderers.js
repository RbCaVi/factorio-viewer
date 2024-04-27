import {createaccordion, fromjson as accordionfromjson} from './accordion.js';
import {fromjson} from './editjson.js';
import {makeiconURL} from './image.js';
import {addclasses, Renderer} from './template.js';

function accordion(self, structure, contents, options) {
  let header;
  if("header" in structure){
    var headerparts=structure.header.map((x)=>self.render(x,options));
    header=document.createElement("span");
    header.append(...headerparts);
  }
  let div=document.createElement("div");
  div.append(...contents);
  return createaccordion(header,div);
}

function editjson(self, structure, contents, options) {
  return fromjson(structure.data);
}

function json(self, structure, contents, options) {
  return accordionfromjson(structure.data);
}

function getidata(structure,options) {
  if(structure.itype=="item"){
    return options.data.getitem(structure.name);
  }else if(structure.itype=="tech"){
    return options.data.data.technology[structure.name];
  }else if(structure.itype=="recipe"){
    let rdata=options.data.data.recipe[structure.name];
    console.log(rdata);
    if(rdata.icons==undefined&&rdata.icon==undefined){
      if(rdata.normal.main_product){
        return options.data.getitem(rdata.normal.main_product);
      }else if(rdata.normal.result){
        return options.data.getitem(rdata.normal.result);
      }else{
        return options.data.getitem(rdata.normal.results[0].name);
      }
    }else{
      return rdata;
    }
  }
}

function icon(self, structure, contents, options) {
  let idata=getidata(structure,options);
  let img;
  if("root" in options){
    // promise to load the image
    img=document.createElement("img");
    makeiconURL(idata,options.root).then(url=>{
      img.src=url;
    });
    addclasses(img,["factorio-icon"]);
  }else{
    img=document.createElement("span");
    if("localizer" in options){
      img.textContent=options.localizer[structure.itype+"locale"](structure.name)[0];
    }else{
      img.textContent=structure.name;
    }
  }
  if("localizer" in options){
    img.title=options.localizer[structure.itype+"locale"](structure.name)[0];
  }
  return img;
}

function texticon(self, structure, contents, options) {
  let idata=getidata(structure,options);
  let icontext=document.createElement("span");
  icontext.textContent=structure.text;
  addclasses(icontext,["icon-text"]);
  let span=document.createElement("span");
  addclasses(span,["factorio-icon"]);
  if("root" in options){
    // promise to load the image
    let img=document.createElement("img");
    makeiconURL(idata,options.root).then(url=>{
      img.src=url;
    });
    span.append(img);
  }else{
    if("localizer" in options){
      span.textContent=options.localizer[structure.itype+"locale"](structure.name)[0];
    }else{
      span.textContent=structure.name;
    }
  }
  span.append(icontext);
  if("localizer" in options){
    span.title=options.localizer[structure.itype+"locale"](structure.name)[0];
  }
  return span;
}

function splitrichtext(text) {
  let i=0;
  const texts=[];
  const tags=[];
  while(true){
    const start=text.indexOf('[',i);
    if(start==-1){
      const newtext=text.slice(i);
      texts.push(newtext);
      break;
    }
    const newtext=text.slice(i,start);
    texts.push(newtext);
    i=text.indexOf(']',start+1)+1;
    const tag=text.slice(start,i);
    tags.push(tag);
    if(i==-1){
      throw 'unmatched brackets in rich text';
    }
  }
  return {texts,tags};
}

// default, red, green, blue, orange, yellow, pink, purple, white, black, gray, brown, cyan, acid
const colors={
  red:{r:1,g:0,b:0,a:1},
}

function gettaginfo(tag){
  tag=tag.slice(1,-1);
  const equals=tag.indexOf('=');
  if(equals==-1){
    return {type:tag.trim()};
  }
  const type=tag.slice(0,equals).trim();
  const value=tag.slice(equals+1).trim();
  if(type=='color'){
    // [color=col]...[/color]
    // [color=r,g,b]...[/color]
    // [color=#rrggbb]...[/color]
    // [color=#aarrggbb]...[/color]
    if(value in colors){
      return {type:'color',color:colors[value]};
    }
    if(value.startsWith('#')){
      // https://learnersbucket.com/examples/interview/convert-hex-color-to-rgb-in-javascript/
      if(value.length==6){
        const a = 1;
        const r = parseInt(hex.slice(0, 2), 16) / 255;
        const g = parseInt(hex.slice(2, 4), 16) / 255;
        const b = parseInt(hex.slice(4, 6), 16) / 255;
        return {type:'color',color:{a,r,g,b}};
      }else{
        const a = parseInt(hex.slice(0, 2), 16) / 255;
        const r = parseInt(hex.slice(2, 4), 16) / 255;
        const g = parseInt(hex.slice(4, 6), 16) / 255;
        const b = parseInt(hex.slice(6, 8), 16) / 255;
        return {type:'color',color:{a,r,g,b}};
      }
    }
    const channels=value.split(',');
    return {type:'color',color:{
      a:1,
      r:parseInt(channels[0]),
      g:parseInt(channels[1]),
      b:parseInt(channels[2])
    }};
  }
  if(type=='font'){
    return {type:'font',font:value};
  }
  return {type,value};
}

function nestrichtext(split) {
  const {texts,tags}=split;
  const stack=[{type:'root',contents:[]}]
  for(let i=0;i<tags.length;i++){
    if(texts[i].length>0){
      stack.at(-1).contents.push(texts[i]);
    }
    const tag=gettaginfo(tags[i]);
    if(tag.type=='color'){
      stack.push({type:'color',color:tag.color,contents:[]});
    }else if(tag.type=='font'){
      stack.push({type:'font',font:tag.font,contents:[]});
    }else if(tag.type=='/color'||tag.type=='/font'){
      if(stack.at(-1).type!=tag.type.slice(1)){
        throw 'unmatched tags';
      }
      const top=stack.pop();
      stack.at(-1).contents.push(top);
    }else{
      stack.at(-1).contents.push(tag);
    }
  }
  stack.at(-1).contents.push(texts.at(-1));
  if(stack.length>1){
    throw 'unmatched tags';
  }
  return stack[0];
}

// copied from image.js
function colorToString(color){
  return color.reduce((s, channel) => {
    let c = Math.floor(channel*255).toString(16);
    c = (c.length==1?"0":"")+c;
    s += c;
    return s;
  }, "#");
}

function renderrichtext(nested) {
  const span=document.createElement("span");
  console.log('render',nested);
  for(const part of nested.contents){
    if(typeof part=='string'){
      span.append(part);
    }else if(part.type=='color'||part.type=='font'){
      const span2=document.createElement("span");
      if(part.type=='color'){
        span2.style.color=colorToString([part.color.r,part.color.g,part.color.b,part.color.a])
      }else{
        span2.style.padding='15px'
        span2.style.color='green'
      }
      span2.append(renderrichtext(part))
      span.append(span2)
    }else{
      const span2=document.createElement("span");
      span2.style.padding='10px'
      span2.textContent=JSON.stringify(part);
      span.append(span2)
    }
  }
  return span;
}

function richtext(self, structure, contents, options) {
  //let span=document.createElement("span");
  const split=splitrichtext(structure.text);
  const nest=nestrichtext(split);
  const out=renderrichtext(nest);
  //span.textContent=JSON.stringify(nest);
  //return span;
  return out;
}

function recipetostructure(recipe, onclick) {
  var rdata=data.pdata.recipe[recipe];
  var ings=rdata.normal.ingredients;
  var ress=rdata.normal.results;
  var onclickbound;
  var ingcontents=[];
  for (var i=0; i<ings.length; i++) {
    if (onclick) {
      onclickbound=onclick.bind(undefined, ings[i][0]);
    }
    ingcontents.push( {
    type:
    'texticon', itype:
    'item', name:
    ings[i][0], text:
    ings[i][1], onclick:
      onclickbound
    }
    );
    ingcontents.push('+');
  }
  var rescontents=[];
  for (var i=0; i<ress.length; i++) {
    if (onclick) {
      onclickbound=onclick.bind(undefined, ress[i][0]);
    }
    rescontents.push( {
    type:
    'texticon', itype:
    'item', name:
    ress[i][0], text:
    ress[i][1], onclick:
      onclickbound
    }
    );
    rescontents.push('+');
  }
  ingcontents.pop();
  rescontents.pop();
  return ingcontents.concat(['→'], rescontents, ' ', rdata.normal.time+' s');
}

function accordionifmultiple(header, parts) {
  if (parts.length==0) {
    return [];
  }
  if (parts.length==1) {
    return {
    type:
    'div', contents:
      [header, parts[0]]
    };
  }
  return {
  type:
  'accordion', header:
  header, contents:
    parts
  };
}

export {accordion, editjson, json, icon, texticon, recipetostructure, accordionifmultiple, richtext};
