class WorkerPool {
	constructor(workersource, workercount = 16){
		const workers = [];
		const queue = [];

		for (let i = 0; i < workercount; i++) {
			const worker = new Worker(workersource):
			worker.addEventListener('message',(([data])=>{
				const [_,_,resolve] = workers[i];
				if (queue.length == 0) {
					workers[i][1] = false;
				} else {
					const [data2,resolve2] = queue.pop();
					workers[i][0].postMessage(data);
					workers[i][2] = resolve2;
				}
				resolve(data);
			}));
			workers.push([worker,false,null]);
		}
	}

	run(data) { // returns a promise which fulfills when the worker sends back a message
		for (let i = 0; i < workers.length; i++) {
			const [worker,running,_] = workers[i];
			if (running) {
				continue;
			}
			worker.postMessage(data);
			const {promise,resolve} = Promise.withResolvers();
			workers[i][1] = true;
			workers[i][2] = resolve;
			return promise;
		}
		const {promise,resolve} = Promise.withResolvers();
		queue.push([data,resolve]);
		return promise;
	}
}

export {WorkerPool};