import {Rational, mul, div, createrational} from "./rational2.js";

class Solver {
	constructor(data, cost = 'normal') {
		// cost is 'normal' or 'expensive'
		// create table of recipes
		// {item:amount/s,recipe:1}
		// cost is added later
		const recipes = {};

		for (const [recipename, recipe] of Object.entries(data.pdata.recipe)) {
			const entry = {};

			for (const [ing, amt] of recipe[cost].ingredients) {
        if(!(ing in entry)){
          entry[ing] = new Rational({}, 0);
        }
        entry[ing].sub(div(createrational(amt), createrational(recipe[cost].time)));
			}

			for (const [res, amt] of recipe[cost].result) {
        if(!(res in entry)){
          entry[res] = new Rational({}, 0);
        }
        entry[res].add(div(createrational(amt), createrational(recipe[cost].time)));
			}

			entry['recipe.' + recipename] = new Rational({}, 1);
			recipes['recipe.' + recipename] = entry;
		}

		for (const [pumpname, pump] of Object.entries(data.data['offshore-pump'])) {
			recipes['pump.' + pumpname] = {
				['pump.' + pumpname]: new Rational({}, 1),
				[pump.fluid]: createrational(pump.pumping_speed * 60)
			};
		}

		for (const [resourcename, resource] of Object.entries(data.data.resource)) {
			if (!('minable' in resource)) {
				continue; // it can't be mined
			}
			if (!resource.collision_mask.includes('resource-layer')) {
				continue; // it can't be mined with a drill type entity
			}
			const entry = {};
			const mining_time = resource.minable.mining_time;

			if ('results' in resource.minable) {
				for (const result of resource.minable.results) {
					const {name: res, amount} = normalizeresult(result);
          if(!(res in entry)){
            entry[res] = new Rational({}, 0);
          }
          entry[res].add(div(createrational(amount), createrational(mining_time)));
				}
			} else {
				const {result: res, count: amount = 1} = normalizeresult(result);
        entry[res] = div(createrational(amount), createrational(mining_time));
			}

			if ('fluid_amount' in resource.minable) {
				const {fluid_amount: amount, required_fluid: fluid} = resource.minable;
				if (amount > 0) {
        	entry[fluid]=div(createrational(-amount),createrational(mining_time));
				}
			}

			entry['mine.' + resourcename] = new Rational({}, 1);
			recipes['mine.' + resourcename] = entry;
		}

		this.recipes = recipes;
	}

	creatematrix() {
		const matrix = {};
		for (const [recipename, recipe] of Object.entries(this.recipes)) {
			const row = {};
			for (const [item, amount] of Object.entries(recipe)) {
				row[item] = copyrational(amount);
			}
			row['.cost'] = 1; // for now
			matrix[recipename] = row;
		}
		// TODO: a processing step to remove net negative loops
		const produces = {};
		const consumes = {};
		for (const [recipename, recipe] of Object.entries(matrix)) {
			// cheese
		}
		return matrix;
	}

	solve(outin) {
		// uses the simplex algorithm
		const matrix = this.creatematrix();
		const out = outin;
		matrix['.out'] = out
		while (true) {
			// find minimum column in outs or break
			const requiredouts = Object.entries(out).filter(
				([, v]) => v.sign == -1
			);
			if (requiredouts.length == 0) {
				break;
			}
			const [mincol, ] = getmin(requiredouts,
				([, v1], [, v2]) => signsub(v1, v2)
			);
			// find minimum cost/recipe[mincol] where recipe[mincol] > 0
			const selectedrows = Object.entries(matrix).filter(
				([, v]) => v.sign == 1
			).map(
				([k, v]) => [k, v, div(v['.cost'], v[minrow])]
			);
			if (selectedrows.length == 0) {
				throw Error(`no recipe that makes ${mincol}`);
			}
			const [minrecipe, minrow, ] = getmin(selectedrows,
				([, , cost1], [, , cost2]) => signsub(cost1, cost2)
			);
			// divide all of minrow by minrow[mincol]
			const mincolamount = minrow[mincol];
			for (const [item, amount] of Object.entries(minrow)) {
				if (item == mincol) {
					minrow[item] = new Rational({}, 1);
				} else {
					minrow[item].div(mincolamount);
				}
			}
			// for each recipe in the table:
			for (const [recipe, row] of Object.entries(matrix)) {
				if (recipe == minrecipe) {
					continue;
				}
				if (!(mincol in row)) {
					continue;
				}
				if (item == mincol) {
					continue;
				}
				for (const [item, amount] of Object.entries(minrow)) {
					if (item in row) {
						row[item].sub(mul(minrow[item], row[mincol]));
						if (row[item].sign == 0) {
							delete row[item];
						}
					} else {
						row[item] = neg(mul(minrow[item], row[mincol]));
					}
				}
			}
		}
		return out;
	}
}

export {Solver};