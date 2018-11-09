/* global mission,worldScripts,SoundSource */
/* (C) Svengali 2016-2018, License CC-by-nc-sa-4.0 */
(function(){
"use strict";
this.name = "Lib_Cubecode";

/** _initCubes
* @obj.pass - Number
* @obj.card - Texture
* @obj.ws - String
* @obj.path - String
*/
this._initCubes = function(obj){
	if(this.$cub.init) return false;
	var ret,map = "lib_lock.png",lo = 0,ws=null,wsf=null;
	if(obj){
		if(obj.card) map = obj.card;
		if(typeof obj.pass==="number") lo = obj.pass;
		if(obj.ws && obj.path){
			ws = obj.ws;
			wsf = obj.path;
		}
	}
	this.$cub.lock = lo;
	this.$cub.ws = ws;
	this.$cub.path = wsf;
	this.$head.subTex[0].mat["lib_null.png"].emission_map = map;
	this.$cub.code = -1;
	this.$cub.init = 1;
	ret = this._showCubes();
	return ret;
};
this.startUp = function(){
	this.$head = {
		model: "lib_ms_cubes",
		title: "Security check",
		background: "lib_console_bg.png",
		choices: {NEXT:"Next",ROTX:"Rotate X",ROTY:"Rotate Y",ROTZ:"Rotate Z",ZZZ:"QUIT"},
		text: "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n                                        Select your option:",
		caller: this.name,
		callback: "_choiceEval",
		checkpoint: "_checkpoints",
		aOris: [{e:-1,ori:[1,0,0,0]}],
		aPos: [{e:-1,pos:[0,30,250]}],
		subTex: [{e:0,mat:{"lib_null.png":{emission_map:"lib_lock.png"}}}],
		flow:[]
	};
	this.$cub = {
		code:-1,
		lock:0,
		cur:1,
		init:0,
		ws:null,
		path:null,
		curOri:[[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0]],
		flows:{a:[4,"rotX",{e:1,t:2,deg:90,da:1,db:1,inf:1}],b:[4,"rotY",{e:1,t:2,deg:90,da:1,db:1,inf:1}],c:[4,"rotZ",{e:1,t:2,deg:90,da:1,db:1,inf:1}]}
	};
	this.$snd = new SoundSource();
	this._aid = worldScripts.Lib_Main._lib;
};
this._showCubes = function(fl,w){
	var obj = this._aid.objClone(this.$head),ac,c = 0,ret,i,un = ['ROTX','ROTY','ROTZ','ZZZ'],m = "lib_ms_cube_a.png";
	for(i=1;i<10;i++){obj.aOris.push({e:i,ori:this.$cub.curOri[i]});}
	if(w) obj.replace = 1;
	else {
		obj.fadeIn = true;
		obj.flow.push([c,"ovFadeIn",{t:1.5}]);
		c++;
		obj.flow.push([c,"snd1",{snd:"lib_enter_code.ogg"}]);
		c++;
	}
	if(this.$cub.lock===this.$cub.code){
		for(i=0;i<4;i++) obj.choices = this._aid.scrChcUnsel(obj.choices,un[i]);
		obj.flow.push([c,"clr"]);
		c++;
		for(i=1;i<10;i++){
			obj.flow.push([c,"lit",{e:i,mat:m,tex:m,col:[0,0.6,0,1]}]);
			c++;
		}
	} else {
		obj.flow.push([c,"lit",{e:this.$cub.cur,mat:m,tex:m,col:[0,0.6,0,1]}]);
		c++;
		if(fl){
			ac = this.$cub.flows[fl];
			ac[0] = c;
			ac[2].e = this.$cub.cur;
			obj.flow.push(ac);
			c++;
			obj.flow.push([c,"check"]);
			c+=5;
			obj.flow.push([c,"snap",{e:this.$cub.cur}]);
			c++;
			obj.flow.push([c,"check"]);
			c++;
		}
	}
	c+=5;
	obj.flow.push([c,"clr"]);
	ret = worldScripts.Lib_Animator._start(obj);
	if(ret && !w && !fl) this._getRes();
	return ret;
};
this._choiceEval = function(choice){worldScripts.Lib_Cubecode._delayChoice(choice); return;};
this._delayChoice = function(choice){
	var cb,ws;
	switch(choice){
		case "NEXT":
			this.$cub.cur++;
			if(this.$cub.cur>9) this.$cub.cur = 1;
			if(this.$cub.lock===this.$cub.code){
				cb = 1;
				this.$cub.init = 0;
			} else this._showCubes(0,1);
			break;
		case "ROTX": this._showCubes("a",1); break;
		case "ROTY": this._showCubes("b",1); break;
		case "ROTZ": this._showCubes("c",1); break;
		case "ZZZ": cb = 1; this.$cub.init = 0; break;
	}
	if(cb && this.$cub.ws && this.$cub.path){
		ws = worldScripts[this.$cub.ws];
		this._aid.objPass(ws,this.$cub.path,this.$cub.code);
	}
	this.$snd.sound = "[changed-option]";
	this.$snd.play();
};
this._checkpoints = function(n){
	var o;
	switch(n){
		case 2:
			o = worldScripts.Lib_Animator._a;
			if(o) this.$cub.curOri[this.$cub.cur] = o.cur[this.$cub.cur].tOri;
			break;
		case 8:
			this._getRes();
			if(this.$cub.lock===this.$cub.code){
				this.$snd.sound = "lib_code_verified.ogg";
				this.$snd.play();
				this._showCubes(0,1);
			}
			break;
	}
	return true;
};
this._getRes = function(){
	var res = 0,pri = [3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61],a,b,c = mission.displayModel;
	for(var i=1;i<10;i++){
		a = pri[i];
		b = c.subEntities[i].vectorUp;
		if(b.x>0) res += b.x*11*a;
		if(b.y>0) res += b.y*13*a;
		if(b.z>0) res += b.z*17*a;
		b = c.subEntities[i].vectorRight;
		if(b.x>0) res += b.x*19*a;
		if(b.y>0) res += b.y*23*a;
		if(b.z>0) res += b.z*29*a;
		b = c.subEntities[i].vectorForward;
		if(b.x>0) res += b.x*31*a;
		if(b.y>0) res += b.y*37*a;
		if(b.z>0) res += b.z*41*a;
	}
	this.$cub.code = Math.floor(res);
};
}).call(this);
