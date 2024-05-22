importScripts("./image-impl.js");

addEventListener('message',
	async ({data:[name,size,options]})=>postMessage(await __imagestuff__.geticon(name,size,options))
);
