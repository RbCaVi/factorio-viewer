function tofrac(num) {
		var denom=1;
		var epsilon=0.00001;
		var factor=2*3*5*7;//*11;
		while(Math.abs(Math.round(num)-num)>epsilon||Math.abs(Math.round(denom)-denom)>epsilon){
			num*=factor;
			denom*=factor;
		}
		num=Math.round(num);
		denom=Math.round(denom);
		return [num,denom];
}

class Rational{
	constructor(num,denom=1){
		var n1,d1,n2,d2;
		if(num instanceof Rational){
			n1=num.num;
			d1=num.denom;
		}else{
			[n1,d1]=tofrac(num);
		}
		if(denom instanceof Rational){
			n2=denom.denom;
			d2=denom.num;
		}else{
			[d2,n2]=tofrac(denom);
		}
		this.num=n1*n2;
		this.denom=d1*d2;
		this.reduce();
	}

	reduce(){
		// find gcd https://stackoverflow.com/questions/4652468/is-there-a-javascript-function-that-reduces-a-fraction
		var a = Math.abs(this.num);
		var b = Math.abs(this.denom);
		var c;
		while (b>0) {
	    c = a % b;
	    a = b;
	    b = c;
		}
		this.num/=a;
		this.denom/=a;
		if(this.denom<0){
			this.num*=-1;
			this.denom*=-1;
		}
		return this;
	}

	mult(r2) {
		var n2,d2;
		if(r2 instanceof Rational){
			n2=r2.num;
			d2=r2.denom;
		}else{
			n2=r2;
			d2=1;
		}
		this.num*=n2;
		this.denom*=d2;
		return this;
	}

	div(r2) {
		var n2,d2;
		if(r2 instanceof Rational){
			n2=r2.num;
			d2=r2.denom;
		}else{
			n2=r2;
			d2=1;
		}
		this.num*=d2;
		this.denom*=n2;
		return this;
	}

	add(r2) {
		var n1,d1,n2,d2;
		if(r2 instanceof Rational){
			n2=r2.num;
			d2=r2.denom;
		}else{
			n2=r2;
			d2=1;
		}
		n1=this.num;
		d1=this.denom;
		this.num=n1*d2+n2*d1;
		this.denom*=d2;
		return this;
	}

	sub(r2) {
		var n1,d1,n2,d2;
		if(r2 instanceof Rational){
			n2=r2.num;
			d2=r2.denom;
		}else{
			n2=r2;
			d2=1;
		}
		n1=this.num;
		d1=this.denom;
		this.num=n1*d2-n2*d1;
		this.denom*=d2;
		return this;
	}

	positive(){
		return this.num>0;
	}

	negative(){
		return this.num<0;
	}

	iszero(){
		return this.num==0;
	}

	lessthan(r2){
		var n2,d2;
		if(r2 instanceof Rational){
			n2=r2.num;
			d2=r2.denom;
		}else{
			n2=r2;
			d2=1;
		}
		return this.num*d2<n2*this.denom;
	}

	greaterthan(r2){
		var n2,d2;
		if(r2 instanceof Rational){
			n2=r2.num;
			d2=r2.denom;
		}else{
			n2=r2;
			d2=1;
		}
		return this.num*d2>n2*this.denom;
	}
}

function div(r1,r2){
	var r=new Rational(r1);
	r.div(r2);
	return r;
}

function mult(r1,r2){
	var r=new Rational(r1);
	r.mult(r2);
	return r;
}

export {Rational,mult,div};