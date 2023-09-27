import {util,clone} from './util.js';

var categories={
    'logistics':'Logistics',
    'production':'Production',
    'resources':'Resources',
    'intermediate-products':'Manufacturing',
    'combat':'Equipment and Combat',
    'science':'Science',
}

var diff_prefixes={
	   'normal':'',
	   'expensive':'expensive-'
}

var order=[
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
    'character',
    'character-jetpack',
];

function unique(value, index, array){
    return array.indexOf(value) === index;
}

function reorder(l){
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
}

var postfixes=['','2','3','4','5'];

function numtostr(n){
    s=n.toString();
    if(s.startsWith('0')){
        s=s.slice(1);
    }
    return s;
}

class Infobox{
    constructor(data){
        // data is the FactorioData object that this infobox gets its data from
        this.data=data;
        this.info=null;
    }

    addtech(tech){
        tech=data.data.technology[tech];
        if(this.info==null){
            this.info={};
        }else{
            throw Error('already set');
        }
        var n=data.pdata.technology[tech];
        this.info.allows=this.data.postreqs.normal[tech].map(tech=>this.data.techlocale(tech)[1]).filter(unique);
        this.info.effects=locale.recipename,this.data.unlocks.normal[tech].map(tech=>this.data.recipelocale(tech)[1]);
        this.info['required-technologies']=this.data.prereqs.normal[tech].map(tech=>this.data.techlocale(tech)[1]).filter(unique);
        this.info['cost-multiplier']=n.normal.count;
        if('expensive' in this.info){
            this.info['expensive-cost-multiplier']=n.expensive.count;
        }
        this.info.cost=n.normal.packs.map(pack=>this.data.itemlocale(pack[0],data.data)[0]+','+numtostr(pack[1])).join(' + ');
    }

    additem(item){
        item=data.getitem(item);
        if(this.info==null){
            this.info={'producers':[]};
        }
        this.info.category=categories[data.data['item-subgroup'][item.subgroup].group];
        this.info['internal-name']=item.name;
        this.info['stack-size']=''+item.stack_size;
        this.info.consumers=this.data.uses.normal[item.name]??[].map(this.data.recipename);
    }

    addfluid(fluid,group='intermediate-products'){
        if(this.info==null){
            this.info={'producers':[]};
        }
        this.info.category=group;
        this.info['internal-name']=fluid;
    }

    addrecipe(recipe){
        recipe=data.data.recipe[recipe];
        if(this.info==null){
            this.info={'producers':[]};
        }
        var postfix;
        for(var i=0;i<postfixes.length;i++){
            postfix=postfixes[i]
            props=['recipe','total-raw','expensive-recipe','expensive-total-raw']
            c=false
            for(prop of props){
                if(prop+postfix in this.info){
                    c=true;
                    break;
                }
            }
            if(!c){
                break;
            }
        }
        var n=data.pdata.recipe[recipe];
        this.info.producers+=this.data.madein[n.category];
        for(x of util.difficulty){
            if(!x in n){
                continue;
            }
            prefix=diff_prefixes[x];
            recipeparts=[[['time',n[x].time,'time']].concat(n[x].ingredients),n[x].results];
            info[prefix+'recipe'+postfix]=recipeparts;
        }
        techs=this.data.unlockedby.normal[recipe]??[];
        this.info['required-technologies']=this.info['required-technologies']??[].concat(techs.map(this.data.techname))
        this.info['required-technologies']=sorted(set(this.info['required-technologies']))
    }

    setconsumers(consumers){
        info.consumers=consumers.map(this.data.recipename);
        return info;
    }

    getjson(){
        return clone(this.info);
    }

    toString(){
        for(var postfix of postfixes){
            for(var x of util.difficulty){
                var prefix=diff_prefixes[x]
                if(!(prefix+'recipe'+postfix in this.info)){
                    continue;
                }
                var r=this.info[prefix+'recipe'+postfix];
                var ings=r[0].map(ing=>this.data.itemlocale(ing[0])[0]+','+numtostr(ing[1]))
                var ress=r[1].map(res=>this.data.itemlocale(res[0])[0]+','+numtostr(res[1]))
                var recipestr=ings+' > '+ress
                this.info[prefix+'recipe'+postfix]=recipestr
            }
        }
        if('producers' in this.info){
            console.info(this.info.producers);
            this.info.producers=reorder(this.info.producers).filter(unique).map(e=>this.data.entitylocale(e)[0]).join(' + ');
        }
        var s='{{Infobox SE';
        for(var key in this.info){
            s+='\n|';
            s+=key;
            s+=' = ';
            console.info('converting key',key,this.info);
            var val=this.info[key];
            if(typeof val!='number'){
                val=''+val;
            }else if(Array.isArray(val)){
                val=v.join(' + ');
            }
            s+=val;
        }
        s+='\n}}';
        return s;
    }
}

export {Infobox};