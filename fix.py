import copy

clone=function(data){
  return JSON.parse(JSON.stringify(data));
};

movekey=function(d1,d2,i){
  if(i in d1){
    d2[i]=d1[i];
    delete d1[i];
  }
};

fixrecipe=function(recipe,root=True){
  var recipe=clone(recipe);
  if('normal' in recipe){
    recipe['normal']=fixrecipe(recipe['normal'],False);
    if('expensive' not in recipe){
      return recipe;
    }
  }
    if('expensive' in recipe){
        recipe['expensive']=fixrecipe(recipe['expensive'],False);
        if('normal' not in recipe||!recipe['normal']){
            recipe['normal']=recipe['expensive'];
            delete recipe['expensive'];
        }
        return recipe
    }
    recipe['ingredients']=recipe['ingredients'].map(fixingredient);
    if('result' in recipe&&!('results' in recipe)){
        if(!('result_count' in recipe)){
            recipe['result_count']=1;
        }
        recipe['results']=[[recipe['result'],recipe['result_count']]];
    }
    recipe['results']=recipe['results'].map(fixresult);
    recipe['energy_required']=recipe.get('energy_required',0.5);
    if(!root){
        return recipe;
    }
    recipe['normal']={};
    movekey(recipe,recipe['normal'],'results');
    movekey(recipe,recipe['normal'],'result');
    movekey(recipe,recipe['normal'],'result_count');
    movekey(recipe,recipe['normal'],'ingredients');
    movekey(recipe,recipe['normal'],'energy_required');
    movekey(recipe,recipe['normal'],'emissions_multiplier');
    movekey(recipe,recipe['normal'],'requester_paste_multiplier');
    movekey(recipe,recipe['normal'],'overload_multiplier');
    movekey(recipe,recipe['normal'],'allow_inserter_overload');
    movekey(recipe,recipe['normal'],'enabled');
    movekey(recipe,recipe['normal'],'hidden');
    movekey(recipe,recipe['normal'],'hide_from_stats');
    movekey(recipe,recipe['normal'],'hide_from_player_crafting');
    movekey(recipe,recipe['normal'],'allow_decomposition');
    movekey(recipe,recipe['normal'],'allow_as_intermediate');
    movekey(recipe,recipe['normal'],'allow_intermediates');
    movekey(recipe,recipe['normal'],'always_show_made_in');
    movekey(recipe,recipe['normal'],'show_amount_in_title');
    movekey(recipe,recipe['normal'],'always_show_products');
    movekey(recipe,recipe['normal'],'unlock_results');
    movekey(recipe,recipe['normal'],'main_product');
    return recipe;
}

fixingredient=function(ingredient){
    if(Array.isArray(ingredient)){
        return {
            'type':'item',
            'name':ingredient[0],
            'amount':ingredient[1]
        };
    }
    return ingredient;
}

fixresult=function(result){
    if(Array.isArray(result)){
        result={'type':'item','name':result[0],'amount':result[1]};
    }
    if('amount_min' in result and !('amount' in result)){
        if('probability' not in result){
            result['probability']=1;
        }
        result['amount']=result['probability']*(0.5*(result['amount_min']+result['amount_max']));
    }
    if('type' not in result){
        result['type']='item';
    }
    return result;
}

fixtech=function(tech,root=True){
    var tech=clone(tech);
    if('normal' in tech){
        tech['normal']=fixtech(tech['normal'],False);
        if(!('expensive' in tech)){
            return tech;
        }
    }
    if('expensive' in tech){
        tech['expensive']=fixtech(tech['expensive'],False);
        if('normal' not in tech||!tech['normal']){
            tech['normal']=tech['expensive'];
            delete tech['expensive'];
        }
        return tech;
    }
    if(!root){
        return tech;
    }
    tech['unit']['ingredients']=tech['unit']['ingredients'].map(fixingredient);
    tech['normal']={};
    movekey(tech,tech['normal'],'upgrade');
    movekey(tech,tech['normal'],'enabled');
    movekey(tech,tech['normal'],'hidden');
    movekey(tech,tech['normal'],'visible_when_disabled');
    movekey(tech,tech['normal'],'ignore_tech_cost_multiplier');
    movekey(tech,tech['normal'],'unit');
    movekey(tech,tech['normal'],'max_level')
    movekey(tech,tech['normal'],'prerequisites');
    movekey(tech,tech['normal'],'effects');
    return tech;
}