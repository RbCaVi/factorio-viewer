import {clone} from './util.js';

let rtable={};

class Rational{
	constructor(num,denom=1){
		var n1,d1,n2,d2;
		if(num instanceof Rational){
			n1=num.num;
			d1=num.denom;
		}else{
			n1=num;
			d1=1;
		}
		if(denom instanceof Rational){
			n2=denom.denom;
			d2=denom.num;
		}else{
			n2=1;
			d2=denom;
		}
		this.num=n1*n2;
		this.denom=d1*d2;
		this.reduce();
	}

	reduce(){
		var epsilon=0.00001;
		var factor=2*3*5*7;//*11;
		while(Math.abs(Math.round(this.num)-this.num)>epsilon||Math.abs(Math.round(this.denom)-this.denom)>epsilon){
			this.num*=30;
			this.denom*=30;
		}
		this.num=Math.round(this.num);
		this.denom=Math.round(this.denom);
		// find gcd https://stackoverflow.com/questions/4652468/is-there-a-javascript-function-that-reduces-a-fraction
		var a = Math.abs(this.num);
		var b = Math.abs(this.denom);
		var c;
		while (b>0) {
	    c = a % b;
	    a = b;
	    b = c;
		}
		this.num/=a;
		this.denom/=a;
		if(this.denom<0){
			this.num*=-1;
			this.denom*=-1;
		}
		return this;
	}

	mult(r2) {
		var n2,d2;
		if(r2 instanceof Rational){
			n2=r2.num;
			d2=r2.denom;
		}else{
			n2=r2;
			d2=1;
		}
		this.num*=n2;
		this.denom*=d2;
		return this;
	}

	div(r2) {
		var n2,d2;
		if(r2 instanceof Rational){
			n2=r2.num;
			d2=r2.denom;
		}else{
			n2=r2;
			d2=1;
		}
		this.num*=d2;
		this.denom*=n2;
		return this;
	}

	add(r2) {
		var n1,d1,n2,d2;
		if(r2 instanceof Rational){
			n2=r2.num;
			d2=r2.denom;
		}else{
			n2=r2;
			d2=1;
		}
		n1=this.num;
		d1=this.denom;
		this.num=n1*d2+n2*d1;
		this.denom*=d2;
		return this;
	}

	sub(r2) {
		var n1,d1,n2,d2;
		if(r2 instanceof Rational){
			n2=r2.num;
			d2=r2.denom;
		}else{
			n2=r2;
			d2=1;
		}
		n1=this.num;
		d1=this.denom;
		this.num=n1*d2-n2*d1;
		this.denom*=d2;
		return this;
	}

	positive(){
		return this.num>0;
	}

	negative(){
		return this.num<0;
	}

	iszero(){
		return this.num==0;
	}

	lessthan(r2){
		var n2,d2;
		if(r2 instanceof Rational){
			n2=r2.num;
			d2=r2.denom;
		}else{
			n2=r2;
			d2=1;
		}
		return this.num*d2<n2*this.denom;
	}

	greaterthan(r2){
		var n2,d2;
		if(r2 instanceof Rational){
			n2=r2.num;
			d2=r2.denom;
		}else{
			n2=r2;
			d2=1;
		}
		return this.num*d2>n2*this.denom;
	}
}

function div(r1,r2){
	return new Rational(r1,r2);
}

function mult(r1,r2){
	var r=new Rational(r1);
	r.mult(r2);
	return r;
}

