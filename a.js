funcs = {};

self.onmessage = async function onmessage (message) {
  const [type, name, data] = message.data;
  if (type == "call") {
    // data is the id and data to call with
    const [id, args] = data;
    self.postMessage(["data", id, await funcs[name](...args)]);
  }
  if (type == "new") {
    // data is the function's definition
    funcs[name] = eval("self.func = " + data);
    self.postMessage(["add", name]);
  }
};