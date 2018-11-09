/* global addFrameCallback,galaxyNumber,guiScreen,mission,missionVariables,player,removeFrameCallback,setScreenBackground,setScreenOverlay,worldScripts,SoundSource,System */
/* (C) Svengali 2016-2018, License CC-by-nc-sa-4.0 */
(function(){
"use strict";
this.name = "Lib_GUI";
this.copyright = "(C)2016-2018";
this.description = "GUI images and sounds handling.";

// Full Sets
this.$guis = {};
this.$IDs = {};
// Extension - temporary overrides, FIFO
this.$guisExt = {
	GUI_SCREEN_EQUIP_SHIP: [],
	GUI_SCREEN_GAMEOPTIONS: [],
	GUI_SCREEN_INTERFACES: [],
	GUI_SCREEN_KEYBOARD: [],
	GUI_SCREEN_LOAD: [],
	GUI_SCREEN_LONG_RANGE_CHART: [],
	GUI_SCREEN_MANIFEST: [],
	GUI_SCREEN_MARKET: [],
	GUI_SCREEN_MARKETINFO: [],
	GUI_SCREEN_OPTIONS: [],
	GUI_SCREEN_REPORT: [],
	GUI_SCREEN_SAVE: [],
	GUI_SCREEN_SAVE_OVERWRITE: [],
	GUI_SCREEN_SHIPLIBRARY: [],
	GUI_SCREEN_SHIPYARD: [],
	GUI_SCREEN_SHORT_RANGE_CHART: [],
	GUI_SCREEN_STATUS: [],
	GUI_SCREEN_STICKMAPPER: [],
	GUI_SCREEN_STICKPROFILE: [],
	GUI_SCREEN_SYSTEM_DATA: []
};
// Extension
this.$IDsExt = {};
// screenID rules - expand, but do not change!
this.$IDRules = {
	"oolite-contracts-cargo-none": {pic:1,ov:1,snd:1,mus:1},
	"oolite-contracts-cargo-details": {mpic:1,snd:1,mus:1},
	"oolite-contracts-cargo-summary": {pic:1,ov:1,snd:1,mus:1},
	"oolite-contracts-parcels-none": {pic:1,ov:1,snd:1,mus:1},
	"oolite-contracts-parcels-details": {mpic:1,snd:1,mus:1},
	"oolite-contracts-parcels-summary": {pic:1,ov:1,snd:1,mus:1},
	"oolite-contracts-passengers-none": {pic:1,ov:1,snd:1,mus:1},
	"oolite-contracts-passengers-details": {mpic:1,snd:1,mus:1},
	"oolite-contracts-passengers-summary": {pic:1,ov:1,snd:1,mus:1},
	"oolite-primablemanager": {pic:1,ov:1,snd:1,mus:1},
	"oolite-register": {pic:1,ov:1,snd:1,mus:1}
};
this.$ambi = {
	audio: true,
	guiFX: true,
	ex: 0,
	last: 0,
	reinit: 0,
	crowd: "generic",
	generic: [],
	redux: [],
	none: []
};
this.$noEx = Object.keys(this.$IDRules);

this.startUp = function(){
	this._aid = worldScripts.Lib_Main._lib;
	for(var i=0;i<this.$noEx.length;i++) this._aid.objLock(this.$IDRules[this.$noEx[i]]);
	this._aid.objLock(this.$IDRules);
};
// remove missionVariables.LIB_GUI sometime
this.startUpComplete = function(){
	delete this.startUpComplete;
	var gu,ms = missionVariables.LIB_GUI,ind=0,max=0,mv=missionVariables.LIB_GUI_CONFIG,mvp;
	this.$s = new SoundSource();
	this.$amb = new SoundSource();
	this.$op = null;
	this.$cur = null;
	this.$k = Object.keys(this.$guis);
	if(ms && worldScripts[ms]) this.$cur = ms;
	if(mv){
		mvp = JSON.parse(missionVariables.LIB_GUI_CONFIG);
		if(mvp.cur && worldScripts[mvp.cur]) this.$cur = mvp.cur;
		this.$ambi.audio = mvp.audio;
		this.$ambi.guiFX = mvp.guiFX;
	}
	gu = this.$k;
	if(!this.$cur && gu.length) this.$cur = gu[gu.length-1];
	if(gu && gu.length){
		ind = gu.indexOf(this.$cur);
		this.$E0 = 0;
		if(ind!==-1){
			ind = Math.pow(2,ind);
			this.$E0 = ind;
		}
		max = Math.pow(2,gu.length)-1;
		this.$inf = {Name:"Lib_GUI",Alias:"Library",Display:"GUI-Config",Alive:"$inf",
			Bool:{
				B0:{Name:"$ambi.audio",Def:true,Desc:"Ambience Audio"},
				B1:{Name:"$ambi.guiFX",Def:true,Desc:"SFX on GUIs"}
			},
			EInt:{E0:{Name:"$E0",Def:ind,Min:0,Max:max,Desc:gu,Notify:"_chgSet",OneOfZero:1},Info:"Choose your background set."}};
		worldScripts.Lib_Config._registerSet(this.$inf);
	}
	// TODO: Attempt to avoid JS-reset bug - remove when solved.
	setScreenBackground("lib_black.png");
	this._setCrowd(player.ship.dockedStation);
	this._stationAmb();
	missionVariables.LIB_GUI = null;
};
this._chgSet = function(){
	var gu = this.$k, ind = this._aid.getMSB(this.$E0)-1;
	if(ind<0) this.$cur = null;
	else this.$cur = gu[ind];
};
this.playerWillSaveGame = function(){
	var o = {
		cur: this.$cur,
		audio: this.$ambi.audio,
		guiFX: this.$ambi.guiFX
	};
	missionVariables.LIB_GUI_CONFIG = JSON.stringify(o);
};
this.alertConditionChanged = function(){
	if(player.ship.isInSpace) this.guiScreenChanged();
};
this.gameResumed = function(){
	this.guiScreenChanged();
	this._stationAmb();
};
this.gamePaused = function(){
	this._stationAmb(1);
};
this.shipDied = function(){
	if(this.$guiFCB) removeFrameCallback(this.$guiFCB);
	this._stationAmb(1);
};
this.shipDockedWithStation = function(st){
	this._setCrowd(st);
	this._stationAmb();
};
this._setCrowd = function(st){
	var inf, p = ["generic","redux","none"];
	if(st.scriptInfo && st.scriptInfo.lib_crowd && p.indexOf(st.scriptInfo.lib_crowd)>-1) inf = st.scriptInfo.lib_crowd;
	if(!st.isMainStation && !st.hasNPCTraffic && !inf) this.$ambi.crowd = "none";
	else {
		if(inf) this.$ambi.crowd = inf;
		else if(st.name==="Rock Hermit") this.$ambi.crowd = "redux";
		else this.$ambi.crowd = "generic";
	}
};
this._stationAmb = function(s){
	if(player.ship.isInSpace || s){
		if(this.$AmbTimer) this.$AmbTimer.stop();
		this.$amb.stop();
		this.$ambi.last = 0;
	} else {
		if(!this.$ambi.audio) return;
		if(this.$ambi.ex){
			this.$ambi.last = 0;
			if(this.$AmbTimer){
				this.$AmbTimer.stop();
				this.$AmbTimer.nextTime = clock.absoluteSeconds+1;
				this.$AmbTimer.start();
			}
			return;
		}
		var w = this.$ambi[this.$ambi.crowd], i = Math.floor(Math.random()*w.length), d,r;
		if(w.length){
			this.$amb.sound = w[i].name;
			this.$amb.volume = w[i].vol;
			this.$amb.play();
			d = w[i].dur-1;
			if(this.$AmbTimer) this.$AmbTimer.stop();
			else this.$AmbTimer = new Timer(this,this._stationAmb,-1,d);
			this.$AmbTimer.nextTime = clock.absoluteSeconds+d;
			this.$AmbTimer.start();
			this.$ambi.reinit = 0;
			this.$ambi.last = clock.absoluteSeconds+d;
		}
	}
};
this.shipWillLaunchFromStation = function(){
	this.$s.stop();
	this._stationAmb(1);
};
this.guiScreenChanged = function(){
	var gu = guiScreen, amb;
	switch(gu){
		case "GUI_SCREEN_EQUIP_SHIP":
		case "GUI_SCREEN_LONG_RANGE_CHART":
		case "GUI_SCREEN_MANIFEST":
		case "GUI_SCREEN_MARKET":
		case "GUI_SCREEN_MARKETINFO":
		case "GUI_SCREEN_REPORT":
		case "GUI_SCREEN_SHIPYARD":
		case "GUI_SCREEN_SHORT_RANGE_CHART":
		case "GUI_SCREEN_STATUS":
			this.$op = null;
			this._setGUI(gu,0);
			this.$ambi.ex = 0;
			break;
		case "GUI_SCREEN_SYSTEM_DATA":
			var inf = System.infoForSystem(galaxyNumber,player.ship.infoSystem),sp = 0;
			if(inf.sun_gone_nova || inf.sun_going_nova) sp = 1;
			this.$op = null;
			this._setGUI(gu,sp);
			this.$ambi.ex = 0;
			break;
		case "GUI_SCREEN_INTERFACES":
		case "GUI_SCREEN_SHIPLIBRARY":
			this.$op = gu;
			this._setGUI(gu,0);
			this.$ambi.ex = 0;
			break;
		case "GUI_SCREEN_GAMEOPTIONS":
		case "GUI_SCREEN_KEYBOARD":
		case "GUI_SCREEN_LOAD":
		case "GUI_SCREEN_OPTIONS":
		case "GUI_SCREEN_SAVE":
		case "GUI_SCREEN_SAVE_OVERWRITE":
		case "GUI_SCREEN_STICKMAPPER":
		case "GUI_SCREEN_STICKPROFILE":
			this.$op = gu;
			this._setGUI(gu,0);
			this._stationAmb(1);
			amb = 1;
			break;
		case "GUI_SCREEN_MISSION":
			this.$op = null;
			if(mission.screenID) this._setMS(mission.screenID);
			else {
				this._stationAmb(1);
				this.$ambi.reinit = 1;
				amb = 1;
			}
			if(mission.exitScreen) this.$op = gu;
			break;
		case "GUI_SCREEN_MAIN":
			amb = 1;
			this.$op = null;
			break;
		default:
			this.$op = null;
	}
	if(this.$op){
		if(!this.$guiFCB) this.$guiFCB = addFrameCallback(this._checkGUI.bind(this));
	} else {
		if(this.$guiFCB) removeFrameCallback(this.$guiFCB);
		delete this.$guiFCB;
	}
	if(!amb && !this.$ambi.reinit && this.$ambi.last<=clock.absoluteSeconds+2) this._stationAmb();
	if(amb) this.$ambi.ex = 1;
};
this.missionScreenEnded = function(){
	if(this.$ambi.reinit) this._stationAmb();
};
this._checkGUI = function(){
	if(!player.ship.isValid) return;
	if(this.$op && guiScreen!==this.$op && guiScreen!=="GUI_SCREEN_MISSION") this.guiScreenChanged();
};
this._setGUI = function(gui,spc){
	if(!this.$cur && !this.$guisExt[gui].length){
		setScreenBackground("lib_black.png");
		return;
	}
	var g = this.$guis[this.$cur],
		ex = this.$guisExt[gui],
		big = player.ship.hudAllowsBigGui,
		img,ov,ref,snd,sou,w;
	if(!ex.length && (!g || (!g[gui] && !g.generic))) return;
	if(ex.length) w = ex[0];
	else if(g[gui]) w = g[gui];
	else w = g.generic;
	if(player.ship.isInSpace){
		sou = "sndF";
		if(spc && w.picNova) img = "picNova";
		else if(w.picFlight) img = "picFlight";
		else if(w.pic) img = "pic";
	} else {
		sou = "snd";
		if(spc && w.picNova) img = "picNova";
		else if(player.ship.dockedStation.script.$guiVoid && w.picVoid){
			img = "picVoid";
			sou = null;
		} else if(w.pic) img = "pic";
	}
	if(sou){
		if(w[sou]) snd = w[sou];
		else if(w.sndRef){
			ref = this.$guis[w.sndRef];
			if(ref && ref[gui] && ref[gui][sou]) snd = ref[gui][sou];
		}
	}
	if(img){
		if(player.alertCondition===3 && w[img+"Red"]) img = img+"Red";
		if(big && w[img+"Big"]) img = img+"Big";
		this._applyBG(w[img]);
	}
	if(w.ov){
		ov = "ov";
		if(player.alertCondition===3 && w[ov+"Red"]) ov = ov+"Red";
		if(big && w[ov+"Big"]) ov = ov+"Big";
		this._applyOV(w[ov]);
	}
	if(snd && this.$ambi.guiFX) this.$s.playSound(snd);
	this.$guisExt[gui].shift();
};
this._setMS = function(id){
	if(!this.$cur && !this.$IDsExt[id]) return;
	var m = this.$IDRules,
		s = this.$IDs[this.$cur],
		ex = (this.$noEx.indexOf(id)===-1?this.$IDsExt[id]:null),
		big = player.ship.hudAllowsBigGui,
		sou = "snd",
		img,ov,w,ref;
	if(!m[id] || (!ex && !s && (!s[id] && !s.generic))){
		this.$s.stop();
		this._stationAmb(1);
		this.$ambi.reinit = 1;
		this.$ambi.ex = 1;
		return;
	}
	if(ex) w = ex;
	else if(s[id]) w = s[id];
	else w = s.generic;
	if(player.ship.isInSpace) sou = "sndF";
	if(m[id].snd && this.$ambi.guiFX){
		if(w[sou]) this.$s.playSound(w[sou]);
		else if(w.sndRef){
			ref = this.$IDs[w.sndRef];
			if(ref && ref[id] && ref[id][sou]) this.$s.playSound(ref[id][sou]);
		} else this.$s.stop();
	} else this.$s.stop();
	if(m[id].mpic && w.mpic) ov = "mpic";
	else {
		if(m[id].pic && w.pic) img = "pic";
		if(m[id].ov && w.ov) ov = "ov";
	}
	if(img){
		if(big && w.picBig) img = "picBig";
		this._applyBG(w[img]);
	}
	if(ov){
		if(big && w[ov+"Big"]) ov = ov+"Big";
		this._applyOV(w[ov]);
	}
};
this._applyBG = function(img){
	if(typeof img==="object" && img.scale){
		var sc = this._aid.ooImageScale(img.x,img.y,img.zoom);
		setScreenBackground({name:img.name,height:sc.height,width:sc.width});
	} else setScreenBackground(img);
};
this._applyOV = function(ov){
	if(typeof ov==="object" && ov.scale){
		var sc = this._aid.ooImageScale(ov.x,ov.y,ov.zoom);
		setScreenOverlay({name:ov.name,height:sc.height,width:sc.width});
	} else setScreenOverlay(ov);
};
}).call(this);
