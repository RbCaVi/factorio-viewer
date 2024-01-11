import {createaccordion, fromjson as accordionfromjson} from './accordion.js';
import {fromjson} from './editjson.js';
import {makeiconURL} from './image.js';
import {addclasses, Renderer} from './template.js';

function accordion(this, structure, contents, options) {
  if ('header' in structure) {
    var headerparts=structure.header.map(renderstructure);
    var header=document.createElement('span');
    header.append(...headerparts);
  }
  var div=document.createElement('div');
  div.append(...contents);
  out=createaccordion(header, div);
}

function editjson(this, structure, contents, options) {
  out=fromjson(structure.data);
}

function json(this, structure, contents, options) {
  out=accordionfromjson(structure.data);
}

function icon(this, structure, contents, options) {
  // promise to load the image
  var img=document.createElement('img');
  var idata;
  if (structure.itype=='item') {
    idata=data.getitem(structure.name);
  } else if (structure.itype=='tech') {
    idata=data.data.technology[structure.name];
  } else if (structure.itype=='recipe') {
    var rdata=data.data.recipe[structure.name];
    console.log(rdata);
    if (rdata.icons==undefined&&rdata.icon==undefined) {
      if (rdata.normal.main_product) {
        idata=data.getitem(rdata.normal.main_product);
      } else if (rdata.normal.result) {
        idata=data.getitem(rdata.normal.result);
      } else {
        idata=data.getitem(rdata.normal.results[0].name);
      }
    } else {
      idata=rdata;
    }
  }
  makeiconURL(idata).then(url=> {
    img.src=url;
  }
  );
  addclasses(img, ['factorio-icon']);
  out=img;
}

function texticon(this, structure, contents, options) {
  // promise to load the image
  var img=document.createElement('img');
  var idata;
  if (structure.itype=='item') {
    idata=data.getitem(structure.name);
  } else if (structure.itype=='tech') {
    idata=data.data.technology[structure.name];
  } else if (structure.itype=='recipe') {
    var rdata=data.data.recipe[structure.name];
    console.log(rdata);
    if (rdata.icons==undefined&&rdata.icon==undefined) {
      if (rdata.normal.main_product) {
        idata=data.getitem(rdata.normal.main_product);
      } else if (rdata.normal.result) {
        idata=data.getitem(rdata.normal.result);
      } else {
        idata=data.getitem(rdata.normal.results[0].name);
      }
    } else {
      idata=rdata;
    }
  }
  makeiconURL(idata).then(url=> {
    img.src=url;
  }
  );
  var icontext=document.createElement('span');
  icontext.textContent=structure.text;
  addclasses(icontext, ['icon-text']);
  var span=document.createElement('span');
  addclasses(span, ['factorio-icon']);
  span.append(img, icontext);
  out=span;
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

export {accordion, editjson, json, icon, texticon, renderstructure, recipetostructure, accordionifmultiple};
