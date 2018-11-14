/* jshint bitwise:false, forin:false */
/* global clock,galaxyNumber,guiScreen,mission,missionVariables,player,system,worldScripts */
/* (C) Svengali 2016-2018, License CC-by-nc-sa-4.0 */
(function(){
"use strict";
this.name = "Lib_PAD_Events";

this.$config = {
	bounty:0,
	credits:0,
	fined:0,
	rank:"Harmless",
	status:"Clean",
	updCR:0,
	updNavy:1,
	updNova:1,
	updTP:0
};
this.$delay = [];
this.$init = 1;
this.startUp = function(){
	this.$init = 0;
};
this.startUpComplete = function(){
	var m = ["PRELUDE","MISSION_COMPLETE","STAGE_1","RUNNING"], mc = -1, mt = -1;
	if(missionVariables.Lib_PAD_EVENTS) this.$config = JSON.parse(missionVariables.Lib_PAD_EVENTS);
	if(missionVariables.conhunt) mc = m.indexOf(missionVariables.conhunt);
	if(missionVariables.thargplans) mt = m.indexOf(missionVariables.thargplans);
	if(this.$config.updNavy && worldScripts.Lib_PAD.$data.GALCOP.NAVY.entry==="") this._add("GALCOP.NAVY.entry",clock.clockString,1);
	this.$config.updNavy = 0;
	if(mc>-1) this._addCurruthers(1);
	if(mt>-1){
		this._addFortesque(1);
		if(mt>0) this._addBlake(1);
	}
	if(this.$config.updNova && missionVariables.nova==="NOVA_HERO"){
		this._add("PERSONS.GENERIC.info","Survived System Nova.",1);
		this.$config.updNova = 0;
	}
	this.$config.bounty = player.bounty;
	this.$config.credits = player.credits;
	this.$config.rank = player.rank;
	this.$config.status = player.legalStatus;
};
this.playerWillSaveGame = function(){
	missionVariables.Lib_PAD_EVENTS = JSON.stringify(this.$config);
};
this.guiScreenChanged = function(){
	if(!player.ship.docked) return;
	if(guiScreen==="GUI_SCREEN_MISSION" && mission.screenID){
		switch(mission.screenID){
			case "oolite-constrictor-hunt-briefing":
				if(this.$config.updNavy) this._add("GALCOP.NAVY.entry",clock.clockString.substr(0,13));
				this.$config.updNavy = 0;
				this._add("LOGS.GENERIC.list","A job for the Navy to hunt a ship.");
				this._addCurruthers();
				this.$config.updCR = 1;
				break;
			case "oolite-constrictor-hunt-debriefing":
				this._add("LOGS.GENERIC.list","Yeeehaa. Got the Constrictor!");
				this._add("GALCOP.NAVY.missions","Eliminated the stolen Constrictor.");
				this._add("GALCOP.NAVY.kills","++",1);
				this.$config.updCR = 0;
				break;
			case "oolite-thargoid-plans-briefing1":
				this._addFortesque();
				break;
			case "oolite-thargoid-plans-briefing2":
				this._add("LOGS.GENERIC.list","A job for the Navy to deliver plans.");
				this._addBlake();
				this.$config.updTP = 1;
				break;
			case "oolite-thargoid-plans-debriefing":
				this._add("GALCOP.NAVY.missions","Delivered Thargoid defence plans.");
				this._add("LOGS.GENERIC.list","Yeeehaa. Delivered the plans!");
				this.$config.updTP = 0;
				break;
			case "oolite-nova-hero":
			case "oolite-nova-disappointed":
			case "oolite-nova-ignored":
			case "oolite-nova-coward":
				this._add("PERSONS.GENERIC.info","Survived System Nova.");
				this.$config.updNova = 0;
				break;
		}
	}
};
this.playerCompletedContract = function(type,result,fee,contract){
	var txt,f;
	if(!fee){
		switch(type){
			case "passenger": txt = "Nooo!! "+contract.name+" did not pay anything."; break;
			case "parcel": txt = "Argh! Didn't get paid for "+contract.name+"."; break;
			case "cargo": txt = "Argh! Didn't get paid for "+contract.cargo_description+"."; break;
		}
	} else {
		f = formatCredits(fee/10,1);
		switch(type){
			case "passenger": txt = (result==="success"?"On arriving":"Even if late")+" "+contract.name+" paid "+f+" ₢."; break;
			case "parcel": txt = (result==="success"?"On arriving":"Even if late")+" I got "+f+" ₢ for delivering "+contract.name+"."; break;
			case "cargo": txt = (result==="success"?"On arriving":"Even if "+result)+" I got "+f+" ₢ for delivering "+contract.cargo_description+"."; break;
		}
	}
	if(txt) this._add("LOGS.GENERIC.list",txt);
};
this.playerEnteredNewGalaxy = function(){
	this.$delay.push(["LOGS.GENERIC.list","Ship jumped to galaxy "+(galaxyNumber+1)+"."]);
};
this.playerRescuedEscapePod = function(fee, reason, pilot){
	fee = formatCredits(fee,1);
	if(system.isInterstellarSpace) this.$delay.push(["LOGS.GENERIC.list","Rescued "+pilot.name+" between worlds"+(fee?" Got "+(fee/10)+" ₢.":".")]);
	else this.$delay.push(["LOGS.GENERIC.list","Rescued "+pilot.name+" at "+system.name+(fee?" Got "+(fee/10)+" ₢.":".")]);
};
this.shipLaunchedEscapePod = function(){
	if(system.isInterstellarSpace) this.$delay.push(["LOGS.GENERIC.list","Nargh! Had to bail out to nowhere."]);
	else this.$delay.push(["LOGS.GENERIC.list","Nargh! Had to bail out at "+system.name+"."]);
};
this.shipWillDockWithStation = function(){
	this.$config.bounty = player.bounty;
	this.$config.credits = player.credits;
	if(player.rank!==this.$config.rank) this._add("LOGS.GENERIC.list","Rank of "+player.rank+" achieved!");
	this.$config.rank = player.rank;
	this.$config.status = player.legalStatus;
	this._addDelayed();
};
this.shipDockedWithStation = function(st){
	if(!player.ship.docked) return;
	var m;
	if(this.$config.credits!==player.credits){
		if(player.credits>this.$config.credits) m = "Yeah! Earned "+formatCredits(player.credits-this.$config.credits,1)+" ₢ at "+st.displayName;
		else m = "No! Lost "+formatCredits(this.$config.credits-player.credits,1)+" ₢ at "+st.displayName;
		if(system.isInterstellarSpace) m += ".";
		else m += " "+system.name+".";
		this._add("LOGS.GENERIC.list",m);
	}
	if(player.ship.markedForFines) this.$config.fined++;
};
this.playerBoughtNewShip = function(){
	this.$config.credits = player.credits;
};
// Note: Handler is fired (too?) early, so guarding (this.$init) is necessary!!!
this.equipmentAdded = function(eq){
	if(this.$init) return;
	this.$config.credits = player.credits;
	if(eq==="EQ_NAVAL_ENERGY_UNIT"){
		this._add("LOGS.GENERIC.list","Got a naval energy unit.");
		this._add("GALCOP.NAVY.awards","Naval energy unit.");
	}
	if(eq==="EQ_CLOAKING_DEVICE"){
		this.$delay.push(["LOGS.GENERIC.list","Got a cloaking device."]);
		this.$delay.push(["PERSONS.GENERIC.info","Found cloaking device."]);
	}
};
this.shipLaunchedFromStation = function(){
	this.$config.bounty = player.bounty;
	this.$config.credits = player.credits;
	this.$config.rank = player.rank;
	this.$config.status = player.legalStatus;
};
this.shipBountyChanged = function(delta){
	var m;
	if(this.$config.bounty===player.bounty+delta) return;
	if(!player.bounty) m = "Pfew. Clean again.";
	else {
		if(delta>0) m = "Ouch. Got a bounty.";
		if(delta<0) m = "Nice. They reduced my bounty.";
		if(this.$config.status!==player.legalStatus) m += " Now I'm "+player.legalStatus+".";
	}
	if(m) this.$delay.push(["LOGS.GENERIC.list",m]);
	this.$config.bounty = player.bounty;
	this.$config.status = player.legalStatus;
};
this.shipKilledOther = function(whom){
	if(player.rank!==this.$config.rank){
		this.$delay.push(["LOGS.GENERIC.list","Rank of "+player.rank+" achieved!"]);
		this.$config.rank = player.rank;
	}
	if(this.$config.updTP && whom && whom.isThargoid) this.$delay.push(["GALCOP.NAVY.kills","++",1]);
};
this.shipWillExitWitchspace = function(){
	if(system.isInterstellarSpace) this.$delay.push(["LOGS.GENERIC.list","Witchspace misjump occurred."]);
};
this._add = function(p,w,s){
	worldScripts.Lib_PAD._setPageEntry(p,w,s);
};
this._addDelayed = function(p,w,s){
	var l = this.$delay.length;
	if(l){
		for(var i=0;i<l;i++) worldScripts.Lib_PAD._setPageEntry(this.$delay[i][0],this.$delay[i][1],this.$delay[i][2]);
	}
	this.$delay.length = 0;
};
this._addPage = function(p,w,t,s){
	worldScripts.Lib_PAD._addPageInCategory(p,w,t,s);
};
this._addCurruthers = function(s){
	this._addPage("PERSONS.CAPTAIN CURRUTHERS",{name:"James Curruthers",origin:"Restricted data",species:"Human colonial",gender:"Male",age:45,ship:"Viper",rank:"Captain",t0:21,t1:"lib_ovc_curruthers.png",t2:8},["GALCOP.NAVY"],s);
};
this._addFortesque = function(s){
	this._addPage("PERSONS.CAPTAIN FORTESQUE",{name:"Peter Fortesque",origin:"Restricted data",species:"Human colonial",gender:"Male",age:41,ship:"Viper",rank:"Captain",t0:21,t1:"lib_ovc_fortesque.png",t2:8},["GALCOP.NAVY"],s);
};
this._addBlake = function(s){
	this._addPage("PERSONS.AGENT BLAKE",{name:"Paul Blake",origin:"Restricted data",species:"Restricted data",gender:"Male",age:34,ship:"Restricted data",rank:"Agent",t0:21,t1:"lib_ovc_blake.png"},["GALCOP.NAVY"],s);
};
}).call(this);
