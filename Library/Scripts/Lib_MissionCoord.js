/* jshint bitwise:false, forin:false */
/* global galaxyNumber,log,system,worldScripts */
/* (C) Svengali 2016-2018, License CC-by-nc-sa-4.0 */
(function(){
"use strict";
this.name = "Lib_MissionCoord";

// TODO: use $missionActive in Lib_Main
this.$pool = [];
this.startUp = function(){
	delete this.startUp;
	this._bSearch = new worldScripts.Lib_BinSearch._lib_BinSearch();
	this.$checked = false;
	this.$isMission = false;
	this.$dbg = false;
};
this._prepare = function(){
	var s = [],r = this.$pool.length;
	if(r){
		var merged = [],pos=0;
		for(var m=0;m<r;m++){
			s = this.$pool[m];
			if(s.length!==2 || !s[1].name || typeof s[1].name!=='string' || !s[1].func || typeof s[1].func!=='string') continue;
			if(s[1].hasOwnProperty("incOXP")){
				var temp = s[1].incOXP;
				for(var i=0;i<temp.length;i++){
					if(worldScripts[temp[i]]!=='undefined'){
						log(this.name,"Dropping token "+s[0]+" : "+s[1].name+"."+s[1].func+" because of incompatibility with "+temp[i]+".");
						continue;
					}
				}
			}
			if(!s[1].hasOwnProperty("mutalEx") || typeof s[1].mutalEx!=='number') s[1].mutalEx = 0;
			pos = merged.indexOf(s[0]);
			if(pos===-1) merged.push(s[0],{0:s[1]});
			else {
				var q = merged[pos+1];
				for(var p=1;p<10;p++){
					if(q.hasOwnProperty(p)) continue;
					q[p] = s[1];
					break;
				}
			}
		}
		r = merged.length;
		for(var j=0;j<r;j+=2){
			this._bSearch.add(merged[j],merged[j+1]);
		}
		if(this.$dbg) log(this.name,"merged: "+JSON.stringify(merged));
	} else {
		delete this._performCheck;
		delete this.shipWillExitWitchspace;
		delete this.shipWillLaunchFromStation;
		this.$checked = true;
	}
	delete this.alertConditionChanged;
	delete this.guiScreenChanged;
	delete this._prepare;
};
this._performCheck = function(early){
	this.$checked = true;
	if(this.$isMission) return;
	var test = system.description,prop;
	var pRand = Math.floor(100*system.scrambledPseudoRandomNumber(system.ID));
	var rest = test.replace(/[^a-zA-Z]/g,' ');
	rest = rest.split(" ");
	rest = worldScripts.Lib_Main._lib.arrUnique(rest);
	var fflag = false, l = rest.length, muteGroup = [];
	for(var s=0;s<l;s++){
		fflag = this._bSearch.contains(rest[s]);
		if(fflag){
			for(prop in fflag){
				var c = fflag[prop];
				if((early && !c.early) || (!early && c.early)) continue;
				if(muteGroup.indexOf(c.mutalEx)!==-1) continue;
				if(c.chance && Math.random()>c.chance) continue;
				if(c.gal && c.gal.indexOf(galaxyNumber)===-1) continue;
				if(c.ID && c.ID.indexOf(system.ID)===-1) continue;
				if(c.gov && c.gov.indexOf(system.government)===-1) continue;
				if(c.seeds && c.seeds.indexOf(pRand)===-1) continue;
				if(c.exToken && rest.indexOf(c.exToken)!==-1) continue;
				if(this.$dbg) log(this.name,"check: "+c.name+" - muteGroup: "+c.mutalEx+" rest[s]:"+rest[s]);
				if(worldScripts[c.name]){
					var act = false;
					if(c.func && worldScripts[c.name][c.func]) act = worldScripts[c.name][c.func](rest[s]);
					if(act){
						muteGroup.push(c.mutalEx);
						this.$isMission = true;
					}
				}
			}
		}
	}
};
this.alertConditionChanged = this.guiScreenChanged = function(){
	if(this._prepare) this._prepare();
	if(!this.$checked && this._performCheck) this._performCheck();
};
this.shipWillExitWitchspace = function(){
	this.$isMission = false;
	if(this._performCheck) this._performCheck(1);
};
this.shipExitedWitchspace = function(){
	if(this._performCheck) this._performCheck();
};
this.shipWillLaunchFromStation = function(){
	if(this._prepare) this._prepare();
	if(!this.$checked && this._performCheck) this._performCheck(1);
};
this.shipLaunchedFromStation = function(){
	if(!this.$checked && this._performCheck) this._performCheck();
};
}).call(this);
