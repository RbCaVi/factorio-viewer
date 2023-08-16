craftertypes=[
  'character',
  'assembling-machine',
  'rocket-silo',
  'furnace'
];

processrecipe=function(recipe){
  recipe=data.data['recipe'][recipe];
  newrecipe={};
  for(var x of ['normal','expensive']){
    if(!x in recipe){
      continue;
    }
    newrecipe[x]={'ingredients':[],'results':[]};
    for(var ingredient of recipe[x]['ingredients']){
      newrecipe[x]['ingredients'].push([
        ingredient['name'],
        ingredient['amount'],
        getitemtype(ingredient['name'])
      ]);
    }
    for(var result in recipe[x]['results']){
      newrecipe[x]['results'].push([
        result['name'],
        result['amount'],
        getitemtype(result['name'])
      ]);
    }
    newrecipe[x]['time']=recipe[x]['energy_required'];
  }
  newrecipe['name']=recipe['name'];
  newrecipe['category']=recipe['category']||'crafting';
  return newrecipe;
}

processtech=function(tech){
  tech=data.data['technology'][tech];
  newtech={};
  newtech['name']=tech['name'];
  for(var x of util.difficulty){
    if(!x in tech){
      continue;
    }
    newtech[x]={'packs':[]};
    for(var pack of tech[x]['unit']['ingredients']){
      newtech[x]['packs'].push([
        pack['name'],
        pack['amount']
      ]);
    }
    if('count' in tech[x]['unit']){
      newtech[x]['count']=tech[x]['unit']['count'];
    }else{
      newtech[x]['count']=tech[x]['unit']['count_formula'];
    }
    newtech[x]['time']=tech[x]['unit']['time'];
    newtech[x]['prerequisites']=tech[x]['prerequisites']??{};
    effects=tech[x]['effects']??{};
    if(!Array.isArray(effects)){
      effects=effects.values();
    }
    newtech[x]['effects']=effects.filter(e=>e['type']=='unlock-recipe').map(e=>e['recipe']);
  }
  return newtech;
}

export {processrecipe,processtech};