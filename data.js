import {normalizerecipe,normalizetech} from 'normalize.js';
class Data{
  constructor(data,locale){
    if(typeof data=='string'){
      data=JSON.parse(data);
    }
    if(typeof locale=='string'){
      data=JSON.parse(locale);
    }
    this.data=data;
    this.locale=locale;
    for(key in this.data['recipe']){
      this.data[key]=normalizerecipe(data[key]);
    }
    for(key in this.data['technology']){
      this.data[key]=normalizetech(data[key]);
    }
  }

  #getnamedesc(thing,type,name){
    if(!name){
      name=thing['name'];
    }
    if('localised_description' in thing){
      desc=this.localize(thing['localised_description']);
    }else{
      desc=this.localize(type+'-description.'+name);
    }
    if('localised_name' in thing){
      name=this.localize(thing['localised_name']);
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
        throw Error(s[0]+' is not in the locale');
      }
      for(var i=1;i<s.length;i++){
        l=l.replace('__'+i+'__',this.#localizeraw(s[i]))
      }
      return l
    }
    return this.locale.get(s)
  }

  localize(s){
    return this.#localizeraw([s]);
  }
  
  recipelocale(recipe){
    recipe=this.data['recipe'][recipe]
    return this.#recipelocaleraw(recipe)
  }

  #recipelocaleraw(recipe){
    console.info(recipe)
    if('normal' in recipe){
      recipe=clone(recipe);
      Object.assign(recipe,recipe['normal']);
      delete recipe['normal'];
    }
    if(recipe['results'].length==1){
      if('main_product' in recipe&&recipe['main_product']==''){
        return this.#getnamedesc(recipe,'recipe');
      }
      return this.itemlocale(recipe['results'][0]['name']);
    }
    if('main_product' in recipe&&recipe['main_product']!=''){
      return this.itemlocale(recipe['main_product']);
    }
    return this.#getnamedesc(recipe,'recipe');
  }

  entitylocale(entity){
    for(var etype of util.entitytypes){
      if(entity in this.data[etype]){
        entity=this.data[etype][entity];
        return this.#getnamedesc(entity,'entity');
      }
    }
    return [null,null];
  }

  itemlocale(item){
    if(item=='time'){
      return ['Time','Time'];
    }
    for(var itype in util.itemtypes){
      if(item in this.data[itype]){
        item=this.data[itype][item];
        console.info(item);
        name,desc=this.#getnamedesc(item,'item');
        if('placed_as_equipment_result' in item){
          namedesc=this.equipmentlocale(item['placed_as_equipment_result']);
        }
        if(!name){
          return this.entitylocale(item['place_result']);
        }
        namedesc[1]||='';
        return namedesc;
      }
    }
    return this.fluidlocale(item,data)
  }

  fluidlocale(fluid){
    var fluid=this.data['fluid'][fluid];
    return this.#getnamedesc(fluid,'fluid');
  }

  equipmentlocale(equipment){
    for(var etype of util.equipmenttypes){
      if(equipment in this.data[etype]){
        equipment=this.data[etype][equipment];
        return this.#getnamedesc(equipment,'equipment');
      }
    }
    return [null,null];
  }

  techlocale(tech){
    var name=tech;
    tech=this.data['technology'][tech];
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
    return namedesc;
  }
}