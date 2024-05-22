import {WorkerPool} from "./workers.js";
import {promiseChain,packPromise,makePromise} from "./util.js";
await import('./image-impl.js');

let makeiconURL;

let iconcache={};

if (!window.Worker) { // workers or offscreencanvas don't exist
  makeiconURL = function makeiconURL(data,options,size=32){
    let cachekey=JSON.stringify({icon:data.icon,icons:data.icons,icon_size:data.icon_size,rendered_size:size});
    if(cachekey in iconcache){
      console.log(cachekey);
      return makePromise(iconcache[cachekey]);
    }
    let canvas=window.__imagestuff__.getCanvas(size,size);
    return window.__imagestuff__.makeiconURL(promiseChain,packPromise,makePromise,canvas,data,options,size).then((url)=>{
      iconcache[cachekey]=url;
      return url;
    });
  }
} else { // workers exist
  if (!window.OffscreenCanvas) { // no canvas, worker only loads
    // const pool = new WorkerPool('image-worker-load.js'); // no trickery

    // makeiconURL = function makeiconURL(data,options,size=32){
    //   let cachekey=JSON.stringify({icon:data.icon,icons:data.icons,icon_size:data.icon_size,rendered_size:size});
    //   if(cachekey in iconcache){
    //     console.log(cachekey);
    //     return makePromise(iconcache[cachekey]);
    //   }
    //   let canvas=window.__imagestuff__.getCanvas(size,size);
    //   return pool.run([canvas,data,options,size],{transfer:[canvas]}).then((url)=>{
    //     iconcache[cachekey]=url;
    //     return url;
    //   });
    // }

    makeiconURL = function makeiconURL(data,options,size=32){
      let cachekey=JSON.stringify({icon:data.icon,icons:data.icons,icon_size:data.icon_size,rendered_size:size});
      if(cachekey in iconcache){
        console.log(cachekey);
        return makePromise(iconcache[cachekey]);
      }
      let canvas=window.__imagestuff__.getCanvas(size,size);
      return window.__imagestuff__.makeiconURL(promiseChain,packPromise,makePromise,canvas,data,options,size).then((url)=>{
        iconcache[cachekey]=url;
        return url;
      });
    }
  } else { // offscreencanvas
    const pool = new WorkerPool('image-worker.js'); // no trickery

    makeiconURL = function makeiconURL(data,options,size=32){
      let cachekey=JSON.stringify({icon:data.icon,icons:data.icons,icon_size:data.icon_size,rendered_size:size});
      if(cachekey in iconcache){
        console.log(cachekey);
        return makePromise(iconcache[cachekey]);
      }
      let canvas=window.__imagestuff__.getCanvas(size,size);
      return pool.run([canvas,data,options,size],{transfer:[canvas]}).then((url)=>{
        iconcache[cachekey]=url;
        return url;
      });
    }
  }
}

export {makeiconURL};