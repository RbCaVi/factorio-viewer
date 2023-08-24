import {craftertypes} from './util.js';

function processrecipe(recipe){
  var newrecipe={'type':'recipe'};
  for(var x of ['normal','expensive']){
    if(!(x in recipe)){
      continue;
    }
    newrecipe[x]={'ingredients':[],'results':[]};
    for(var ingredient of recipe[x].ingredients){
      newrecipe[x].ingredients.push([
        ingredient.name,
        ingredient.amount
      ]);
    }
    for(var result of recipe[x].results){
      newrecipe[x].results.push([
        result.name,
        result.amount
      ]);
    }
    newrecipe[x].time=recipe[x].energy_required;
  }
  newrecipe.name=recipe.name;
  newrecipe.category=recipe.category||'crafting';
  return newrecipe;
}

function processtech(tech){
  var newtech={'type':'tech'};
  newtech.name=tech.name;
  for(var x of util.difficulty){
    if(!(x in tech)){
      continue;
    }
    newtech[x]={'packs':[]};
    for(var pack of tech[x].unit.ingredients){
      newtech[x].packs.push([
        pack.name,
        pack.amount
      ]);
    }
    if('count' in tech[x].unit){
      newtech[x].count=tech[x].unit.count;
    }else{
      newtech[x].count=tech[x].unit.count_formula;
    }
    newtech[x].time=tech[x].unit.time;
    newtech[x].prerequisites=tech[x].prerequisites??[];
    if(!Array.isArray(newtech[x].prerequisites)){
      newtech[x].prerequisites=Object.values(newtech[x].prerequisites);
    }
    var effects=tech[x].effects??{};
    if(!Array.isArray(effects)){
      effects=Object.values(effects);
    }
    newtech[x].effects=effects.filter(e=>e.type=='unlock-recipe').map(e=>e.recipe);
  }
  return newtech;
}

function processitem(item){
  return item;
}

function processentity(entity){
  return entity;
}

export {processrecipe,processtech};