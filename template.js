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

function addprops(element,props){
	// props is {prop:value...}
	for(var [prop,value] of props.entries()){
		element[prop]=value;
	}
}

function renderstructure(structure,options={}){
	var out;
	if(typeof structure=='string'||typeof structure=='number'||isElement(structure)){
		return structure;
	}
	var contents=structure.contents?.flat().map((x)=>renderstructure(x,options));
	if(structure.type=='accordion'){
		if('header' in structure){
			var headerparts=structure.header.map((x)=>renderstructure(x,options));
			var header=document.createElement('span');
			header.append(...headerparts);
		}
		var div=document.createElement('div');
		div.append(...contents);
		out=createaccordion(header,div);
	}else if(structure.type=='editjson'){
		out=fromjson(structure.data);
	}else if(structure.type=='json'){
		out=accordionfromjson(structure.data);
	}else if(structure.type=='icon'){
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
		var img;
		if('root' in options){
			// promise to load the image
			img=document.createElement('img');
			makeiconURL(idata,options.root).then(url=>{
				img.src=url;
			});
			addclasses(img,['factorio-icon']);
		}else{
			img=document.createElement('span');
			if('localizer' in options){
    			img.textContent=options.localizer[structure.itype+'locale'](structure.name)[0]
			}else{
				img.textContent=structure.name;
			}
		}
		if('localizer' in options){
    		img.title=options.localizer[structure.itype+'locale'](structure.name)[0]
		}
		out=img;
	}else if(structure.type=='texticon'){
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
		var icontext=document.createElement('span');
		icontext.textContent=structure.text;
		addclasses(icontext,['icon-text']);
		var span=document.createElement('span');
		addclasses(span,['factorio-icon']);
		if('root' in options){
			// promise to load the image
			var img=document.createElement('img');
			makeiconURL(idata,options.root).then(url=>{
				img.src=url;
			});
			span.append(img);
		}else{
			if('localizer' in options){
    			span.textContent=options.localizer[structure.itype+'locale'](structure.name)[0]
			}else{
				span.textContent=structure.name;
			}
		}
		span.append(icontext);
		if('localizer' in options){
    		span.title=options.localizer[structure.itype+'locale'](structure.name)[0]
		}
		out=span;
	}else{
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
	if('props' in structure){
		addprops(out,structure.props);
	}
	if('onclick' in structure&&structure.onclick){
		out.addEventListener('click',()=>{
			structure.onclick(out);
		});
	}
	return out;
}

function recipetostructure(recipe,onclick){
	var rdata=data.pdata.recipe[recipe];
	var ings=rdata.normal.ingredients;
	var ress=rdata.normal.results;
	var onclickbound;
	var ingcontents=[];
	for(var i=0;i<ings.length;i++){
		if(onclick){
			onclickbound=onclick.bind(undefined,ings[i][0]);
		}
		ingcontents.push({type:'texticon',itype:'item',name:ings[i][0],text:ings[i][1],onclick:onclickbound});
		ingcontents.push('+');
	}
	var rescontents=[];
	for(var i=0;i<ress.length;i++){
		if(onclick){
			onclickbound=onclick.bind(undefined,ress[i][0]);
		}
		rescontents.push({type:'texticon',itype:'item',name:ress[i][0],text:ress[i][1],onclick:onclickbound});
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