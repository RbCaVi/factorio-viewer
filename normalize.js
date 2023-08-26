import {clone} from './util.js';

function movekey(d1,d2,i){
  if(i in d1){
    d2[i]=d1[i];
    delete d1[i];
  }
};

function normalizerecipe(recipe,root=true){
  var recipe=clone(recipe);
  if('normal' in recipe){
    recipe.normal=normalizerecipe(recipe.normal,false);
    if(!('expensive' in recipe)){
      return recipe;
    }
  }
    if('expensive' in recipe){
        recipe.expensive=normalizerecipe(recipe.expensive,false);
        if(!('normal' in recipe)||!recipe.normal){
            recipe.normal=recipe.expensive;
            delete recipe.expensive;
        }
        return recipe;
    }
    recipe.ingredients=recipe.ingredients.map(normalizeingredient);
    if('result' in recipe&&!('results' in recipe)){
        if(!('result_count' in recipe)){
            recipe.result_count=1;
        }
        recipe.results=[[recipe.result,recipe.result_count]];
        delete recipe.result;
    }
    recipe.results=recipe.results.map(normalizeresult);
    recipe.energy_required=recipe.energy_required??0.5;
    if(!root){
        return recipe;
    }
    recipe.normal={};
    movekey(recipe,recipe.normal,'results');
    movekey(recipe,recipe.normal,'result');
    movekey(recipe,recipe.normal,'result_count');
    movekey(recipe,recipe.normal,'ingredients');
    movekey(recipe,recipe.normal,'energy_required');
    movekey(recipe,recipe.normal,'emissions_multiplier');
    movekey(recipe,recipe.normal,'requester_paste_multiplier');
    movekey(recipe,recipe.normal,'overload_multiplier');
    movekey(recipe,recipe.normal,'allow_inserter_overload');
    movekey(recipe,recipe.normal,'enabled');
    movekey(recipe,recipe.normal,'hidden');
    movekey(recipe,recipe.normal,'hide_from_stats');
    movekey(recipe,recipe.normal,'hide_from_player_crafting');
    movekey(recipe,recipe.normal,'allow_decomposition');
    movekey(recipe,recipe.normal,'allow_as_intermediate');
    movekey(recipe,recipe.normal,'allow_intermediates');
    movekey(recipe,recipe.normal,'always_show_made_in');
    movekey(recipe,recipe.normal,'show_amount_in_title');
    movekey(recipe,recipe.normal,'always_show_products');
    movekey(recipe,recipe.normal,'unlock_results');
    movekey(recipe,recipe.normal,'main_product');
    return recipe;
}

function normalizeingredient(ingredient){
    if(Array.isArray(ingredient)){
        return {
            'type':'item',
            'name':ingredient[0],
            'amount':ingredient[1]
        };
    }
    return ingredient;
}

function normalizeresult(result){
    if(Array.isArray(result)){
        result={'type':'item','name':result[0],'amount':result[1]};
    }
    if(('amount_min' in result)&&!('amount' in result)){
        if(!('probability' in result)){
            result.probability=1;
        }
        result.amount=result.probability*(0.5*(result.amount_min+result.amount_max));
    }
    if(!('type' in result)){
        result.type='item';
    }
    return result;
}

function normalizetech(tech,root=true){
    var tech=clone(tech);
    if('normal' in tech){
        tech.normal=normalizetech(tech.normal,false);
        if(!('expensive' in tech)){
            return tech;
        }
    }
    if('expensive' in tech){
        tech.expensive=normalizetech(tech.expensive,false);
        if(!('normal' in tech)||!tech.normal){
            tech.normal=tech.expensive;
            delete tech.expensive;
        }
        return tech;
    }
    if(!root){
        return tech;
    }
    tech.unit.ingredients=tech.unit.ingredients.map(normalizeingredient);
    tech.normal={};
    movekey(tech,tech.normal,'upgrade');
    movekey(tech,tech.normal,'enabled');
    movekey(tech,tech.normal,'hidden');
    movekey(tech,tech.normal,'visible_when_disabled');
    movekey(tech,tech.normal,'ignore_tech_cost_multiplier');
    movekey(tech,tech.normal,'unit');
    movekey(tech,tech.normal,'max_level')
    movekey(tech,tech.normal,'prerequisites');
    movekey(tech,tech.normal,'effects');
    return tech;
}

export {normalizerecipe,normalizetech,normalizeresult};