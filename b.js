class WorkerFuncs {
	constructor() {
		this.worker = new Worker('a.js');
		this.counter = 0;
	}

	addfunc(name, f) {
		this.worker.postMessage(['new', name, f.toString()]);
		return new Promise((resolve, reject) => {
			const listener = (message) => {
				const [type, data] = message.data;
				if (type == 'add' && data == name) {
					this.worker.removeEventListener('message', listener);
					resolve();
				}
			};
			this.worker.addEventListener('message', listener);
		});
	}

	call(name, options, ...args) {
		// data should be already in the right format for the worker
		const id = this.counter;
		this.counter++;
		this.worker.postMessage(['call', name, [id, args]]);
		return new Promise((resolve, reject) => {
			const listener = (message) => {
				const [type, rid, data] = message.data;
				if (type == 'data' && rid == id) {
					this.worker.removeEventListener('message', listener);
					resolve(data);
				}
				if (type == 'error' && rid == id) {
					this.worker.removeEventListener('message', listener);
					reject(data);
				}
			};
			this.worker.addEventListener('message', listener);
		});
	}
}

class SingleFuncs {
	constructor() {
		this.funcs = {};
	}

	addfunc(name, f) {
		this.funcs[name] = f;
	}

	call(name, options, ...args) {
		return this.funcs[name].bind(this)(...args);
	}
}

const Funcs = Worker ? WorkerFuncs : SingleFuncs;

export {Funcs};