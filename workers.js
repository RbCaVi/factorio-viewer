let makePromise;

if (Promise.withResolvers) {
	makePromise = function makePromise() {
		const {promise,resolve} = Promise.withResolvers();
		return {promise,resolve};
	}
} else {
	makePromise = function makePromise() {
		let resolve;
		const promise = new Promise(res => {
		  resolve = res;
		});
		return {promise,resolve};
	}
}

class WorkerPool {
	constructor(workersource, workercount = 16){
		this.workers = [];
		this.queue = [];

		for (let i = 0; i < workercount; i++) {
			const worker = new Worker(workersource);
			worker.addEventListener('message',(([data])=>{
				const [,,resolve] = this.workers[i];
				if (this.queue.length == 0) {
					this.workers[i][1] = false;
				} else {
					const [data2,options,resolve2] = this.queue.pop();
					this.workers[i][0].postMessage(data2,options);
					this.workers[i][2] = resolve2;
				}
				resolve(data);
			}));
			this.workers.push([worker,false,null]);
		}
	}

	run(data,options) { // returns a promise which fulfills when the worker sends back a message
		for (let i = 0; i < this.workers.length; i++) {
			const [worker,running,] = this.workers[i];
			if (running) {
				continue;
			}
			worker.postMessage(data,options);
			const {promise,resolve} = makePromise();
			this.workers[i][1] = true;
			this.workers[i][2] = resolve;
			return promise;
		}
		const {promise,resolve} = makePromise();
		this.queue.push([data,options,resolve]);
		return promise;
	}
}

export {WorkerPool};