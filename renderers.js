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

function richtext(self, structure, contents, options) {
  let span=document.createElement("span");
  span.textContent=structure.text;
  return span;
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
