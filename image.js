import {promiseChain,packPromise,makePromise} from "./util.js";

function toObjectURL(canvas){
  if(typeof canvas.convertToBlob=="function"){
    return canvas.convertToBlob().then(URL.createObjectURL);
  }else{
    return new Promise(resolve=>canvas.toBlob(resolve)).then(URL.createObjectURL);
  }
}

function getCanvas(width,height){
  //if(typeof OffscreenCanvas=='function'){
  //    return new OffscreenCanvas(width,height);
  //}else{
  let canvas=document.createElement("canvas");
  canvas.width=width;
  canvas.height=height;
  return canvas;
  //}
}

function loadImage(src){
  return fetch(src).then(r=>r.blob()).then(createImageBitmap);
}

function colorToString(color){
  return color.reduce((s, channel) => {
    let c = Math.floor(channel).toString(16);
    c = (c.length==1?"0":"")+c;
    s += c;
    return s;
  }, "#");
}

function fixcolor(col){
  // return the color normalized to hex rgba format
  let color={"r":0,"g":0,"b":0};
  if(Array.isArray(col)){
    for(let i=0;i<col.length;i++){
      color[["r","g","b","a"][i]]=col[i];
    }
  }else{
    ["r","g","b","a"].map(x=>{if(x in col){color[x]=col[x];}});
  }
  if(Math.max(...Object.values(color))<=1){
    color['a'] ??= 1;
    ["r","g","b","a"].map(x=>{color[x]*=255;});
  }else{
    color['a'] ??= 255;
  }
  return colorToString(["r","g","b","a"].map(i=>color[i]));
}

let iconcache={};

function makeiconURL(data,options,size=32){
  // return a promise for the canvas being fully rendered
  let cachekey=JSON.stringify({icon:data.icon,icons:data.icons,icon_size:data.icon_size});
  if(cachekey in iconcache){
    console.log(cachekey);
    return makePromise(iconcache[cachekey]);
  }
  if("icons" in data){
    let icons=data.icons;
    let baseiconsize=data.icon_size??icons[0].icon_size*((icons[0].scale??0.5)*2);
    let canvas=getCanvas(size,size);
    let parts=[];
    for(let icondata of icons){
      let iconname=icondata.icon;
      let iconsize=icondata.icon_size??baseiconsize;
      parts.push(packPromise(geticon(iconname,iconsize,options),icondata).then(([icon,idata])=>{
        let icanvas=getCanvas(icon.width,icon.height);
        let ctx=icanvas.getContext("2d");
        if("tint" in idata){
          let tint=fixcolor(idata.tint);
          //console.log('tint',data.name,idata.tint,tint);
          ctx.fillStyle=tint;
          ctx.fillRect(0,0,icanvas.width,icanvas.height);
        }
        ctx.globalCompositeOperation="multiply";
        ctx.drawImage(icon,0,0);
        ctx.globalCompositeOperation="destination-atop";
        ctx.drawImage(icon,0,0);
        ctx.globalCompositeOperation="source-over";
        return [icanvas,idata];
      }));
    }
    return new Promise((resolve,reject)=>
      promiseChain(parts,([icanvas,idata])=>{
        let iconsize=idata.icon_size??baseiconsize;
        let shift=[0,0];
        if("shift" in idata){
          shift=idata.shift;
          shift=shift.map(x=>x*(size/baseiconsize)*2); // i don't know why 2
        }
        let isize=iconsize*(size/baseiconsize);
        if("scale" in idata){
          isize*=idata.scale*2;
        }
        let ctx=canvas.getContext("2d");
        ctx.drawImage(icanvas,(canvas.width-isize)/2+shift[0],(canvas.height-isize)/2+shift[1],isize,isize);
      }).then(()=>{
        return toObjectURL(canvas);
      }).then(url=>{
        iconcache[cachekey]=url;
        resolve(url);
      },
      (error)=>
        reject(error)
      )
    );
  }else{
    let canvas=getCanvas(size,size);
    let iconname=data.icon;
    let iconsize=data.icon_size;
    return geticon(iconname,iconsize,options).then(icon=>{
      let ctx=canvas.getContext("2d");
      ctx.drawImage(icon,0,0,size,size);
    }).then(()=>{
      return toObjectURL(canvas);
    }).then(url=>{
      iconcache[cachekey]=url;
      return url;
    });
  }
}

function getpath(filename,options){
  let mod;
  let path;
  let slash = filename.indexOf("/");
  mod = filename.slice(0, slash);
  if (mod.slice(0,2)!='__'){
    throw Error(`mod ${mod} didn\'t have __ on both sides`);
  }
  if (mod.slice(-2)!='__'){
    throw Error(`mod ${mod} didn\'t have __ on both sides`);
  }
  let modname = mod.slice(2,-2);
  path = filename.slice(slash);
  let root = options.modassets[modname];
  if (root == undefined) {
    root = options.modassets.__default.replace('{}',modname);
  }
  return root+'/'+path;
}

function geticon(name,size,options){
  return loadImage(getpath(name,options)).then(image=>{
    return createImageBitmap(image,0,0,size,size);
  });
}

export {makeiconURL};