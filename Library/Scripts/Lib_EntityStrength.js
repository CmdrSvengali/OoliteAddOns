/* global system,worldScripts */
/* (C) Svengali 2016-2018, License CC-by-nc-sa-4.0 */
(function(){
"use strict";
this.name = "Lib_EntityStrength";

this.$weapons = ["EQ_WEAPON_NONE","EQ_WEAPON_MINING_LASER","EQ_WEAPON_PULSE_LASER","EQ_WEAPON_BEAM_LASER","EQ_WEAPON_MILITARY_LASER","EQ_WEAPON_THARGOID_LASER"];
this.$slotsA = ["forwardWeapon","aftWeapon","portWeapon","starboardWeapon"];
this.$slotsB = ["weaponPositionForward","weaponPositionAft","weaponPositionPort","weaponPositionStarboard"];
/** Returns strength value for passed entity.
*/
this._check = function(ent){
	var w = ent.weaponFacings,
		eq = ent.equipment,
		esc = ent.escorts,
		sec = ent.subEntityCapacity,
		c = 0, wc = 0, ind = 0,
		i, l, s, t, tt;
	c += ent.maxEnergy*(ent.maxPitch+ent.maxRoll+ent.maxYaw)*ent.energyRechargeRate;
	if(ent.isPlayer) c += (ent.maxAftShield*ent.aftShieldRechargeRate+ent.maxForwardShield*ent.forwardShieldRechargeRate)*0.5;
	c += ent.maxSpeed*ent.maxThrust;
	c *= 0.001;
	if(eq && eq.length){
		if(ent.isPlayer) c += eq.length;
		else c += eq.length*5;
	}
	if(esc && esc.length){
		l = esc.length;
		for(i=0;i<l;i++) c += this._check(esc[i])*0.5;
	}
	c += ent.maxEscorts;
	if(w){
		for(i=0;i<4;i++){
			t = ent[this.$slotsA[i]];
			if(t && t.equipmentKey){
				ind = this.$weapons.indexOf(t.equipmentKey);
				if(ind<0) ind = 6;
				tt = ent[this.$slotsB[i]];
				if(tt && tt.length) ind += tt.length; // multi
				wc += ind;
			}
		}
		if(ent.accuracy>1) wc *= ent.accuracy;
		c += wc*10;
	}
	if(sec){
		s = ent.subEntities;
		l = (s?s.length:0);
		for(i=0;i<l;i++) if(s[i].isTurret) c += 50;
		if(ent.isPlayer && l<sec) c += 50*(sec-l); // no cheats
	}
	c += ent.missileCapacity*5;
	if(!ent.maxSpeed) c /= ent.mass*0.000005;
	if(ent.isThargoid) c *= 1.5;
	c = Math.round(c);
	// Add value to ship script.
	if(ent.script) ent.script.$libStrength = c;
	return c;
};
/** Returns maximum value of NPC ships in the system.
	Params:
		rel - Piloted ships relative to entity.
		all - Return Array of all numbers.
		redo - Set script values. Do not use careless.
*/
this._gather = function(rel,all,redo){
	var a = [],b,l,i=0,c;
	if(rel) b = system.filteredEntities(this,function(e){return(e.isShip && e.isValid && e.isPiloted && !e.isPlayer);},rel,52000);
	else {
		b = system.allShips;
		i = 1;
	}
	l = b.length;
	if(l>400) l = 400; // Cap
	if(redo){
		for(i;i<l;i++) a.push(this._check(b[i]));
	} else {
		for(i;i<l;i++){
			if(b[i].script){
				if(typeof b[i].script.$libStrength==='number') c = b[i].script.$libStrength;
				else c = this._check(b[i]);
			} else c = -1;
			a.push(c);
		}
	}
	if(!all){
		if(a.length) a = Math.max.apply(Math,a);
		else a = 0;
		if(!isFinite(a)) a = 999999;
		if(!rel) worldScripts.Lib_Main._lib.$entLastStrength = a;
	}
	return a;
};
this.shipSpawned = function(ent){
	this._check(ent);
	if(ent.primaryRole==="lib_test" && ent.script.name!=="lib_test") worldScripts.Lib_Main._lib.$entCstRemoved = true;
};
this.missionScreenOpportunity = function(){this._gather(0,0,1); delete this.missionScreenOpportunity;};
this.shipWillDockWithStation = this.shipExitedWitchspace = function(){this._gather(0,0,1);};
}).call(this);
