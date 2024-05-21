import {WorkerPool} from "./workers.js";

let makeiconURL;

if (!window.Worker) { // workers don't exist
  await import('./image-impl.js');
  makeiconURL = window.__imagestuff__.makeiconURL.bind(undefined,promiseChain,packPromise,makePromise);
} else { // running in the window and workers exist
  const pool = new WorkerPool('image-worker.js'); // no trickery

  makeiconURL = function makeiconURL(data,options,size=32){
    return pool.run([data,options,size]);
  }
}

export {makeiconURL};