import {craftertypes,clone,util} from "./util.js";
import {normalizerecipe,normalizetech} from "./normalize.js";
import {processrecipe,processtech} from "./process.js";

class FactorioData{
  constructor(data){
    if(typeof data=="string"){
      data=JSON.parse(data);
    }
    this.data=data;
    this.rawdata=clone(data);
    for(let key in this.data.recipe){
      this.data.recipe[key]=normalizerecipe(data.recipe[key]);
    }
    for(let key in this.data.technology){
      this.data.technology[key]=normalizetech(data.technology[key]);
    }
    this.pdata={"recipe":{},"technology":{}};
    for(let key in this.data.recipe){
      this.pdata.recipe[key]=processrecipe(data.recipe[key]);
    }
    for(let key in this.data.technology){
      this.pdata.technology[key]=processtech(data.technology[key]);
    }

    let getdifficulties=()=>util.difficulty.reduce((a,b)=> (a[b]={},a),{});
    this.uses=getdifficulties();
    this.produces=getdifficulties();

    for(let recipe of Object.values(this.pdata.recipe)){
      for(let x of util.difficulty){
        if(!(x in recipe)){
          continue;
        }
        for(let ing of recipe[x].ingredients){
          if(!(ing[0] in this.uses[x])){
            this.uses[x][ing[0]]=[];
          }
          this.uses[x][ing[0]].push(recipe.name);
        }
        for(let res of recipe[x].results){
          if(!(res[0] in this.produces[x])){
            this.produces[x][res[0]]=[];
          }
          this.produces[x][res[0]].push(recipe.name);
        }
      }
    }

    this.prereqs=getdifficulties();
    this.postreqs=getdifficulties();
    this.unlocks=getdifficulties();
    this.unlockedby=getdifficulties();

    for(let tech of Object.values(this.pdata.technology)){
      for(let x of util.difficulty){
        if(!(x in tech)){
          continue;
        }
        for(let prereq of tech[x].prerequisites){
          if(!(prereq in this.postreqs[x])){
            this.postreqs[x][prereq]=[];
          }
          this.postreqs[x][prereq].push(tech.name);
          if(!(tech.name in this.prereqs[x])){
            this.prereqs[x][tech.name]=[];
          }
          this.prereqs[x][tech.name].push(prereq);
        }
        for(let effect of tech[x].effects){
          if(!(tech.name in this.unlocks[x])){
            this.unlocks[x][tech.name]=[];
          }
          this.unlocks[x][tech.name].push(effect);
          if(!(effect in this.unlockedby[x])){
            this.unlockedby[x][effect]=[];
          }
          this.unlockedby[x][effect].push(tech.name);
        }
      }
    }
    
    this.ccats={};
    this.madein={};
    
    for(let ctype of craftertypes){
      for(let crafter of Object.keys(this.data[ctype])){
        this.ccats[crafter]=this.data[ctype][crafter].crafting_categories;
        for(let ccat of this.data[ctype][crafter].crafting_categories){
          if(!(ccat in this.madein)){
            this.madein[ccat]=[];
          }
          this.madein[ccat].push(crafter);
        }
      }
    }
  }

  getitemtype(item){
    for(let itype of ["fluid"].concat(util.itemtypes)){
      if(item in this.data[itype]){
        return itype;
      }
    }
  }

  getitem(item){
    for(let itype of ["fluid"].concat(util.itemtypes)){
      if(item in this.data[itype]){
        return this.data[itype][item];
      }
    }
  }

  getentity(entity){
    for(let etype of ["fluid"].concat(util.entitytypes)){
      if(entity in this.data[etype]){
        return this.data[etype][entity];
      }
    }
  }

  getequipment(equipment){
    for(let etype of ["fluid"].concat(util.equipmenttypes)){
      if(equipment in this.data[etype]){
        return this.data[etype][equipment];
      }
    }
  }

  getrawitem(item){
    for(let itype of ["fluid"].concat(util.itemtypes)){
      if(item in this.rawdata[itype]){
        return this.rawdata[itype][item];
      }
    }
  }
}

export {FactorioData};