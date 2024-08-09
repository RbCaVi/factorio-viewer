funcs = {};

self.onmessage = async function onmessage (message) {
  const [type, name, data] = message.data;
  if (type == "call") {
    // data is the id and data to call with
    const [id, args] = data;
    try {
		  self.postMessage(["data", id, await funcs[name](...args)]);
		} catch (e) {
    	self.postMessage(["error", id, e.toString()]);
    }
  }
  if (type == "new") {
    // data is the function's definition
    funcs[name] = eval("self.func = " + data);
    self.postMessage(["add", name]);
  }
};