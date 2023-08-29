import {createaccordion,fromjson as accordionfromjson} from './accordion.js';
import {fromjson} from './editjson.js';
import {makeiconURL} from './image.js';

// https://stackoverflow.com/questions/384286/how-do-you-check-if-a-javascript-object-is-a-dom-object
function isElement(element) {
  return element instanceof Element || element instanceof HTMLDocument;  
}

function addstyles(element,styles){
	// styles is {style name:style value}
	for(var [key,value] of Object.entries(styles)){
		element.style[key]=value;
	}
}

function addclasses(element,classes){
	// classes is [class...]
	for(var c of classes){
		element.classList.add(c);
	}
}

function renderstructure(structure){
	var out;
	if(typeof structure=='string'||typeof structure=='number'||isElement(structure)){
		return structure;
	}
	if('contents' in structure){
		structure.contents=structure.contents.flat();
	}
	if(structure.type=='accordion'){
		if('header' in structure){
			var headerparts=structure.header.map(renderstructure);
			var header=document.createElement('span');
			header.append(...headerparts);
		}
		var contents=structure.contents.map(renderstructure);
		var div=document.createElement('div');
		div.append(...contents);
		out=createaccordion(header,div);
	}else if(structure.type=='editjson'){
		out=fromjson(structure.data);
	}else if(structure.type=='json'){
		out=accordionfromjson(structure.data);
	}else if(structure.type=='icon'){
		// promise to load the image
		var img=document.createElement('img');
		var idata;
		if(structure.itype=='item'){
			idata=data.getitem(structure.name);
		}else if(structure.itype=='tech'){
			idata=data.data.technology[structure.name];
		}else if(structure.itype=='recipe'){
			var rdata=data.data.recipe[structure.name];
			console.log(rdata);
			if(rdata.icons==undefined&&rdata.icon==undefined){
				if(rdata.normal.main_product){
					idata=data.getitem(rdata.normal.main_product);
				}else if(rdata.normal.result){
					idata=data.getitem(rdata.normal.result);
				}else{
					idata=data.getitem(rdata.normal.results[0].name);
				}
			}else{
				idata=rdata;
			}
		}
		makeiconURL(idata).then(url=>{
      	img.src=url;
		});
		var iconstyle={
			borderColor:'black',
			borderWidth:'1px',
			borderStyle:'solid',
			position:'relative',
			display:'inline-block'
		};
		addstyles(img,iconstyle);
		var itype=structure.itype;
		var name=structure.name;
		img.addEventListener('click',()=>render(itype,name));
		out=img;
	}else{
		var contents=structure.contents.map(renderstructure);
		var container=document.createElement(structure.type);
		container.append(...contents);
		out=container;
	}
	if('classes' in structure){
		addclasses(out,structure.classes);
	}
	if('styles' in structure){
		addstyles(out,structure.styles);
	}
	return out;
}

function recipetostructure(recipe){
	var rdata=data.pdata.recipe[recipe];
	var ings=rdata.normal.ingredients;
	var ress=rdata.normal.results;
	var iconstyle={
		borderColor:'black',
		borderWidth:'1px',
		borderStyle:'solid',
		position:'relative',
		display:'inline-block'
	};
	var ingcontents=[];
	for(var i=0;i<ings.length;i++){
		ingcontents.push({
			type:'span',
			contents:[
				{type:'icon',itype:'item',name:ings[i][0]},
				{type:'span',contents:[ings[i][1]],classes:['icon-text']}
			],
			styles:iconstyle
		});
		ingcontents.push('+');
	}
	var rescontents=[];
	for(var i=0;i<ress.length;i++){
		rescontents.push({
			type:'span',
			contents:[
				{type:'icon',itype:'item',name:ress[i][0]},
				{type:'span',contents:[ress[i][1]],classes:['icon-text']}
			],
			styles:iconstyle
		});
		rescontents.push('+');
	}
	ingcontents.pop();
	rescontents.pop();
	return ingcontents.concat(['→'],rescontents,' ',rdata.normal.time+' s');
}

function accordionifmultiple(header,parts){
	if(parts.length==0){
		return [];
	}
	if(parts.length==1){
		return {type:'div',contents:[header,parts[0]]};
	}
	return {type:'accordion',header:header,contents:parts};
}

export {addstyles,addclasses,renderstructure,recipetostructure,accordionifmultiple};