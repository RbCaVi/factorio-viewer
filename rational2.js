class Rational {
	constructor(factors, sign = 1) {
		this.factors = factors;
		this.sign = sign; // -1 or 1 or 0
	}
}

const wheel = [1, 5];
const wheelsize = 6;
const startprimes = [2, 3]

function factor(n) {
	if (n == 0) {
		return new Rational({}, 0);
	}
	const sign = 1;
	if (n < 0) {
		n = -n;
		sign = -1;
	}
	const factors = {};
	for (const prime of startprimes) {
		while (n % prime == 0) {
			factors[prime] = (factors[prime] ?? 0) + 1;
			n /= prime;
		}
		if (n == 1) {
			return new Rational(factors, sign);
		}
	}
	for (let i = 0; i < Math.sqrt(n) + 1; i += wheelsize) {
		for (const j of wheel) {
			const prime = i + j; // possibly a prime
			if (prime == 1) {
				continue;
			}
			while (n % prime == 0) {
				factors[prime] = (factors[prime] ?? 0) + 1;
				n /= prime;
			}
			if (n == 1) {
				return factors;
			}
		}
	}
	factors[n] = (factors[n] ?? 0) + 1;
	return new Rational(factors, sign);
}

function fracapprox(f) {
	let epsilon = 0.001;
	let n = 0;
	const base = 2 * 3 * 5;
	const factors = {2: 1, 3: 1, 5: 1};
	while (epsilon < 0.5 && Math.abs(Math.round(f) - f) > epsilon) {
		f *= base;
		epsilon *= base;
		n += 1;
	}
	return [Math.round(f),n,factors];
}

function createrational(n) {
	const [n,power,base] = fracapprox(f);
	let num = factor(n);
	const b = pow(base, power);
	return div(num, b);
}

function add(r1, r2) {
	const {factors: f1, sign: s1} = r1;
	const {factors: f2, sign: s2} = r2;
	if (s1 == 0) {
		return r2;
	}
	if (s2 == 0) {
		return r1;
	}
	const gcd = {};
	for (const [prime, exp1] of Object.entries(f1)) {
		const exp2 = f2[prime] ?? 0;
		gcd[prime] = Math.min(exp1, exp2);
	}
	for (const [prime, exp2] of Object.entries(f2)) {
		if (!(prime in gcd)) {
			gcd[prime] = Math.min(0, exp2);
		}
	}
	let n1 = new BigInt(1), n2 = new BigInt(1);
	for (const p in gcd) {
		const prime = BigInt(p);
		const exp1 = f1[p] ?? 0;
		const exp2 = f2[p] ?? 0;
		n1 *= prime ** exp1 - gcd[p];
		n2 *= prime ** exp2 - gcd[p];
	}
	return mul(gcd, factor(s1 * n1 + s2 * n2));
}

function sub(r1, r2) {
	const {factors: f2, sign: s2} = r2;
	return add(r1, new Rational(f2, -s2));
}

function mul(r1, r2) {
	const {factors: f1, sign: s1} = r1;
	const {factors: f2, sign: s2} = r2;
	if (s1 == 0 || s2 == 0) {
		return new Rational({}, 0);
	}
	const factors = {};
	for (const [prime, exp1] of Object.entries(f1)) {
		const exp2 = f2[prime] ?? 0;
		if (exp1 + exp2 == 0) {
			continue;
		}
		factors[prime] = exp1 + exp2;
	}
	for (const [prime, exp2] of Object.entries(f2)) {
		if (!(prime in factors)) {
			factors[prime] = exp2;
		}
	}
	return new Rational(factors, s1 * s2);
}

function div(r1, r2) {
	const {factors: f1, sign: s1} = r1;
	const {factors: f2, sign: s2} = r2;
	if (s1 == 0) {
		return new Rational({}, 0);
	}
	if (s2 == 0) {
		throw new Error('division by zero!');
	}
	const factors = {};
	for (const [prime, exp1] of Object.entries(f1)) {
		const exp2 = f2[prime] ?? 0;
		if (exp1 - exp2 == 0) {
			continue;
		}
		factors[prime] = exp1 - exp2;
	}
	for (const [prime, exp2] of Object.entries(f2)) {
		if (!(prime in factors)) {
			factors[prime] = exp2;
		}
	}
	return new Rational(factors, s1 * s2);
}

export {Rational};