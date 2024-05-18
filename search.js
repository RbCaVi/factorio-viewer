function match(pattern,s){
	// find pattern in s
	const patterns=pattern.toLowerCase().split(/\s/);
	s=s.toLowerCase();
	const patternis=patterns.filter(p=>p.length>0).map(p=>[p,0]);
	const matches=[];
	for(let i=0;i<s.length;i++){
		for (let j = 0; j < patternis.length; j++) {
			const [pattern,idx] = patternis[j];
			if(idx==pattern.length){
				continue;
			}
			if(s.charAt(i)==pattern.charAt(idx)) {
				if (matches.at(-1) != i) {
					matches.push(i);
				}
				patternis[j][1]++;
			}
		}
	}
	if (patternis.every(([pattern,idx])=>idx==pattern.length)) {
		return [true,matches];
	}
	return [false,[]];
}

function comparematch(m1,m2){
	if(m1.length!=m2.length){
		throw 'unmatched lengths';
	}
	for(var i=0;i<m1.length;i++){
		if(m1[i]<m2[i]){
			return -1;
		}else if(m1[i]>m2[i]){
			return 1;
		}
	}
	return 0;
}

function compare([,,im1,lm1],[,,im2,lm2]){
	// compare the locale match first
	var empty1=lm1.length==0;
	var empty2=lm2.length==0;
	if(empty1){
		if(empty2){
			return comparematch(im1,im2);
		}else{
			return 1;
		}
	}else{
		if(empty2){
			return -1;
		}else{
			var match=comparematch(lm1,lm2);
			if(match==0){
				return comparematch(im1,im2);
			}
			return match;
		}
	}
}

function locationOf(element, array, compare, start, end) {
  var start = start || 0;
  var end = end || array.length;
  var pivot = (start+end)>>1;
  if (end - start <= 1)
    return array[pivot] > element ? pivot - 1 : pivot;
	var comp=compare(array[pivot],element);
  if (comp==0) return pivot;
  if (comp<0) {
    return locationOf(element, array, compare, pivot, end);
  } else {
    return locationOf(element, array, compare, start, pivot);
  }
}

function insort(array, element, compare) {
	var loc=locationOf(element, array, compare);
  array.splice(loc + 1, 0, element);
  return array;
}

function highlightletters(s,highlighted){
	var out=document.createElement('span');
	for(var i=0;i<s.length;i++){
		if(highlighted.includes(i)){
			var h=document.createElement('span');
			h.textContent=s.charAt(i);
			modules.template.addclasses(h,['search-highlighted']);
			out.append(h);
		}else{
			out.append(s.charAt(i));
		}
	}
	return out;
}

function itemsearch(element){
	var search=element.value;
	var scores=[];
	for(var [iname,[lname,ldesc]] of Object.entries(itemlocales)){
		var [imatched,imatch]=match(search,iname);
		var [lmatched,lmatch]=match(search,lname);
		if(imatched||lmatched){
			insort(scores,[iname,lname,imatch,imatch],compare);
		}
	}
	console.log(scores);
	var resultsdiv=element.nextElementSibling;
	resultsdiv.textContent='';
	for(let [iname,lname,imatch,lmatch] of scores){
		var structure={
			type:'div',
			contents:[
				{type:'span',contents:[highlightletters(lname,lmatch)]},
				{type:'span',contents:[highlightletters(iname,imatch)],classes:['internal-name']},
				{type:'icon',itype:'item',name:iname}
			],
			onclick:()=>{setitem(iname);}
		};
		resultsdiv.append(modules.template.renderstructure(structure));
	}
}

function setitem(item) {
	console.log('picked',item);
	var input=document.querySelector('#itemsearch');
	input.value=itemlocales[item][0];
	itemsearch(input);
	document.querySelector('.item').innerText='';
	document.querySelector('.item').append(renderitem(item));
	window.item=item;
}