importScripts("./util.js");
importScripts("./image-impl.js");

makeiconURL = makeiconURL.bind(undefined,promiseChain,packPromise,makePromise)

addEventListener('message',
	async ([data,options,size])=>postMessage(await makeiconURL(data,options,size))
);
