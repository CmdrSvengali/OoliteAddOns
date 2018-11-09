/* jshint forin:false, bitwise:false */
/* global Sound,SoundSource,Timer,clock,guiScreen,mission,missionVariables,player,system,worldScripts */
/* (C) Svengali 2016-2018, License CC-by-nc-sa-4.0 */
(function(){
"use strict";
this.name = "Lib_Music";
this.copyright = "(C)2016-2018";
this.description = "Event-driven and generic music handling.";

this.$E0 = 0;
this.$inf = {
	Name:"Lib_Music",Display:"Music-Config",Alive:"$inf",Alias:"Library",
	SInt:{S0:{Name:"$dub.vol",Def:0.8,Min:0,Max:1,Float:true,Desc:"Volume",Notify:"_updateVol"}},
	EInt:{E0:{Name:"$E0",Def:0,Min:0,Max:1,Hide:true,Desc:[" "]},Info:"No AddOn installed.",Notify:"_buildList"}
};
this.$act = {
	generic:0
};
this.$groupIDs = [];
this.$radios = [];
this.$media = {
	aegis:{enter:[],exit:[]},
	alert:{red:[]},
	docked:{main:[],any:[]},
	exitWS:{inter:[],goneNova:[],doNova:[],standard:[]},
	killed:{any:[]},
	launch:{inter:[],goneNova:[],doNova:[],main:[],any:[]},
	planetIn:{enterMain:[],enterSun:[],any:[]},
	planetOut:{exitMain:[],exitSun:[],any:[]},
	radio:{generic:[]},
	rescued:{any:[]},
	scooped:{any:[]},
	scoopFuel:{fuel:[]}
};
this.$dub = {
	auto:0,
	channel:null,
	cnt:0,
	cur:null,
	dur:0,
	ent:null,
	hand:null,
	kick:0,
	lockAlert:1,
	lockDock:0,
	lockFuel:1,
	lockKill:1,
	lockPlanet:1,
	now:0,
	queue:[],
	radio:null,
	reinit:0,
	spec:null,
	vol:0.8
};
this.startUp = function(){
	delete this.startUp;
	var mus;
	this._aid = worldScripts.Lib_Main._lib;
	this.$snd = new SoundSource();
	this.$snd.sound = "lib_music_fade.ogg";
	if(missionVariables.LIB_MUSIC){
		mus = JSON.parse(missionVariables.LIB_MUSIC);
		this.$dub.vol = mus.vol;
		this.$snd.volume = mus.vol;
	}
};
this.playerWillSaveGame = function(){
	var t, s = [], ind, mus = {};
	if(this.$E0){
		t = [].concat(this.$inf.EInt.E0.Desc);
		for(var i=0;i<t.length;i++){
			ind = Math.pow(2,i);
			if(this.$E0&ind) s.push(t[i]);
		}
		if(s.length>24) s.length = 24;
		missionVariables.LIB_RADIO = JSON.stringify(s);
	} else missionVariables.LIB_RADIO = null;
	mus.vol = this.$dub.vol;
	missionVariables.LIB_MUSIC = JSON.stringify(mus);
};
/** Expects Object with the structure of this.$media (can be partial),
* except radio. The Arrays contain Objects with members:
* {snd: <filename>, dur: duration seconds <integer>, vol: optional, volume 0...1 <float>}
*/
this._addEventMusic = function(obj,ID){
	if(!obj || typeof obj!=="object" || typeof ID!=="string") return false;
	var c = this._aid.objClone(obj);
	for(var h in c){
		if(!this.$media[h] || h==="radio") continue;
		for(var s in c[h]){
			if(s==="any" && !this.$media[h][s]) continue;
			if(!this.$media[h][s]) this.$media[h][s] = [];
			for(var i=0;i<c[h][s].length;i++){
				c[h][s][i].act = ID;
				this.$media[h][s].push(c[h][s][i]);
			}
		}
	}
	if(this.$actClone){
		this.$actClone[ID] = 0;
		this.$act[ID] = 0;
	} else if(typeof this.$act[ID]!=="number") this.$act[ID] = 0;
	if(this.$groupIDs.indexOf(ID)===-1) this.$groupIDs.push(ID);
	return true;
};
/** Toggle status for group ID.
* - ID: Name <string>
*/
this._toggleGroup = function(ID){
	var a = this.$act;
	if(typeof a[ID]!=="number") return false;
	if(this.$actClone) a = this.$actClone;
	if(!a[ID]) a[ID] = 1;
	else a[ID] = 0;
	return a[ID];
};
/** Take priority for the specified GroupID.
* - ID: Name <string>
*/
this._setPriorityGroup = function(ID){
	var g,i,l;
	if(typeof this.$act[ID]!=="number") return false;
	this._clrPriorityGroup();
	this.$actClone = this._aid.objClone(this.$act);
	g = this.$groupIDs;
	l = g.length;
	for(i=0;i<l;i++) this.$act[g[i]] = 0;
	this.$act[ID] = 1;
	return true;
};
/** Clear priority.
*/
this._clrPriorityGroup = function(){
	if(this.$actClone) this.$act = this.$actClone;
	delete this.$actClone;
	return;
};
/** Add radio channel or merges. Expects Object with members:
* - name: Channel name <string>. Can be generic, docking, fight, (docked) entity name or a custom channel
* - sounds: Array of Objects with {snd: <filename>, dur: duration seconds <integer>, vol: optional, volume <float>}
* - radio: If set channel name will be listed in this.$radios
*/
this._addChannel = function(obj){
	var c = this._aid.objClone(obj),i,len=obj.sounds.length;
	if(!this.$media.radio[c.name]) this.$media.radio[c.name] = [];
	for(i=0;i<len;i++){
		c.sounds[i].act = c.name;
		this.$media.radio[c.name].push(c.sounds[i]);
	}
	if(this.$actClone){
		this.$actClone[c.name] = 1;
		this.$act[c.name] = 0;
	} else this.$act[c.name] = 1;
	if(c.radio && this.$radios.indexOf(c.name)===-1) this.$radios.push(c.name);
	return true;
};
/** Sets or clears custom radio channel.
* - str: Channel name <string> or null.
*/
this._setChannel = function(str){
	var d = this.$dub;
	switch(typeof str){
		case "string": if(typeof this.$act[str]==="number" && typeof this.$media.radio[str]!=="undefined") d.channel = str; break;
		case "object": if(!str) d.channel = null; break;
	}
	return d.channel;
};
this._buildList = function(){
	var c = this.$radios, l = c.length, ind, d = [];
	for(var i=0;i<l;i++){
		ind = Math.pow(2,i);
		if(this.$E0&ind) d = d.concat(this.$media.radio[c[i]]);
	}
	if(this.$E0 && d.length){
		this._addChannel({name:"RadioPlaylist",sounds:[]});
		this.$media.radio.RadioPlaylist = d;
		this._setChannel("RadioPlaylist");
	} else this.$dub.channel = null;
};
this._updateInf = function(){
	var c = this.$radios, l = c.length, max = Math.pow(2,l)-1, o = this.$inf.EInt;
	o.E0.Max = max&0xffffff;
	o.E0.Desc = [].concat(c);
	if(l){
		o.E0.Hide = false;
		o.Info = "Push selected radio channels to main playlist.";
	}
};
this._updateVol = function(){
	var d = this.$dub, mus, vol, cvol=1, i;
	if(d.cur){
		mus = Sound.musicSoundSource();
		vol = d.vol;
		if(mus.isPlaying){
			for(i=0;i<d.queue.length;i++){
				if(d.queue[i].snd===d.cur){
					if(d.queue[i].vol) cvol = d.queue[i].vol;
					break;
				}
			}
			mus.volume = vol*cvol;
		}
	}
	this.$snd.volume = d.vol;
};
this._selectGeneric = function(d){
	if(d.channel){
		d.queue = this.$media.radio[d.channel];
		d.spec = "generic";
	} else {
		if(d.radio){
			d.queue = this.$media.radio[d.radio];
			d.spec = d.radio;
		} else {
			d.queue = this.$media.radio.generic;
			d.spec = "generic";
		}
	}
	d.hand = "radio";
	d.now = 0;
};
this._resetTimer = function(t){
	if(this.$mediaTimer) this.$mediaTimer.stop();
	this.$mediaTimer = null;
	if(typeof t==="number") this.$mediaTimer = new Timer(this,this._doPlay,t,1);
};
this._doPlay = function(q,d){
	var sel,r,found,vol;
	if(!d) d = this.$dub;
	d.cnt++;
	if(!q){
		q = [];
		if(d.lockDock && player.ship.isValid && player.ship.docked){
			d.lockDock = 0;
			this.shipDockedWithStation(player.ship.dockedStation);
			return;
		}
	}
	if(d.cnt>d.dur){
		if(!d.now && d.hand==="radio") this._selectGeneric(d);
		if(!q.length){
			this._selectGeneric(d);
			q = d.queue;
			if(q.length) found = 1;
		} else found = 1;
		if(found){
			if(d.now && d.kick) this.$snd.play();
			// TODO: selection
			r = Math.floor(Math.random()*q.length);
			sel = q[r];
			vol = d.vol;
			if(sel.vol) vol *= sel.vol;
			Sound.playMusic(sel.snd,false,vol);
			d.dur = sel.dur;
			d.cnt = d.dur-2;
			d.cur = sel.snd;
		} else {
			d.dur = 1;
			d.cnt = 0;
		}
		d.ent = null;
		d.now = 0;
		d.kick = 0;
		if(found) this._resetTimer(d.dur+this._aid.randXY(13,22));
		else this._resetTimer();
		if(d.hand!=="radio") return d.dur;
		else return 10;
	} else d.hand = "radio";
	return 0;
};
this._performMedia = function(hand,spec,ent){
	var d = this.$dub,i,q=[],len,w, add = this.$media[hand].any, any = 1;
	if(hand!=="alert" && guiScreen==="GUI_SCREEN_MISSION") return 0;
	if(!ent && d.radio==="fight" && player.alertHostiles && hand!=="killed") return 0;
	if(ent && this.$media[hand][ent]){
		w = this.$media[hand][ent];
		if(w.length) any = 0;
	} else w = this.$media[hand][spec];
	if((!w || !w.length) && any && add){
		if(w) w = w.concat(add);
		else w = add;
	}
	if(w){
		len = w.length;
		// TODO: move the hard work to _toggleGroup and _setPriorityGroup
		for(i=0;i<len;i++){
			if(this.$act[w[i].act]) q.push(w[i]);
		}
		if(q.length){
			d.cnt = 1;
			d.dur = 0;
			d.hand = hand;
			d.spec = spec;
			d.queue = q;
			if(ent) d.ent = ent;
			else d.ent = null;
			d.now = 1;
			return this._doPlay(q,d);
		}
	}
	d.kick = 0;
	return 10;
};
// Handler
this.alertConditionChanged = function(to){
	var c = clock.absoluteSeconds, d = this.$dub;
	if(!player.ship.isInSpace) return;
	switch(to){
		case 1:
		case 2: 
			if(d.radio==="fight") d.radio = "generic";
			break;
		case 3:
			if(c>=d.lockAlert){
				d.kick = 1;
				d.lockAlert = c+this._performMedia("alert","red");
			}
			if(this.$media.radio.fight){
				d.radio = "fight";
				if(!this.$mediaTimer || !this.$media.alert.red.length) this._resetTimer(0);
			}
			break;
	}
};
this.playerRescuedEscapePod = function(fee,reason,occupant){
	var c = clock.absoluteSeconds;
	if(!occupant || !occupant.name || c<this.$dub.lockDock) return;
	this.$dub.lockDock = clock.absoluteSeconds+this._performMedia("rescued","ent",occupant.name);
};
this.shipDockedWithStation = function(station){
	var c = clock.absoluteSeconds, d = this.$dub;
	this._clrLock();
	if(!station) return;
	if(this.$media.radio[station.name]) d.radio = station.name;
	else d.radio = "generic";
	if(c<d.lockDock) return;
	this._resetTimer(0); // autopilot!
	if(station.isMainStation) this._performMedia("docked","main");
	else this._performMedia("docked","ent",station.name);
	d.lockDock = 0;
};
this.shipEnteredPlanetaryVicinity = function(planet){
	var aa,ab,c = clock.absoluteSeconds, d = this.$dub;
	if(!player.ship.isInSpace || !planet || c<d.lockPlanet) return;
	if(planet.isMainPlanet) aa = "enterMain";
	else if(planet.isSun) aa = "enterSun";
	else {
		aa = "ent";
		ab = planet.name;
	}
	d.kick = 1;
	d.lockPlanet = c+this._performMedia("planetIn",aa,ab);
};
this.shipEnteredStationAegis = function(station){
	var c = clock.absoluteSeconds, d = this.$dub;
	if(!player.ship.isInSpace || !station || c<d.lockPlanet) return;
	d.kick = 1;
	d.lockPlanet = c+this._performMedia("aegis","enter");
};
this.shipExitedStationAegis = function(station){
	var c = clock.absoluteSeconds, d = this.$dub;
	if(!player.ship.isInSpace || !station || c<d.lockPlanet) return;
	d.kick = 1;
	d.lockPlanet = c+this._performMedia("aegis","exit");
};
this.shipExitedPlanetaryVicinity = function(planet){
	var aa,ab,c = clock.absoluteSeconds, d = this.$dub;
	if(!player.ship.isInSpace || !planet || c<d.lockPlanet) return;
	if(planet.isMainPlanet) aa = "exitMain";
	else if(planet.isSun) aa = "exitSun";
	else {
		aa = "ent";
		ab = planet.name;
	}
	d.kick = 1;
	d.lockPlanet = c+this._performMedia("planetOut",aa,ab);
};
this.shipExitedWitchspace = function(){
	this._clrLock();
	var a;
	if(!player.ship.isInSpace) return;
	if(system.isInterstellarSpace) a = "inter";
	else if(system.sun.hasGoneNova) a = "goneNova";
	else if(system.sun.isGoingNova) a = "doNova";
	else a = "standard";
	this.$dub.kick = 1;
	this._performMedia("exitWS",a);
};
this.shipKilledOther = function(whom){
	var c = clock.absoluteSeconds, d = this.$dub;
	if(!player.ship.isInSpace || c<d.lockKill) return;
	d.kick = 1;
	if(whom && whom.name) d.lockKill = c+this._performMedia("killed","ent",whom.name);
	else d.lockKill = c+this._performMedia("killed","any");
};
this.shipScoopedFuel = function(){
	var c = clock.absoluteSeconds, d = this.$dub;
	if(!player.ship.isInSpace || c<d.lockFuel) return;
	d.kick = 1;
	d.lockFuel = c+this._performMedia("scoopFuel","fuel");
};
this.shipScoopedOther = function(whom){
	if(!player.ship.isInSpace || !whom || !whom.name) return;
	this.$dub.kick = 1;
	this._performMedia("scooped","ent",whom.name);
};
this.shipTargetDestroyed = function(target){
	var c = clock.absoluteSeconds, d = this.$dub, t;
	if(!player.ship.isInSpace || c<d.lockKill) return;
	d.kick = 1;
	if(target){
		t = target.name;
		if(t && this.$media.killed[t]){
			d.lockKill = c+this._performMedia("killed","ent",t);
			return;
		}
	}
	d.lockKill = c+this._performMedia("killed","any");
};
this.shipWillDockWithStation = function(){
	var d = this.$dub;
	d.auto = 0;
	if(d.cur) Sound.stopMusic(d.cur);
};
this.shipWillLaunchFromStation = function(station){
	var d = this.$dub;
	if(!station) return;
	d.radio = "generic";
	d.lockDock = 0;
	d.kick = 1;
	this._resetTimer(0);
	if(station.isMainStation) this._performMedia("launch","main");
	else this._performMedia("launch","ent",station.name);
};
// Special cases
this.gamePaused = function(){
	if(this.$dub.cur) Sound.stopMusic(this.$dub.cur);
	this._clrLock();
};
this.gameResumed = function(){
	if(this.$dub.auto && this.$media.radio.docking){
		this.playerStartedAutoPilot();
	} else this._resetTimer(0);
};
this.guiScreenChanged = function(){
	var d = this.$dub, k,m;
	if(guiScreen==="GUI_SCREEN_MISSION"){
		m = mission.screenID;
		if(m) k = worldScripts.Lib_GUI.$IDRules[m];
		if(!m || !k || !k.mus){
			if(d.cur) Sound.stopMusic(d.cur);
			this._resetTimer();
			d.reinit = 1;
		}
	}
};
this.missionScreenEnded = function(){
	if(this.$dub.reinit){
		this.$dub.reinit = 0;
		this._resetTimer(0);
	}
};
// Start session
this.missionScreenOpportunity = function(){
	delete this.missionScreenOpportunity;
	if(guiScreen!=="GUI_SCREEN_MISSION") this.shipDockedWithStation(player.ship.dockedStation);
	else this.$dub.reinit = 1;
	var c = this.$radios, l = c.length, ind, s;
	this._updateInf();
	if(missionVariables.LIB_RADIO){
		s = JSON.parse(missionVariables.LIB_RADIO);
		for(var i=0;i<l;i++){
			ind = c.indexOf(s[i]);
			if(ind!==-1) this.$E0 += Math.pow(2,ind);
		}
		this._buildList();
	}
	worldScripts.Lib_Config._registerSet(this.$inf);
};
this.playerCancelledAutoPilot = function(){
	var d = this.$dub;
	if(d.auto && d.cur) Sound.stopMusic(d.cur);
	d.radio = "generic";
	d.auto = 0;
	this._resetTimer(0);
};
this.playerStartedAutoPilot = function(){
	if(this.$media.radio.docking){
		Sound.stopMusic();
		this.$dub.radio = "docking";
		this.$dub.auto = 1;
		this._resetTimer(0);
	} else this._resetTimer();
};
this.shipDied = function(){
	this._resetTimer();
	if(this.$dub.cur) Sound.stopMusic(this.$dub.cur);
};
this.shipLaunchedEscapePod = function(){
	this.shipDied();
};
this._clrLock = function(){
	var d = this.$dub;
	d.lockAlert = 1;
	d.lockFuel = 1;
	d.lockKill = 1;
	d.lockPlanet = 1;
};
}).call(this);
