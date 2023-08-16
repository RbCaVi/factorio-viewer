import os

import process
import data
import util
import locales as locale

import copy

clone=function(data){
    return JSON.parse(JSON.stringify(data));
};

categories={
    'logistics':'Logistics',
    'production':'Production',
    'resources':'Resources',
    'intermediate-products':'Manufacturing',
    'combat':'Equipment and Combat',
    'science':'Science',
}

diff_prefixes={
	   'normal':'',
	   'expensive':'expensive-'
}

order=[
    'stone-furnace',
    'steel-furnace',
    'electric-furnace',
    'industrial-furnace',
    'burner-assembling-machine',
    'assembling-machine-1',
    'assembling-machine-2',
    'assembling-machine-3',
    'se-space-assembling-machine',
    'se-space-manufactory',
    'chemical-plant',
    'se-pulveriser',
    'se-recycling-facility',
    'se-space-supercomputer-1',
    'se-space-supercomputer-2',
    'se-space-supercomputer-3',
    'se-space-supercomputer-4',
    'se-nexus',
    'se-space-astrometrics-laboratory',
    'se-space-biochemical-laboratory',
    'se-space-electromagnetics-laboratory',
    'se-space-genetics-laboratory',
    'se-space-gravimetrics-laboratory',
    'se-space-laser-laboratory',
    'se-space-material-fabricator',
    'se-space-mechanical-laboratory',
    'se-space-radiation-laboratory',
    'se-space-thermodynamics-laboratory',
    'se-space-particle-accelerator',
    'se-space-particle-collider',
    'se-space-decontamination-facility',
    'se-space-radiator',
    'se-space-radiator-2',
    'se-space-hypercooler',
    'se-space-telescope',
]
[
    'character',
    'character-jetpack',
]

function unique(value, index, array){
    return array.indexOf(value) === index;
}

function reorder(l):
    var newl=[];
    for(var i of l){
        i=i.replace('-grounded','');
        if(i.includes('telescope')){
            i='se-space-telescope';
        }
        if(i.includes('character')){
            i='character';
        }
        if(!order.includes(i)){
            console.log('unordered',i);
        }
        newl.push(i);
    }
    newl.sort((a,b)=>order.indexOf(b)-order.indexOf(a));
    return newl.filter(unique);

postfixes=['','2','3','4','5'];

class Infobox{
    constructor(){
        
    }
}

def numtostr(n):
    s=n.toString();
    if s.startsWith('0'):
        s=s[1:]
    return s

process.init()
data.init()

defaultrinfo={'producers':[]}
defaulttinfo={}

def towikitech(tech,info=None):
    util.pj(tech)
    if info is None:
        info=copy.deepcopy(defaulttinfo)
    else:
        info=copy.deepcopy(info)
    n=data.pdata['technology'][tech]
    info['allows']=[*set(map(locale.techname,process.postreqs['normal'][tech]))]
    info['effects']=[*map(locale.recipename,process.unlocks['normal'][tech])]
    info['required-technologies']=[*map(locale.techname,process.prereqs['normal'][tech])]
    info['cost-multiplier']=n['normal']['count']
    if 'expensive' in info:
        info['expensive-cost-multiplier']=n['expensive']['count']
    info['cost']=' + '.join([
        	   locale.itemlocale(pack[0],data.data)[0]+','+numtostr(pack[1])
        	   for pack in
        	   n['normal']['packs']
        ])
    return info

def towikiitem(item,info=None):
    if info is None:
        info=copy.deepcopy(defaultrinfo)
    else:
        info=copy.deepcopy(info)
    proto=process.getitem(item)
    info['category']=categories[data.data['item-subgroup'][proto['subgroup']]['group']]
    info['internal-name']=item
    info['stack-size']=str(proto['stack_size'])
    info['consumers']=[*map(locale.recipename,process.uses['normal'].get(item,[]))]
    return info

def towikifluid(fluid,group,info=None):
    if info is None:
        info=copy.deepcopy(defaultrinfo)
    else:
        info=copy.deepcopy(info)
    proto=process.getitem(fluid)
    util.pj(proto)
    info['category']=group
    info['internal-name']=fluid
    return info

def towikirecipe(recipe,info=None,replace=None):
    if info is None:
        info=copy.deepcopy(defaultrinfo)
    else:
        info=copy.deepcopy(info)
    if type(recipe)==list or type(recipe)==tuple:
        for x in recipe:
            info=towikirecipe(x,info,replace)
        return info
    if not replace:
        for i,postfix in enumerate(postfixes):
            props=['recipe','total-raw','expensive-recipe','expensive-total-raw']
            c=False
            for prop in props:
                if prop+postfix in info:
                    c=True
                    break
            if not c:
                break
    elif type(replace)==int:
        postfix=postfixes[replace]
    else:
        postfix=replace
    n=data.pdata['recipe'][recipe]
    info['producers']+=process.madein[n['category']]
    for x in util.difficulty:
        if x not in n:
            continue
        prefix=diff_prefixes[x]
        ings=' + '.join([
        	   locale.itemlocale(ing[0],data.data)[0]+','+numtostr(ing[1])
        	   for ing in
        	   [['time',n[x]['time'],'time']]+n[x]['ingredients']
        ])
        ress=' + '.join([
        	   locale.itemlocale(res[0],data.data)[0]+','+numtostr(res[1])
        	   for res in
        	   n[x]['results']
        ])
        recipestr=ings+' > '+ress
        info[prefix+'recipe'+postfix]=recipestr
    util.debug(recipe)
    techs=process.unlockedby['normal'].get(recipe,[])
    info['required-technologies']=info.get('required-technologies',[])+[*map(locale.techname,techs)]
    info['required-technologies']=sorted(set(info['required-technologies']))
    return info

def addconsumers(consumers,info):
    if info is None:
        info=copy.deepcopy(defaultrinfo)
    else:
        info=copy.deepcopy(info)
    info['consumers']=[*map(locale.recipename,consumers)]
    return info

def toinfobox(info):
    if 'producers' in info:
      util.debug(info['producers'])
      info['producers']=' + '.join(map(locale.entityname,reorder(set(info['producers']))))
    s='{{Infobox SE'
    for key in info:
        s+='\n|'
        s+=key
        s+=' = '
        util.debug(key,info)
        val=info[key]
        if type(val)==int:
            val=str(val)
        elif type(val)!=str:
            util.debug(val)
            val=' + '.join(val)
        s+=val
    s+='\n}}'
    return s

#util.pj([x for x in data.data['recipe'].keys() if 'simu' in x])

#util.pj([*process.uses['expensive'].keys()])
#a=towikirecipe('se-simulation-ab')
#util.pj(a)
#util.pj(towikirecipe(['se-simulation-ab','se-simulation-abm'],a))