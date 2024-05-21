// from util.js
function promiseChain(ps,f){
  // ps is an array of promises
  // f is a one argument function
  // it calls f on the data from each promise in order and returns the resulting promise
  return ps.reduce((p1,p2)=>{
    return p1.then(data1=>{
      f(data1);
      return p2;
    });
  }).then(data=>{
    f(data);
  });
}

function packPromise(p,data){
  // puts a data value into a promise
  return p.then(pdata=>[pdata,data]);
}

function makePromise(data){
  // returns a promise that returns this data
  return new Promise(resolve=>resolve(data));
}

importScripts("./image-impl.js");

addEventListener('message',
	async ({data:[canvas,data,options,size]})=>postMessage(await makeiconURL(promiseChain,packPromise,makePromise,canvas,data,options,size))
);
