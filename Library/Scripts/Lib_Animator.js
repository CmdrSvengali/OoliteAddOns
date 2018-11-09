/* jshint bitwise:false, forin:false */
/* global _Animator,Sound,SoundSource,Timer,Vector3D,addFrameCallback,clock,isValidFrameCallback,mission,player,removeFrameCallback,setScreenBackground,setScreenOverlay,worldScripts */
/* (C) Svengali 2016-2018, License CC-by-nc-sa-4.0 */
(function(){
"use strict";
this.name = "Lib_Animator";
/** 
* TODO:
* 	Flags - append
*	Fixme - modifyMaterials
*/
this._start = function(ani){
	if(!player.ship.docked || !ani || !ani.model || !ani.flow || (this._a && !ani.replace && !ani.capture)) return false;
	if((this._a && (!ani.replace || !ani.capture) ) && (!mission.displayModel || mission.displayModel.dataKey!==ani.model)) return false;
	var obj = worldScripts.Lib_Main._lib.objClone(ani),hud,hudHide,i,msc;
	if(this._a && (obj.replace || obj.capture)){
		this._a.reset();
		if(this.$anim){
			hud = this.$anim.prevHUD;
			hudHide = this.$anim.prevHUDHide;
		}
		this._cleanUp(1);
	}
	this._a = new this._Animator();
	if(!obj.capture){
		msc = {
			background: null,
			choices: (obj.choices?obj.choices:null),
			choicesKey: (obj.choicesKey?obj.choicesKey:null),
			model: (obj.model?obj.model:null),
			music: (obj.music?obj.music:null),
			overlay: null,
			screenID: (obj.screenID?obj.screenID:"Lib_Animator"),
			spinModel: false,
			title: (obj.title?obj.title:"")
		};
		if(obj.text) msc.message = obj.text;
		if(obj.background){
			msc.background = obj.background;
			this._a.bg.name = obj.background;
		}
		if(obj.overlay){
			msc.overlay = obj.overlay;
			this._a.ov.name = obj.overlay;
		}
		if(obj.fadeIn) msc.overlay = {name:"lib_blend10.png",width:1024,height:512};
	}
	this.$anim = {
		count: 0,
		index: 0,
		flow: obj.flow,
		caller: (obj.caller?obj.caller:null),
		callback: (obj.callback?obj.callback:null),
		checkpoint: (obj.checkpoint?obj.checkpoint:null),
		prevHUD: (hud?hud:player.ship.hud),
		prevHUDHide: (typeof hudHide!=="undefined"?hudHide:player.ship.hudHidden),
		custom: obj.custom,
		capture: obj.capture?obj.capture:null,
		md: obj.model
	};
	if(!obj.capture){
		if(obj.hud){
			player.ship.hud = obj.hud;
			player.ship.hudHidden = false;
		} else player.ship.hudHidden = true;
		mission.runScreen(msc,this._choiceEval);
	}
	if(!mission.displayModel) return false;
	this._a.init(mission.displayModel);
	this.$waitUntil = -1;
	if(obj.corner) this._a.screenCornerPos(obj.corner);
	if(obj.aPos) for(i=0;i<obj.aPos.length;i++) this._a.setPosition(obj.aPos[i]);
	if(obj.aExh) for(i=0;i<obj.aExh.length;i++) this._a.setExhaust(obj.aExh[i]);
	if(obj.aOris) for(i=0;i<obj.aOris.length;i++) this._a.setOrientation(obj.aOris[i]);
	if(obj.aBinds) for(i=0;i<obj.aBinds.length;i++) this._a.setBinding(obj.aBinds[i]);
	if(obj.aProps) for(i=0;i<obj.aProps.length;i++) this._a.setProp(obj.aProps[i]);
	if(obj.bPos) for(i=0;i<obj.bPos.length;i++) this._a.setPosition(obj.bPos[i]);
	if(obj.bOris) for(i=0;i<obj.bOris.length;i++) this._a.setOrientation(obj.bOris[i]);
	if(obj.bBinds) for(i=0;i<obj.bBinds.length;i++) this._a.setBinding(obj.bBinds[i]);
	if(obj.bProps) for(i=0;i<obj.bProps.length;i++) this._a.setProp(obj.bProps[i]);
	if(obj.shadeMaps) for(i=0;i<obj.shadeMaps.length;i++) this._a.setShaderProp(obj.shadeMaps[i]);
	if(obj.pilots) for(i=0;i<obj.pilots.length;i++) this._a._setPilot(obj.pilots[i]);
	if(obj.subRots) for(i=0;i<obj.subRots.length;i++) this._a.subs[obj.subRots[i].e].subEntityRotation = obj.subRots[i].r;
	if(obj.subTex) for(i=0;i<obj.subTex.length;i++) this._a.setMaterials(obj.subTex[i]);
	this.$sndA = new SoundSource();
	this.$sndB = new SoundSource();
	if(obj.delta) this._a.defDelta = obj.delta;
	else this._a.defDelta = 0.005;
	if(!this.$animTimer) this.$animTimer = new Timer(this,this._doAnimTimer,0,0.25);
	else this.$animTimer.start();
	return true;
};
this._cleanUp = function(all){
	if(this.$animTimer) this.$animTimer.stop();
	delete this.$animTimer;
	if(all){
		delete this.$anim;
		delete this.$sndA;
		delete this.$sndB;
		delete this._a;
	}
};
this._choiceEval = function(choice){worldScripts.Lib_Animator._choice(choice); return;};
this._choice = function(choice){
	this._a.reset();
	player.ship.hud = this.$anim.prevHUD;
	player.ship.hudHidden = this.$anim.prevHUDHide;
	var a = this.$anim.caller, b = this.$anim.callback;
	this._cleanUp(1);
	if(a && b) worldScripts[a][b](choice);
	return;
};
this._doAnimTimer = function(){
	if(!this.$anim.flow.length || !mission.displayModel || !mission.displayModel.isValid || this.$anim.index>=this.$anim.flow.length){
		this._a.reset();
		this._cleanUp();
		return;
	}
	var cur = this.$anim.flow[this.$anim.index],i,p;
	if(this.$anim.count >= cur[0]){
		// [time,cmd,obj,other]
		switch(cur[1]){
			case "reset": this._a.reset(); break;
			case "clr": this._a.clear(); break;
			case "clrMov": this._a.clearMoves(); break;
			case "kill": // Get CPU usage down
				if(this.$anim.index===this.$anim.flow.length-1){
					mission.displayModel.remove();
					if(cur[2] && cur[2].txt) mission.addMessageText(cur[2].txt);
				}
				break;
			case "rotw": this._a.rotateW(cur[2]); break;
			case "rot": this._a.rotate(cur[2]); break;
			case "rotTo": this._a.rotateTo(cur[2]); break;
			case "rotX": this._a.rotateXDeg(cur[2]); break;
			case "rotY": this._a.rotateYDeg(cur[2]); break;
			case "rotZ": this._a.rotateZDeg(cur[2]); break;
			case "stopRot": this._a.stopRotate(cur[2]); break;
			case "fly": this._a.flight(cur[2]); break;
			case "flyTo": this._a.flightTo(cur[2]); break;
			case "stopFly": this._a.stopFlight(cur[2]); break;
			case "velo": this._a.velocity(cur[2]); break;
			case "veloTo": this._a.velocityTo(cur[2]); break;
			case "veloSet": this._a.setVelocity(cur[2]); break;
			case "stopVelo": this._a.stopVelocity(cur[2]); break;
			case "walk": this._a.walk(cur[2]); break;
			case "walkTo": this._a.walkTo(cur[2]); break;
			case "stopWalk": this._a.stopWalk(cur[2]); break;
			case "aiDest": this._a.aiDestination(cur[2]); break;
			case "aiFace": this._a.aiFace(cur[2]); break;
			case "aiFly": this._a.aiFly(cur[2]); break;
			case "aiHold": this._a.aiHold(cur[2]); break;
			case "aiRange": this._a.aiRange(cur[2]); break;
			case "aiSpeed": this._a.aiSpeed(cur[2]); break;
			case "aiStop": this._a.aiStop(cur[2]); break;
			case "zoom": this._a.zoom(cur[2]); break;
			case "zoomTo": this._a.zoomTo(cur[2]); break;
			case "stopZoom": this._a.stopZoom(cur[2]); break;
			case "prop": this._a.setProp(cur[2]); break;
			case "matSet": this._a.setMaterials(cur[2]); break;
			case "matMod": this._a.modifyMaterials(cur[2]); break;
			case "lit": this._a.highlight(cur[2]); break;
			case "tex": this._a.setTextures(cur[2]); break;
			case "shadeSet": this._a.setShader(cur[2]); break;
			case "shadeMod": this._a.setShaderProp(cur[2]); break;
			case "sun": this._a.sun(cur[2]); break;
			case "twinkle": this._a.twinkle(cur[2]); break;
			case "moon": this._a.moon(cur[2]); break;
			case "boom": this._a.explosion(cur[2]); break;
			case "hyper":
				this._a.hyper(cur[2]);
				this.$sndB.playSound("[bgs_fxWitch]");
				break;
			case "shoot":
				var d = [0.00001,clock.absoluteSeconds,0];
				//if(cur[2].rear) d[2] = cur[2].rear;
				if(this._a.cur[cur[2].tg].ang>0.098){
					this.$sndA.playSound("[player-laser-miss]");
				} else {
					d[0] = 1/this._a.cur[cur[2].tg].mag;
					this.$sndA.playSound("[player-laser-hit]");
				}
				this._a.setProp({e:cur[2].e,p:"destination",v:d});
				break;
			case "laser":
				var act, tg, mag, ang, v;
				var d = [0.00001,clock.absoluteSeconds,0];
				if(cur[2].e>-1) act = this._a.subs[cur[2].e];
				else act = this._a.ent;
				if(cur[2].tg>-1) tg = this._a.subs[cur[2].tg];
				else tg = this._a.ent;
				v = act.position.subtract(tg.position).direction().multiply(-1);
				mag = act.position.subtract(tg.position).magnitude();
				ang = act.heading.angleTo(v);
				if(ang>0.098){
					this.$sndA.playSound("[player-laser-miss]");
				} else {
					d[0] = 1/mag;
					this.$sndA.playSound("[player-laser-hit]");
				}
				this._a.setProp({e:cur[2].e,p:"destination",v:d});
				break;
			case "bind": this._a.setBinding(cur[2]); break;
			case "stopBind": this._a.stopBinding(cur[2]); break;
			case "pos": this._a.setPosition(cur[2]); break;
			case "posTo": this._a.setPositionTo(cur[2]); break;
			case "posFl": this._a.setFlasherPositionTo(cur[2]); break;
			case "ori": this._a.setOrientation(cur[2]); break;
			case "snap": this._a.snapIn(cur[2]); break;
			case "bg": this._a.setBackground(cur[2]); break;
			case "bgZoom": this._a.zoomBackground(cur[2]); break;
			case "bgZoomTo": this._a.zoomBackgroundTo(cur[2]); break;
			case "bgStop": this._a.stopBackground(); break;
			case "bgClr": this._a.clearBackground(); break;
			case "bgRes": this._a.resetBackground(cur[2]); break;
			case "ov": this._a.setOverlay(cur[2]); break;
			case "ovZoom": this._a.zoomOverlay(cur[2]); break;
			case "ovStop": this._a.stopOverlay(); break;
			case "ovClr": this._a.clearOverlay(); break;
			case "ovFadeIn": this._a.fadeIn(cur[2]); break;
			case "ovFadeOut": this._a.fadeOut(cur[2]); break;
			case "corner": this._a.screenCornerPos(cur[2]); break;
			case "txt": mission.addMessageText(cur[2]); break;
			case "snd1": this.$sndA.playSound(cur[2].snd); break;
			case "snd2": this.$sndB.playSound(cur[2].snd); break;
			case "mus": Sound.playMusic(cur[2].snd); break;
			case "custom": this.$anim.custom[cur[2]](); break;
			case "goto": this._goto(cur[2]); break;
			case "check":
				var ch = false;
				if(this.$anim.caller && this.$anim.checkpoint) ch = worldScripts[this.$anim.caller][this.$anim.checkpoint](cur[0]);
				if(typeof ch==='number') this._goto(ch);
				else {
					if(!ch){this._a.reset(); this._cleanUp();}
				}
				break;
			case "waitExt":
				if(this.$waitUntil>-1){
					this._goto(this.$waitUntil);
					this.$waitUntil = -1;
				} else {
					this.$anim.index--;
					this.$anim.count--;
				}
				break;
			case "speak":
				this._a._pilotSpeak(cur[2]);
				if(cur[2].snd) this.$sndB.playSound(cur[2].snd);
				break;
		}
		if(cur[3]){
			for(i=0;i<cur[3].length;i++){
				p = cur[3][i];
				switch(p.id){
					case "txt": mission.addMessageText(p.txt); break;
					case "snd1": this.$sndA.playSound(p.snd); break;
					case "snd2": this.$sndB.playSound(p.snd); break;
					case "mus": Sound.playMusic(p.snd); break;
				}
			}
		}
		this.$anim.index++;
	}
	this.$anim.count++;
	return;
};
this._goto = function(cmp){
	var from,to;
	if(cmp>this.$anim.count){
		from = this.$anim.index;
		to = this.$anim.flow.length;
	} else {
		from = 0;
		to = this.$anim.index;
	}
	for(var i=from;i<to;i++){
		if(this.$anim.flow[i][0]===cmp){
			this.$anim.index = i-1;
			this.$anim.count = cmp-1;
			break;
		}
	}
};
/** Animation API
*/
this._Animator = function(){};
_Animator.prototype = {
	constructor: _Animator,
	w: 1024,
	h: 512,
	fcb: 0,
	fcbs: [],
	bg: {name:null,width:this.w,height:this.h,mw:1,mh:1},
	ov: {name:null,width:this.w,height:this.h,mw:1,mh:1},
	ovFade: {n:10,dir:1,t:2,cur:0},
	defDelta: 0.005,
	ent: null,
	subs: null,
	flow: {
		bind:{},
		flight:{},
		props:{},
		rotate:{},
		velocity:{},
		walk:{},
		zoom:{},
		bg:{},
		ov:{},
		aiDest:{}
	},
	cur: {},
	/** ent = Entity. Must be called before anything else!
	*/
	init: function(ent){
		this.cur = {"-1":{mf:0,ang:0,mag:0,tOri:null}};
		this.ent = ent;
		if(ent.subEntities && ent.subEntities.length){
			this.subs = ent.subEntities;
			for(var i=0;i<ent.subEntities.length;i++) this.cur[i] = {mf:0,ang:0,mag:0,tOri:null};
		}
		else this.subs = null;
		this.w = 1024;
		this.h = 512;
		this.bg.width = this.w;
		this.bg.height = this.h;
		this.ov.width = this.w;
		this.ov.height = this.h;
	},
	reset: function(){
		this.clear();
		this.bg = {name:null,width:this.w,height:this.h,mw:1,mh:1};
		this.ov = {name:null,width:this.w,height:this.h,mw:1,mh:1};
		this.ovFade = {n:10,dir:1,t:2,cur:0};
		this.ent = null;
		this.subs = null;
		this.defDelta = 0.005;
	},
	clear: function(){
		this._removeFCBs();
		this.flow = {
			bind:{},
			flight:{},
			props:{},
			rotate:{},
			velocity:{},
			walk:{},
			zoom:{},
			bg:{},
			ov:{},
			aiDest:{}
		};
	},
	clearMoves: function(){
		var m = ["flight","rotate","velocity","walk","zoom","aiDest"],k;
		for(var o=0;o<m.length;o++){
			k = Object.keys(this.flow[m[o]]);
			for(var i=0;i<k.length;i++){
				this._stopIt({e:k[i]},m[o]);
			}
		}
	},
	/** e, t, rx,ry,rz [, z, da, db]		World!
	*/
	rotateW: function(obj){
		var c = [this.ent,this.subs,0,this.defDelta,obj];
		this.fcb = addFrameCallback(function(delta){
			if(!delta || !c[0] || !c[0].isValid) return;
			var f=1, bz=1, da=1, db=1, act;
			if(c[3]>delta) f = 1/(c[3]/delta);
			else f = 1-(c[3]-delta);
			c[2] += delta;
			if(c[2]>=c[4].t) return;
			if(c[4].e>-1) act = c[1][c[4].e];
			else act = c[0];
			if(c[4].z) bz = Math.sqrt(Math.abs(act.position.z));
			if(c[4].da && c[2]<c[4].da) da = 1-((c[4].da-c[2])/c[4].da);
			if(c[4].db && c[2]>c[4].t-c[4].db) db = (c[4].t-c[2])/c[4].db;
			if(c[4].rx) act.orientation = act.orientation.rotateX(c[4].rx*da*db*bz*f);
			if(c[4].ry) act.orientation = act.orientation.rotateY(c[4].ry*da*db*bz*f);
			if(c[4].rz) act.orientation = act.orientation.rotateZ(c[4].rz*da*db*bz*f);
			return;
		});
		this._addTo("rotate",this.fcb,obj);
		return true;
	},
	/** e, t, rx,ry,rz [, z, da, db]		Model!
	*/
	rotate: function(obj){
		var c = [this.ent,this.subs,0,this.defDelta,obj];
		this.fcb = addFrameCallback(function(delta){
			if(!delta || !c[0] || !c[0].isValid) return;
			var f=1, bz=1, da=1, db=1, act;
			if(c[3]>delta) f = 1/(c[3]/delta);
			else f = 1-(c[3]-delta);
			c[2] += delta;
			if(c[2]>=c[4].t) return;
			if(c[4].e>-1) act = c[1][c[4].e];
			else act = c[0];
			if(c[4].z) bz = Math.sqrt(Math.abs(act.position.z));
			if(c[4].da && c[2]<c[4].da) da = 1-((c[4].da-c[2])/c[4].da);
			if(c[4].db && c[2]>c[4].t-c[4].db) db = (c[4].t-c[2])/c[4].db;
			if(c[4].rx) act.orientation = act.orientation.rotate(act.vectorRight,c[4].rx*da*db*bz*f);
			if(c[4].ry) act.orientation = act.orientation.rotate(act.vectorUp,c[4].ry*da*db*bz*f);
			if(c[4].rz) act.orientation = act.orientation.rotate(act.vectorForward,c[4].rz*da*db*bz*f);
			return;
		});
		this._addTo("rotate",this.fcb,obj);
		return true;
	},
	/** e, t, tg [, z, da, db, s]
	*/
	rotateTo: function(obj){
		this._stopIt(obj,"rotate");
		if(!obj.tg.isShip){
			if(typeof obj.tg==='number') obj.tg = this.subs[obj.tg];
			else if(obj.tg.constructor.name==="Array") obj.tgv = new Vector3D(obj.tg);
		}
		var c = [this.ent,this.subs,0,this.defDelta,obj,this.cur[obj.e]];
		this.fcb = addFrameCallback(function(delta){
			if(!delta || !c[0] || !c[0].isValid || !c[4].tg || (!c[4].tg.isValid && !c[4].tgv)) return;
			var f=1, bz=1, da=1, db=1, act, v, a, cr, steps = 0.01;
			if(c[3]>delta) f = 1/(c[3]/delta);
			else f = 1-(c[3]-delta);
			c[2] += delta;
			if(c[2]>=c[4].t) return;
			if(c[4].e>-1) act = c[1][c[4].e];
			else act = c[0];
			if(c[4].tgv){
				v = act.position.subtract(c[4].tgv).direction().multiply(-1);
				c[5].mag = act.position.subtract(c[4].tgv).magnitude();
			} else {
				v = act.position.subtract(c[4].tg.position).direction().multiply(-1);
				c[5].mag = act.position.subtract(c[4].tg.position).magnitude();
			}
			a = act.heading.angleTo(v);
			c[5].ang = a;
			if(c[4].z) bz = 1-1/Math.sqrt(Math.max(Math.abs(act.position.z),0.001));
			if(c[4].da && c[2]<c[4].da) da = 1-((c[4].da-c[2])/c[4].da);
			if(c[4].db && c[2]>c[4].t-c[4].db) db = (c[4].t-c[2])/c[4].db;
			if(c[4].s) steps = c[4].s*da;
			cr = act.heading.cross(v);
			act.orientation = act.orientation.rotate(cr,-a*steps*f*bz*da*db);
			return;
		});
		this._addTo("rotate",this.fcb,obj);
		return true;
	},
	/** e, t, deg [, z, da, db, inf]		World!
	*/
	rotateXDeg: function(obj){
		if(obj.e>-1) obj.nt = this.subs[obj.e].orientation.rotateX(0.017453293916206696*obj.deg);
		else obj.nt = this.ent.orientation.rotateX(0.017453293916206696*obj.deg);
		if(obj.inf) this.cur[obj.e].tOri = obj.nt;
		obj.st = obj.deg/(obj.t*1000);
		var c = [this.ent,this.subs,0,this.defDelta,obj];
		this.fcb = addFrameCallback(function(delta){
			if(!delta || !c[0] || !c[0].isValid) return;
			var f=1, bz=1, da=1, db=1, act, sp;
			if(c[3]>delta) f = 1/(c[3]/delta);
			else f = 1-(c[3]-delta);
			c[2] += delta;
			if(c[2]>=c[4].t) return;
			if(c[4].e>-1) act = c[1][c[4].e];
			else act = c[0];
			sp = act.orientation.dot(c[4].nt);
			if(sp>0.999) return;
			if(c[4].z) bz = Math.sqrt(Math.abs(act.position.z));
			if(c[4].da && c[2]<c[4].da) da = 1-((c[4].da-c[2])/c[4].da);
			if(c[4].db && c[2]>c[4].t-c[4].db) db = (c[4].t-c[2])/c[4].db;
			if(c[4].deg) act.orientation = act.orientation.rotateX(c[4].st*da*db*bz*f);
			return;
		});
		this._addTo("rotate",this.fcb,obj);
		return true;
	},
	/** e, t, deg [, z, da, db, inf]		World!
	*/
	rotateYDeg: function(obj){
		if(obj.e>-1) obj.nt = this.subs[obj.e].orientation.rotateY(0.017453293916206696*obj.deg);
		else obj.nt = this.ent.orientation.rotateY(0.017453293916206696*obj.deg);
		if(obj.inf) this.cur[obj.e].tOri = obj.nt;
		obj.st = obj.deg/(obj.t*1000);
//		obj.st = ((0.017453293916206696*obj.deg)/obj.t)*this.defDelta;
		var c = [this.ent,this.subs,0,this.defDelta,obj];
		this.fcb = addFrameCallback(function(delta){
			if(!delta || !c[0] || !c[0].isValid) return;
			var f=1, bz=1, da=1, db=1, act, sp;
			if(c[3]>delta) f = 1/(c[3]/delta);
			else f = 1-(c[3]-delta);
			c[2] += delta;
			if(c[2]>=c[4].t) return;
			if(c[4].e>-1) act = c[1][c[4].e];
			else act = c[0];
			sp = act.orientation.dot(c[4].nt);
			if(sp>0.9999) return;
			if(c[4].z) bz = Math.sqrt(Math.abs(act.position.z));
			if(c[4].da && c[2]<c[4].da) da = 1-((c[4].da-c[2])/c[4].da);
			if(c[4].db && c[2]>c[4].t-c[4].db) db = (c[4].t-c[2])/c[4].db;
			if(c[4].deg) act.orientation = act.orientation.rotateY(c[4].st*da*db*bz*f);
			return;
		});
		this._addTo("rotate",this.fcb,obj);
		return true;
	},
	/** e, t, deg [, z, da, db, inf]		World!
	*/
	rotateZDeg: function(obj){
		if(obj.e>-1) obj.nt = this.subs[obj.e].orientation.rotateZ(0.017453293916206696*obj.deg);
		else obj.nt = this.ent.orientation.rotateZ(0.017453293916206696*obj.deg);
		if(obj.inf) this.cur[obj.e].tOri = obj.nt;
		obj.st = obj.deg/(obj.t*1000);
		var c = [this.ent,this.subs,0,this.defDelta,obj];
		this.fcb = addFrameCallback(function(delta){
			if(!delta || !c[0] || !c[0].isValid) return;
			var f=1, bz=1, da=1, db=1, act, sp;
			if(c[3]>delta) f = 1/(c[3]/delta);
			else f = 1-(c[3]-delta);
			c[2] += delta;
			if(c[2]>=c[4].t) return;
			if(c[4].e>-1) act = c[1][c[4].e];
			else act = c[0];
			sp = act.orientation.dot(c[4].nt);
			if(sp>0.999) return;
			if(c[4].z) bz = Math.sqrt(Math.abs(act.position.z));
			if(c[4].da && c[2]<c[4].da) da = 1-((c[4].da-c[2])/c[4].da);
			if(c[4].db && c[2]>c[4].t-c[4].db) db = (c[4].t-c[2])/c[4].db;
			if(c[4].deg) act.orientation = act.orientation.rotateZ(c[4].st*da*db*bz*f);
			return;
		});
		this._addTo("rotate",this.fcb,obj);
		return true;
	},
	/** e
	*/
	stopRotate: function(obj){
		this._stopIt(obj,"rotate");
		return true;
	},
	/** e, t, mu,mr,mf, rx,ry,rz [,da, db, z, fu, en]
	*/
	flight: function(obj){
		this.rotate(obj);
		this.velocity(obj);
	},
	/** e, t, tg, s, mu,mr,mf [, da, db, z, fu, en]
	*/
	flightTo: function(obj){
		this.rotateTo(obj);
		this.velocityTo(obj);
	},
	/** e
	*/
	stopFlight: function(obj){
		this.stopVelocity(obj);
		this.stopRotate(obj);
		return true;
	},
	aiDestination: function(obj){
		var act;
		if(obj.e>-1) act = this.subs[obj.e];
		else act = this.ent;
		this._stopIt(obj,"aiDest");
		if(obj.dest){
			if(typeof obj.dest==='number') act.destination = this.subs[obj.dest];
			else act.destination = obj.dest;
		} else {
			var c = [this.ent,this.subs,0,this.defDelta,obj,0];
			this.fcb = addFrameCallback(function(delta){
				if(!delta || !c[0] || !c[0].isValid) return;
				var act, st;
				c[2] += delta;
				c[5]++;
				// Updating only every 50. framecallback!!!
				if(c[2]>=c[4].t || c[5]<50) return;
				if(c[4].e>-1) act = c[1][c[4].e];
				else act = c[0];
				act.destination = c[1][c[4].tg].position;
				c[5] = 0;
				return;
			});
			this._addTo("aiDest",this.fcb,obj);
		}
	},
	aiFace: function(obj){
		this.aiDestination(obj);
		if(obj.e>-1) this.subs[obj.e].performFaceDestination();
		else this.ent.performFaceDestination();
	},
	aiFly: function(obj){
		this.aiSpeed(obj);
		this.aiRange(obj);
		this.aiDestination(obj);
		var act;
		if(obj.e>-1) act = this.subs[obj.e];
		else act = this.ent;
		act.performFlyToRangeFromDestination();
	},
	aiHold: function(obj){
		if(obj.e>-1) this.subs[obj.e].performHold();
		else this.ent.performHold();
		this._stopIt(obj,"aiDest");
	},
	aiRange: function(obj){
		if(obj.e>-1) this.subs[obj.e].desiredRange = obj.rng;
		else this.ent.desiredRange = obj.rng;
	},
	aiSpeed: function(obj){
		if(obj.e>-1) this.subs[obj.e].desiredSpeed = obj.spd;
		else this.ent.desiredSpeed = obj.spd;
	},
	aiStop: function(obj){
		if(obj.e>-1) this.subs[obj.e].performStop();
		else this.ent.performStop();
		this._stopIt(obj,"aiDest");
	},
	/** e, t, mu,mr,mf [,da, db, z, fu, en]
	*/
	velocity: function(obj){
		var c = [this.ent,this.subs,0,this.defDelta,obj];
		this.fcb = addFrameCallback(function(delta){
			if(!delta || !c[0] || !c[0].isValid) return;
			var f=1, bz=1, da=1, db=1, act;
			if(c[3]>delta) f = 1/(c[3]/delta);
			else f = 1-(c[3]-delta);
			c[2] += delta;
			if(c[2]>=c[4].t) return;
			if(c[4].e>-1) act = c[1][c[4].e];
			else act = c[0];
			if(c[4].z) bz = Math.sqrt(Math.abs(act.position.z));
			if(c[4].da && c[2]<c[4].da) da = 1-((c[4].da-c[2])/c[4].da);
			if(c[4].db && c[2]>c[4].t-c[4].db) db = (c[4].t-c[2])/c[4].db;
			if(c[4].mu) act.velocity = act.vectorUp.multiply(c[4].mu*bz*da*db*f);
			if(c[4].mr) act.velocity = act.vectorRight.multiply(c[4].mr*bz*da*db*f);
			if(c[4].mf) act.velocity = act.vectorForward.multiply(c[4].mf*bz*da*db*f);
			if(c[4].fu) act.fuel = (act.velocity.magnitude()/act.maxSpeed)*7;
			if(c[4].en) act.energy = (act.velocity.magnitude()/act.maxSpeed)*act.maxEnergy;
			return;
		});
		this._addTo("velocity",this.fcb,obj);
		return true;
	},
	/** e, t, tg, mu,mr,mf [, da, db, z, fu, en]
	*/
	velocityTo: function(obj){
		this._stopIt(obj,"velocity");
		var x;
		if(!obj.tg.isShip){
			if(typeof obj.tg==='number') obj.tg = this.subs[obj.tg];
			else if(obj.tg.constructor.name==="Array") obj.tgv = new Vector3D(obj.tg);
		} else if(obj.tg.isInSpace) obj.tgv = obj.tg.position;
		if(obj.e>-1) x = this.subs[obj.e].velocity.magnitude();
		else x = this.ent.velocity.magnitude();
		if(x>1) obj.da = obj.da/x;
		var c = [this.ent,this.subs,0,this.defDelta,obj,this.cur[obj.e],0];
		this.fcb = addFrameCallback(function(delta){
			if(!delta || !c[0] || !c[0].isValid || c[6]) return;
			var f=1, bz=1, da=1, db=1, act, col, v, dist, mul,slow, check;
			if(c[3]>delta) f = 1/(c[3]/delta);
			else f = 1-(c[3]-delta);
			c[2] += delta;
			if(c[2]>=c[4].t) return;
			if(c[4].e>-1) act = c[1][c[4].e];
			else act = c[0];
			col = act.collisionRadius;
			if(c[4].tgv) v = c[4].tgv;
			else v = c[4].tg;
			if(c[4].tg.isInSpace) col += c[4].tg.collisionRadius;
			dist = act.position.distanceTo(v);
			if(dist<col*4){
				f *= 1/(col*4/dist);
				slow = 1;
			}
			if(dist<col){
				if(!c[6]){
					act.velocity = [0,0,0];
					c[6] = 1;
					if(c[4].fu) act.fuel = 0;
					if(c[4].en) act.energy = 0;
					c[5].mf = 0;
				}
				return;
			}
			if(c[4].z) bz = Math.sqrt(Math.abs(act.position.z));
			if(c[4].da && c[2]<c[4].da) da = 1-((c[4].da-c[2])/c[4].da);
			if(c[4].db && c[2]>c[4].t-c[4].db) db = (c[4].t-c[2])/c[4].db;
			mul = bz*da*db*f;
			if(c[4].mu) act.velocity = act.vectorUp.multiply(c[4].mu*mul);
			if(c[4].mr) act.velocity = act.vectorRight.multiply(c[4].mr*mul);
			if(c[4].mf){
				check = c[4].mf*mul;
				if(!slow && c[5].mf>check) check = c[5].mf;
				act.velocity = act.vectorForward.multiply(check);
				c[5].mf = check;
			}
			if(c[4].fu) act.fuel = (act.velocity.magnitude()/act.maxSpeed)*7;
			if(c[4].en) act.energy = (act.velocity.magnitude()/act.maxSpeed)*act.maxEnergy;
			return;
		});
		this._addTo("velocity",this.fcb,obj);
		return true;
	},
	/** e, velo
	*/
	setVelocity: function(obj){
		this._stopIt(obj,"velocity");
		if(obj.e>-1) this.ent.subEntities[obj.e].velocity = obj.velo;
		else this.ent.velocity = obj.velo;
		return true;
	},
	/** e
	*/
	stopVelocity: function(obj){
		this._stopIt(obj,"velocity");
		if(obj.e>-1) this.ent.subEntities[obj.e].velocity = [0,0,0];
		else this.ent.velocity = [0,0,0];
		return true;
	},
	/** e, t, st [,z, da, db]
	*/
	walk: function(obj){
		var c = [this.ent,this.subs,0,this.defDelta,obj];
		this.fcb = addFrameCallback(function(delta){
			if(!delta || !c[0] || !c[0].isValid) return;
			var f=1, bz=1, da=1, db=1, act, up,rol, mul, steps;
			if(c[3]>delta) f = 1/(c[3]/delta);
			else f = 1-(c[3]-delta);
			c[2] += delta;
			steps = Math.floor(c[2]);
			if(c[2]>=c[4].t || steps>=c[4].st) return;
			if(c[4].e>-1) act = c[1][c[4].e];
			else act = c[0];
			if(c[4].z) bz = Math.sqrt(Math.abs(act.position.z));
			if(c[4].da && c[2]<c[4].da) da = 1-((c[4].da-c[2])/c[4].da);
			if(c[4].db && c[2]>c[4].t-c[4].db) db = (c[4].t-c[2])/c[4].db;
			mul = Math.PI*bz*da*db*f;
			rol = Math.cos(c[2]*mul);
			up = Math.cos(c[2]*3*mul);
			act.position = act.position.subtract([rol*0.05,up*0.15,mul*0.15]);
			return;
		});
		this._addTo("walk",this.fcb,obj);
		return true;
	},
	walkTo: function(){},
	/** e
	*/
	stopWalk: function(obj){
		this._stopIt(obj,"walk");
		return true;
	},
	/** e, t, mz [, z, da, db]
	*/
	zoom: function(obj){
		var c = [this.ent,this.subs,0,this.defDelta,obj];
		this.fcb = addFrameCallback(function(delta){
			if(!delta || !c[0] || !c[0].isValid) return;
			var f=1, bz=1, da=1, db=1, act, mf=1;
			if(c[3]>delta) f = 1/(c[3]/delta);
			else f = 1-(c[3]-delta);
			c[2] += delta;
			if(c[2]>=c[4].t) return;
			if(c[4].e>-1) act = c[1][c[4].e];
			else act = c[0];
			if(c[4].z) bz = Math.sqrt(Math.abs(act.position.z));
			if(c[4].da && c[2]<c[4].da) da = 1-((c[4].da-c[2])/c[4].da);
			if(c[4].db && c[2]>c[4].t-c[4].db) db = (c[4].t-c[2])/c[4].db;
			if(c[4].mz>1) mf = 1+(da*db*bz*(c[4].mz%1));
			else mf = 1-(f*da*db*bz*(1%c[4].mz));
			act.position = act.position.multiply(mf);
			return;
		});
		this._addTo("zoom",this.fcb,obj);
		return true;
	},
	zoomTo: function(){},
	/** e
	*/
	stopZoom: function(obj){
		this._stopIt(obj,"zoom");
		return true;
	},
	/** e, p, v [, t, da, db]
	*/
	setProp: function(obj){
		if(!obj.t){
			if(obj.e>-1) this.subs[obj.e][obj.p] = obj.v;
			else this.ent[obj.p] = obj.v;
		} else {
			var c = [this.ent,this.subs,0,this.defDelta,obj];
			this.fcb = addFrameCallback(function(delta){
				if(!delta || !c[0] || !c[0].isValid) return;
				var f=1, da=1, db=1, act;
				if(c[3]>delta) f = 1/(c[3]/delta);
				else f = 1-(c[3]-delta);
				c[2] += delta;
				if(c[2]>=c[4].t) return;
				if(c[4].e>-1) act = c[1][c[4].e];
				else act = c[0];
				if(c[4].da && c[2]<c[4].da) da = 1-((c[4].da-c[2])/c[4].da);
				if(c[4].db && c[2]>c[4].t-c[4].db) db = (c[4].t-c[2])/c[4].db;
				if(typeof act[c[4].p]==='number') act[c[4].p] += c[4].v*f*da*db/c[4].t;
				else act[c[4].p] = act[c[4].p].multiply(c[4].v*f*da*db/c[4].t); // TODO check
				return;
			});
			this._addTo("props",this.fcb,obj);
		}
		return true;
	},
	/** e, mat, sha
	*/
	setMaterials: function(obj){
		var act;
		if(obj.e>-1) act = this.subs[obj.e];
		else act = this.ent;
		if(obj.mat && obj.sha) act.setMaterials(obj.mat,obj.sha);
		else if(obj.mat) act.setMaterials(obj.mat,{});
		else if(obj.sha) act.setMaterials({},obj.sha);
		return true;
	},
	/** e, prop
	* i, p, v
	*/
	modifyMaterials: function(obj,prop){
		var m = this._getMaterials(obj),k = Object.keys(m),w;
		if(!k.length) return;
		for(var o=0;o<obj.prop.length;o++){
			w = obj.prop[o];
			m[k[w.i]][w.p] = w.v;
		}
		this._setMaterials(obj,m);
	},
	/** e, mat, tex, col
	*/
	highlight: function(obj){
		var act,m;
		if(obj.e>-1) act = this.subs[obj.e];
		else act = this.ent;
		m = act.getMaterials();
		m[obj.mat].emission_map = obj.tex;
		m[obj.mat].emission_modulate_color = obj.col;
		act.setMaterials(m);
	},
	setTextures: function(obj){},
	/** e, sha [, rep]
	*/
	setShader: function(obj){
		if(obj.rep){
			var k = Object.keys(obj.sha),w,h,v;
			for(var o=0;o<k.length;o++){
				w = obj.sha[k[o]].uniforms;
				h = Object.keys(w);
				for(var i=0;i<h.length;i++){
					v = obj.sha[k[o]].uniforms[h[i]];
					if(v.value==="p1") v.value = clock.absoluteSeconds-1;
				}
			}
		}
		if(obj.e>-1) this.subs[obj.e].setShaders(obj.sha);
		else this.ent.setShaders(obj.sha);
		return true;
	},
	/** e, tex (Array), uni (Array), val (Array)
	*/
	setShaderProp: function(obj){
		var a,b,flagM,i;
		a = this._getShaders(obj);
		b = Object.keys(a);
		if(!b.length){
			a = this._getMaterials(obj);
			flagM = 1;
			b = Object.keys(a);
		}
		if(!b.length) return false;
		if(obj.tex) for(i=0;i<obj.tex.length;i++) a[b[0]].textures = obj.tex;
		if(obj.uni) for(i=0;i<obj.uni.length;i++) a[b[0]].uniforms[obj.uni[i]].value = obj.val[i];
		if(flagM){
			if(obj.e>-1) this.subs[obj.e].setMaterials(a);
			else this.ent.setMaterials(a);
		} else {
			if(obj.e>-1) this.subs[obj.e].setShaders(a);
			else this.ent.setShaders(a);
		}
		return true;
	},
	/** e, id, scale, pos
	*/
	explosion: function(obj){
		var act,sha = {};
		sha[obj.id] = {
			fragment_shader:"lib_ms_whexit.fs",
			vertex_shader:"lib_ms_bbT.vs",
			textures:["lib_explode2.png"],
			uniforms:{
				colorMap:{type:"texture",value:0},
				Time:{binding:"universalTime"},
				Dest:{binding:"destination",bindToSubentity:true,normalized:false}}};
		if(obj.e>-1) act = this.subs[obj.e];
		else act = this.ent;
		act.destination = [2,clock.absoluteSeconds-1,obj.scale];
		act.setShaders(sha);
		if(obj.pos) act.position = obj.pos;
	},
	/** e, id, scale, pos
	*/
	hyper: function(obj){
		var act,sha = {};
		sha[obj.id] = {
			fragment_shader:"lib_ms_whexit.fs",
			vertex_shader:"lib_ms_bbT.vs",
			textures:["lib_hyper.png"],
			uniforms:{
				colorMap:{type:"texture",value:0},
				Time:{binding:"universalTime"},
				Dest:{binding:"destination",bindToSubentity:true,normalized:false}}};
		if(obj.e>-1) act = this.subs[obj.e];
		else act = this.ent;
		act.destination = [6,clock.absoluteSeconds-1,obj.scale];
		act.setShaders(sha);
		if(obj.pos) act.position = obj.pos;
	},
	/** e, id, scale, pos, col
	*/
	sun: function(obj){
		var act,sha = {};
		sha[obj.id] = {
			fragment_shader:"lib_ms_sun.fs",
			vertex_shader:"lib_ms_bbT.vs",
			uniforms:{
				Suncolor:{type:"vector",value:obj.col},
				Time:{type:"float",value:0},
				Dest:{binding:"destination",bindToSubentity:true,normalized:false}}};
		if(obj.e>-1) act = this.subs[obj.e];
		else act = this.ent;
		act.destination = [1,1,obj.scale];
		act.setShaders(sha);
		if(obj.pos) act.position = obj.pos;
	},
	/** e, id, scale, pos, col
	*/
	twinkle: function(obj){
		var act,sha = {};
		sha[obj.id] = {
			fragment_shader:"lib_ms_bg_twinkle.fs",
			vertex_shader:"lib_ms_bbT.vs",
			uniforms:{
				Time:{binding:"universalTime"},
				Dest:{binding:"destination",bindToSubentity:true,normalized:false}}};
		if(obj.e>-1) act = this.subs[obj.e];
		else act = this.ent;
		act.destination = [99999999,0,obj.scale];
		act.setShaders(sha);
		if(obj.pos) act.position = obj.pos;
	},
	/** e, id, scale, pos, col
	*/
	moon: function(obj){
		var act,sha = {};
		sha[obj.id] = {
			fragment_shader:"lib_ms_moon.fs",
			vertex_shader:"lib_ms_moon.vs",
			textures:[{name:obj.tex,cube_map:true}],
			uniforms:{
				colorMap:{type:"texture",value:0},
				Suncolor:{type:"vector",value:obj.col},
				Scale:{type:"float",value:obj.scale}}};
		if(obj.e>-1) act = this.subs[obj.e];
		else act = this.ent;
		act.setShaders(sha);
		if(obj.pos) act.position = obj.pos;
	},
	/** e, t, tg, [exh, fe, dist, swap]
	*/
	setBinding: function(obj){
		if(typeof obj.tg==='number'){
			if(obj.tg>-1) obj.tg = this.subs[obj.tg];
			else obj.tg = this.ent;
		}
		if(obj.dist){
			if(obj.e>-1) obj.distv = this.subs[obj.e].position.subtract(obj.tg.position);
			else obj.distv = obj.tg.position;
		}
		var c = [this.ent,this.subs,0,this.defDelta,obj];
		this.fcb = addFrameCallback(function(delta){
			if(!delta || !c[0] || !c[0].isValid) return;
			var f=1, act, p, o, s = 0;
			if(c[3]>delta) f = 1/(c[3]/delta);
			else f = 1-(c[3]-delta);
			c[2] += delta;
			if(c[2]>=c[4].t) return;
			if(c[4].e>-1) act = c[1][c[4].e];
			else act = c[0];
			if(c[4].fe){
				act.fuel = c[4].tg.fuel;
				act.energy = c[4].tg.energy;
			}
			if(c[4].exh){
				if(c[4].tg.desiredSpeed) s = c[4].tg.speed+1;
				act.fuel = (s/c[4].tg.maxSpeed)*0.7;
				act.energy = (s/c[4].tg.maxSpeed)*c[4].tg.maxEnergy;
			}
			if(c[4].dsor){
				act.destination = c[4].tg.position;
				act.energy = 0;
			}
			if(c[4].distv){
				o = c[4].tg.orientation;
				if(c[4].swap) o = o.rotate(c[4].tg.vectorUp,-Math.PI);
				act.orientation = o;
				p = c[4].tg.position.add(c[4].distv.rotateBy(o));
				act.position = p;
			}
			return;
		});
		this._addTo("bind",this.fcb,obj);
		return true;
	},
	/** e
	*/
	stopBinding: function(obj){
		this._stopIt(obj,"bind");
		return true;
	},
	/** e, pos
	*/
	setPosition: function(obj){
		if(obj.e>-1) this.subs[obj.e].position = obj.pos;
		else this.ent.position = obj.pos;
		return true;
	},
	/** e, tg, ex, p
	*/
	setExhaust: function(obj){
		if(obj.e>-1){
			this.subs[obj.e].position = this.subs[obj.tg].exhausts[obj.ex].position;
			this.subs[obj.e][obj.p] = this.subs[obj.tg].exhausts[obj.ex].size.multiply(0.11764); // .dat 1/8.5
		}
		return true;
	},
	/** e, tg [, off]
	*/
	setPositionTo: function(obj){
		var pos;
		if(obj.tg>-1) pos = this.subs[obj.tg].position;
		else pos = this.ent.position;
		if(obj.off) pos.add(obj.off);
		if(obj.e>-1) this.subs[obj.e].position = pos;
		else this.ent.position = pos;
		return true;
	},
	/** e, f, tg [, off]
	*/
	setFlasherPositionTo: function(obj){
		var pos;
		if(obj.tg>-1) pos = this.subs[obj.tg].position;
		else pos = this.ent.position;
		if(obj.off) pos = pos.add(obj.off);
		if(obj.e>-1) this.subs[obj.e].flashers[obj.f].position = pos;
		else this.ent.flashers[obj.f].position = pos;
		return true;
	},
	/** e, ori
	*/
	setOrientation: function(obj){
		if(obj.e>-1) this.subs[obj.e].orientation = obj.ori;
		else this.ent.orientation = obj.ori;
		return true;
	},
	/** e, inf
	*/
	snapIn: function(obj){
		this._stopIt(obj,"rotate");
		var act,ori;
		if(obj.e>-1) act = this.subs[obj.e];
		else act = this.ent;
		ori = act.orientation;
		ori.w = this._snapIn(ori.w);
		ori.x = this._snapIn(ori.x);
		ori.y = this._snapIn(ori.y);
		ori.z = this._snapIn(ori.z);
		act.orientation = ori;
	},
	/** n
	*/
	setBackground: function(obj){
		this.bg.name = obj.n;
		setScreenBackground(this.bg);
	},
	/** mw, mh [, n]
	*/
	zoomBackground: function(obj){
		this.bg.mw = obj.mw;
		this.bg.mh = obj.mh;
		if(obj.n) this.bg.name = obj.n;
		this.fcb = addFrameCallback(this._zoomBG.bind(this));
		this.fcbs.push(this.fcb);
		this.flow.bg["-1"] = [this.fcb];
	},
	zoomBackgroundTo: function(){},
	/**
	*/
	stopBackground: function(){
		this._stopIt({e:-1},"bg");
	},
	/**
	*/
	clearBackground: function(){
		this.stopBackground();
		setScreenBackground(null);
	},
	resetBackground: function(obj){
		this.stopBackground();
		this.bg = {name:null,width:this.w,height:this.h,mw:1,mh:1};
		if(obj && obj.n) this.setBackground(obj);
	},
	/** n
	*/
	setOverlay: function(obj){
		this.ov.name = obj.n;
		setScreenOverlay(this.ov);
	},
	/** mw, mh [, n]
	*/
	zoomOverlay: function(obj){
		this.ov.mw = obj.mw;
		this.ov.mh = obj.mh;
		if(obj.n) this.ov.name = obj.n;
		this.fcb = addFrameCallback(this._zoomOV.bind(this));
		this.fcbs.push(this.fcb);
		this.flow.ov["-1"] = [this.fcb];
	},
	/**
	*/
	stopOverlay: function(){
		this._stopIt({e:-1},"ov");
	},
	/**
	*/
	clearOverlay: function(){
		this.stopOverlay();
		setScreenOverlay(null);
	},
	/** t
	*/
	fadeIn: function(obj){
		this._stopIt({e:-1},"ov");
		this.ov = {name:"lib_blend0.png",width:this.w,height:this.h,mw:1,mh:1};
		this.ovFade = {n:0,dir:1,t:obj.t};
		this.fcb = addFrameCallback(this._fadeOV.bind(this));
		this.fcbs.push(this.fcb);
		this.flow.ov["-1"] = [this.fcb];
	},
	/** t
	*/
	fadeOut: function(obj){
		this._stopIt({e:-1},"ov");
		this.ov = {name:"lib_blend10.png",width:this.w,height:this.h,mw:1,mh:1};
		this.ovFade = {n:0,dir:0,t:obj.t};
		this.fcb = addFrameCallback(this._fadeOV.bind(this));
		this.fcbs.push(this.fcb);
		this.flow.ov["-1"] = [this.fcb];
	},
	/** e, lv, x, y, mz
	*/
	screenCornerPos: function(obj){
		var pos,
			w = 1024/this.w,
			h = 768/this.h;
		if(obj.e>-1) pos = this.subs[obj.e].position;
		else pos = this.ent.position;
		pos.x = obj.lv*pos.z*obj.x;
		pos.y = obj.lv*pos.z*0.75*obj.y;
		if(obj.mz) pos.z *= obj.mz;
		else pos.z *= 1.3;
		var wh = w/h;
		pos = pos.add([w*wh-1,h*wh-1,0]);
		this.ent.position = pos;
		return true;
	},
	// Sub functions
	_addTo: function(w,id,obj){
		this.fcbs.push(id);
		if(this.flow[w][obj.e]) this.flow[w][obj.e].push(id);
		else this.flow[w][obj.e] = [id];
	},
	/** e, what
	*/
	_stopIt: function(obj,what){
		var f = this.flow[what][obj.e],ind;
		if(!f) return false;
		for(var i=0;i<f.length;i++){
			if(isValidFrameCallback(f[i])) removeFrameCallback(f[i]);
			ind = this.fcbs.indexOf(f[i]);
			if(ind!==-1) this.fcbs.splice(ind,1);
		}
		this.flow[what][obj.e] = [];
		return true;
	},
	/**
	*/
	_zoomBG: function(delta){
		if(!delta) return;
		this.bg.width *= this.bg.mw;
		this.bg.height *= this.bg.mh;
		setScreenBackground(this.bg);
	},
	/**
	*/
	_zoomOV: function(delta){
		if(!delta) return;
		this.ov.width *= this.ov.mw;
		this.ov.height *= this.ov.mh;
		setScreenOverlay(this.ov);
	},
	/**
	*/
	_fadeOV: function(delta){
		if(!delta) return;
		var f = Math.floor(this.ovFade.n*10/this.ovFade.t);
		if(this.ovFade.dir) f = 10-f;
		else f++;
		if(f<0) f = 0;
		if(f>10) f = 10;
		this.ov.name = "lib_blend"+f+".png";
		setScreenOverlay(this.ov);
		this.ovFade.n += delta;
	},
	_removeFCBs: function(){
		if(!this.fcbs.length) return false;
		for(var i=0;i<this.fcbs.length;i++){
			if(isValidFrameCallback(this.fcbs[i])) removeFrameCallback(this.fcbs[i]);
		}
		this.fcb = 0;
		this.fcbs = [];
		return true;
	},
	_getMaterials: function(obj){
		if(obj.e>-1) return this.subs[obj.e].getMaterials();
		return this.ent.getMaterials();
	},
	_setMaterials: function(obj,m){
		if(obj.e>-1) return this.subs[obj.e].setMaterials(m);
		return this.ent.setMaterials(m);
	},
	_getShaders: function(obj){
		if(obj.e>-1) return this.subs[obj.e].getShaders();
		return this.ent.getShaders();
	},
	_setPilot: function(obj){
		var act;
		this.setShaderProp(obj);
		if(obj.e>-1) act = this.subs[obj.e];
		else act = this.ent;
		act.destination = obj.scpos;
		act.lightsActive = obj.init;
	},
	_pilotSpeak: function(obj){
		var act;
		if(obj.e>-1) act = this.subs[obj.e];
		else act = this.ent;
		act.energy = obj.fade;
		if(obj.txt) mission.addMessageText(obj.txt);
	},
	_sRND: function(seed,max){
		return ((0x731753*seed)>>16)%max;
	},
	_snapIn: function(e){
		if(e>0.9) e = 1;
		if(e>0.6 && e<0.8) e = 0.707107;
		if(e>0.4 && e<0.6) e = 0.5;
		if(e>-0.1 && e<0.1) e = 0.0;
		if(e>-0.6 && e<-0.4) e = -0.5;
		if(e>-0.8 && e<-0.6) e = -0.707107;
		if(e<-0.9) e = -1;
		return e;
	}
};
}).call(this);