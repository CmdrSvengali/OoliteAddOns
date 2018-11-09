/* global system,worldScripts,Timer */
/* (C) Svengali 2016-2018, License CC-by-nc-sa-4.0 - Detect changes in custom role entity */
(function(){
"use strict";
this.name = "lib_test";

// There are a few AddOns which are changing / removing custom role entities. Uncalled!

this.shipSpawned = function(){
	delete this.shipSpawned;
	this.$checkTimer = new Timer(this,this._doCheck,0.5);
};
this._stopTimers = function(warn){
	if(this.$checkTimer) this.$checkTimer.stop();
	this.$checkTimer = null;
	return;
};
this._doCheck = function _doCheck(){
	var eq = {
		accuracy: -2,
		autoAI: false,
		autoWeapons: false,
		bounty: 0,
		cloakAutomatic: false,
		energyRechargeRate: 3,
		fuel: 6,
		heatInsulation: 1,
		isBeacon: false,
		isCloaked: false,
		isDerelict: false,
		isJamming: false,
		isPirate: false,
		isPirateVictim: false,
		isPolice: false,
		isTrader: false,
		maxEnergy: 450,
		maxEscorts: 2,
		missileCapacity: 4,
		missileLoadTime: 4,
		name: "Boa",
		shipClassName: "Boa"
	},
	eqs = {
		aftWeapon: ["EQ_WEAPON_PULSE_LASER"],
		equipment: ["EQ_FUEL_SCOOPS","EQ_ESCAPE_POD"],
		forwardWeapon: ["EQ_WEAPON_PULSE_LASER"],
		missiles: ["EQ_MISSILE","EQ_MISSILE","EQ_MISSILE"],
		portWeapon: ["EQ_WEAPON_NONE"],
		starboardWeapon: ["EQ_WEAPON_NONE"]
	},
	wps = ["weaponPositionForward","weaponPositionAft","weaponPositionPort","weaponPositionStarboard"],
	listA = Object.keys(eq), lA = listA.length,
	listB = Object.keys(eqs), lB = listB.length,
	i,j,k,cur, warn = worldScripts.Lib_Main._lib.$entCstChanged;
	for(i=0;i<lA;i++) if(this.ship[listA[i]] !== eq[listA[i]] && warn.indexOf(listA[i])===-1) warn.push(listA[i]);
	for(i=0;i<lB;i++){
		cur = this.ship[listB[i]];
		if(cur.length){
			for(j=0;j<cur.length;j++) if(cur[j].equipmentKey !== eqs[listB[i]][j] && warn.indexOf(listB[i])===-1) warn.push(cur[j].equipmentKey);
		} else if(cur.equipmentKey !== eqs[listB[i]][0] && warn.indexOf(listB[i])===-1) warn.push(listB[i]);
	}
	for(k=0;k<4;k++) if(this.ship[wps[k]].length>1 && warn.indexOf(wps[k])===-1) warn.push(wps[k]);
	if(145!==this.shipDied.toSource().length+this.shipRemoved.toSource().length) worldScripts.Lib_Main._lib.$entCstPatched = true;
	this._stopTimers();
};
this.shipDied = function(){this._stopTimers();};
this.shipRemoved = function(){this._stopTimers(); worldScripts.Lib_Main._lib.$entCstRemoved = true;};
this.entityDestroyed = function(){this._stopTimers();};
this.shipLaunchedEscapePod = function(){this._stopTimers();};
this.shipWillEnterWormhole = function(){this._stopTimers();};
this.playerWillEnterWitchspace = function(){this._stopTimers();};
}).call(this);
