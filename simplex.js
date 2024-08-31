import {clone,stringify} from "./util.js";
import {normalizeresult} from "./normalize.js";
import {Rational,mult,div} from "./rational.js";

class SimplexSolver{
  constructor(data){
    this.data=data;
    this.rtable={};
    for(let recipename in this.data.pdata.recipe){
      let recipe=this.data.pdata.recipe[recipename];
      let entry={};
      for(let ing of recipe.normal.ingredients){
        if(!(ing[0] in entry)){
          entry[ing[0]]=new Rational(0);
        }
        entry[ing[0]].sub(div(ing[1],recipe.normal.time));
      }
      for(let res of recipe.normal.results){
        if(!(res[0] in entry)){
          entry[res[0]]=new Rational(0);
        }
        entry[res[0]].add(div(res[1],recipe.normal.time));
      }
      this.rtable[recipename]=entry;
    }

    for(let pump of Object.values(this.data.data["offshore-pump"])){
      // add water recipe
      let entry={};
      entry[pump.fluid]=new Rational(pump.pumping_speed*60);
      this.rtable["pump."+pump.name]=entry;
    }

    for(let resource of Object.values(this.data.data.resource)){
      if(!("minable" in resource)){
        continue;
      }
      let entry={};
      if((resource.minable.fluid_amount??0)>0){
        entry[resource.minable.required_fluid]=div(-resource.minable.fluid_amount,resource.minable.mining_time);
      }
      if(resource.minable.results){
        for(let res of resource.minable.results){
          res=normalizeresult(res);
          if(!(res.name in entry)){
            entry[res.name]=new Rational(0);
          }
          entry[res.name].add(div(res.amount,resource.minable.mining_time));
        }
      }else if(resource.minable.result){
        if(!(resource.minable.result in entry)){
          entry[resource.minable.result]=new Rational(0);
        }
        entry[resource.minable.result].add(div(resource.minable.count??1,resource.minable.mining_time));
      }
      this.rtable["mine."+resource.name]=entry;
    }
  }

  #clonertable(){
    let newtable={};
    for(let [key,recipe] of Object.entries(this.rtable)){
      let newrecipe={};
      for(let [item,amount] of Object.entries(recipe)){
        newrecipe[item]=new Rational(amount.num,amount.denom);
      }
      newtable[key]=newrecipe;
    }
    return newtable;
  }

  solve(outs){
    let rtable2=this.#clonertable();
    prunerecipes(rtable2)
    addcosts(rtable2);
    addslacks(rtable2);
    outs=clone(outs);
    mapKeys(outs,x=>new Rational(x));
    rtable2[".out"]=outs;
    let pivots=0;
    while(true){
      let col=minIndex(outs);
      if(!(outs[col].negative())){
        break;
      }
      let [minrow,minr]=Object.entries(rtable2)[0];
      for(let [row,recipe] of Object.entries(rtable2)){
        if((!(col in recipe))||(!recipe[col].positive())||row==".out"){
          continue;
        }
        if((!(col in minr))||(!minr[col].positive())||minrow==".out"||(div(minr[".cost"],minr[col]).greaterthan(div(recipe[".cost"],recipe[col])))){
          minr=recipe;
          minrow=row;
        }
      }
      if((!(col in minr))||(!minr[col].positive())||minrow==".out"){
        throw "nothing making "+col;
      }
      let v=minr[col];
      mapKeys(minr,x=>div(x,v));
      console.log("pivot",minrow,"by",col);
      for(let recipe of Object.values(rtable2)){
        if(recipe===minr){
          continue;
        }
        if(col in recipe){
          if(recipe===outs){
            console.log("subtracting",stringify(minr),"*",stringify(recipe[col]),"from .out");
          }
          subtractObject(recipe,minr,recipe[col]);
        }
      }
      console.log(stringify(outs));
      pivots++;
    }
    mapKeys(outs,f=>f.reduce());
    console.log("did",pivots,"pivots");
    return outs;
  }
}

function minIndex(o) {
  let lowest = Object.keys(o)[0];
  for (let i in o) {
    if (o[i].lessthan(o[lowest])) lowest = i;
  }
  return lowest;
}

function mapKeys(o,f){
  for(let key in o){
    o[key]=f(o[key]);
  }
}

function subtractObject(o,o2,multiplier){
  multiplier=new Rational(multiplier);
  for(let [key,value] of Object.entries(o2)){
    if(!(key in o)){
      o[key]=new Rational(0);
    }
    let x=mult(value,multiplier);
    o[key].sub(x);
    if(o[key].iszero()){
      delete o[key];
    }else{
      o[key].reduce();
    }
  }
}

function addcosts(rtable) {
  for(let key in rtable){
    if(key==".out"){
      continue;
    }
    rtable[key][".cost"]=new Rational(1);
  }
}

function addslacks(rtable) {
  for(let key in rtable){
    if(key==".out"){
      continue;
    }
    rtable[key]["recipe."+key]=new Rational(1);
  }
}

export {SimplexSolver};