/* jshint bitwise:false, forin:false */
/* global mission,player,system,worldScripts,Vector3D */
/* (C) Svengali 2016-2018, License CC-by-nc-sa-4.0 */
(function(){
"use strict";
this.name = "Lib_Starmap";

this.startUpComplete = function(){
	worldScripts.Lib_GUI.$IDRules.Lib_Starmap = {mus:1};
	this.$defs = {
		off: Vector3D([0,0,0]),
		rel: Vector3D([0,0,0])
	};
	this._update();
	this.$VSE = null;
	this.$OP = worldScripts.Lib_Main._lib.ooShaders();
	this.$POI = null;
};
/** function _start( obj ) - System map
* obj - Object
*  ini - Array. Max 12 entries.
*    String or Object { map:TEXTURE,ent:ENTITY [,col:Number] }
*  message - Optional. String. Initial message text.
*  title - Optional. String. Screen title.
*  ani - Optional. Animation for Lib_Animator. Requires capture flag!
*  POI - Optional. Vector. Point of interest.
*  MUL - Optional. Number. Multiplier. Default 0.00015.
* $return -
*/
this._start = function(obj,force){
	if(!obj || (this.$VSE && this.$VSE.isValid) || !this.$OP) return false;
	if(force) this._update();
	var absZ,col,fin,i,map,mat,md,mul,pos,tmp,rl, trck = [],
		maxZ = 0, maxY = 0, minZ = 0, minY = 0, mag = 0, sd = 0,
		dck = player.ship.docked, pls = 0, plm = 0, st = 0, as = 0;
	this.$POI = null;
	if(obj.POI){
		this.$POI = obj.POI;
		rl = obj.POI;
	} else rl = this.$defs.rel;
	if(obj.MUL) mul = obj.MUL;
	else mul = 0.00015;
	if(dck){
		var head = {
			choices:{ZZZ:"Continue"},
			message:obj.message?obj.message:"",
			background:{name:"lib_starmap_bg.png",height:512},
			screenID:"Lib_Starmap",
			model:"lib_ms_helper12",
			spinModel:false,
			title:obj.title?obj.title:"System Map"
		};
		this.$HUD = player.ship.hudHidden;
		player.ship.hudHidden = true;
		mission.runScreen(head,this._choices);
		md = mission.displayModel;
		md.orientation = [1,0,1,0];
		md.position = [0,0,500];
	} else {
		if(!this.$wp || (this.$wp && !this.$wp.isValid)) this.$wp = system.addVisualEffect("lib_starmap_wp",[0,0,0]);
		md = system.addVisualEffect("lib_starmap12",player.ship.position);
		md.script.$defs = rl;
		md.script.$mul = mul;
	}
	md.lightsActive = false;
	if(obj){
		for(i=0;i<12;i++){
			mat = md.subEntities[i].getMaterials();
			col = 0;
			if(i>obj.ini.length-1){
				mat["lib_null.png"].textures[0] = "lib_blend0.png";
			} else {
				if(typeof(obj.ini[i])==="string"){
					pos = this.$defs.off;
					map = "lib_blend0.png";
					switch(obj.ini[i]){
						case "PS": map = "lib_starmap_5.png"; pos = player.ship.position; trck.push({ent:player.ship,sub:i}); break;
						case "S": if(system.sun){map = "lib_starmap_0.png"; pos = system.sun.position; trck.push({ent:system.sun,sub:i});} break;
						case "P": tmp = this._getPlanet(pls); pls++; if(tmp){map = tmp[0]; pos = tmp[1].position; trck.push({ent:tmp[1],sub:i});} break;
						case "M": tmp = this._getMoon(plm); plm++; if(tmp){map = tmp[0]; pos = tmp[1].position; trck.push({ent:tmp[1],sub:i});} break;
						case "ST": if(this.$st.sta){map = "lib_starmap_3.png"; pos = this.$st.sta.position; trck.push({ent:this.$st.sta,sub:i});} break;
						case "STG": tmp = this._getGalStation(st); st++; if(tmp){map = tmp[0]; pos = tmp[1].position; trck.push({ent:tmp[1],sub:i});
							if(tmp[1].isPolice) col = 4; else col = 3;} break;
						case "WP": map = "lib_starmap_2.png"; trck.push({ent:this.$wp,sub:i}); break;
						case "H": if(this.$st.sth.length){map = "lib_starmap_4.png"; pos = this.$st.sth[0].position; trck.push({ent:this.$st.sth[0],sub:i});} break;
						case "AS": tmp = this._getAsteroidField(as); as += 20; if(tmp){map = tmp[0]; pos = tmp[1].position; trck.push({ent:tmp[1],sub:i});} break;
					}
				} else {
					if(obj.ini[i].ent){
						pos = obj.ini[i].ent.position;
						trck.push({ent:obj.ini[i].ent,sub:i});
					} else {
						if(dck) pos = obj.ini[i].pos;
						else continue;
					}
					map = obj.ini[i].map;
					if(obj.ini[i].col) col = obj.ini[i].col;
				}
				if(col) mat["lib_null.png"].uniforms.MC.value = this._getColor(col);
				mat["lib_null.png"].textures[0] = map;
				pos = this._compress(pos);
				// Scale down for display
				fin = pos.subtract(rl).multiply(mul);
				if(dck){
					if(fin.z>maxZ) maxZ = fin.z;
					if(fin.y>maxY) maxY = fin.y;
					if(fin.z<minZ) minZ = fin.z;
					if(fin.y<minY) minY = fin.y;
				} else {
					mag = fin.magnitude();
					if(mag>110) sd = (mag-100)*0.1;
				}
				md.subEntities[i].position = fin;
			}
			md.subEntities[i].setMaterials(mat);
		}
		if(dck){
			// Auto zoom
			absZ = Vector3D([(-minZ)+maxZ,(-minY)+maxY,0]).magnitude();
			absZ = Math.max(absZ,180);
			md.position = [0,0,absZ*2];
			// Animation
			if(obj.ani) worldScripts.Lib_Animator._start(obj.ani);
		} else {
			if(sd) md.script.$mul = mul/sd;
			// Track
			if(trck.length) md.script.$upd = trck;
			if(player.ship.compassTarget) md.orientation = player.ship.compassTarget.position.rotationTo(rl);
			else md.orientation = player.ship.position.rotationTo(rl);
			this.$VSE = md;
			this.$EnableTimer = new Timer(this,this._doEnableTimer,1);
		}
	}
	return true;
};
this._getPlanet = function(n){
	if(!n){
		if(!this.$pl.pla) return null;
		return(["lib_starmap_1.png",this.$pl.pla]);
	}
	if(this.$pl.plp.length<=n-1) return null;
	return(["lib_starmap_P1.png",this.$pl.plp[n-1]]);
};
this._getMoon = function(n){
	if(this.$pl.plm.length<=n) return null;
	return(["lib_starmap_M1.png",this.$pl.plm[n]]);
};
this._getGalStation = function(n){
	if(this.$st.stgal.length<=n) return null;
	if(this.$st.stgal[n].maxSpeed>5) return(["lib_starmap_i4.png",this.$st.stgal[n]]);
	return(["lib_starmap_i5.png",this.$st.stgal[n]]);
};
this._getAsteroidField = function(n){
	if(this.$as.length<=n) return null;
	return(["lib_starmap_7.png",this.$as[n]]);
};
this._getColor = function(n){
	var c;
	switch(n){
		case 1: c = [0.8,0,0,1]; break; // red
		case 2: c = [0,0.8,0,1]; break; // green
		case 3: c = [0,0,0.8,1]; break; // blue
		case 4: c = [0.6,0,0.8,1]; break; // purple
		case 5: c = [0.4,0.4,0.4,1]; break; // gray
		case 6: c = [0,0.7,0.7,1]; break; // aqua
		case 7: c = [0.8,0.6,0,1]; break; // amber
		case 8: c = [0.8,0.6,0.3,1]; break; // gold
		case 9: c = [0.3,0,0.5,1]; break; // UV
		default: c = [1,1,1,1]; break; // white
	}
	return c;
};
this._addInFreeSlot = function(ent,map,col){
	if(!this.$VSE || !this.$VSE.isValid) return;
	var x = this.$VSE.script.$upd,m=x.length,slot,mat;
	for(var i=0;i<12;i++){
		if(i>m-1 || !x[i].ent){slot = i; break;}
	}
	if(typeof(slot)!=="number" || slot>11) return false;
	mat = this.$VSE.subEntities[slot].getMaterials();
	mat["lib_null.png"].textures[0] = map;
	mat["lib_null.png"].uniforms.MC.value = this._getColor(col);
	if(slot<=m) x[slot] = {ent:ent,sub:slot};
	else x.push({ent:ent,sub:slot});
	this.$VSE.script.$upd = x;
	this.$VSE.subEntities[slot].setMaterials(mat);
	this.$VSE.subEntities[slot].shaderVector1 = [0,0,0];
	return true;
};
// Inflight options
this._doEnableTimer = function(){
	if(player.alertCondition<3 && !player.ship.weaponsOnline){
		this._switchOn();
		if(!this.$VSE || !this.$VSE.isValid) return;
		this.$VSE.shaderFloat1 = 1;
	} else this._switchOff();
	this.$EnableTimer = null;
};
this.alertConditionChanged = function(s){
	if(s>2) this._switchOff();
	else if(s>0 && !player.ship.weaponsOnline) this._switchOn();
};
this.compassTargetChanged = function(){
	if(!this.$VSE || !this.$VSE.isValid) return;
	if(this.$POI) this.$VSE.orientation = player.ship.compassTarget.position.rotationTo(this.$POI);
	else this.$VSE.orientation = player.ship.compassTarget.position.rotationTo(this.$defs.rel);
};
this.weaponsSystemsToggled = function(state){
	if(state) this._switchOff();
	else if(player.alertCondition<3) this._switchOn();
};
this._switchOn = function(){
	if(!this.$VSE || !this.$VSE.isValid) return;
	this.$VSE.script.$hide = true;
	if(!this.$EnableTimer) this.$EnableTimer = new Timer(this,this._doEnableTimer,1);
};
this._switchOff = function(){
	if(!this.$VSE || !this.$VSE.isValid) return;
	this.$VSE.shaderFloat1 = 0;
	this.$VSE.script.$hide = false;
};
this._toggleMP = function(){
	if(!this.$VSE || !this.$VSE.isValid) return;
	this.$VSE.script.$PSC = !this.$VSE.script.$PSC;
};
// Update after populator
this.shipExitedWitchspace = this.shipWillDockWithStation = this.shipWillLaunchFromStation = function(){
	this._update();
};
this._update = function(){
	if(this.$VSE && this.$VSE.isValid) this.$VSE.remove();
	this.$VSE = null;
	this._updPlanets();
	this._updStations();
	this._updAsteroids();
	this._getMidpoint();
};
this._updPlanets = function(){
	var pl = system.planets;
	this.$pl = {pla:null,plp:[],plm:[]};
	for(var i=0;i<pl.length;i++){
		if(pl[i].isMainPlanet) this.$pl.pla = pl[i];
		else {
			if(pl[i].hasAtmosphere) this.$pl.plp.push(pl[i]);
			else this.$pl.plm.push(pl[i]);
		}
	}
};
this._updStations = function(){
	var st = system.stations;
	this.$st = {sta:null,sth:[],stgal:[],stoth:[]};
	for(var i=0;i<st.length;i++){
		if(st[i].isMainStation) this.$st.sta = st[i];
		else if(st[i].isRock && st[i].name==="Rock Hermit") this.$st.sth.push(st[i]);
		else {
			switch(st[i].allegiance){
				case "galcop":
				case "hunter":
				case "neutral": this.$st.stgal.push(st[i]); break;
				default: if(st[i].beaconCode) this.$st.stoth.push(st[i]);
			}
		}
	}
};
this._updAsteroids = function(){
	this.$as = system.filteredEntities(this,function(entity){return entity.isShip && entity.isRock && entity.name==="Asteroid";},player.ship);
};
this._getMidpoint = function(){
	if(system.isInterstellarSpace){
		this.$defs.rel = this.$defs.off;
		return;
	} else {
		// no c as WP is [0,0,0]
		var a = this._compress(system.sun.position), b = this._compress(system.mainPlanet.position);
		this.$defs.rel = Vector3D([(a.x+b.x)/3,(a.y+b.y)/3,(a.z+b.z)/3]);
	}
};
// Compress far out
this._compress = function(pos){
	var pmag = pos.magnitude();
	if(pmag>1199998.8) pos = Vector3D.interpolate(this.$defs.off,pos,1199998.8/pmag);
	return pos;
};
this._choices = function(choice){worldScripts.Lib_Starmap._choiceEval(choice); return;};
this._choiceEval = function(choice){
	player.ship.hudHidden = this.$HUD;
};
}).call(this);