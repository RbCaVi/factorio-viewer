class WorkerFuncs {
	constructor() {
		this.worker = new Worker('a.js');
		this.counter = 0;
		this.threads = 0;
		this.maxthreads = 16;
		this.queue = [];
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
		let id = this.counter;
		this.counter++;
		if (this.threads < this.maxthreads) {
			const f = (name, id, resolve, reject, options, args) => {
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
				this.worker.postMessage(['call', name, [id, args]]);
				this.worker.addEventListener('message', listener);
			}
			this.threads++;
			console.log(this.threads);
			return new Promise(async (resolve, reject) => {
				while (true) {
					const p = new Promise((res, rej) => f(name, id, res, rej, options, args));
					p.then(resolve, reject);
					try {
						await p;
					} finally {}
					const item = this.queue.pop();
					if (item == undefined) {
						break;
					}
					[name, id, resolve, reject, options, args] = item;
				}
				this.threads--;
			});
		} else {
			let resolve, reject;
			const p = new Promise((res, rej) => {[resolve, reject] = [res, rej];});
			this.queue.push([name, id, resolve, reject, options, args]);
			return p
		}
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