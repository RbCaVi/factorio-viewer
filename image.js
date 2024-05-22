import {WorkerPool} from "./workers.js";
import {promiseChain,packPromise,makePromise} from "./util.js";
await import('./image-impl.js');

let makeiconURL;

let iconcache={};

if (!window.Worker || !window.OffscreenCanvas) { // workers or offscreencanvas don't exist
  if (!window.OffscreenCanvas && window.Worker) { // no canvas, worker only loads
    const pool = new WorkerPool('image-worker-load.js',4); // no trickery

    // const imcache = {}; // {key,weak ref to image}

    window.__imagestuff__.geticon = function geticon(name,size,options){
      // let cachekey=JSON.stringify({name,size,options});
      // if(cachekey in imcache){
      //   console.log(cachekey,'found in cache');
      //   const out = imcache[cachekey].deref();
      //   if (out != undefined) {
      //     return makePromise(out.data);
      //   } else {
      //     delete imcache[cachekey];
      //   }
      // }
      const iconp = pool.run([name,size,options]);
      // imcache[cachekey] = new WeakRef({data:iconp});
      // iconp.then(x=>{imcache[cachekey]=new WeakRef({data:x});});
      return iconp;
    }
  }

  makeiconURL = function makeiconURL(data,options,size=32){
    let cachekey=JSON.stringify({icon:data.icon,icons:data.icons,icon_size:data.icon_size,rendered_size:size});
    if(cachekey in iconcache){
      console.log(cachekey);
      console.log(cachekey,'found in cache');
      const out = iconcache[cachekey].deref();
      if (out != undefined) {
        return makePromise(out.data);
      } else {
        delete iconcache[cachekey];
      }
    }
    let canvas=window.__imagestuff__.getCanvas(size,size);
    const urlp = window.__imagestuff__.makeiconURL(promiseChain,packPromise,makePromise,canvas,data,options,size);
    iconcache[cachekey] = new WeakRef({data:urlp});
    urlp.then(x=>{iconcache[cachekey]=new WeakRef({data:x});});
    return urlp;
  }
} else { // workers exist
  const pool = new WorkerPool('image-worker.js'); // no trickery

  makeiconURL = function makeiconURL(data,options,size=32){
    let cachekey=JSON.stringify({icon:data.icon,icons:data.icons,icon_size:data.icon_size,rendered_size:size});
    if(cachekey in iconcache){
      console.log(cachekey);
      console.log(cachekey,'found in cache');
      const out = iconcache[cachekey].deref();
      if (out != undefined) {
        return makePromise(out.data);
      } else {
        delete iconcache[cachekey];
      }
    }
    let canvas=window.__imagestuff__.getCanvas(size,size);
    const urlp = pool.run([canvas,data,options,size],{transfer:[canvas]});
    concache[cachekey] = new WeakRef({data:urlp});
    urlp.then(x=>{concache[cachekey]=new WeakRef({data:x});});
    return urlp;
  }
}

export {makeiconURL};