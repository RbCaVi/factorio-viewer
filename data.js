import {craftertypes,clone,util} from './util.js';
import {normalizerecipe,normalizetech} from './normalize.js';
import {processrecipe,processtech} from './process.js';

class FactorioData{
  #localecache={
    'recipe':{},
    'entity':{},
    'item':{},
    'fluid':{},
    'equipment':{},
    'tech':{}
  };

  constructor(data,locale){
    if(typeof data=='string'){
      data=JSON.parse(data);
    }
    if(typeof locale=='string'){
      locale=JSON.parse(locale);
    }
    this.data=data;
    this.locale=locale;
    for(key in this.data.recipe){
      this.data.recipe[key]=normalizerecipe(data.recipe[key]);
    }
    for(key in this.data.technology){
      this.data.technology[key]=normalizetech(data.technology[key]);
    }
    this.pdata={"recipe":{},"technology":{}};
    for(var key in this.data.recipe){
      this.pdata.recipe[key]=processrecipe(data.recipe[key]);
    }
    for(var key in this.data.technology){
      this.pdata.technology[key]=processtech(data.technology[key]);
    }

    var getdifficulties=()=>util.difficulty.reduce((a,b)=> (a[b]={},a),{})
    this.uses=getdifficulties();
    this.produces=getdifficulties();

    for(var recipe of Object.values(this.pdata.recipe)){
      for(var x of util.difficulty){
        if(!(x in recipe)){
          continue;
        }
        for(var ing of recipe[x].ingredients){
          if(!(ing[0] in this.uses[x])){
             this.uses[x][ing[0]]=[];
          }
          this.uses[x][ing[0]].push(recipe.name);
        }
        for(var res in recipe[x].results){
          if(!(res[0] in this.produces[x])){
            this.produces[x][res[0]]=[];
          }
          this.produces[x][res[0]].push(recipe.name);
        }
      }
    }

    this.prereqs=getdifficulties();
    this.postreqs=getdifficulties();
    this.unlocks=getdifficulties();
    this.unlockedby=getdifficulties();

    for(var tech of Object.values(this.pdata.technology)){
      for(var x of util.difficulty){
        if(!(x in tech)){
          continue;
        }
        for(var l of [this.prereqs,this.postreqs,this.unlocks,this.unlockedby]){
          if(!(tech.name in l[x])){
            l[x][tech.name]=[];
          }
        }
        for(var prereq of tech[x].prerequisites){
          if(!(prereq in this.postreqs[x])){
            this.postreqs[x][prereq]=[];
          }
          this.postreqs[x][prereq].push(tech.name);
          if(!(tech.name in this.prereqs[x])){
            this.prereqs[x][tech.name]=[];
          }
          this.prereqs[x][tech.name].push(prereq);
        }
        for(var effect of tech[x].effects){
          if(!(tech.name in this.unlocks[x])){
            this.unlocks[x][tech.name]=[];
          }
          this.unlocks[x][tech.name].push(effect);
          if(!(effect in this.unlockedby[x])){
            this.unlockedby[x][effect]=[];
          }
          this.unlockedby[x][effect].push(tech.name);
        }
      }
    }
    
    this.ccats={};
    this.madein={};
    
    for(var ctype of craftertypes){
      for(var crafter of Object.keys(this.data[ctype])){
        this.ccats[crafter]=this.data[ctype][crafter].crafting_categories;
        for(var ccat of this.data[ctype][crafter].crafting_categories){
          if(!(ccat in this.madein)){
            this.madein[ccat]=[];
          }
          this.madein[ccat].push(crafter);
        }
      }
    }
  }

  #getnamedesc(thing,type,name){
    var name,desc;
    if(!name){
      name=thing.name;
    }
    if('localised_description' in thing){
      desc=this.localize(thing.localised_description);
    }else{
      desc=this.localize(type+'-description.'+name);
    }
    if('localised_name' in thing){
      name=this.localize(thing.localised_name);
    }else{
      name=this.localize(type+'-name.'+name);
    }
    return [name,desc];
  }

  #localizeraw(s){
    console.info('localize',s)
    if(typeof s=='string'){
      return s;
    }else if(typeof s=='number'){
      return ''+s;
    }else if(Array.isArray(s)){
      if(s[0]==''){
        return s.slice(1).map(this.#localizeraw).join('');
      }
      var l=this.locale[s[0]];
      if(l==undefined){
        return null;
      }
      for(var i=1;i<s.length;i++){
        l=l.replace('__'+i+'__',this.#localizeraw(s[i]));
      }
      return l;
    }
    return this.locale.get(s);
  }

  localize(s){
    return this.#localizeraw([s]);
  }
  
  recipelocale(recipe){
    if(recipe in this.#localecache.recipe){
      return this.#localecache.recipe[recipe];
    }
    var namedesc;
    recipe=this.data.recipe[recipe];
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
    for(var etype of util.entitytypes){
      if(entity in this.data[etype]){
        entity=this.data[etype][entity];
        namedesc=this.#getnamedesc(entity,'entity');
        this.#localecache.item[item.name]=namedesc;
        return namedesc;
      }
    }
    namedesc=[null,null];
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
    item=this.getitem(item);
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
      namedesc=this.entitylocale(item.place_result);
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
    var fluid=this.data.fluid[fluid];
    namedesc=this.#getnamedesc(fluid,'fluid');
    this.#localecache.fluid[fluid.name]=namedesc;
    return namedesc;
  }

  equipmentlocale(equipment){
    if(equipment in this.#localecache.equipment){
      return this.#localecache.equipment[equipment];
    }
    var namedesc;
    for(var etype of util.equipmenttypes){
      if(equipment in this.data[etype]){
        equipment=this.data[etype][equipment];
        namedesc=this.#getnamedesc(equipment,'equipment');
        this.#localecache.equipment[equipment.name]=namedesc;
        return namedesc;
      }
    }
    namedesc=[null,null];
    this.#localecache.equipment[equipment.name]=namedesc;
    return namedesc;
  }

  techlocale(tech){
    if(tech in this.#localecache.tech){
      return this.#localecache.tech[tech];
    }
    var name=tech;
    tech=this.data.technology[tech];
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

  getitemtype(item){
    for(var itype of ['fluid'].concat(util.itemtypes)){
      if(item in this.data[itype]){
        return itype;
      }
    }
  }

  getitem(item){
    for(var itype of ['fluid'].concat(util.itemtypes)){
      if(item in this.data[itype]){
        return this.data[itype][item];
      }
    }
  }

  getlcache(){
    return this.#localecache;
  }
}

export {FactorioData};