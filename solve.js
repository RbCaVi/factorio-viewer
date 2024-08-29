import {Rational,mult,div} from "./rational2.js";

class Solver {
	constructor(data, cost) {
		// cost is 'normal' or 'expensive'
		// create table of recipes
		// {item:amount/s,recipe:1}
		// cost is added later
		const recipes = {};

		for (const [recipename, recipe] of Object.entries(data.pdata.recipe)) {
			const entry = {};

			for (const [ing, amt] of recipe.normal.ingredients) {
        if(!(ing in entry)){
          entry[ing] = createrational(0);
        }
        entry[ing].sub(div(amt, recipe.normal.time));
			}

			for (const [res, amt] of recipe.normal.result) {
        if(!(res in entry)){
          entry[res] = createrational(0);
        }
        entry[res].add(div(amt, recipe.normal.time));
			}

			entry['recipe.' + recipename] = new Rational(1);
			recipes['recipe.' + recipename] = entry;
		}

		for (const [pumpname, pump] of Object.entries(data.data['offshore-pump'])) {
			recipes['pump.' + pumpname] = {
				'pump.' + pumpname: new Rational(1);
				pump.fluid: new Rational(pump.pumping_speed * 60)
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
            entry[res] = new Rational(0);
          }
          entry[res].add(div(amount, mining_time));
				}
			} else {
				const {result: res, count: amount = 1} = normalizeresult(result);
        entry[res] = div(amount, mining_time);
			}

			if ('fluid_amount' in resource.minable) {
				const {fluid_amount: amount, required_fluid: fluid} = resource.minable;
				if (amount > 0) {
        	entry[fluid]=div(-amount,mining_time);
				}
			}

			entry['mine.' + resourcename] = new Rational(1);
			recipes['mine.' + resourcename] = entry;
		}

		this.recipes = recipes;
	}

	creatematrix() {
		const matrix = {};
		for (const [recipename, recipe] of Object.entries(this.recipes)) {
			const row = {};
			for (const [item, amount] of Object.entries(recipe)) {
				row[item] = new Rational(amount);
			}
			row['.cost'] = 1; // for now
			matrix[recipename] = row;
		}
		// TODO: a processing step to remove net negative loops
		return matrix;
	}

	solve(out) {
		// uses the simplex algorithm
		const matrix = this.creatematrix();
	}
}