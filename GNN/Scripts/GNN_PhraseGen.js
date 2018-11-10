/* jshint bitwise:false, forin:false */
/* global clock,expandDescription,expandMissionText,galaxyNumber,log,player,system,worldScripts,System,Timer */
/* (C) Disembodied and Svengali 2009-2018, License CC-by-nc-sa-4.0 */
(function(){
"use strict";
this.name = "GNN_PhraseGen";

this.$recGuard = true;
this.$galaxyStats = [];
this.startUp = function(){
	delete this.startUp;
	this.$init = true;
	this.$spec = {
		currentSystem: {},
		rndBrew: [],
		rndFirstName: [],
		rndShipName: [],
		rndSurName: [],
		rndSystem: [],
		idsA: ["I","II","III","IV","V","VI","VII","IX","X"],
		idsB: ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"],
		idsC: ["0","1","2","3","4","5","6","7","8","9"]
	};
	this.$pool = worldScripts.GNN_Words.pool;
	this.$irNouns = worldScripts.GNN_Words.irregularNouns;
	this.$irVerbs = worldScripts.GNN_Words.irregularVerbs;
	this.$suptive = worldScripts.GNN_Words.superlatives;
	this._getGalaxy();
	this._fillInBits(1);
};
/* Experimental
this.startUpComplete = function(){
	var d = "",s;
	for(var i=0;i<256;i++){
		s = this.$galaxyStats[i];
		d += s.name+"|"+s.description+"#";
	}
	worldScripts.Lib_PAD._addPageInCategory("SYSTEMS.ALMANACH",{$hide:d});
};
*/
// Entry point for OXPs.
this._makePhrase = function(set,pattern,store,seed,cst){
	if(!set) return(false);
	if(typeof(set)==='object') this.$stdObj = set;
	else {
		if(typeof(this.$pool[set])==='undefined') return false;
		this.$stdObj = this.$pool[set];
	}
	var option = {
		patt: null,
		store: 0,
		seed: 0,
		cst: []
	};
	if(typeof(pattern)!=='undefined') option.patt = pattern;
	if(store) option.store = true;
	if(seed) option.seed = seed;
	if(cst) option.cst = cst;
	var t = this._buildPhrase(option.patt,option.store,option.seed,option.cst);
	return t;
};
// Entry point for OXPs.
this._addSample = function(samplename,obj,clone){
	if(typeof(obj) !== 'object' || typeof(samplename) !== 'string' || typeof(this.$pool[samplename]) !== 'undefined') return false;
	if(clone) this.$pool[samplename] = this._cloneObj(obj);
	else this.$pool[samplename] = obj;
	return true;
};
this._fillInBits = function(rep){
	this.$spec.rndBrew = [];
	this.$spec.rndFirstName = [];
	this.$spec.rndShipName = [];
	this.$spec.rndSurName = [];
	if(rep) this.$spec.rndSystem = this.$galaxyStats;
	this._setCur();
	this.$spec.rndFirstName.push(this._makePhrase("GNN_Names","1"));
	this.$spec.rndFirstName.push(this._makePhrase("GNN_Names","2"));
	this.$spec.rndFirstName.push(this._makePhrase("GNN_Names","12"));
	this.$spec.rndSurName.push(this._makePhrase("GNN_Names","{1"));
	this.$spec.rndSurName.push(this._makePhrase("GNN_Names","{1"));
	this.$spec.rndSurName.push(this._makePhrase("GNN_Names","{1"));
	this.$spec.rndBrew.push(this._makePhrase("GNN_NamesBrews"));
	this.$spec.rndShipName.push(this._makePhrase("GNN_NamesShips"));
	delete this.$init;
};
this._setCur = function(){
	if(system.isInterstellarSpace) this.$spec.currentSystem = {description:"interstellar",economy:-1,government:-1,ID:-1,inhabitant:"none",name:"interstellar",population:-1,productivity:-1,radius:-1,sun:false,techlevel:-1};
	else this.$spec.currentSystem = this.$galaxyStats[system.ID];
};
this.shipWillDockWithStation = function(){
	if(!system.isInterstellarSpace) this._fillInBits();
};
this.shipWillLaunchFromStation = function(){
	this._setCur();
};
this.playerEnteredNewGalaxy = function(){
	this.$init = true;
	this._getGalaxy();
	this._fillInBits(1);
};
this.shipWillExitWitchspace = function(){
	if(this.$init) return;
	this._setCur();
};
this.$stdObj = {
	fieldA:[],fieldB:[],fieldC:[],fieldD:[],fieldE:[],fieldF:[],fieldG:[],fieldH:[],fieldI:[],
	fieldJ:[],fieldK:[],fieldL:[],fieldM:[],fieldN:[],fieldO:[],fieldP:[],fieldQ:[],fieldR:[],
	sentences:[],custom:[],splitRules:[]
};
this.$fields = [["fieldA","fieldJ"],["fieldB","fieldK"],["fieldC","fieldL"],["fieldD","fieldM"],
	["fieldE","fieldN"],["fieldF","fieldO"],["fieldG","fieldP"],["fieldH","fieldQ"],["fieldI","fieldR"]];
this._cloneObj = function(srcInstance){
	if(typeof(srcInstance)!=='object' || srcInstance===null) return srcInstance;
	var newInstance = srcInstance.constructor();
	for(var i in srcInstance) newInstance[i] = this._cloneObj(srcInstance[i]);
	return newInstance;
};
this._random = function(maxnum){
	return maxnum*(Math.random()%1) | 0;
};
// Random number in range a-b in steps of s
this._rndRange = function(a,b,s){
	var x = Math.random();
	var y = (b*x)-(a*x)+1;
	if(!y) return a;
	var z = Math.floor(y/s);
	return a+z*s;
};
// First letter uppercase
this._initialCap = function(str){
	if(!str) return "";
	return str[0].toUpperCase() + str.substr(1);
};
// Rules
this._makePlural = function(word){
	// e,f,h,o,s,x,y
	if(/[^es]s$/.test(word)) return word;
	if(/fe$/.test(word)) return word.replace(/fe$/,"ves");
	if(/e$/.test(word)) return word + "s";
	if(/(?:[^ei]x|[^o]o|[es]s|[cs]h)$/.test(word)) return word + "es";
	if(/s$/.test(word)) return word;
	if(/[^aeou]y$/.test(word)) return word.replace(/y$/,"ies");
	if(/[^erf]f$/.test(word)) return word.replace(/f$/,"ves");
	if(/[ei]x$/.test(word)) return word.replace(/[ei]x$/,"ices");
	return word + "s";
};
// Rules
this._makePast = function(word){
	// b,e,l,p,y
	if(/e$/.test(word)) return word + "d";
	if(/[^aeou]y$/.test(word)) return word.replace(/y$/,"ied");
	if(/[^adeliosy][aeioy][bcdfgjklmnpqrsvz]$/.test(word)) return word + word[word.length-1] + "ed";
	return word + "ed";
};
this._makeVerbPhrase = function(word,tense,markPlural){
	var wsp = word.split(" ");
	var wspl = wsp.length;
	for(var i=0;i<wspl;i++){
		var t = wsp[i].match(/[\$&]/g);
		if(t && t.length){
			var raw = wsp[i].replace(/[\$&]/g,""),flagP,flagS,flagH,flagI;
			var ex = raw.match(/[^A-Za-z=]/g);
			if(ex) raw = raw.replace(/[^A-Za-z=]/g,"");
			var tl = t.length;
			for(var o=0;o<tl;o++){
				switch(t[o]){
					case "&":
						flagI=1;
						raw = raw.replace(/=/," ");
						if(typeof(this.$irVerbs[raw])!=='undefined') raw = this.$irVerbs[raw][(tense<4?tense:3)];
						else flagI=0;
						break;
					case "$":
						switch(tense){
							case 0: if(markPlural) flagS=1; break;
							case 1: if(!flagI) flagS=1; break;
							case 2: flagP=1; break;
							case 3: flagP=1; break;
							case 4: flagH=1; flagP=1; break;
						}
						break;
				}
			}
			if(flagS) raw = this._makePlural(raw);
			if(flagI) flagI = 0;
			else if(flagP) raw = this._makePast(raw);
			if(flagH) raw = (markPlural?"have ":"has ")+raw;
			if(ex) raw = raw + ex[0];
			wsp[i] = raw;
		}
	}
	return wsp.join(" ");
};
this._handleRules = function(wrd,tense,nextPlural,markShift,donot){
	if(/[\$$^&]/.test(wrd)){
		var irregNoun = 0;
		// Verbs
		if(/\$/.test(wrd)) wrd = this._makeVerbPhrase(wrd,tense,nextPlural);
		else { // Nouns
			var ex = wrd.match(/[^A-Za-z=]/g);
			if(ex) wrd = wrd.replace(/[^A-Za-z=&]/g,"");
			if(/&/g.test(wrd)){
				irregNoun = 1;
				wrd = wrd.replace(/&/,"");
			}
			if(nextPlural){
				if(irregNoun && typeof(this.$irNouns[wrd])!=='undefined') wrd = this.$irNouns[wrd];
				else wrd = this._makePlural(wrd);
			}
			if(ex) wrd = wrd + ex[0];
		}
	} else {
		if(nextPlural && donot<2) wrd = this._makePlural(wrd);
	}
	return wrd;
};
this._handleCombiners = function(wrd,markShift,rec){
	var last = 0;
	var z = wrd.indexOf("[");
	var y = wrd.charAt(z+1);
	var x = this.$fields[y-1][markShift];
	var w = this._getField(x,last,rec);
	wrd = wrd.replace(/\[\d\]/,w[0]);
	last = w[1];
	if(rec<5){
		if(/\[\d\]/g.test(w[0])){
			rec++;
			wrd = this._handleCombiners(wrd,markShift,rec);
		}
		rec--;
		if(/\[\d\]/g.test(wrd)){
			rec++;
			wrd = this._handleCombiners(wrd,markShift,rec);
		}
		rec--;
	} else if(this.$recGuard) log(this.name,"Warning! - FieldCombiner recursion limit.\n\nwrd:"+wrd+" : "+x+" : "+y+" : "+z+" : "+rec);
	return wrd;
};
this._handleNV = function(word,tense,nextPlural,markShift){
	var wr = word.split(" ");
	var n = wr.length;
	for(var i=0;i<n;i++){
		var wrd = wr[i];
		// field combiner
		if(/\[\d\]/g.test(wrd)) wrd = this._handleCombiners(wrd,markShift,0);
		// Verbs, nouns
		var c = wrd.split(" ");
		if(c.length>1){
			var cc = c.length;
			for(var o=0;o<cc;o++){
				c[o] = this._handleRules(c[o],tense,nextPlural,markShift,cc);
			}
			wrd = c.join(" ");
		} else wrd = this._handleRules(wrd,tense,nextPlural,markShift,n);
		wrd = wrd.replace(/&$/,"");
		wr[i] = wrd;
	}
	word = wr.join(" ");
	return word;
};
this._cmpConditions = function(w,c,v,a){
	switch(c){
		case "<":
			if(a<2){
				if(this.$spec.currentSystem[w]<v) return true;
			} else if(this.$spec.rndSystem[this.$lSys][w]<v) return true;
			break;
		case ">":
			if(a<2){
				if(this.$spec.currentSystem[w]>v) return true;
			} else if(this.$spec.rndSystem[this.$lSys][w]>v) return true;
			break;
		case ":":
			if(a<2){
				if(this.$spec.currentSystem[w]==v) return true;
			} else if(this.$spec.rndSystem[this.$lSys][w]==v) return true;
			break;
		case "!":
			if(a<2){
				if(this.$spec.currentSystem[w]!=v) return true;
			} else if(this.$spec.rndSystem[this.$lSys][w]!=v) return true;
			break;
	}
	return false;
};
this._parseConditions = function(wrd,remB){
	var left = false, right = false, compare = 1, w = wrd.split(")"), c;
	var wl = w.length;
	for(var q=0;q<wl;q++){
		var ex = w[q].match(/\(/g);
		if(ex){
			var exl = ex.length;
			for(var i=0;i<exl;i++){
				compare = 1;
				var con = w[q].match(/\(.*/);
				var act = con[0].split("="); // split conditions from actions (Sg:0,e<5 [4]|[7]
				switch(act[0].charAt(1)){ // A,B,D,M,P,S,X,Y
					case "A": compare = 5; break;
					case "B": compare = 3; break;
					case "D": compare = 4; break;
					case "M": return expandMissionText(act[0].substr(3));
					case "S":
						compare = 2;
						// prepare @S
						if(this.$lSys<0) this._getRNDSystem();
						break;
					case "X": return expandDescription("["+act[0].substr(3)+"]");
					case "Y": compare = 6; break;
				}
				// conditions
				switch(compare){
					case 1:
					case 2:
						c = act[0].substr(2).split(","); // multiple conditions
						var cl = c.length;
						for(var u=0;u<cl;u++){
							var cx = c[u][1], cy = c[u].substr(2), cz;
							switch(c[u][0]){
								case "c": cz = "productivity"; break;
								case "d":
									var rega = new RegExp(cy,"g");
									if(compare===1) left = rega.test(this.$spec.currentSystem.description);
									else left = rega.test(this.$spec.rndSystem[this.$lSys].description);
									if(cx==='!') left = !left;
									break;
								case "e": cz = "economy"; break;
								case "g": cz = "government"; break;
								case "i":
									var regb = new RegExp(cy,"gi");
									if(compare===1) left = regb.test(this.$spec.currentSystem.inhabitant);
									else left = regb.test(this.$spec.rndSystem[this.$lSys].inhabitant);
									if(cx==='!') left = !left;
									break;
								case "p": cz = "population"; break;
								case "r": cz = "radius"; break;
								case "s": cz = "sun"; break;
								case "t": cz = "techlevel"; break;
							}
							if(cz) left = this._cmpConditions(cz,cx,cy,compare);
							if(!left) break;
						}
						break;
					case 3: //Bits
						c = act[0].substr(2);
						var bitID = parseInt(c)%30;
						if(act.length<2){
							if(c[c.length-1]==="+"){
								this.$bits |= (1<<bitID);
								left = true;
							} else if(c[c.length-1]==="-"){
								this.$bits &= ~(1<<bitID);
								left = true;
							}
						}
						if((this.$bits&(1<<bitID))!=0) left = true;
						break;
					case 4: //Dice
						c = act[0].substr(2);
						if(act.length<2){
							var ns = c.split(",");
							right = this._rndRange(+ns[0],+ns[1],+ns[2]);
							left = true;
						} else {
							if(c>Math.floor(Math.random()*100)) left = true;
						}
						break;
					case 5: //All
						c = parseInt(act[0].substr(2));
						if((this.$bits&c)===c) left = true;
						break;
					case 6: //Any
						c = parseInt(act[0].substr(2));
						if(this.$bits&c) left = true;
						break;
				}
				// actions
				if(act.length>1){
					var acc = act[1].split("|");
					if(!left){
						if(acc.length>1) right = acc[1];
					} else right = acc[0];
				}
				if(right) w[q] = w[q].replace(/\(.*/,right);
				else w[q] = w[q].replace(/\(.*/,"");
			}
		}
	}
	wrd = w.join("");
	if(remB) wrd = wrd.replace(/[\[\]]/g,"");
	return wrd;
};
this._getField = function(field,last,rec){
	var sp = this.$stdObj[field].length;
	var r = this._random(sp);
	if(this.$salt) r = ((0x357941*this.$salt)>>16)%sp;
	else if(r===last) r = this._random(sp);
	if(rec){
		if(rec===5) r = sp-1;
		else r = (r+rec)%sp;
	}
	var wrd = this.$stdObj[field][r];
	if(/\([ABDMPSXY]/g.test(wrd)) wrd = this._parseConditions(wrd);
	return([wrd,r]);
};
this._getRNDSystem = function(){
	var sp = this.$spec.rndSystem.length,r;
	if(this.$salt) r = ((0x357941*this.$salt)>>16)%sp;
	else {
		r = this._random(sp);
		var reselect = 0;
		while(r===this.$lSys){
			r = this._random(sp);
			reselect++;
			if(reselect>10) break;
		}
	}
	this.$lSys = r;
	return r;
};
this._buildPhrase = function(OXPPattern,store,sd,cst,cpf,foo){
	var pattern, cp = -1;
	if(sd) sd = sd&0x1ff;
	if(OXPPattern){
		if(typeof(OXPPattern)==='object'){
			cp = this._random(OXPPattern.length);
			pattern = OXPPattern[cp];
		} else {
			cp = 0;
			pattern = OXPPattern;
		}
	} else {
		if(sd){
			var sp = this.$stdObj.sentences.length;
			cp = ((0x357941*sd)>>16)%sp;
		} else cp = this._random(this.$stdObj.sentences.length);
		pattern = this.$stdObj.sentences[cp];
	}
	var aFlag = 0, markShift = 0, tense = 0, nextPlural = 0, nextSpecial = 0, nextUpper = 1;
	var lastA = -1, lastB = -1, lastC = -1, lastD = -1, lastE = -1, lastF = -1, lastG = -1, lastH = -1, lastI = -1;
	var info = {num:""}, za = [], zb = 0, zc = [], zd = 0, wOffset = 0, lasts;
	if(!foo){
		this.$lSys = -1; this.$salt = (sd?sd:0)&0x1ff; this.$bits = 0; this.$limit = 0;
		if(this.$stdObj.custom && this.$stdObj.custom.length){
			if(!cst) this.$bits = this.$stdObj.custom[0];
			else {
				this.$bits = cst[0];
				this.$stdObj.custom = cst;
			}
		}
		lasts = {rndBrew:[],rndFirstName:[],rndSurName:[],rndShipName:[],rndSystem:[],rndTitle:[],lastWords:[]};
	} else {
		lasts = foo;
		wOffset = foo.lastWords.length;
		nextUpper = 0;
	}
	if(/\([ABDMPSXY]/g.test(pattern)){
		za = pattern.match(/\([a-zA-Z0-9,:!><=\)\[\]\| @\+-_\{\}]+\)/g);
		pattern = pattern.replace(/\([a-zA-Z0-9,:!><=\)\[\]\| @\+-_\{\}]+\)/g,"@?");
	}
	if(/\[[a-zA-Z_]+\]/g.test(pattern)){
		zc = pattern.match(/\[[a-zA-Z_]+\]/g);
		pattern = pattern.replace(/\[[a-zA-Z_]+\]/g,"@[");
	}
	pattern = pattern.split(" ");
	var denpat = pattern.length, r = -1, tmp = null;
	for(var p=0;p<denpat;p++){
		var lenpat = pattern[p].length, txt = "", wrd = "", pushit = 0;
		for (var ichr = 0; ichr < lenpat; ichr++){
			var chr = pattern[p].charAt(ichr);
			if(!nextSpecial){
				switch(chr){
					case '@': nextSpecial = 1; continue;
					case '1':
						tmp = this._getField(this.$fields[0][markShift],lastA);
						wrd = tmp[0]; lastA = tmp[1]; pushit = 1;
						wrd = this._handleNV(wrd,tense,nextPlural,markShift);
						break;
					case '2':
						tmp = this._getField(this.$fields[1][markShift],lastB);
						wrd = tmp[0]; lastB = tmp[1]; pushit = 1;
						wrd = this._handleNV(wrd,tense,nextPlural,markShift);
						break;
					case '3':
						tmp = this._getField(this.$fields[2][markShift],lastC);
						wrd = tmp[0]; lastC = tmp[1]; pushit = 1;
						wrd = this._handleNV(wrd,tense,nextPlural,markShift);
						break;
					case '4':
						tmp = this._getField(this.$fields[3][markShift],lastD);
						wrd = tmp[0]; lastD = tmp[1]; pushit = 1;
						wrd = this._handleNV(wrd,tense,nextPlural,markShift);
						break;
					case '5':
						tmp = this._getField(this.$fields[4][markShift],lastE);
						wrd = tmp[0]; lastE = tmp[1]; pushit = 1;
						wrd = this._handleNV(wrd,tense,nextPlural,markShift);
						break;
					case '6':
						tmp = this._getField(this.$fields[5][markShift],lastF);
						wrd = tmp[0]; lastF = tmp[1]; pushit = 1;
						wrd = this._handleNV(wrd,tense,nextPlural,markShift);
						break;
					case '7':
						tmp = this._getField(this.$fields[6][markShift],lastG);
						wrd = tmp[0]; lastG = tmp[1]; pushit = 1;
						wrd = this._handleNV(wrd,tense,nextPlural,markShift);
						break;
					case '8':
						tmp = this._getField(this.$fields[7][markShift],lastH);
						wrd = tmp[0]; lastH = tmp[1]; pushit = 1;
						wrd = this._handleNV(wrd,tense,nextPlural,markShift);
						break;
					case '9':
						tmp = this._getField(this.$fields[8][markShift],lastI);
						wrd = tmp[0]; lastI = tmp[1]; pushit = 1;
						wrd = this._handleNV(wrd,tense,nextPlural,markShift);
						break;
					case '.': wrd = chr; nextUpper = 2; break;
					case '!': wrd = chr; nextUpper = 2; break;
					case '?': wrd = chr; nextUpper = 2; break;
					case '#': tense = 1; continue;
					case '_': tense = 2; continue;
					case '^': tense = 3; continue;
					case '*': tense = 4; continue;
					case '>': nextPlural = 1; continue;
					case '<': nextPlural = 0; continue;
					case '|': nextPlural = (Math.random()>0.5?1:0); continue;
					case '+': nextUpper = 1; continue;
					case '{': markShift = 1; continue;
					case '}': markShift = 0; continue;
					default: wrd = chr;
				}
				if(pushit && store){
					if(info[p]) info[p] += wrd;
					else info[p] = wrd;
				}
				tense = 0; nextPlural = 0;
			} else { // @
				var where = "", sys = false, ovr = false, spc;
				switch(chr){
					case 'a':
						r = this._random(this.$spec.idsA.length);
						wrd = this.$spec.idsA[r];
						if(store) info.num += wrd;
						break;
					case 'B': wrd = player.bounty+" Cr"; break;
					case 'b':
						r = this._random(this.$spec.idsB.length);
						wrd = this.$spec.idsB[r];
						if(store) info.num += wrd;
						break;
					case 'C': wrd = player.name; break;
					case 'c':
						r = this._random(this.$spec.idsC.length);
						wrd = this.$spec.idsC[r];
						if(store) info.num += wrd;
						break;
					case 'D': wrd = player.ship.displayName; break;
					case 'd': wrd = String(clock.days-Math.floor(Math.random()*7)); break;
					case 'F':
						where = "rndFirstName";
						break;
					case 'f':
						if(lasts.rndFirstName.length){
							if(+pattern[p].charAt(ichr+1)+1){ // trickery
								wrd = lasts.rndFirstName[+pattern[p].charAt(ichr+1)];
								ichr++;
							} else wrd = lasts.rndFirstName[lasts.rndFirstName.length-1];
						} else where = "rndFirstName";
						break;
					case 'h':
						if(this.$lSys<0) r = this._getRNDSystem();
						wrd = this.$spec.rndSystem[this.$lSys].inhabitant.toLowerCase();
						lasts.lastWords.push(wrd);
						if(store) info.lastInhabitant = wrd;
						break;
					case 'I': wrd = player.ship.name; break;
					case 'i':
						if(lasts.rndShipName.length){
							if(+pattern[p].charAt(ichr+1)+1){ // trickery
								wrd = lasts.rndShipName[+pattern[p].charAt(ichr+1)];
								ichr++;
							} else wrd = lasts.rndShipName[lasts.rndShipName.length-1];
						} else where = "rndShipName";
						break;
					case 'L': wrd = player.legalStatus; break;
					case 'N':
						where = "rndSurName";
						break;
					case 'n':
						if(lasts.rndSurName.length){
							if(+pattern[p].charAt(ichr+1)+1){ // trickery
								wrd = lasts.rndSurName[+pattern[p].charAt(ichr+1)];
								ichr++;
							} else wrd = lasts.rndSurName[lasts.rndSurName.length-1];
						} else where = "rndSurName";
						break;
					case 'P':
						wrd = this.$spec.currentSystem.name;
						if(store) info.currentSystemName = wrd;
						break;
					case 'R': wrd = player.rank; break;
					case 'S':
						sys = true;
						ovr = true;
						where = "rndSystem";
						break;
					case 's':
						sys = true;
						where = "rndSystem";
						break;
					case 'T': wrd = (player.ship.target?player.ship.target.name:""); break;
					case 'W':
						wrd = this._parseConditions("(Si:human=[GNN_Names]|[GNN_NamesOther])");
						if(this.$limit<3){
							this.$limit++;
							var wwa = this.$stdObj;
							this.$stdObj = this.$pool[wrd.substr(1,wrd.length-2)];
							wrd = this._buildPhrase(null,0,sd,0,0,lasts);
							if(!this.$stdObj.splitRules) lasts.lastWords.push(wrd);
							this.$stdObj = wwa;
							if(store) info[p] = wrd;
							this.$limit--;
						}
						break;
					case 'X':
						if(this.$lSys<0) r = this._getRNDSystem();
						break;
					case 'Y':
						if(this.$stdObj.custom){
							if(+pattern[p].charAt(ichr+1)+1){ // trickery
								wrd = this.$stdObj.custom[+pattern[p].charAt(ichr+1)];
								ichr++;
							}
						}
						break;
					case 'Z':
						where = "rndBrew";
						break;
					case 'z':
						if(lasts.rndBrew.length){
							if(+pattern[p].charAt(ichr+1)+1){ // trickery
								wrd = lasts.rndBrew[+pattern[p].charAt(ichr+1)];
								ichr++;
							} else wrd = lasts.rndBrew[lasts.rndBrew.length-1];
						} else where = "rndBrew";
						break;
					case '0':
					case '1':
					case '2':
					case '3':
					case '4':
					case '5':
					case '6':
					case '7':
					case '8':
					case '9':
						if(foo){
							if(lasts.lastWords.length>chr) wrd = lasts.lastWords[+chr+wOffset];
						} else {
							if(lasts.lastWords.length>chr) wrd = lasts.lastWords[+chr];
						}
						break;
					case '?':
						var zla;
						wrd = this._parseConditions(za[zb]);
						if(wrd.charAt(0)===" "){
							spc = 1;
							wrd = wrd.trim();
						}
						if(/\[\d\]/.test(wrd)) wrd = this._handleCombiners(wrd,markShift,0);
						wrd = this._handleNV(wrd,tense,nextPlural,markShift);
						if(this.$limit<3 && /\[[a-zA-Z_]+\]/.test(wrd)){
							zla = wrd.substr(1,wrd.length-2);
							if(this.$pool[zla]){
								this.$limit++;
								var wwb = this.$stdObj;
								this.$stdObj = this.$pool[zla];
								wrd = this._buildPhrase(null,0,sd,0,0,lasts);
								if(!this.$stdObj.splitRules) lasts.lastWords.push(wrd);
								this.$stdObj = wwb;
								if(store) info[p] = wrd;
								wOffset = 0;
								this.$limit--;
							}
						} else if(/[\{\}]/.test(wrd)){
							if(wrd==="{") markShift = 1;
							if(wrd==="}") markShift = 0;
							wrd = wrd.substr(1);
						} else {
							if(this.$limit>2){
								if(this.$recGuard) log(this.name,"Warning! - Sample recursion limit. "+zla);
							}
							if(!this.$stdObj.splitRules) if(wrd) lasts.lastWords.push(wrd);
						}
						if(spc) wrd = " "+wrd;
						zb++;
						break;
					case '[':
						var zlb = zc[zd];
						var zk = zlb.substr(1,zlb.length-2);
						if(this.$limit<3 && this.$pool[zk]){
							this.$limit++;
							var wwc = this.$stdObj;
							this.$stdObj = this.$pool[zk];
							wrd = this._buildPhrase(null,0,sd,0,0,lasts);
							if(!this.$stdObj.splitRules) lasts.lastWords.push(wrd);
							this.$stdObj = wwc;
							if(store) info[p] = wrd;
							this.$limit--;
						} else {
							if(this.$limit>2){
								if(this.$recGuard) log(this.name,"Warning! - Sample recursion limit. "+zlb);
								wrd = zlb;
							}
						}
						zd++;
						break;
					default: wrd = chr;
				}
				if(where){
					if(sys){
						if(ovr || (sys && this.$lSys<0)) r = this._getRNDSystem();
						wrd = this.$spec[where][this.$lSys].name;
						if(nextPlural){
							wrd = this._makePlural(wrd);
							nextPlural = 0;
						}
					} else {
						r = this._random(this.$spec[where].length);
						wrd = this.$spec[where][r];
					}
					lasts[where].push(wrd);
				}
				if(wrd && wrd[0]==="@"){
					pattern[p] = pattern[p].replace(/@\?/,wrd);
					p--;
					nextSpecial = 0;
					continue;
				}
				nextSpecial = 0;
			}
			if(nextUpper){
				if(nextUpper>1) nextUpper--;
				else {
					wrd = this._initialCap(wrd);
					nextUpper = 0;
				}
			}
			txt += wrd;
		}
		pattern[p] = txt;
		if(txt.length===1){
			if(txt==="a") aFlag = 1;
			else if(txt==="A") aFlag = 2;
			else aFlag = 0;
		} else {
			if(aFlag){
				if(typeof(this.$suptive[txt])!=='undefined'){
					var rep = pattern[p-1].split(" ");
					if(aFlag>1) rep[rep.length-1] = "The";
					else rep[rep.length-1] = "the";
					pattern[p-1] = rep.join(" ");
				} else {
					if(/^[FHLMNRSX][A-Z]/.test(txt)) pattern[p-1] = pattern[p-1]+"n"; // a -> an
					else if(/^u/i.test(txt)){
						if(/^u[^aeiou\d\s][^aeiou\d\s]/i.test(txt)) pattern[p-1] = pattern[p-1]+"n"; // a -> an
						else if(/^un[aeou]/i.test(txt)) pattern[p-1] = pattern[p-1]+"n"; // a -> an
						else if(/^uni/i.test(txt) && /^unim|(?:ive|ble)$/i.test(txt)) pattern[p-1] = pattern[p-1]+"n"; // a -> an
					} else {
						if(/^(?:[aei]|o[^ne]|ho(?:ur|nest|no|mage|mbre|rs d')|he(?:ir|rb))/i.test(txt)) pattern[p-1] = pattern[p-1]+"n"; // a -> an
					}
				}
				aFlag = 0;
			} else if(/\ba\b$/.test(txt)) aFlag = 1;
		}
	}
	if(!foo || (foo && this.$limit===1)){
		if(this.$stdObj.splitRules){
			switch(this.$stdObj.splitRules[cp]){
				case 1:
					lasts.rndFirstName.push(pattern[0]);
					lasts.rndSurName.push(pattern[1]);
					lasts.rndTitle.push("");
					break;
				case 2:
					lasts.rndSurName.push(pattern[0]);
					lasts.rndFirstName.push("");
					lasts.rndTitle.push("");
					break;
				case 3:
					lasts.rndFirstName.push(pattern[0]);
					lasts.rndTitle.push(pattern[1]);
					lasts.rndSurName.push(pattern[2]);
					break;
				case 4:
					lasts.rndTitle.push(pattern[0]);
					lasts.rndFirstName.push(pattern[1]);
					lasts.rndSurName.push(pattern[2]);
					break;
				case 21:
					lasts.rndShipName.push(pattern.join(" "));
					break;
				case 22:
					lasts.rndBrew.push(pattern.join(" "));
					break;
			}
		}
	}
	var fin = pattern.join(" ");
	if(cpf){
		if(store){
			info.store = lasts;
			info.bits = parseInt(this.$bits);
			return([fin,info,cp,lasts]);
		} else return([fin,cp,lasts]);
	}
	if(store){
		info.store = lasts;
		info.bits = parseInt(this.$bits);
		return([fin,info]);
	}
	return fin;
};
this.systemInformationChanged = function(gal,sys,key,newValue){
	if(gal!==galaxyNumber || !this.$galaxyStats.length || sys<0 || sys>255) return;
	var nope = ["description","economy","ID","government","inhabitant","name","population","productivity","radius","sun_gone_nova","techlevel"].indexOf(key);
	if(nope===-1) return;
	if(key==="sun_gone_nova") this.$galaxyStats[sys].sun = (newValue?false:true);
	else this.$galaxyStats[sys][key] = newValue;
};
// Still slow! The string expansion (descriptions,etc) are eating it up.
this._getGalaxy = function(){
	this.$galaxyStats = [];
	var gn = galaxyNumber,c,sy;
	for(var i=0;i<256;i++){
		c = System.infoForSystem(gn,i);
		sy = {
			description: c.description,
			economy: c.economy,
			government: c.government,
			ID: i,
			inhabitant: c.inhabitant,
			name: c.name,
			population: c.population,
			productivity: c.productivity,
			radius: c.radius,
			sun: (c.sun_gone_nova?false:true),
			techlevel: c.techlevel
		};
		this.$galaxyStats.push(sy);
	}
};
}).call(this);
