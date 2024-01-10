import * as util from "./util.js";

function processrecipe(recipe){
  let newrecipe={"type":"recipe"};
  for(let x of ["normal","expensive"]){
    if(!(x in recipe)){
      continue;
    }
    newrecipe[x]={"ingredients":[],"results":[]};
    for(let ingredient of recipe[x].ingredients){
      newrecipe[x].ingredients.push([
        ingredient.name,
        ingredient.amount
      ]);
    }
    for(let result of recipe[x].results){
      newrecipe[x].results.push([
        result.name,
        result.amount
      ]);
    }
    newrecipe[x].time=recipe[x].energy_required;
  }
  newrecipe.name=recipe.name;
  newrecipe.category=recipe.category||"crafting";
  return newrecipe;
}

function processtech(tech){
  let newtech={"type":"tech"};
  newtech.name=tech.name;
  for(let x of util.difficulty){
    if(!(x in tech)){
      continue;
    }
    newtech[x]={"packs":[]};
    for(let pack of tech[x].unit.ingredients){
      newtech[x].packs.push([
        pack.name,
        pack.amount
      ]);
    }
    if("count" in tech[x].unit){
      newtech[x].count=tech[x].unit.count;
    }else{
      newtech[x].count=tech[x].unit.count_formula;
    }
    newtech[x].time=tech[x].unit.time;
    newtech[x].prerequisites=tech[x].prerequisites??[];
    if(!Array.isArray(newtech[x].prerequisites)){
      newtech[x].prerequisites=Object.values(newtech[x].prerequisites);
    }
    let effects=tech[x].effects??{};
    if(!Array.isArray(effects)){
      effects=Object.values(effects);
    }
    newtech[x].effects=effects.filter(e=>e.type=="unlock-recipe").map(e=>e.recipe);
  }
  return newtech;
}

/*
function processitem(item){
  return item;
}

function processentity(entity){
  return entity;
}
*/

export {processrecipe,processtech};