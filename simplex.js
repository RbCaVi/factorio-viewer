import {clone} from './util.js';

let rtable={};

function unallowed(recipe,data) {
	if(recipe.normal.ingredients.length==1){
		for(var precipe of data.produces[recipe.normal.ingredients[0]]){
			var icounts={};
			for(var [ing,count] of data.pdata.recipe[precipe]){
				icounts[ing]=(icounts[ing]??0)+count;
			}
			var pass=true;
			for(var [res,count] of recipe.results){
				if(count>icounts[ing]??0){
					pass=false;
					break;
				}
			}
			if(pass){
				return true;
			}
		}
	}
	return false;
}

function setup(data){
	rtable={}
	for(var recipename in data.pdata.recipe){
		var recipe=data.pdata.recipe[recipename];
		if(unallowed(recipe,data)){
			continue;
		}
		var entry={};
		for(var ing of recipe.normal.ingredients){
			entry[ing[0]]=(entry[ing[0]]??0)-ing[1]/recipe.normal.time;
		}
		for(var res of recipe.normal.results){
			entry[res[0]]=(entry[res[0]]??0)+res[1]/recipe.normal.time;
		}
		rtable[recipename]=entry;
	}

	for(var item of ['iron-ore','copper-ore','crude-oil']){
		var entry={};
		entry[item]=1;
		rtable[item]=entry;
	}
}

function f(outs){
	var rtable2=clone(rtable);
	addcosts(rtable2);
	addslacks(rtable2);
	rtable2['.out']=outs;
	while(true){
		var col=minIndex(outs);
		if(outs[col]>=0){
			break;
		}
		var [minrow,minr]=Object.entries(rtable2)[0];
		for(var [row,recipe] of Object.entries(rtable2)){
			//console.log(minrow,row,minr,recipe);
			if((!(col in recipe))||recipe[col]<=0||row=='.out'){
				//console.log('no contain');
				continue;
			}
			if((!(col in minr))||minr[col]<=0||minrow=='.out'||minr['.cost']/minr[col]>recipe['.cost']/recipe[col]){
				minr=recipe;
				minrow=row;
			}
		}
		var v=minr[col];
		mapKeys(minr,x=>x/v);
		console.log('pivot',minrow,col);
		for(var recipe of Object.values(rtable2)){
			if(recipe==minr){
				continue;
			}
			if(col in recipe){
				subtractObject(recipe,minr,recipe[col]);
			}
		}
	}
}

function minIndex(o) {
	var lowest = Object.keys(o)[0];
	for (var i in o) {
  	if (o[i] < o[lowest]) lowest = i;
	}
	return lowest;
}

function mapKeys(o,f){
	for(var key in o){
		o[key]=f(o[key]);
	}
}

function subtractObject(o,o2,multiplier){
	for(var [key,value] of Object.entries(o2)){
		o[key]=(o[key]??0)-(o2[key]*multiplier);
	}
}

function addcosts(rtable) {
	for(var key in rtable){
		if(key=='.out'){
			continue;
		}
		rtable[key]['.cost']=1;
	}
}

function addslacks(rtable) {
	for(var key in rtable){
		if(key=='.out'){
			continue;
		}
		rtable[key]['recipe.'+key]=1;
	}
}

export {f,setup,rtable};