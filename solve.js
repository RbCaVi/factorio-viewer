import {Rational, mul, div, createrational, copyrational, neg, signsub} from "./rational2.js";
import {normalizeresult} from './normalize.js';

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

			for (const [res, amt] of recipe[cost].results) {
        if(!(res in entry)){
          entry[res] = new Rational({}, 0);
        }
        entry[res].add(div(createrational(amt), createrational(recipe[cost].time)));
			}

			recipes['recipe.' + recipename] = entry;
		}

		for (const [pumpname, pump] of Object.entries(data.data['offshore-pump'])) {
			recipes['pump.' + pumpname] = {
				[pump.fluid]: createrational(pump.pumping_speed * 60)
			};
		}

		for (const [resourcename, resource] of Object.entries(data.data.resource)) {
			if (!('minable' in resource)) {
				continue; // it can't be mined
			}
			if (('collision_mask' in resource) && !resource.collision_mask.includes('resource-layer')) {
				continue; // it can't be mined with a drill type entity
			}
			const entry = {};
			const mining_time = createrational(resource.minable.mining_time);

			if ('results' in resource.minable) {
				for (const result of resource.minable.results) {
					const {name: res, amount} = normalizeresult(result);
          if(!(res in entry)){
            entry[res] = new Rational({}, 0);
          }
          entry[res].add(div(createrational(amount), mining_time));
				}
			} else {
				if (!('result' in resource.minable)) {
					continue;
				}
				const res = resource.minable.result;
				const amount = resource.minable.amount ?? 1;
        entry[res] = div(createrational(amount), mining_time);
			}

			if ('fluid_amount' in resource.minable) {
				const {fluid_amount: amount, required_fluid: fluid} = resource.minable;
				if (amount > 0) {
        	entry[fluid]=div(createrational(-amount),mining_time);
				}
			}

			recipes['mine.' + resourcename] = entry;
		}

		this.recipes = recipes;
	}

	creatematrix() {
		const matrix = {};
		const produces = {};
		const consumes = {};
		for (const [recipename, recipe] of Object.entries(this.recipes)) {
			const row = {};
			for (const [item, amount] of Object.entries(recipe)) {
				if (amount.sign != 0) {
					row[item] = copyrational(amount);
				}
				if (amount.sign == 1) {
					if (!(item in produces)) {
						produces[item] = new Set();
					}
					produces[item].add(recipename);
				}
				if (amount.sign == -1) {
					if (!(item in consumes)) {
						consumes[item] = new Set();
					}
					consumes[item].add(recipename);
				}
			}
			row['.cost'] = new Rational({}, 1); // for now
			row[recipename] = new Rational({}, 1);
			matrix[recipename] = row;
		}
		// a processing step to remove net negative loops
		// do forced pivots (only one recipe produces this item)
		// remove all-negative recipes
		const pivoted = new Set();
		while (true) {
			let haspivoted = false;
			for (const [item, recipes] of Object.entries(produces)) {
				if (recipes.size != 1) {
					continue;
				}
				delete produces[item];
				pivoted.add(item);
				haspivoted = true;
				if (!(item in consumes)) {
					continue;
				}
				const recipename = [...recipes.keys()][0];
				console.log('forced pivot by', recipename, 'on', item);
				const recipe = matrix[recipename];
				const itemamount = recipe[item];
				for (const [pitem, amount] of Object.entries(recipe)) {
					if (pitem == item) {
						continue;
					}
					recipe[pitem].div(itemamount);
				}
				recipe[item] = new Rational({}, 1);
				const crecipes = [...consumes[item].keys()];
				for (const crecipename of crecipes) {
					//console.log('pivoting', crecipename);
					const crecipe = matrix[crecipename];
					// these are recipes that consume the item
					// remove all produces and consumes entries
					for (const [citem, amount] of Object.entries(crecipe)) {
						// these should always return true - i'm not checking them
						if (citem.includes('.')) {
							continue;
						}
						if (amount.sign == 1) {
							if (pivoted.has(citem)) {
								continue;
							}
							produces[citem].delete(crecipename);
						}
						if (amount.sign == -1) {
							consumes[citem].delete(crecipename);
						}
					}
					// forced pivot
					for (const [pitem, amount] of Object.entries(recipe)) {
						//console.log('pre', pitem, String(crecipe[pitem]), '-', String(recipe[pitem]), '*', String(crecipe[item]));
						if (pitem == item) {
							continue;
						}
						if (pitem in crecipe) {
							crecipe[pitem].sub(mul(recipe[pitem], crecipe[item]));
							if (crecipe[pitem].sign == 0) {
								delete crecipe[pitem];
							}
						} else {
							crecipe[pitem] = neg(mul(recipe[pitem], crecipe[item]));
						}
						//console.log('post =', String(crecipe[pitem]));
					}
					delete crecipe[item];
					// TODO: check for all-negative ness
					// add new produces and consumes entries
					for (const [citem, amount] of Object.entries(crecipe)) {
						if (citem.includes('.')) {
							continue;
						}
						// these should always return true - i'm not checking them
						if (amount.sign == 1) {
							if (pivoted.has(citem)) {
								continue;
							}
							produces[citem].add(crecipename);
						}
						if (amount.sign == -1) {
							consumes[citem].add(crecipename);
						}
					}
				}
			}
			if (!haspivoted) {
				break;
			}
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
