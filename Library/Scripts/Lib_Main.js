/* jshint bitwise:false, forin:false */
/* global _libMain,defaultFont,expandMissionText,galaxyNumber,global,log,missionVariables,oolite,player,system,worldScripts,Ship,System */
/* (C) Svengali 2016-2018, License CC-by-nc-sa-4.0 - Helper functions and data objects */
(function(){
"use strict";
this.name = "Lib_Main";
this.author = "Svengali";

/** _libMain - Main class. There's often no need to instantiate it for other AddOns.
* Just create a reference -> this._aid = worldScripts.Lib_Main._lib;
*/
this._libMain = function(){};
_libMain.prototype = {
	constructor: _libMain,
	/** Contains connected systems based on players position when
	* the game starts or player jumps to a new galaxy.
	*/
	$connections: [[],[],[],[],[],[],[],[]],
	$missionActive: null,
	/** Contains data keys of all ships.
	*/
	$ships: [],
	spc: String.fromCharCode(31),
	spcw: defaultFont.measureString(String.fromCharCode(31)),
	spcs: String.fromCharCode(32),
	spcsw: defaultFont.measureString(String.fromCharCode(32)),
	// Sanity
	$entCstChanged: [],
	$entCstPatched: false,
	$entCstRemoved: false,
	$entLastStrength: 0,

	// ***** Number *****
	/** Returns clamped Number in range min...max.
	*/
	clamp: function(n,min,max){
		return((n>max)?max:(n<min)?min:n);
	},
	/** Counts set bits in Number.
	*/
	cntBits: function(n){
		var res = 0;
		if(n<0) n = ~n;
		while(n>0){
			if((n&1)) res++;
			n>>=1;
		}
		return res;
	},
	/** Returns greatest common denominator.
	*/
	gcd: function(x,y){
		return(y===0?x:this.gcd(y,x%y));
	},
	/** Returns position of most significant bit of non-negative Number or zero.
	*/
	getMSB: function(n){
		var res = 15;
		for(var r=8;r>0;r>>=1) res = (n<1<<res)?res-r:res+r;
		return((n<1<<res)?res:res+1);
	},
	/** Modulo. Differs from JS native for negative values.
	* -2%3 = -2 while this._aid.mod(-2,3) = 1
	*/
	mod: function(x,y){
		return x-Math.floor(x/y)*y;
	},
	/** Returns random Number in range 0...n.
	*/
	rand: function(n){
		return n*(Math.random()%1) | 0;
	},
	/** Returns random Number in range min...max.
	*/
	randXY: function(min,max){
		return min+this.rand(max-min+1);
	},
	/** Returns String with converted base of Number.
	* this._aid.toBase(-29,16) = "-1d"
	*/
	toBase: function(n,bas,from){
		return parseInt(n,from || 10).toString(bas);
	},
	/** Returns String with converted base of Number. Programmers version.
	* this._aid.toBaseSign(-29,16) = "-0xffffe3"
	*/
	toBaseSign: function(n,bas){
		return (n<0?"-":"")+(bas===16?"0x":"")+(parseInt((n<0?(0xffffffffffff+n)+1:n),10)&0xffffff).toString(bas);
	},
	/** Returns String with a leading zero if n<10.
	*/
	toLZ: function(n){
		return((n!==null&&n<10&&n>=0?"0":"")+n);
	},
	/** Returns String with a leading zeros if n<100.
	*/
	toLZZ: function(n){
		return(n!==null&&n<100&&n>=0?"0"+this.toLZ(n):""+n);
	},
	/** Returns String with specified length filled with leading zeros.
	*/
	toNLZ: function(n,len){
		return ("0000000000000000"+n).substr(-len);
	},
	/** Returns rounded Number with specified precision.
	*/
	toPrec: function(n,p){
		if(!n) return 0;
		var y = Math.pow(10,p);
		return Math.round(n*y)/y;
	},

	// ***** String *****
	/** Returns reverted String.
	*/
	strRev: function(str){
		if(!str) return "";
		var i = str.length, res = "";
		while(i--) res += str[i];
		return res;
	},
	/** Returns random String with specified length.
	*/
	strRND: function(len,chars){
		chars = chars || 'abcdefghijklmnopqrstuvwxyz';
		var res = '', rndPos;
		for(var i=0;i<len;i++){
			rndPos = Math.floor(Math.random()*chars.length);
			res += chars.substring(rndPos,rndPos+1);
		}
		return res;
	},
	/** Returns random numbered String with specified length.
	*/
	strRNDInt: function(len){
		var res = String(1000000000+Math.random()*1000000000 | 0);
		return res.substr(0,len);
	},
	/** Returns trimmed String. Unlike .trim() it also removes control chars.
	*/
	strTrim: function(str){
		return str.replace(/[\f\r\n\t\v]/g,"").trim();
	},

	// ***** Array *****
	/** Merges nested Arrays
	*/
	arrConcat: function(arrA,arrB){
		if(this.typeGet(arrB)!=="array") return arrA;
		var res = arrA.slice(0), na = arrB.slice(0);
		var la = res.length, lb = na.length;
		for(var i=0;i<lb;i++){
			if(i>la-1) break;
			if(this.typeGet(na[i])==="array") res[i] = res[i].concat(na[i]);
		}
		return res;
	},
	/** Returns difference between Arrays. Strict equality.
	*/
	arrDiff: function(a,b,oneway){
		var res = [], i = a.length;
		while(i--) if(b.indexOf(a[i])===-1) res.push(a[i]);
		if(oneway) return res;
		i = b.length;
		while(i--) if(a.indexOf(b[i])===-1) res.push(b[i]);
		return res;
	},
	/** Returns flattened Array.
	*/
	arrFlat: function(arr){
		return this._arrFlatten(arr,[]);
	},
	/** Returns Array with min and max of flat input Array containing only numbers.
	*/
	arrMinMax: function(arr){
		return [Math.min.apply(Math,arr),Math.max.apply(Math,arr)];
	},
	/** Returns Array without specified element. Strict equality.
	*/
	arrOmit: function(arr,ele){
		var len = arr.length, res = arr.slice(0);
		for(var i=0;i<len;i++){
			if(res[i]===ele) res.splice(i,1);
		}
		return res;
	},
	/** Returns shuffled Array.
	*/
	arrShuffle: function(arr){
		var j,k,t, res = arr.slice(0);
		j = res.length;
		do{
			k = (Math.random()*(j--))<<0;
			t = res[j];
			res[j] = res[k];
			res[k] = t;
		} while(j);
		return res;
	},
	/** Returns sorted Array of Objects. Selectionsort.
	*/
	arrSortBy: function(arr,prop){
		var res = arr.slice(0), len = res.length, min,i,j;
		for(i=0;i<len;i++){
			min = i;
			for(j=i+1;j<len;j++){
				if(j>0 && j<len && res[j][prop]<res[min][prop]) min = j;
			}
			if(i!==min) this._arrSwap(res,i,min);
		}
		return res;
	},
	/** Merges Arrays.
	*/
	arrUnion: function(){
		var len = arguments.length, res = [];
		while(len--){
			var arg = arguments[len];
			for(var i=0;i<arg.length;i++){
				var ele = arg[i];
				if(res.indexOf(ele)===-1) res.push(ele);
			}
		}
		return res;
	},
	/** Returns Array with unique entries. Strict equality.
	*/
	arrUnique: function(arr){
		var res = arr.slice(0), len = res.length, i = -1;
		while(i++<len){
			var j = i+1;
			for(;j<res.length;++j){
				if(res[i]===res[j]) res.splice(j--,1);
			}
		}
		return res;
	},

	// ***** Object *****
	/** Return deep cloned Object.
	*/
	objClone: function(obj){
		if(typeof obj!=='object' || obj===null) return obj;
		var res = obj.constructor();
		for(var i in obj) res[i] = this.objClone(obj[i]);
		return res;
	},
	/** Deep freeze Object. In-place.
	*/
	objFreeze: function(obj){
		var prop, propKey;
		Object.freeze(obj);
		for(propKey in obj){
			prop = obj[propKey];
			if(!obj.hasOwnProperty(propKey) || typeof prop!=="object" || Object.isFrozen(prop)) continue;
			this.objFreeze(prop);
		}
	},
	/** Returns value of the Objects member in the specified path or null.
	*/
	objGet: function(obj,path){
		var a = this.objGrab(obj,path);
		if(!a[0] || !a[1]) return null;
		return a[0][a[1]];
	},
	/** Returns Array with Object and key following the specified path.
	*/
	objGrab: function(obj,path){
		var p = path.split("."), len = p.length-1, last = p.pop(), o = obj;
		if(len<1) return [obj,last];
		for(var i=0;i<len;i++) o = this._objRet(o,p[i]);
		return [o,last];
	},
	/** Lock object, but leave expandable.
	*/
	objLock: function(obj){
		var props = Object.getOwnPropertyNames(obj);
		for(var i=0;i<props.length;i++){
			var desc = Object.getOwnPropertyDescriptor(obj,props[i]);
			if("value" in desc) desc.writable = false;
			desc.configurable = false;
			Object.defineProperty(obj,props[i],desc);
		}
	},
	/** Returns merged object. In-place.
	*/
	objMerge: function(target,obj,omit){
		for(var key in obj){
			if(!this._objHasOwn(obj,key)) continue;
			if(omit && !this._objHasOwn(target,key)) continue;
			var val = obj[key];
			if(typeof target[key]==="object"){
				if(!target[key]) target[key] = this.objClone(val);
				else target[key] = this.objMerge(target[key] || {},val);
			} else target[key] = this.objClone(val);
		}
		return target;
	},
	/** Returns deep merged object. In-place.
	*/
	objMergeDeep: function(orig,objects){
		if(typeof orig!=="object") orig = {};
		var len = arguments.length, target = this.objClone(orig);
		for(var i=1;i<len;i++){
			var val = arguments[i];
			if(typeof val==="object") this.objMerge(target,val);
		}
		return target;
	},
	/** Passes value to Function in Object following the specified path. Returns true or false.
	*/
	objPass: function(obj,path,val){
		var a = this.objGrab(obj,path);
		if(!a[0] || !a[1]) return false;
		if(typeof a[0][a[1]]==='function'){
			a[0][a[1]](val);
			return true;
		}
		return false;
	},
	/** Passes value to Function in Object following the specified path. Returns returned value.-)
	*/
	objRequest: function(obj,path,val){
		var a = this.objGrab(obj,path);
		if(!a[0] || !a[1]) return false;
		if(typeof a[0][a[1]]==='function') return a[0][a[1]](val);
		return false;
	},
	/** Deep seal Object. In-place.
	*/
	objSeal: function(obj){
		var prop, propKey;
		Object.seal(obj);
		for(propKey in obj){
			prop = obj[propKey];
			if(!obj.hasOwnProperty(propKey) || typeof prop!=="object" || Object.isSealed(prop)) continue;
			this.objSeal(prop);
		}
	},
	/** Sets value in Object following the specified path. Returns true or false.
	*/
	objSet: function(obj,path,val){
		var a = this.objGrab(obj,path);
		if(!a[0] || !a[1]) return false;
		if(!a[1]){
			obj[path] = val;
			return true;
		}
		a[0][a[1]] = val;
		return true;
	},

	// ***** Type *****
	/** Returns lowercase type of Argument for JS native and Oolites classes.
	*/
	typeGet: function(obj){
		var t = typeof obj;
		switch(t){
			case 'undefined':
			case 'boolean':
			case 'number':
			case 'string':
			case 'function': return t;
		}
		if(!obj) return null;
		t = Object.prototype.toString.call(obj).substr(8).replace("]","");
		return t.toLowerCase();
	},

	// ***** AddOn *****
	/** Checks required worldScripts and versions. The Array req is expected to contain two elements
	* (name and version) per check and version must be null for legacy scripts or if you want to
	* check only for existance!
	* Note: Checks property '$deactivated' in scripts.
	*/
	addOnVersion: function(who,req,quiet){
		var ok,ws, len = req.length, res = [];
		for(var i=0;i<len;i+=2){
			ok = 1;
			ws = worldScripts[req[i]];
			if(typeof ws==='undefined') ok = 0;
			else if(ws.$deactivated || (req[i+1] && !this.cmpVersion(ws.version,req[i+1]))) ok = 0;
			if(!ok){
				if(!quiet){
					if(!req[i+1]) this._addOnVersion(who,req[i],null);
					else this._addOnVersion(who,req[i],req[i+1]);
				}
			}
			res.push(ok);
		}
		return res;
	},
	/** Clears specified missionVariables.
	*/
	clrMVs: function(arr){
		var i = 0, l = arr.length;
		for(i;i<l;i++) missionVariables[arr[i]] = null;
		return;
	},
	/** Delete specified properties.
	*/
	clrProps: function(where,arr){
		var i = 0, l = arr.length;
		for(i;i<l;i++) delete worldScripts[where][arr[i]];
		return;
	},
	/** Compares dotted version Strings. Strips pre-/suffixes in first argument.
	* Returns 0 if smaller, 1 if equal and 2 if bigger.
	* JS native .localeCompare() may be another option.
	*/
	cmpVersion: function(act,exp){
		var x = act.replace(/[^\d\.]/g,"").split('.'),y = exp.split('.');
		if(!x.length) return 0;
		for(var i=0;i<x.length;i++){
			if(i>y.length-1 || x[i]>y[i]) return 2;
			if(x[i]<y[i]) return 0;
		}
		return 1;
	},

	// ***** Screens *****
	/** Returns aligned String.
	* e.g. this._aid.scrAddLine([ ["First",8],["Second",8],["Third",8] ],"","\n");
	*/
	scrAddLine: function(line,sep,brk){
		if(!line){
			if(brk) return brk;
			return "";
		}
		var le = line.length,res = "",coun = 0,tmp;
		for(var i=0;i<le;i++){
			if(coun>30) break;
			tmp = this.scrToWidth(line[i][0],line[i][1],"",1);
			res += tmp[0]+(sep?sep:"");
			coun += tmp[1];
			if(sep==="\n") coun = 0;
		}
		if(brk) res += brk;
		return res;
	},
	/** Sets unselectable flag for missionscreen choices. In-place.
	*/
	scrChcUnsel: function(opt,key){
		if(typeof opt[key]==='string') opt[key] = {text:opt[key],unselectable:true};
		else if(typeof opt[key]==='object') opt[key].unselectable = true;
		return opt;
	},
	/** Returns String with linebreaks up to max.
	*/
	scrFillLines: function(cur,max){
		var res = "";
		for(var i=cur;i<max;i++) res += "\n";
		return res;
	},
	/** Returns String with specified length in em.
	* Truncated if width > max, otherwise filled up with space or chr.
	*/
	scrToWidth: function(str,max,chr,ret,rgt){
		if(typeof str==='object' && str) str = str.toSource();
		str = String(str);
		var l = defaultFont.measureString(str),c,d;
		if(max<1){
			if(ret) return [str,l];
			return str;
		}
		if(chr) c = defaultFont.measureString(chr);
		if(l>max){
			while(l>max){
				if(str && str.length>1) str = str.substr(0,str.length-1);
				d = defaultFont.measureString(str);
				l = d;
			}
		}
		if(l<max){
			while(l<max){
				if(chr && c<max-l){
					str += chr;
					l += c;
				} else {
					if(max-l>this.spcsw){
						if(rgt) str = this.spcs+str;
						else str += this.spcs;
						l += this.spcsw;
					} else {
						if(max-l>this.spcw){
							if(rgt) str = this.spc+str;
							else str += this.spc;
							l += this.spcw;
						} else break;
					}
				}
			}
		}
		if(ret) return [str,l];
		return str;
	},

	// ***** Oolite *****
	/** Returns Object with width, height, gcd and ratio of screen window.
	*/
	ooScreen: function(){
		var g = this._ooGame(),w,h,d,a;
		w = g.gameWindow.width;
		h = g.gameWindow.height;
		d = this.gcd(w,h);
		a = w/h;
		return {width:w,height:h,gcd:d,ratio:a};
	},
	/** Returns shader support level.
	*/
	ooShaders: function(){
		var g = this._ooGame();
		if(g.wireframeGraphics) return 0;
		switch(g.detailLevel){
			case 'DETAIL_LEVEL_MINIMUM':
			case 'DETAIL_LEVEL_NORMAL': return 0;
			case 'DETAIL_LEVEL_SHADERS': return 1;
			case 'DETAIL_LEVEL_EXTRAS': return 2;
			default: return 0;
		}
	},
	/** Returns Object with width and height to be used for images
	* x and y are width and height in pixels, zoom any number or 0.
	* Author: Norbert Nagy.
	*/
	ooImageScale: function(x,y,zoom){
		var he = 480, wi = 0, o = this.ooScreen();
		if(x>0 && y>0){
			if(o.ratio>=x/y){
				if(zoom<0) wi = 0;
				else {
					if(zoom) he = 0;
					wi = o.ratio*480;
				}
			} else if(zoom<0){
				he = 0;
				wi = o.ratio*480;
			} else if(!zoom) wi = o.ratio*480;
		}
		if(!wi && he>0) wi = null;
		else if(wi>0 && !he) he = null;
		return {height:he,width:wi};
	},

	// ***** Entities *****
	/** Spawns VisualEffect in front of (or behind) the player.
	*/
	entFXCreate: function(ent,mul){
		return system.addVisualEffect(ent,player.ship.position.add(player.ship.vectorForward.multiply(mul)));
	},
	/** Sets main texture for entity.
	*/
	entSetMainTex: function(ent,tex){
		var ta = ent.getMaterials(), tb = Object.keys(ta), tc = ta[tb[0]].textures;
		if(!tc) return false;
		if(typeof tc[0] === 'string') ta[tb[0]].textures[0] = tex;
		else ta[tb[0]].textures[0].name = tex;
		ent.setMaterials(ta);
	},
	setMaterials: function(ent,obj){
		if(obj.mat && obj.sha) ent.setMaterials(obj.mat,obj.sha);
		else if(obj.mat) ent.setMaterials(obj.mat,{});
		else if(obj.sha) ent.setMaterials({},obj.sha);
		return true;
	},

	// ***** Helper *****
	_addOnVersion: function(w,r,v){
		log("Check",w+" requirement not matched : "+r+(v?" required min. version "+v:"")+" not found.");
		return;
	},
	_arrFlatten: function(arr,res){
		var len = arr.length, i = -1;
		while(len--){
			var cur = arr[++i];
			if(Array.isArray(cur)) this._arrFlatten(cur,res);
			else res.push(cur);
		}
		return res;
	},
	_arrSwap: function(arr,f,s){
		var temp = arr[f];
		arr[f] = arr[s];
		arr[s] = temp;
	},
	_chkGlobal: function(){
		var a = Object.getOwnPropertyNames(global), warn=[], t, ok = expandMissionText("LIBC_GLOB").split("|");
		for(var i=0;i<a.length;i++) if(ok.indexOf(a[i])===-1) warn.push(a[i]);
		if(warn.length){
			log("WARNING","Warning! Global namespace polluted by:");
			t = JSON.stringify(warn);
			log("WARNING",t);
		}
	},
	_cmpNum: function(a,b){return a-b;},
	_cmpGen: function(a,b){return (b<a)-(a<b);},
	_cmpObjKey: function(a,b,k){return a[k]-b[k];},
	_cmpArrKey: function(a,b){return a[0]-b[0];},
	_getMat: function(ent){
		var ta = ent.getMaterials(),tb = Object.keys(ta);
		return ta[tb[0]];
	},
	// Collecting the data + Class A algorithm is expensive.
	_getConnected: function(gal,sys,coo){
		var gn = galaxyNumber,
			id = system.ID,
			cpp = player.ship.galaxyCoordinatesInLY,
			check = [], cur = [], gInfo = [],
			c,cp,dist,len,i,o,r,s,t,u,w;
		if(typeof gal==='number'){
			gn = gal;
			cpp = coo;
			id = sys;
		}
		// Collect coordinates
		for(i=0;i<256;i++){
			c = System.infoForSystem(gn,i).coordinates;
			r = {x: c.x, y: c.y, id: i, done: 0};
			gInfo.push(r);
		}
		cp = {x: cpp.x, y: cpp.y, z: 0};
		gInfo = this.arrSortBy(gInfo,"x");
		this.$connections[gn] = [];
		// Start loop
		for(u=0;u<256;u++){
			t = gInfo[u];
			if(t.x>cp.x+7.15) break;
			if(t.x<cp.x-7.15 || t.y<cp.y-7.15 || t.y>cp.y+7.15) continue;
			dist = Math.sqrt((cp.x-t.x)*(cp.x-t.x)+(cp.y-t.y)*(cp.y-t.y));
			if(dist<7.341) cur.push(t);
		}
		// Grow
		while(cur.length){
			check = check.concat(cur);
			cur = [];
			for(o=0;o<check.length;o++){
				cp = check[o];
				if(cp.id===id || cp.done) continue;
				for(i=0;i<256;i++){
					t = gInfo[i];
					if(t.x>cp.x+7.15) break;
					if(t.x<cp.x-7.15 || t.y<cp.y-7.15 || t.y>cp.y+7.15) continue;
					dist = Math.sqrt((cp.x-t.x)*(cp.x-t.x)+(cp.y-t.y)*(cp.y-t.y));
					if(dist<7.341 && check.indexOf(t)===-1 && cur.indexOf(t)===-1) cur.push(t);
				}
			}
			len = check.length;
			for(w=0;w<len;w++) check[w].done = 1;
		}
		len = check.length;
		for(s=0;s<len;s++) this.$connections[gn].push(check[s].id);
	},
	_objHasOwn: function(obj,key){return Object.prototype.hasOwnProperty.call(obj,key);},
	_objRet: function(obj,prop){
		if(obj[prop] && typeof obj[prop]==='object') return obj[prop];
		return obj;
	},
	_ooGame: function(){return oolite.gameSettings;},
	_sanity: function(){return {changed:this.$entCstChanged,removed:this.$entCstRemoved,strength:this.$entLastStrength,patched:this.$entCstPatched};},
	_shuffle: function(){return 0.5-Math.random();}
};
/* Do before startUp. These features are useful for other OXPs, but are somewhat slow
	and it's better to have it done only once instead of slow code in lots of OXPs.
*/
this._lib = new this._libMain(); // Create instance
this._lib.$ships = Ship.keys().sort();

this.startUp = this.playerEnteredNewGalaxy = function(){
	this._lib._getConnected();
};
this.missionScreenOpportunity = function(){
	delete this.missionScreenOpportunity;
	this._lib._chkGlobal();
	this.shipWillExitWitchspace();
};
this.shipWillExitWitchspace = function(){
	system.addShips('lib_test',1,[99999999,99999999,99999999],15000);
};

}).call(this);
