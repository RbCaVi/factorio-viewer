import {normalizerecipe,normalizetech} from 'normalize.js';
class Data{
  constructor(data,locale){
    if(typeof data=='string'){
      data=JSON.parse(data);
    }
    this.data=data;
    for(key in this.data['recipe']){
      this.data[key]=normalizerecipe(data[key]);
    }
    for(key in this.data['technology']){
      this.data[key]=normalizetech(data[key]);
    }
  }
}