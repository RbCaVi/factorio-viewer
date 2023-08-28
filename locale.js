import {stringify,clone} from './util.js';

class FactorioLocale{
	#localecache={};

	constructor(locale){
    if(typeof locale=='string'){
      locale=JSON.parse(locale);
    }
		this.locale=locale;
	}

  #localizeraw(s){
    console.info('localize',s);
    var key=stringify(s);
    if(key in this.#localecache){
    	console.info('found',s,'in cache as',this.#localecache[key]);
    	return this.#localecache[key];
    }
    if(typeof s=='string'){
      var out=s;
      this.#localecache[key]=out;
      return out;
    }else if(typeof s=='number'){
      var out=''+s;
      this.#localecache[key]=out;
      return out;
    }else if(Array.isArray(s)){
      if(s[0]==''){
        var out=s.slice(1).map(x=>this.#localizeraw(x)).join('');
        this.#localecache[key]=out;
        return out;
      }
      var l=this.locale[s[0]];
      if(l==undefined){
        var out=null;
        this.#localecache[key]=out;
        return out;
      }
      for(var i=1;i<s.length;i++){
        l=l.replace('__'+i+'__',this.#localizeraw(s[i]));
      }
      var out=l;
      this.#localecache[key]=out;
      return out;
    }
    //var out=this.locale.get(s);
    //this.#localecache[key]=out;
    //return out;
  }

  localize(s){
    if(typeof s=='string'){
      s=[s];
    }
    var l=this.#localizeraw(s);
    console.info('localized to',l);
    return l;
  }
}

class FactorioLocalizer{
  #localecache={
    'recipe':{},
    'entity':{},
    'item':{},
    'fluid':{},
    'equipment':{},
    'tech':{}
  };

	constructor(data,locale){
		this.data=data;
		this.locale=locale;
	}

	#getnamedesc(thing,type,name){
    var name,desc;
    if(!name){
      name=thing.name;
    }
    if('localised_description' in thing){
      desc=this.locale.localize(thing.localised_description);
    }else{
      desc=this.locale.localize(type+'-description.'+name);
    }
    if('localised_name' in thing){
      name=this.locale.localize(thing.localised_name);
    }else{
      name=this.locale.localize(type+'-name.'+name);
    }
    return [name,desc];
  }
  
  recipelocale(recipe){
    if(recipe in this.#localecache.recipe){
      return this.#localecache.recipe[recipe];
    }
    var namedesc;
    recipe=this.data.data.recipe[recipe];
    namedesc=this.#recipelocaleraw(recipe);
    this.#localecache.recipe[recipe.name]=namedesc;
    return namedesc;
  }

  #recipelocaleraw(recipe){
    console.info(recipe)
    if('normal' in recipe){
      recipe=clone(recipe);
      Object.assign(recipe,recipe.normal);
      delete recipe.normal;
    }
    var name,desc;
    if('localised_name' in recipe){
      name=this.locale.localize(recipe.localised_name);
    }else{
      name=this.locale.localize('recipe-name.'+recipe.name);
    }
    if('localised_description' in recipe){
      desc=this.locale.localize(recipe.localised_description);
    }else{
      desc=this.locale.localize('recipe-description.'+recipe.name);
    }
    if(name!=null){
      return [name,desc];
    }
    if(recipe.results.length==1){
      if('main_product' in recipe&&recipe.main_product==''){
        return this.#getnamedesc(recipe,'recipe');
      }
      return this.itemlocale(recipe.results[0].name);
    }
    if('main_product' in recipe&&recipe.main_product!=''){
      return this.itemlocale(recipe.main_product);
    }
    return this.#getnamedesc(recipe,'recipe');
  }

  entitylocale(entity){
    if(entity in this.#localecache.entity){
      return this.#localecache.entity[entity];
    }
    var namedesc;
    var entity=this.data.getentity(entity);
    if(entity!=undefined){
      namedesc=this.#getnamedesc(entity,'entity');
    }else{
    	namedesc=[null,null];
    }
    this.#localecache.entity[entity.name]=namedesc;
    return namedesc;
  }

  itemlocale(item){
    if(item in this.#localecache.item){
      return this.#localecache.item[item];
    }
    var namedesc;
    if(item=='time'){
      namedesc=['Time','Time'];
      this.#localecache.item[item.name]=namedesc;
      return namedesc;
    }
    item=this.data.getitem(item);
    if(item.type=='fluid'){
      namedesc=this.fluidlocale(item.name);
      this.#localecache.item[item.name]=namedesc;
      return namedesc;
    }
    namedesc=this.#getnamedesc(item,'item');
    if('placed_as_equipment_result' in item){
      namedesc=this.equipmentlocale(item.placed_as_equipment_result);
    }
    if(!namedesc[0]){
    	if(item.place_result){
      	namedesc=this.entitylocale(item.place_result);
    	}else{
    		namedesc[0]='???';
    	}
    }
    namedesc[1]=namedesc[1]??'';
    this.#localecache.item[item.name]=namedesc;
    return namedesc;
  }

  fluidlocale(fluid){
    if(fluid in this.#localecache.fluid){
      return this.#localecache.fluid[fluid];
    }
    var namedesc;
    var fluid=this.data.data.fluid[fluid];
    namedesc=this.#getnamedesc(fluid,'fluid');
    this.#localecache.fluid[fluid.name]=namedesc;
    return namedesc;
  }

  equipmentlocale(equipment){
    if(equipment in this.#localecache.equipment){
      return this.#localecache.equipment[equipment];
    }
    var namedesc;
    var equipment=this.data.getequipment(equipment);
    if(equipment!=undefined){
      namedesc=this.#getnamedesc(equipment,'equipment');
    }else{
    	namedesc=[null,null];
    }
    this.#localecache.equipment[equipment.name]=namedesc;
    return namedesc;
  }

  techlocale(tech){
    if(tech in this.#localecache.tech){
      return this.#localecache.tech[tech];
    }
    var name=tech;
    tech=this.data.data.technology[tech];
    var n=+name.slice(name.lastIndexOf('-')+1);
    var pf;
    if(isNaN(n)||n==Infinity||n==-Infinity){
      pf='';
    }else{
      pf=' '+n;
      name=name.slice(0,name.lastIndexOf('-'));
    }
    var namedesc=this.#getnamedesc(tech,'technology',name);
    namedesc[0]+=pf;
    this.#localecache.tech[tech.name]=namedesc;
    return namedesc;
  }
}

export {FactorioLocale,FactorioLocalizer};