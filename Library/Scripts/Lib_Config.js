/* jshint bitwise:false, forin:false */
/* global expandMissionText,log,mission,player,worldScripts */
/* (C) Svengali 2016-2018, License CC-by-nc-sa-4.0 */
(function(){
"use strict";
this.name = "Lib_Config";
this.description = "Options for AddOns which ship configurable user-friendly features.";

this.$sets = {}; // Settings objects
this.$setNames = []; // Sorting
this.$setProbs = {}; // Error codes
this.$curSet = null;
this.$defCHC = {
	allowInterrupt: false,
	choices: {ZZZ: "Exit"},
	initialChoicesKey: null,
	message: "",
	screenID: this.name,
	textEntry: false,
	title: "Config"
};
this.$oxpc = {
	curBit: 0,
	curInd: 0,
	curKeys: [],
	curMSB: 0,
	curOpt: 0,
	curPage: 0,
	curTyp: 0,
	div: "",
	entry: 0,
	intern: 0,
	resort: 0,
	scr: ['Bool','SInt','EInt']
};
/** _registerSet(obj) - Use on .startUpComplete() or later.
	@obj - Settings object
	@return Number. Error code. 0 - ok, >0 - error (see missiontext.plist)
*/
this._registerSet = function(obj){
	if(this.startUp) return 99;
	if(!obj || typeof obj!=='object') return 101;
	if(!Object.keys(obj).length) return 102;
	var e = this._checkSet(obj);
	if(e) return e;
	var id = obj.Name+obj.Display,
		ind = this.$setNames.indexOf(id);
	this.$sets[id] = obj; // Store or update
	if(ind===-1){ // No double entries
		this.$setNames.push(id);
		this.$oxpc.entry++;
		this.$oxpc.resort = 1;
		this.$setProbs[id] = e;
	}
	return 0;
};
/** _unregisterSet(obj)
	@obj - Settings object
	@return Number. Error code. 0 - ok, >0 - error (see missiontext.plist)
*/
this._unregisterSet = function(obj){
	if(typeof obj!=='object') return 501;
	var id = obj.Name+obj.Display,
		ind = this.$setNames.indexOf(id);
	if(!this.$sets[id]) return 502;
	if(ind===-1) return 503;
	delete this.$sets[id];
	this.$oxpc.entry--;
	this.$oxpc.resort = 1;
	this.$setNames.splice(ind,1);
	return 0;
};
this._updSet = function(obj){
	if(typeof obj!=='object') return 601;
	var ind = -1,
		tmp,tmps,
		e = this._checkSet(obj);
	if(!e || e===211){
		ind = this.$setNames.indexOf(obj.Name+obj.Display);
		if(ind!==-1){
			tmp = this.$setNames[ind];
			if(tmp){
				if(!e){
					tmps = this._aid.objGrab(worldScripts[obj.Name],obj.Alive);
					this.$sets[tmp] = tmps[0][tmps[1]];
				}
				this.$curSet = this.$sets[tmp];
			}
		} else { // Not registered
			this.$curSet = obj;
			this.$oxpc.intern = 0;
			return e;
		}
	} else this.$curSet = obj;
	return e;
};
this.startUp = function(){
	delete this.startUp;
	this._aid = worldScripts.Lib_Main._lib; // Covered by manifest
	worldScripts.Lib_GUI.$IDRules.Lib_Config = {pic:1,mus:1};
	this.$oxpc.div = this._aid.scrToWidth("-",31,"-")+"\n";
};
this.startUpComplete = function(){
	delete this.startUpComplete;
	this.shipDockedWithStation(); // Implement interface
};
this.shipDockedWithStation = function(){
	if(!player.ship || !player.ship.isValid || !player.ship.docked) return;
	player.ship.dockedStation.setInterface(this.name,{
		title: "Config for AddOns",
		category: "AddOns",
		summary: this.description,
		callback: this._showStart.bind(this)
	});
};
this._checkSet = function(obj){
	var e = 0, t = ['string','function','object','undefined'], noti;
	if(typeof obj.Name!==t[0]) return 201;
	if(typeof obj.Display!==t[0]) return 202;
	if(typeof obj.Alive!==t[0]) return 203;
	if(obj.Alias && typeof obj.Alias!==t[0]) return 209;
	if(obj.Notify){
		if(typeof obj.Notify!==t[0]) return 204;
		noti = this._aid.objGrab(worldScripts[obj.Name],obj.Notify);
		if(typeof noti[0]==='undefined') return 212;
		if(typeof noti[0]!==t[1] && typeof noti[0][noti[1]]!==t[1]) return 212;
	}
	var k = this.$oxpc.scr,v;
	for(var i=0;i<k.length;i++){
		v = k[i];
		if(typeof obj[v]!==t[3]){
			if(typeof obj[v]!==t[2]) return 206+i;
			if(!obj[v] || !Object.keys(obj[v]).length) return 213+i;
		} else e++;
	}
	if(e===3) return 205;
	if(!this._checkAvail(obj)) return 211;
	return 0;
};
this._checkAvail = function(obj){
	var ws = worldScripts[obj.Name];
	if(!ws || ws.$deactivated) return false;
	var a = this._aid.objGrab(ws,obj.Alive);
	if(typeof a[0][a[1]]!=='object' || !Object.keys(a[0][a[1]]).length) return false;
	return true;
};
this._checkHeader = function(obj){
	var h = {Name:"-",Alias:0,Display:"-",Mani:"-",Author:"-",Copyright:"-",Licence:"-",Desc:"-",Version:"-",Ref:false,Extern:false},
		ws = worldScripts[obj.Name];
	h.Ref = this._checkAvail(obj);
	if(ws){
		if(ws.name) h.Name = ws.name;
		if(obj.Name) h.Name = obj.Name;
		if(ws.author) h.Author = ws.author;
		if(ws.copyright) h.Copyright = ws.copyright;
		if(ws.licence) h.Licence = ws.licence;
		else if(ws.license) h.Licence = ws.license;
		if(ws.description) h.Desc = ws.description;
		if(ws.version) h.Version = ws.version;
		if(ws.oolite_manifest_identifier) h.Mani = ws.oolite_manifest_identifier;
	} else if(obj.Name) h.Name = obj.Name;
	if(obj.Display) h.Display = obj.Display;
	if(obj.Alias) h.Alias = obj.Alias;
	if(!this.$oxpc.intern) h.Extern = true;
	return h;
};
this._checkValues = function(obj,typ){
	var wc = obj[typ],
		ws = worldScripts[obj.Name],
		max = 16777215, min = -16777215,
		c,ty,de,val;
	switch(typ){
		case 'Bool': ty = 'boolean'; de = 'string'; break;
		case 'SInt': ty = 'number'; de = 'string'; break;
		case 'EInt': ty = 'number'; de = 'object'; break;
	}
	for(var t in wc){
		if(!wc[t]) return 301;
		if(t==='Info' || t==='Notify') continue;
		c = wc[t];
		if(typeof c.Name!=='string') return 302;
		if(typeof c.Def!==ty) return 303;
		if(typeof c.Desc!==de) return 304;
		val = this._aid.objGet(ws,c.Name);
		if(typeof val!==ty) return 401;
		if(typ!=='Bool'){
			if(typeof c.Max!==ty) return 311;
			if(typeof c.Min!==ty) return 312;
			if(typ==='EInt') min = 0;
			if(c.Max<min) return 313;
			if(c.Max>max) return 314;
			if(c.Min>c.Max) return 315;
			if(c.Min<min) return 316;
			if(c.Def>c.Max) return 317;
			if(c.Def<c.Min) return 318;
			if(c.Def>max) return 319;
			if(c.Def<min) return 320;
			if(val>max || val>c.Max) return 411;
			if(val<min || val<c.Min) return 412;
		}
	}
	return 0;
};
this._fillOptions = function(chc,tit,ent){
	var obj = JSON.parse(JSON.stringify(this.$defCHC));
	if(chc) obj.choices = chc;
	if(tit) obj.title = tit;
	if(ent) obj.textEntry = true;
	return obj;
};
this._resort = function(){
	this.$setNames = this.$setNames.sort();
	this.$oxpc.resort = 0;
};
this._reset = function(){
	this.$curSet = null;
	this.$defCHC.initialChoicesKey = null;
	var o = this.$oxpc;
	o.curBit = 0;
	o.curMSB = 0;
	o.curInd = 0;
	o.curKeys = [];
	o.curOpt = 0;
	o.curPage = 0;
	o.curTyp = 0;
	o.intern = 0;
};
this._showScr = function(obj,mes,mesKey,cb){
	if(mesKey){
		obj.messageKey = mesKey;
		obj.message = null;
	} else if(mes) obj.message = mes;
	if(cb) mission.runScreen(obj,cb);
	else mission.runScreen(obj,this._choiceEval);
};
this._showStart = function(){
	var ch = {goLI:"List Settings",ZZZ:"Exit"},
		chc,txt,
		o = this.$oxpc;
	this._reset();
	if(!o.entry) ch = this._aid.scrChcUnsel(ch,'goLI');
	chc = this._fillOptions(ch);
	chc.exitScreen = "GUI_SCREEN_INTERFACES";
	this._showScr(chc,0,'LIBC_HEAD');
	txt = o.div;
	o.intern = 1;
	txt += "\nCurrently registered settings: "+o.entry+"\n\nChoose your option.";
	mission.addMessageText(txt);
	if(o.resort) this._resort();
};
this._showList = function(){
	var ch = {LINext:"Next Setting",lioOXP:"Select Setting",LIPNext:"Next page",LIPPrev:"Previous page",LIRet:"Back"},
		chc,txt,tmp,tmq,ind,
		o = this.$oxpc,
		max = o.curPage*10,
		e = o.entry;
	txt = this._aid.scrAddLine([["",1],["Settings",10],["Script/Alias",10],["Version",7],["Ref",3]],"","\n");
	txt += o.div;
	for(var i=0;i<10;i++){
		ind = i+max;
		if(e<=ind) break;
		tmq = this.$setNames[ind];
		tmp = this._checkHeader(this.$sets[tmq]);
		txt += this._aid.scrAddLine([[(o.curInd===ind?">":""),1]]);
		txt += this._addHeader(tmp,1);
	}
	if(e<=max) ch = this._aid.scrChcUnsel(ch,'LINext');
	if(e<=(1+o.curPage)*10) ch = this._aid.scrChcUnsel(ch,'LIPNext');
	if(!o.curPage) ch = this._aid.scrChcUnsel(ch,'LIPPrev');
	chc = this._fillOptions(ch);
	this._showScr(chc,txt);
};
/** _showOXPPage(obj) - for direct access
	@obj - Settings object
	@return Number. Error code. 0 - ok, >0 - error (see missiontext.plist)
*/
this._showOXPPage = function(obj){
	if(!obj || typeof obj!=='object') return 101;
	if(!Object.keys(obj).length) return 102;
	var e = this._updSet(obj),
		ch = {goBool:"Show switches",goEInt:"Show flags",goSInt:"Show values",OXPZZZ:"Back"},
		c = this.$curSet,
		o = this.$oxpc,
		tmp = this._checkHeader(c),
		chc,txt;
	if(e || !tmp.Ref){
		ch = this._aid.scrChcUnsel(ch,'goBool');
		ch = this._aid.scrChcUnsel(ch,'goEInt');
		ch = this._aid.scrChcUnsel(ch,'goSInt');
	} else {
		if(!c.Bool) ch = this._aid.scrChcUnsel(ch,'goBool');
		if(!c.EInt) ch = this._aid.scrChcUnsel(ch,'goEInt');
		if(!c.SInt) ch = this._aid.scrChcUnsel(ch,'goSInt');
		if(c.Reset) ch.OXPDef = "Reset to defaults";
	}
	txt = this._addHeader(tmp);
	txt += o.div;
	txt += this._aid.scrAddLine([["Author(s): "+tmp.Author,29],["Manifest: "+tmp.Mani,29],["Copyright: "+tmp.Copyright,29],["Licence: "+tmp.Licence,29],["Desc: "+tmp.Desc,29]],"\n");
	txt += o.div;
	if(e || !tmp.Ref) txt += "\n"+this._addError(tmp,e,'obj');
	else txt += "\nSettings object found.\n";
	chc = this._fillOptions(ch,tmp.Display);
	this._showScr(chc,txt);
	o.curBit = 0;
	o.curMSB = 0;
	o.curOpt = 0;
	o.curTyp = 0;
	return e;
};
/** _showOXPSub(obj) - for direct access
	@obj - Settings object
	@typ - String. Either "Bool","SInt" or "EInt"
	@return Number. Error code. 0 - ok, >0 - error (see missiontext.plist)
*/
this._showOXPSub = function(obj,typ){
	if(!obj || typeof obj!=='object') return 101;
	if(!Object.keys(obj).length) return 102;
	if(!typ || this.$oxpc.scr.indexOf(typ)===-1) return 701;
	var e = this._updSet(obj),
		c = this.$curSet,
		ch = {OXPNext:"Next option",OXPToggle:"Change current",OXPZZZ:"Back"},
		o = this.$oxpc,
		r,tp,val,inf,
		z = 0, sh = 1;
	o.curTyp = typ;
	var op = Object.keys(c[typ]),
		opl = op.length,
		opk = [],
		pass = this._checkValues(c,typ),
		tmp = this._checkHeader(c),
		txt = this._addHeader(tmp);
	if(e || pass) sh = 0;
	txt += o.div;
	if(sh){
		for(var x=0;x<opl;x++){
			tp = op[x];
			if(tp==='Info' || tp==='Notify') continue;
			if(opk.length>8) break;
			if(!c[typ][tp].Hide) opk.push(tp);
		}
		o.curKeys = opk;
		if(!opk.length){
			txt += "Nothing to configure yet.\n";
			z++;
		} else {
			for(var t in c[typ]){
				if(z>8) break;
				if(t==='Info' || t==='Notify') continue;
				val = c[typ][t];
				if(!val || val.Hide) txt += this._aid.scrAddLine([["",1],["-",1]],"","\n");
				else {
					if(!o.curOpt) o.curOpt = t;
					r = this._calcs(val);
					switch(typ){
						case 'Bool':
							txt += this._aid.scrAddLine([[(o.curOpt===t?">":" "),1],[z,1],[r.Dec,4],["D:"+val.Def,5],[val.Desc,8]],"","\n");
							break;
						case 'SInt':
							txt += this._aid.scrAddLine([[(o.curOpt===t?">":""),1],[z,1],[r.Dec,5],["D:"+r.Def,5],["R:"+r.Min+" - "+r.Max,10],[val.Desc,8]],"","\n");
							break;
						case 'EInt':
							o.curMSB = r.msb;
							txt += this._aid.scrAddLine([["",1],[z,10],[r.Dec,5],[r.str,14],[r.msb,0]],"","\n");
							for(var i=0;i<r.msb;i++){
								if(i && 0===i%3) txt += "\n";
								txt += this._aid.scrAddLine([[(o.curBit===i?">":""),1],[(r.revstr.length>i?r.revstr[i]:"0"),1],[(val.Desc.length>i?val.Desc[i]:" "),8]],"");
							}
							txt += "\n";
							z = Math.ceil(r.msb/3);
							break;
					}
				}
				z++;
			}
		}
	} else {
		if(e) txt += this._addError(tmp,e,typ);
		if(pass) txt += this._addError(tmp,pass,typ);
		z += (e?1:0)+(pass?1:0);
	}
	txt += this._aid.scrFillLines(z,9);
	if(c[typ].Info){
		inf = c[typ].Info;
		if(inf[0]==="^") inf = expandMissionText(inf.substr(1));
		txt += "\nDesc:\n"+inf.toString().substr(0,240)+"\n";
	}
	if(!sh || (opk.length<2 && typ!=='EInt')) ch = this._aid.scrChcUnsel(ch,'OXPNext');
	if(!sh || !opk.length) ch = this._aid.scrChcUnsel(ch,'OXPToggle');
	var chc = this._fillOptions(ch,tmp.Display);
	this._showScr(chc,txt);
	return e;
};
this._calcs = function(val){
	var s = this._aid.objGet(worldScripts[this.$curSet.Name],val.Name);
	var r = {Dec: s};
	switch(this.$oxpc.curTyp){
		case 'SInt':
			r.Dec = r.Dec;
			r.Def = val.Def;
			r.Max = val.Max;
			r.Min = val.Min;
			break;
		case 'EInt':
			r.str = this._aid.toBase(r.Dec,2);
			r.msb = this._aid.getMSB(val.Max);
			r.revstr = this._aid.strRev(r.str);
			break;
	}
	return r;
};
this._showOXPValueEnter = function(){
	var c = this.$curSet,
		o = this.$oxpc,
		tmp = this._checkHeader(c),
		txt = this._addHeader(tmp)+o.div,
		val = c[o.curTyp][o.curOpt],
		r = this._calcs(val);
	txt += this._aid.scrAddLine([["",1],["",1],[r.Dec,5],["D:"+r.Def,5],["R:"+r.Min+" - "+r.Max,10],[val.Desc,0]],"","\n");
	txt += o.div;
	txt += "\nHexadecimal whole numbers, e.g. '0xff'.";
	if(val.Min<0) txt += "\nNegative values, e.g. dec '-32' or hexadecimal '-0x20'.";
	if(val.Float) txt += "\nFloating point values , e.g '1.1'.";
	txt += "\n\nEnter your value.";
	var chc = this._fillOptions({},tmp.Name,1);
	this._showScr(chc,txt,null,this._choiceEnter);
};
this._addHeader = function(tmp,flag){
	return this._aid.scrAddLine([[tmp.Display,10],[(tmp.Alias?tmp.Alias:tmp.Name),10],[tmp.Version,4],[(flag?"":"#"),1],[(flag?"":""),1],[(flag?"":(tmp.Extern?"Ex":"")),1],[(tmp.Ref?"":"!")+(tmp.Extern?"-":String(this.$setProbs[tmp.Name+tmp.Display])),2.5]],"","\n");
};
this._addError = function(w,e,typ){
	this.$setProbs[w.Name+w.Display] = e;
	log(this.name,"Error: "+w.Name+" "+w.Display+" - ("+typ+") "+expandMissionText('LIBC_E'+e));
	return "Error: "+e+" - ("+typ+") "+expandMissionText('LIBC_E'+e)+"\n";
};
this._notiError = function(s,w){
	log(this.name,"Notification failed for "+s+"."+w+"!");
};
this._choiceEval = function(choice){worldScripts.Lib_Config._choices(choice); return;};
this._choices = function(choice){
	if(choice) this.$defCHC.initialChoicesKey = choice;
	var o = this.$oxpc,
		c = this.$curSet,
		p = Math.floor(o.curInd/10),
		cur = this.$setNames[o.curInd],
		a,b,flag,ind,ok,ws;
	var pp = p*10;
	switch(choice){
		case 'goBool':
			this._showOXPSub(c,'Bool');
			break;
		case 'goEInt':
			this._showOXPSub(c,'EInt');
			break;
		case 'goLI':
			o.intern = 1;
			this._showList();
			break;
		case 'lioOXP':
			this._showOXPPage(this.$sets[cur]);
			break;
		case 'goSInt':
			this._showOXPSub(c,'SInt');
			break;
		case 'LINext':
			o.curInd++;
			if(o.curInd>=pp+10 || o.curInd<pp || o.curInd>=o.entry) o.curInd = pp;
			this._showList();
			break;
		case 'LIPNext':
			o.curPage++;
			o.curInd = pp+10;
			this._showList();
			break;
		case 'LIPPrev':
			if(o.curPage>-1){
				o.curPage--;
				o.curInd = pp-10;
			}
			this._showList();
			break;
		case 'LIRet':
			this._showStart();
			break;
		case 'OXPDef':
			ws = worldScripts[c.Name];
			if(c.Notify) a = 1;
			ind = o.scr;
			for(var i=0;i<3;i++){
				flag = ind[i];
				if(c[flag]){
					if(!a && c[flag].Notify) b = 1;
					else b = 0;
					for(var j in c[flag]){
						if(typeof c[flag][j]!=='object') continue;
						this._aid.objSet(ws,c[flag][j].Name,c[flag][j].Def);
						if(!a && !b && c[flag][j].Notify) this._aid.objPass(ws,c[flag][j].Notify,j);
					}
					if(b) this._aid.objPass(ws,c[flag].Notify,flag);
				}
			}
			if(a) this._aid.objPass(ws,c.Notify,"All");
			this._showOXPPage(this.$sets[cur]);
			mission.addMessageText("Reset to defaults.");
			break;
		case 'OXPNext':
			switch(o.curTyp){
				case 'Bool':
				case 'SInt':
					ind = o.curKeys.indexOf(o.curOpt)+1;
					if(ind>o.curKeys.length-1) ind = 0;
					o.curOpt = o.curKeys[ind];
					break;
				case 'EInt':
					o.curBit++;
					if(o.curBit>=o.curMSB) o.curBit = 0;
					break;
			}
			this._showOXPSub(c,o.curTyp);
			break;
		case 'OXPToggle':
			ws = worldScripts[c.Name];
			ind = c[o.curTyp][o.curOpt].Name;
			switch(o.curTyp){
				case 'Bool':
					a = this._aid.objGet(ws,ind);
					a = !a;
					this._aid.objSet(ws,ind,a);
					flag = 1;
					break;
				case 'SInt':
					this._showOXPValueEnter();
					break;
				case 'EInt':
					a = this._aid.objGet(ws,ind);
					b = Math.pow(2,o.curBit);
					if(c[o.curTyp][o.curOpt].OneOf) a = b;
					else if(c[o.curTyp][o.curOpt].OneOfZero){
						if(a===b) a = 0;
						else a = b;
					} else {
						if(a&b) a -= b;
						else a += b;
					}
					this._aid.objSet(ws,ind,a);
					flag = 1;
					break;
			}
			if(flag){
				if(c[o.curTyp][o.curOpt].Notify){
					ok = this._aid.objPass(ws,c[o.curTyp][o.curOpt].Notify,o.curOpt);
					if(!ok) this._notiError(c.Name,c[o.curTyp][o.curOpt].Notify);
				}
				this._showOXPSub(c,o.curTyp);
			}
			break;
		case 'OXPZZZ':
			ws = worldScripts[c.Name];
			if(o.curTyp){
				if(c[o.curTyp].Notify){
					ok = this._aid.objPass(ws,c[o.curTyp].Notify,o.curTyp);
					if(!ok) this._notiError(c.Name,c[o.curTyp].Notify);
				}
				this._showOXPPage(c);
			} else {
				if(c.Notify){
					ok = this._aid.objPass(ws,c.Notify,"All");
					if(!ok) this._notiError(c.Name,c.Notify);
				}
				this.$curSet = null;
				if(o.intern){
					this.$defCHC.initialChoicesKey = 'LIRet';
					this._showList();
				} else this._reset(); // Bye
			}
			break;
		case 'ZZZ':
			this._reset();
			break;
	}
};
// Numerical input
this._choiceEnter = function(choice){worldScripts.Lib_Config._choiceEnterB(choice); return;};
this._choiceEnterB = function(choice){
	var o = this.$oxpc,
		c = this.$curSet,
		ws = worldScripts[c.Name],
		ind = c[o.curTyp][o.curOpt],
		sign = 1,
		ok,val;
	if(choice){
		// Store sign
		if(choice[0]==='-'){
			choice = choice.substr(1);
			sign = -1;
		}
		if(choice.length>2 && choice.substr(0,2)==="0x" && !isNaN(parseInt(choice))) val = parseInt(choice);
		else if(ind.Float && !isNaN(parseFloat(choice))) val = parseFloat(choice);
		else if(!isNaN(parseInt(choice))) val = parseInt(choice);
		if(typeof(val)!=='undefined'){
			val *= sign; // Reapply sign
			val = this._aid.clamp(val,ind.Min,ind.Max);
			this._aid.objSet(ws,ind.Name,val);
			if(c[o.curTyp][o.curOpt].Notify){
				ok = this._aid.objPass(ws,c[o.curTyp][o.curOpt].Notify,o.curOpt);
				if(!ok) this._notiError(c.Name,c[o.curTyp][o.curOpt].Notify);
			}
		}
	}
	this._showOXPSub(c,o.curTyp);
};
}).call(this);