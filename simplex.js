import {clone,stringify} from './util.js';
import {normalizeresult} from './normalize.js';
import {Rational,mult,div} from './rational.js';

class SimplexSolver{
	constructor(data){
		this.data=data;
		this.reciperanks=rankrecipes(this.data);
		this.rtable={}
		for(var recipename in this.data.pdata.recipe){
			var recipe=this.data.pdata.recipe[recipename];
			if(this.#unallowed(recipe)){
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
			this.rtable[recipename]=entry;
		}

		for(var pump of Object.values(this.data.data['offshore-pump'])){
			// add water recipe
			var entry={};
			entry[pump.fluid]=new Rational(pump.pumping_speed*60);
			this.rtable['pump.'+pump.name]=entry;
		}

		for(var resource of Object.values(this.data.data.resource)){
			if(!('minable' in resource)){
				continue;
			}
			var entry={};
			if((resource.minable.fluid_amount??0)>0){
				entry[resource.minable.required_fluid]=div(-resource.minable.fluid_amount,resource.minable.mining_time);
			}
			if(resource.minable.results){
				for(var res of resource.minable.results){
					res=normalizeresult(res);
					if(!(res.name in entry)){
						entry[res.name]=new Rational(0);
					}
					entry[res.name].add(div(res.amount,resource.minable.mining_time));
				}
			}else if(resource.minable.result){
				if(!(resource.minable.result in entry)){
					entry[resource.minable.result]=new Rational(0);
				}
				entry[resource.minable.result].add(div(resource.minable.count??1,resource.minable.mining_time));
			}
			this.rtable['mine.'+resource.name]=entry;
		}
	}

	#unallowed(recipe,data) {
		/*
			if(recipe.name=='empty-barrel'){
				return false;
			}
			if(recipe.name=='se-matter-fusion-dirty'){
				return false;
			}
			if(recipe.name=='se-bio-methane-to-crude-oil'){
				console.log('rejected',recipe,'by bio-crude');
				return true;
			}
			if(recipe.name=='se-bio-sludge-crude-oil'){
				console.log('rejected',recipe,'by bio-crude');
				return true;
			}
			if(recipe.name=='coal-liquefaction'){
				console.log('rejected',recipe,'by coal');
				return true;
			}
			if(recipe.name.includes('naq')){
				console.log('rejected',recipe,'by naquium');
				return true;
			}
			if(recipe.name.includes('cry')){
				console.log('rejected',recipe,'by cryonite');
				return true;
			}
			if(recipe.name.includes('vul')){
				console.log('rejected',recipe,'by vulcanite');
				return true;
			}
			if(recipe.name.includes('beryl')){
				console.log('rejected',recipe,'by beryllium');
				return true;
			}
			if(recipe.name.includes('vita')){
				console.log('rejected',recipe,'by vitamelange');
				return true;
			}
			if(recipe.name.includes('holm')){
				console.log('rejected',recipe,'by holmium');
				return true;
			}
			if(recipe.name.includes('iri')){
				console.log('rejected',recipe,'by iridium');
				return true;
			}
			if(recipe.name.includes('scrap')){
				console.log('rejected',recipe,'by scrap');
				return true;
			}
			if(recipe.name.includes('wood')||recipe.name.includes('bio')||recipe.name.includes('spec')){
				console.log('rejected',recipe,'by biology');
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
		*/
		if(recipe.name=='se-big-turbine-internal'){
			console.log('rejected',recipe,'by turbine-internal');
			return true;
		}
		if(recipe.name.startsWith('se-condenser-turbine-reclaim-water-')){
			console.log('rejected',recipe,'by turbine-reclaim');
			return true;
		}
		if(recipe.name.startsWith('se-core-fragment-')){
			console.log('rejected',recipe,'by core');
			return true;
		}
		if(recipe.name.startsWith('empty-')&&recipe.name.endsWith('-barrel')){
			console.log('rejected',recipe,'by barrel');
			return true;
		}
		if(recipe.category!='hard-recycling'){
			return false;
		}
		if(recipe.normal.ingredients.length==1){
			for(var precipe of this.data.produces.normal[recipe.normal.ingredients[0][0]]??[]){
				if(this.data.pdata.recipe[precipe].normal.results.length>1){
					continue;
				}
				var icounts={};
				for(var [ing,count] of this.data.pdata.recipe[precipe].normal.ingredients){
					icounts[ing]=(icounts[ing]??0)+count;
				}
				var rcounts={};
				for(var [res,count] of this.data.pdata.recipe[precipe].normal.results){
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
					console.log('rejected',recipe,'by',this.data.pdata.recipe[precipe]);
					return true;
				}
			}
		}
		return false;
	}

	#clonertable(rank){
		var newtable={};
		for(var [key,recipe] of Object.entries(this.rtable)){
			if(this.reciperanks[key]>rank){
				continue;
			}
			var newrecipe={};
			for(var [item,amount] of Object.entries(recipe)){
				newrecipe[item]=new Rational(amount.num,amount.denom);
			}
			newtable[key]=newrecipe;
		}
		return newtable;
	}

	#getitemrank(item){
		if(item.startsWith('recipe.')){
			return this.reciperanks[item]+1;
		}
		return Math.min(...this.data.produces.normal[item].map(recipe=>this.reciperanks[recipe]));
  }

	solve(outs){
		var rank=Math.max(...Object.keys(outs).map(item=>this.#getitemrank(item)??0));
		var rtable2=this.#clonertable(rank);
		addcosts(rtable2);
		addslacks(rtable2);
		outs=clone(outs);
		mapKeys(outs,x=>new Rational(x));
		rtable2['.out']=outs;
		var pivots=0;
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
			if((!(col in minr))||(!minr[col].positive())||minrow=='.out'){
				throw 'nothing making '+col;
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
						console.log('subtracting',stringify(minr),'*',stringify(recipe[col]),'from .out')
					}
					subtractObject(recipe,minr,recipe[col]);
				}
			}
			console.log(stringify(outs));
			pivots++;
		}
		mapKeys(outs,f=>f.reduce());
		console.log('did',pivots,'pivots');
		return outs;
	}
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
		}else{
			o[key].reduce();
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

function ranktech(data) {
	var techpres=new Map((
		function*() {
		  for (let key in data.data.technology){
		    yield [key, data.prereqs.normal[key]??[]];
		  }
		})()
	);
	var ranked={};
	var allranked=new Set();
	for(var i=0;;i++){
		var newranks=[];
		for(var [techname,prereqs] of techpres.entries()){
			if(prereqs.every(p=>allranked.has(p))){
				techpres.delete(techname);
				newranks.push(techname);
				ranked[techname]=i;
			}
		}
		if(newranks.length==0){
			break;
		}
		newranks.forEach(item=>allranked.add(item));
	}
	return ranked;
}

function rankrecipes(data){
	var techrank=ranktech(data);
	var ranks={};
	for(var recipename in data.data.recipe){
		var recipe=data.data.recipe[recipename];
		if(recipe.normal.enabled??true){
			ranks[recipename]=0;
			continue;
		}
		var techs=data.unlockedby.normal[recipename];
		if(techs==undefined){
			continue;
		}
		ranks[recipename]=Math.min(...techs.map(tech=>techrank[tech]))+1;
	}
	return ranks;
}

export {SimplexSolver};