function unallowed(recipe,data) {
	if(recipe.name=='empty-barrel'){
		return false;
	}
	if(recipe.name=='se-matter-fusion-dirty'){
		return false;
	}
	if(recipe.name=='se-big-turbine-internal'){
		console.log('rejected',recipe,'by turbine-internal');
		return true;
	}
	if(recipe.name.startsWith('se-condenser-turbine-reclaim-water-')){
		console.log('rejected',recipe,'by turbine-reclaim');
		return true;
	}
	if(recipe.name.startsWith('se-melting-')){
		console.log('rejected',recipe,'by ice');
		return true;
	}
	if(recipe.name.startsWith('se-matter-fusion-')){
		console.log('rejected',recipe,'by fusion');
		return true;
	}
	if(recipe.name.startsWith('empty-')&&recipe.name.endsWith('-barrel')){
		console.log('rejected',recipe,'by barrel');
		return true;
	}
	if(recipe.category!='hard-recycling'){
		//return false;
	}
	if(recipe.normal.ingredients.length==1){
		for(var precipe of data.produces.normal[recipe.normal.ingredients[0][0]]??[]){
			if(data.pdata.recipe[precipe].normal.results.length>1){
				continue;
			}
			var icounts={};
			for(var [ing,count] of data.pdata.recipe[precipe].normal.ingredients){
				icounts[ing]=(icounts[ing]??0)+count;
			}
			var rcounts={};
			for(var [res,count] of data.pdata.recipe[precipe].normal.results){
				rcounts[res]=(icounts[res]??0)+count;
			}
			var pass=true;
			for(var [res,count] of recipe.normal.results){
				if((count/recipe.normal.ingredients[0][1])>=((icounts[res]??0)/rcounts[recipe.normal.ingredients[0][0]])){
					pass=false;
					break;
				}
			}
			if(pass){
				console.log('rejected',recipe,'by',data.pdata.recipe[precipe]);
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
			if(!(ing[0] in entry)){
				entry[ing[0]]=new Rational(0);
			}
			entry[ing[0]].sub(div(ing[1],recipe.normal.time));
		}
		for(var res of recipe.normal.results){
			if(!(res[0] in entry)){
				entry[res[0]]=new Rational(0);
			}
			entry[res[0]].add(div(res[1],recipe.normal.time));
		}
		rtable[recipename]=entry;
	}

	for(var item of ['iron-ore','copper-ore','crude-oil']){
		var entry={};
		entry[item]=new Rational(1);
		rtable['mine.'+item]=entry;
	}
}

function clonertable(){
	var newtable={};
	for(var [key,recipe] of Object.entries(rtable)){
		var newrecipe={};
		for(var [item,amount] of Object.entries(recipe)){
			newrecipe[item]=new Rational(amount.num,amount.denom);
		}
		newtable[key]=newrecipe;
	}
	return newtable;
}

function f(outs){
	var rtable2=clonertable();
	addcosts(rtable2);
	addslacks(rtable2);
	outs=clone(outs);
	mapKeys(outs,x=>new Rational(x));
	rtable2['.out']=outs;
	while(true){
		var col=minIndex(outs);
		if(!(outs[col].negative())){
			break;
		}
		var [minrow,minr]=Object.entries(rtable2)[0];
		for(var [row,recipe] of Object.entries(rtable2)){
			if((!(col in recipe))||(!recipe[col].positive())||row=='.out'){
				continue;
			}
			if((!(col in minr))||(!minr[col].positive())||minrow=='.out'||(div(minr['.cost'],minr[col]).greaterthan(div(recipe['.cost'],recipe[col])))){
				minr=recipe;
				minrow=row;
			}
		}
		var v=minr[col];
		mapKeys(minr,x=>div(x,v));
		console.log('pivot',minrow,'by',col);
		for(var recipe of Object.values(rtable2)){
			if(recipe===minr){
				continue;
			}
			if(col in recipe){
				if(recipe===outs){
					console.log('subtracting',minr,'*',recipe[col],'from .out')
				}
				subtractObject(recipe,minr,recipe[col]);
			}
		}
		console.log(s(outs));
	}
	mapKeys(outs,f=>f.reduce());
	return outs;
}

function minIndex(o) {
	var lowest = Object.keys(o)[0];
	for (var i in o) {
  	if (o[i].lessthan(o[lowest])) lowest = i;
	}
	return lowest;
}

function mapKeys(o,f){
	for(var key in o){
		o[key]=f(o[key]);
	}
}

function s(x){
	return JSON.stringify(x);
}

function subtractObject(o,o2,multiplier){
	multiplier=new Rational(multiplier);
	for(var [key,value] of Object.entries(o2)){
		if(!(key in o)){
			o[key]=new Rational(0);
		}
		var x=mult(o2[key],multiplier);
		o[key].sub(x);
		if(o[key].iszero()){
			delete o[key];
		}
	}
}

function addcosts(rtable) {
	for(var key in rtable){
		if(key=='.out'){
			continue;
		}
		rtable[key]['.cost']=new Rational(1);
	}
}

function addslacks(rtable) {
	for(var key in rtable){
		if(key=='.out'){
			continue;
		}
		rtable[key]['recipe.'+key]=new Rational(1);
	}
}

export {f,setup,rtable};