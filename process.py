import util

craftertypes=[
    'character',
    'assembling-machine',
    'rocket-silo',
    'furnace'
];

getitemtype=function(item){
    for(var itype of ['fluid']+util.itemtypes){
        if(item in data.data[itype]){
            return itype;
        }
    }
}

processrecipe=function(recipe){
    recipe=data.data['recipe'][recipe];
    new={};
    for(var x of ['normal','expensive']){
        if(!x in recipe){
            continue;
        }
        new[x]={'ingredients':[],'results':[]};
        for(var ingredient of recipe[x]['ingredients']){
            new[x]['ingredients'].push([
                ingredient['name'],
                ingredient['amount'],
                getitemtype(ingredient['name'])
            ]);
        }
        for(var result in recipe[x]['results']){
            new[x]['results'].push([
                result['name'],
                result['amount'],
                getitemtype(result['name'])
            ]);
        }
        new[x]['time']=recipe[x]['energy_required'];
    }
    new['name']=recipe['name'];
    new['category']=recipe['category']||'crafting';
    return new;
}

processtech=function(tech){
    tech=data.data['technology'][tech];
    new={};
    new['name']=tech['name'];
    for(var x of util.difficulty){
        if(!x in tech){
            continue;
        }
        new[x]={'packs':[]};
        for(var pack of tech[x]['unit']['ingredients']){
            new[x]['packs'].push([
                pack['name'],
                pack['amount']
            ]);
        }
        if('count' in tech[x]['unit']){
            new[x]['count']=tech[x]['unit']['count'];
        }else{
            new[x]['count']=tech[x]['unit']['count_formula'];
        }
        new[x]['time']=tech[x]['unit']['time'];
        new[x]['prerequisites']=tech[x]['prerequisites']??{};
        effects=tech[x]['effects']??{};
        if(!Array.isArray(effects)){
            effects=effects.values();
        }
        new[x]['effects']=effects.filter(e=>e['type']=='unlock-recipe').map(e=>e['recipe']);
    }
    return new;
}

getitem=function(item){
    for(var itype of ['fluid'].concat(util.itemtypes)){
        if(item in data.data[itype]){
            return data.data[itype][item];
        }
    }
}

import data

def init():
    global uses,produces
    global prereqs,postreqs,unlocks,unlockedby
    global ccats,madein
    uses={x:{} for x in util.difficulty}
    produces={x:{} for x in util.difficulty}

    for(var recipe of data.data['recipe'].values().map(processrecipe))
	       for x in util.difficulty:
	           if x not in recipe:
	               continue
	           for ing in recipe[x]['ingredients']:
	               if ing[0] not in uses[x]:
	                   uses[x][ing[0]]=[]
	               uses[x][ing[0]].append(recipe['name'])
	           for res in recipe[x]['results']:
	               if res[0] not in produces[x]:
	                   produces[x][res[0]]=[]
	               produces[x][res[0]].append(recipe['name'])

    prereqs={x:{} for x in util.difficulty}
    postreqs={x:{} for x in util.difficulty}
    unlocks={x:{} for x in util.difficulty}
    unlockedby={x:{} for x in util.difficulty}

    for(var tech of data.data['technology'].values().map(processtech))
	       for x in util.difficulty:
	           if x not in tech:
	               continue
	           for l in [prereqs,postreqs,unlocks,unlockedby]:
	               if tech['name'] not in l[x]:
	                   l[x][tech['name']]=[]
	           for prereq in tech[x]['prerequisites']:
	               if prereq not in postreqs[x]:
	                   postreqs[x][prereq]=[]
	               postreqs[x][prereq].append(tech['name'])
	               if tech['name'] not in prereqs[x]:
	                   prereqs[x][tech['name']]=[]
	               prereqs[x][tech['name']].append(prereq)
	           for effect in tech[x]['effects']:
	               if tech['name'] not in unlocks[x]:
	                   unlocks[x][tech['name']]=[]
	               unlocks[x][tech['name']].append(effect)
	               if effect not in unlockedby[x]:
                                       unlockedby[x][effect]=[]
	               unlockedby[x][effect].append(tech['name'])
    
    ccats={}
    madein={}
    
    for ctype in craftertypes:
        for crafter in data.data[ctype]:
            ccats[crafter]=data.data[ctype][crafter]['crafting_categories']
            for ccat in data.data[ctype][crafter]['crafting_categories']:
                if ccat not in madein:
                    madein[ccat]=[]
                madein[ccat].append(crafter)

init()