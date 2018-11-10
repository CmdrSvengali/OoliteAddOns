// jshint bitwise:false
/* global Sound,SoundSource,Timer,clock,expandMissionText,missionVariables,player,system,worldScripts */
/* BGS 2.5, (C) Svengali 2010-2018, License CC-by-nc-sa-4.0 */
(function(){
"use strict";
this.name = "BGS";

this.$pub = {
	chat:[],
	engineAmbi:"[bgs_ambiEngine]",
	engineDown:"[bgs_fxEngineDown]",
	engineUp:"[bgs_fxEngineUp]",
	witch:[],
	witchCNT:6,
	witchG:"[bgs_fxCountG]",
	witchH:"[bgs_fxCountH]"
};
this.$BGS = {
	chat:1,
	count:1,
	def:{engineAmbi:"[bgs_ambiEngine]",engineDown:"[bgs_fxEngineDown]",engineUp:"[bgs_fxEngineUp]"},
	engine:1,
	engineAmbi:1,
	jump:1,
	hypFX:1,
	hypFXExt:1,
	dockFX:1,
	curSpeed:0,
	curSnd:null,
	dockShader:"bgs_docking",
	hypCtrl:0,
	hypShader:"bgs_hyper",
	noShade:0,
	seconds:0,
	CNT:{wp:0,wpType:0,hyper:15},
	conf:{chatPause:26,cntAdd:-0.3,jitter:0.002,E0:0x1ff},
	inf: {
		Name:"BGS",Display:"Config",Alive:"$BGS.inf",Notify:"_notification",Reset:true,
		SInt:{
			S0:{Name:"$BGS.conf.jitter",Def:0.002,Float:1,Min:0.0001,Max:0.1,Desc:"Jitter"},
			S1:{Name:"$BGS.conf.cntAdd",Def:-0.3,Float:1,Min:-2,Max:2,Desc:"Offset"},
			S2:{Name:"$BGS.conf.chatPause",Def:26,Min:18,Max:42,Desc:"Chatter pause"},
			Info:"^BGS_INFS"
		},
		EInt:{
			E0:{Name:"$BGS.conf.E0",Def:0x1ff,Min:0,Max:0x3ff,Desc:["Chatter","Countdown","Engine","EngineAmbi","Jump","QMine","Jump FX","Exit FX","Dock FX","FX Redux"]},
			Info:"^BGS_INFE"
		}
	}
};
this.startUp = function(){
	delete this.startUp;
	this._aid = worldScripts.Lib_Main._lib;
	if(missionVariables.BGS){
		this.$BGS.conf = this._aid.objMerge(this.$BGS.conf,JSON.parse(missionVariables.BGS));
		this._aid.clrMVs(["BGS"]);
		this._notification();
	}
	var b = this.$BGS, check, lvl = this._aid.ooShaders(), ov = "bgs_inter_ov.png", fu = "bgs_fullscr.png",
		sa = "bgs-m_fx_interface_none.ogg", sb = "bgs-m_fx_interface_map.ogg", sc = "bgs-m_fx_interface_select.ogg";
	if(!lvl){b.dockFX = 0; b.hypFX = 0; b.hypFXExt = 0; b.noShade = 1;}
	// Check countdown sounds
	check = Sound.load('[galactic-hyperspace-countdown-begun]');
	if(check && check.name!=='bgs-m_silence.ogg') b.count = 0;
	check = Sound.load('[hyperspace-countdown-begun]');
	if(check && check.name!=='bgs-m_silence.ogg') b.count = 0;
	worldScripts.Lib_GUI.$guis.BGS = {
		generic:{pic:"bgs_options.png"},
		GUI_SCREEN_EQUIP_SHIP:{pic:"bgs_ship.png",snd:"bgs-m_fx_equipment1.ogg"},
		GUI_SCREEN_INTERFACES:{pic:ov,snd:"[menu-navigation-not]"},
		GUI_SCREEN_KEYBOARD:{pic:fu},
		GUI_SCREEN_LONG_RANGE_CHART:{pic:ov},
		GUI_SCREEN_MANIFEST:{pic:"bgs_manifest.png",snd:"bgs-m_fx_manifest1.ogg",sndF:"bgs-m_fx_manifest1.ogg"},
		GUI_SCREEN_MARKET:{pic:"bgs_market.png",snd:"bgs-m_fx_market1.ogg"},
		GUI_SCREEN_MARKETINFO:{pic:"bgs_market.png"},
		GUI_SCREEN_SHIPLIBRARY:{pic:fu},
		GUI_SCREEN_SHIPYARD:{pic:"bgs_ship.png",snd:"bgs-m_fx_shipyard1.ogg"},
		GUI_SCREEN_SHORT_RANGE_CHART:{pic:ov},
		GUI_SCREEN_STATUS:{pic:"bgs_status_docked.png",picFlight:"bgs_status_inflight.png",picFlightRed:"bgs_status_red.png",picVoid:"bgs_status.png"},
		GUI_SCREEN_STICKMAPPER:{pic:fu},
		GUI_SCREEN_STICKPROFILE:{pic:fu},
		GUI_SCREEN_SYSTEM_DATA:{pic:"bgs_inter.png",picNova:"bgs_inter_red.png",snd:"bgs-m_fx_systemdata1.ogg",sndF:"bgs-m_fx_systemdata1.ogg"}
	};
	worldScripts.Lib_GUI.$IDs.BGS = {
		generic: {pic:fu,mpic:ov},
		"oolite-contracts-cargo-none":{pic:ov,snd:sa},
		"oolite-contracts-cargo-details":{mpic:ov,snd:sb},
		"oolite-contracts-cargo-summary":{pic:ov,snd:sc},
		"oolite-contracts-parcels-none":{pic:ov,snd:sa},
		"oolite-contracts-parcels-details":{mpic:ov,snd:sb},
		"oolite-contracts-parcels-summary":{pic:ov,snd:sc},
		"oolite-contracts-passengers-none":{pic:ov,snd:sa},
		"oolite-contracts-passengers-details":{mpic:ov,snd:sb},
		"oolite-contracts-passengers-summary":{pic:ov,snd:sc},
		"oolite-register":{pic:fu}
	};
	this.$pub.chat = expandMissionText("BGS_CHATTER").split("|");
	this.$pub.witch = expandMissionText("BGS_COUNT").split("|");
	var amb = [
		{name:"bgs-ambi_station1.ogg",dur:41,vol:0.5},
		{name:"bgs-ambi_station2.ogg",dur:41,vol:0.5},
		{name:"bgs-ambi_station3.ogg",dur:41,vol:0.5},
		{name:"bgs-ambi_station4.ogg",dur:41,vol:0.5},
		{name:"bgs-ambi_station5.ogg",dur:41,vol:0.5}
	];
	worldScripts.Lib_GUI.$ambi.generic = worldScripts.Lib_GUI.$ambi.generic.concat(amb);
	var red = [
		{name:"bgs-ambi_station_r1.ogg",dur:30,vol:0.6},
		{name:"bgs-ambi_station_r2.ogg",dur:30,vol:0.6}
	];
	worldScripts.Lib_GUI.$ambi.redux = worldScripts.Lib_GUI.$ambi.redux.concat(red);
	var none = [
		{name:"bgs-ambi_station_r3.ogg",dur:30,vol:0.5}
	];
	worldScripts.Lib_GUI.$ambi.none = worldScripts.Lib_GUI.$ambi.none.concat(none);
};
this.startUpComplete = function(){
	delete this.startUpComplete;
	this.$sndA = new SoundSource(); // engineAmbi or witchAmbi
	this.$sndA.loop = true;
	this.$sndB = new SoundSource(); // engineUp or engineDown
	this.$sndC = new SoundSource(); // chatter
	this.$sndD = new SoundSource(); // fxWitch, fxHyper
	this.$sndWP = new SoundSource(); // countdown
	worldScripts.Lib_Config._registerSet(this.$BGS.inf);
};
this.guiScreenChanged = function(){
	if(this.$saved){
		this._aid.clrMVs(["BGS"]);
		this.$saved = null;
	}
};
this.playerCancelledJumpCountdown = this.playerStartedAutoPilot = function(){
	this._clrTimer(1);
	this.$sndA.stop();
	this.$sndWP.stop();
};
this.playerJumpFailed = function(){
	this._clrTimer(1);
};
this.playerStartedJumpCountdown = function(type,duration){
	var b = this.$BGS;
	if(b.jump){
		this.$sndD.playSound("[bgs_fxWitch]");
		this.$sndA.playSound("[bgs_ambiWitch]");
	}
	if(duration<1 || !b.count) return;
	b.CNT.wp = duration;
	b.CNT.wpType = (type==="galactic"?1:0);
	b.CNT.hyper = duration;
	this._clrTimer(1);
	this.$WPTimer = new Timer(this,this._doWPTimer,0,1);
	if(b.conf.cntAdd){
		this.$WPTimer.stop();
		this.$WPTimer.nextTime = clock.absoluteSeconds+b.conf.cntAdd;
		this.$WPTimer.start();
	}
};
this.playerWillSaveGame = function(){
	missionVariables.BGS = JSON.stringify(this.$BGS.conf);
	this.$saved = 1;
};
this._setInf = function(k,i,w,f){
	if(i["bgs_"+k]) w[k] = i["bgs_"+k];
	else w[k] = f[k];
};
this.shipWillLaunchFromStation = function(station){
	var b = this.$BGS, p = this.$pub, inf = player.ship.scriptInfo;
	this._setInf("engineAmbi",inf,p,b.def);
	this._setInf("engineUp",inf,p,b.def);
	this._setInf("engineDown",inf,p,b.def);
	if(b.dockFX) this._setDockTex(station,0);
	b.curSound = null;
	this.$bgsTimer = new Timer(this,this._doBGSTimer,0,0.25);
};
this.shipWillEnterWitchspace = function(type){
	this.$sndC.stop();
	this.$BGS.hypCtrl = 0;
	if(type==="galactic jump") this.$BGS.hypCtrl = 1;
};
this.shipWillExitWitchspace = function(){
	var b = this.$BGS, oo, uni;
	if(!b.hypFX || player.ship.docked) return;
	system.breakPattern = false;
	oo = this._aid.ooScreen();
	if(system.isInterstellarSpace) uni = [0,3,oo.ratio];
	else {
		if(b.hypCtrl) uni = [3,0,oo.ratio];
		else uni = [2,-3,oo.ratio];
	}
	var ent = this._aid.entFXCreate(b.hypShader,250);
	this._setSHProp(ent,[250,9,uni,[0,0,1.4],1,4,0]);
};
this.shipExitedWitchspace = function(){
	this.$sndA.stop();
	var b = this.$BGS, uni = [0.3,0.3,1], z = -25;
	if(player.ship.isInSpace && b.hypFXExt){
		if(system.isInterstellarSpace) uni = [1.0,0.6,0.6];
		else if(b.hypCtrl) uni = [1.0,0.5,1.0];
		var ent = this._aid.entFXCreate("bgs_exitWormhole",z);
		this._setSHProp(ent,[z,22,[14,-4.6,0],uni,0,0.9,1]);
	}
	if(b.jump) this.$sndD.playSound("[bgs_fxWitch]");
};
this.shipWillDockWithStation = function(station){
	if(this.$BGS.dockFX) this._setDockTex(station,1);
	this.shipDied();
};
this.shipDied = function(){
	this._clrTimer(1,1);
	this._clrSNDs();
};
this.shipLaunchedEscapePod = function(){
	this.shipDied();
};
this.gamePaused = function(){
	this._clrSNDs();
};
this._clrTimer = function(w,g){
	if(w && this.$WPTimer){
		this.$WPTimer.stop();
		delete this.$WPTimer;
	}
	if(g && this.$bgsTimer){
		this.$bgsTimer.stop();
		delete this.$bgsTimer;
	}
};
this._clrSNDs = function(){
	this.$sndA.stop();
	this.$sndB.stop();
	this.$sndC.stop();
	this.$sndWP.stop();
};
this._doBGSTimer = function(){
	if(!player.ship.isInSpace) return;
	var ps = player.ship, b = this.$BGS, ox = b.conf, p = this.$pub, ch,cg,r;
	if(b.engine){
		if(b.engineAmbi && 0<ps.speed-ox.jitter){
			if(!this.$sndA.isPlaying) this.$sndA.playSound(p.engineAmbi);
		} else this.$sndA.stop();
		if(!ps.torusEngaged){
			if(ps.speed>b.curSpeed+ox.jitter) ch = p.engineUp;
			else if(ps.speed<b.curSpeed-ox.jitter) ch = p.engineDown;
			if(ch){
				cg = Sound.load(ch);
				if(cg && (cg.name!==b.curSnd || !this.$sndB.isPlaying)){
					this.$sndB.playSound(ch);
					if(this.$sndB.sound.name!==b.curSnd) b.curSnd = this.$sndB.sound.name;
				}
			}
		}
		b.curSpeed = ps.speed;
	}
	if(ps.withinStationAegis){
		if(b.chat && !this.$sndC.isPlaying && clock.absoluteSeconds>b.seconds){
			r = p.chat[Math.floor(Math.random()*p.chat.length)];
			this.$sndC.sound = r;
			this.$sndC.volume = 0.6;
			this.$sndC.play();
			b.seconds = clock.absoluteSeconds+this._aid.randXY(14,ox.chatPause);
		}
	} else if(this.$sndC.isPlaying) this.$sndC.stop();
	return;
};
this._doWPTimer = function(){
	var a = this.$BGS.CNT, s;
	a.wp--;
	if(!this.$sndWP.isPlaying){
		if(a.wp>13 && a.hyper<a.wp+2){
			if(!a.wpType) s = this.$pub.witchH;
			else s = this.$pub.witchG;
			this.$sndWP.playSound(s);
		} else if(a.wp<this.$pub.witchCNT && a.wp>-1){
			this.$sndWP.playSound(this.$pub.witch[a.wp]);
		} else if(a.wp<-1) this._clrTimer(1);
	}
	if(this.$BGS.hypFX && player.ship.isValid && a.wp===-1) this.$sndD.playSound("[bgs_fxHyper]");
};
// TODO: Multiple docks?
this._setDockTex = function(st,land){
	if(land) this.$sndB.playSound(this.$pub.engineDown);
	if(st.hasRole("aquatics_HQ")) return; // possible for one, if we get more we'd need an indicator.
	var shs = [0.5,1,3,5,7], sh = 2.5, as = 1.0, co = 0.4, sit = null, sis = null, tint = [0.2824,0.171,0.0507],
		oo, inf, isMain = st.isMainStation, i;
	if(st.name==="Rock Hermit") isMain = true;
	if(!isMain && !st.scriptInfo) return;
	if(st.scriptInfo){
		inf = st.scriptInfo;
		if(inf.bgs_tunnel_off) return;
		if(inf.bgs_tunnel_texture) sit = inf.bgs_tunnel_texture;
		if(inf.bgs_tunnel_tint){
			tint = inf.bgs_tunnel_tint.split(",");
			for(i=0;i<3;i++) tint[i] = parseFloat(tint[i]);
		}
		if(inf.bgs_tunnel_shape) sis = parseFloat(inf.bgs_tunnel_shape);
		if(inf.bgs_tunnel_contrast) co = parseFloat(inf.bgs_tunnel_contrast);
	}
	if(isMain || sit || sis){
		if(!sis){
			var s = st.subEntities;
			var l = s.length;
			for(i=0;i<l;i++){
				if(s[i].isDock){
					var bb = s[i].boundingBox,r;
					if(bb.x>=bb.y) r = bb.x/bb.y;
					else r = bb.y/bb.x;
					sh = shs[this._aid.clamp(Math.floor(r),0.5,4)];
					break;
				}
			}
		} else sh = sis;
		oo = this._aid.ooScreen();
		as = oo.ratio;
		if(sh>1.1) as *= 0.5;
		var ent = this._aid.entFXCreate(this.$BGS.dockShader,250);
		this._setSHProp(ent,[250,4,[!land,sh,as],tint,0,0,0]);
		if(sit) this._aid.entSetMainTex(ent,sit);
		ent.shaderFloat1 = co;
		st.breakPattern = false;
	}
};
this._setSHProp = function(ent,arr){
	ent.script.$repos = arr[0];
	ent.script.$ridTime = arr[1];
	ent.shaderVector1 = arr[2];
	ent.shaderVector2 = arr[3];
	ent.script.$look = arr[4];
	ent.script.$reposTil = arr[5];
	ent.script.$view = arr[6];
};
// script_info keys are not merged!
this._shipSpawned = function(ship){
	if(ship.isMine && ship.AIScript && ship.AIScript.name==="Oolite Q-bomb AI"){
		if(ship.script.shipDied) ship.script.bgsShipDied = ship.script.shipDied;
		ship.script.shipDied = function(whom,why){
			if(ship.script.bgsShipDied) ship.script.bgsShipDied(whom,why);
			if(!player.ship.isValid || ship.position.distanceTo(player.ship.position)>25600) return;
			if(why && why==="cascade weapon"){var a = new SoundSource(); a.playSound("[bgs_fxQMine]");}
		};
	}
};
this._notification = function(){
	var b = this.$BGS, a = b.conf.E0, c,
		d = [[1,"chat",0],[2,"count",0],[4,"engine",0],[8,"engineAmbi",0],[16,"jump",0],
			[64,"hypFX",1],[128,"hypFXExt",1],[256,"dockFX",1]];
	for(var i=0;i<8;i++){
		c = d[i];
		if(c[2]===1 && b.noShade) continue;
		if((a&c[0])) b[c[1]] = 1;
		else b[c[1]] = 0;
	}
	if((a&32)) this.shipSpawned = function(ship){this._shipSpawned(ship);};
	else delete this.shipSpawned;
	if(!b.noShade){
		if((a&512)){
			b.hypShader = "bgs_hyper_redux";
			b.dockShader = "bgs_docking_redux";
		} else {
			b.hypShader = "bgs_hyper";
			b.dockShader = "bgs_docking";
		}
	}
	return;
};
this._Help = function(what){
	var h;
	switch(what){
		case "$pub": h = "BGS_HELP_pub"; break;
		default: h = "BGS_HELP";
	}
	return expandMissionText(h);
};
}).call(this);
