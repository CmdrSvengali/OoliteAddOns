/* global clock,expandDescription,expandMissionText,galaxyNumber,mission,missionVariables,player,system,worldScripts,Vector3D */
/* (C) DaddyHoggy, Drew, Disembodied and Svengali 2009-2018, License CC-by-nc-sa-4.0 */
(function(){
"use strict";
this.name = "GNN";
this.description = "The Galactic News Network";

this.$snoop = {
	audio: true,
	fifo: [],
	hot: [],
	maxDays: 24,
	nextNews: 0,
	unused: []
};
this.$doop = {
	ext: [ // Some events
		{ws:"AsteroidStorm",prop:{name:"badRockKiller",v:"PLAYER"},mV:{name:"asteroids",v:"asteroids_OVER"},
			act:{EX:"AsteroidStorm",m:"badrock",p:1,Model:"badrock",Spin:1}},
		{ws:"oolite-constrictor-hunt",mV:{name:"conhunt",v:"CONSTRICTOR_DESTROYED"},
			act:{m:"conhunt",p:1,Model:"constrictor",Spin:1}},
		{ws:"oolite-nova",mV:{name:"nova",v:"NOVA_ESCAPED_SYSTEM"},
			act:{m:"nova",p:1,Mat:{"lib_null.png":{emission_map:"GNN_solar.png",fragment_shader:"GNN_solar.fs",vertex_shader:"lib_simple.vs",
			textures:["GNN_solar.png",{name:"lib_explode2.png",repeat_s:true,repeat_t:true}],uniforms:{colorMap:{type:"texture",value:0},
			fxMap:{type:"texture",value:1},Time:"timeElapsedSinceSpawn"}}}}}
	],
	hud: false,
	inf: {Name:"GNN",Display:"Config",Alive:"$doop.inf",
		Bool:{B0:{Name:"$snoop.audio",Def:true,Desc:"Audio"}},
		SInt:{S0:{Name:"$snoop.maxDays",Def:24,Min:12,Max:99,Desc:"Interval"},Info:"^GNN_INFS"}
	},
	intern: 206,
	expImages:[[],[],[],[]],
	expPrefixes:[]
};
this.startUp = function(){
	var infos,oxpID,i, k = this.$snoop;
	if(missionVariables.GNN){
		infos = JSON.parse(missionVariables.GNN);
		for(i=0;i<infos.unused.length;i++){
			oxpID = infos.unused[i].ID;
			if(worldScripts[oxpID]) k.fifo.push(infos.unused[i]);
			else k.unused.push(infos.unused[i]);
		}
		for(i=0;i<infos.fifo.length;i++){
			oxpID = infos.fifo[i].ID;
			if(worldScripts[oxpID]) k.fifo.push(infos.fifo[i]);
			else k.unused.push(infos.fifo[i]);
		}
		k.nextNews = infos.nextNews;
		k.hot = infos.hot;
		k.audio = infos.audio;
		k.maxDays = infos.maxDays;
	}
	this._aid = worldScripts.Lib_Main._lib;
	delete this.startUp;
};
this.startUpComplete = function(){
	this._updInterface(player.ship.dockedStation);
	this._resort();
	worldScripts.Lib_Config._registerSet(this.$doop.inf);
	for(var i=0;i<this.$doop.ext.length;i++){
		if(!worldScripts[this.$doop.ext[i].ws]) this.$doop.ext[i] = null;
	}
	this.$doop.ext = this._aid.arrOmit(this.$doop.ext,null);
	delete this.startUpComplete;
};
this.playerWillSaveGame = function(){
	missionVariables.GNN = JSON.stringify(this.$snoop);
};
this.shipWillDockWithStation = function(){
	var i,obj,pass;
	if(this.$snoop.hot.length) this.$snoop.hot = this._aid.arrOmit(this.$snoop.hot,null);
	for(i=0;i<this.$doop.ext.length;i++){
		pass = 0;
		obj = this.$doop.ext[i];
		if(obj.prop){
			if(worldScripts[obj.ws][obj.prop.name]===obj.prop.v) pass++;
		} else pass++;
		if(obj.mV){
			if(missionVariables[obj.mV.name]===obj.mV.v) pass++;
		} else pass++;
		if(pass===2) this._addHot(obj.act);
	}
};
this.shipExitedWitchspace = function(){
	if(galaxyNumber === 3 && missionVariables.nova === "TWO_HRS_TO_ZERO") missionVariables.GNN_nova = system.name;
};
this._addHot = function(o){
	var x = {ID:"GNN",Message:o.m,Priority:o.p,Delay:clock.days+1};
	if(o.Model){
		x.Model = o.Model;
		if(o.Spin) x.Spin = o.Spin;
	}
	if(o.EX) x.EX = o.EX;
	if(o.Tex) x.Tex = o.Tex;
	if(o.Mat) x.Mat = o.Mat;
	this.$snoop.hot.push(x);
};
this.shipDockedWithStation = function(st){
	if(player.ship.docked){
		this._updInterface(st);
		this._resort();
	}
};
this.dayChanged = function(newday){
	var x = Math.floor(Math.random()*100),i,obj,m, k = this.$snoop;
	for(i=0;i<k.hot.length;i++){
		obj = k.hot[i];
		if(obj && obj.Delay<=newday){
			if(obj.ID==="GNN"){
				obj.AutoPos = 1;
				obj.Message = "GNN_"+obj.Message;
				if(obj.EX) obj.ID = obj.EX;
			}
			if(worldScripts[obj.ID]) k.fifo.push(obj);
			else k.unused.push(obj);
			k.hot[i] = null;
		}
	}
	if(k.fifo.length<3){
		if(newday>k.nextNews){
			switch(x){
				case 5: m = "GNN_A"; break;
				case 9: m = "GNN_B"; break;
				case 13: m = "GNN_C"; break;
				case 17: m = "GNN_D"; break;
				default: m = "Intern";
			}
			k.fifo.push({ID:"GNN",Message:m,Priority:5});
			k.nextNews = newday+this._aid.randXY(Math.floor(k.maxDays/2),k.maxDays);
		}
	}
	if(player.ship.docked) this._updInterface(player.ship.dockedStation);
};
this._doScreen = function(){worldScripts.GNN.$doop.hud = player.ship.hudHidden; player.ship.hudHidden = true; worldScripts.GNN._showScreen(); return;};
this._showScreen = function(obj){
	if(!player.ship.docked || system.isInterstellarSpace) return false;
	var what,ret,ws;
	var head = {
		choices: {BACK:"Back"},
		exitScreen: "GUI_SCREEN_INTERFACES",
		message: "No news available.",
		model: "lib_ms_helper",
		music: "GNN.ogg",
		overlay: {name:"GNN_clean.png",height:512},
		screenID: this.name,
		spinModel: false,
		title: ""
	};
	if(obj){ // Direct
		if(this._aid.typeGet(obj)!=="object" || !obj.ID || !obj.Message) return false;
		var news = this._setStandards(obj);
		this._showInserted(head,news);
	} else {
		if(this.$snoop.fifo.length){
			if(this.$snoop.fifo.length>1) head.choices.NEXT = "Next message";
			what = this.$snoop.fifo[0];
			if(what.ID==="GNN"){
				switch(what.Message){
					case "Intern": ret = this._showInternal(head); break;
					case "GNN_A":
					case "GNN_B":
					case "GNN_C":
					case "GNN_D": ret = this._showInternal(head,what.Message); break;
					default: ret = this._showInserted(head,what); break;
				}
			} else ret = this._showInserted(head,what);
		} else return false;
	}
	if(ret){
		this.$snoop.fifo.shift();
		this._updInterface(player.ship.dockedStation);
		if(what.CB){
			ws = worldScripts[what.ID];
			if(what.CBID) this._aid.objPass(ws,what.CB,what.CBID);
			else this._aid.objPass(ws,what.CB,what.Message);
		}
	}
	return true;
};
this._setHead = function(head,obj){
	var em,extI,ov,r,txt;
	if(obj.Agency){
		switch(obj.Agency){
			case 1: ov = "A1"+this._aid.randXY(1,4); em = 1; break;
			case 2: ov = "A2"+this._aid.randXY(1,4); em = 2; break;
			case 3: ov = "A3"+this._aid.randXY(1,3); em = 3; break;
			default: ov = "A4"+this._aid.randXY(1,4); em = 4; break;
		}
	} else if(obj.Pic){
		// External image pack?
		if(obj.PicExt){
			if(this.$doop.expPrefixes.indexOf(obj.PicExt)!==-1) head.overlay = obj.Pic;
		} else head.overlay = obj.Pic;
	}
	if(ov){
		// Expanded image pool
		extI = this.$doop.expImages[em-1];
		if(extI.length && Math.random()>0.5){
			r = this._aid.randXY(0,extI.length-1);
			head.overlay = {name:extI[r],height:512};
		} else head.overlay.name = "GNN_"+ov+".png";
	}
	if(obj.Music) head.music = obj.Music;
	if(!this.$snoop.audio) head.music = null;
	txt = expandMissionText(obj.Message);
	if(obj.DKey) txt = expandDescription(obj.Message);
	if(!txt) txt = obj.Message;
	worldScripts.Lib_PAD.$config.last.news = txt;
	head.message = "\n\n\n\n\n\n\n\n"+txt;
	if(obj.Model){
		head.model = obj.Model;
		if(obj.Spin) head.spinModel = true;
	}
	return head;
};
this._setModelDef = function(obj,em){
	var md = mission.displayModel,pa,pb,d,n;
	if(md){
		if(obj.Pos) md.position = obj.Pos;
		if(em) this._aid.setMaterials(md,{mat:{"lib_null.png":{emission_map:"GNN_"+em+".png",fragment_shader:"GNN_"+em+".fs",vertex_shader:"lib_simple.vs",textures:[{name:"GNN_"+em+".png",repeat_s:true,repeat_t:true},{name:"GNN_blur.png",repeat_s:true,repeat_t:true}],uniforms:{colorMap:{type:"texture",value:0},fxMap:{type:"texture",value:1},Time:"timeElapsedSinceSpawn"}}}});
		if(obj.Tex) this._aid.setMaterials(md,{mat:{"lib_null.png":{emission_map:obj.Tex}}});
		if(obj.Mat) this._aid.setMaterials(md,{mat:obj.Mat});
		if(obj.AutoPos){
			pa = md.position;
			pb = new Vector3D([28.4,20.2,84]);
			d = pa.z*2.5/pb.z;
			if(md.name==="lib_ms_helper") d = 1;
			n = [pb.x*d,pb.y*d,pb.z*d];
			md.position = n;
			md.orientation = [1,0,0,0];
		}
		if(obj.Ori) md.orientation = obj.Ori;
	}
};
this._showInserted = function(head,obj){
	head = this._setHead(head,obj);
	mission.runScreen(head,this._choices);
	if(obj.Model) this._setModelDef(obj);
	else this._setModelDef(obj,obj.Agency?obj.Agency:1);
	return 1;
};
this._showInternal = function(head,gen){
	var em,n,nstr,ov,r,txt,xy,extI;
	if(gen){
		ov = "A1"+this._aid.randXY(1,4);
		em = 1;
		txt = worldScripts.GNN_PhraseGen._makePhrase(gen);
	} else {
		n = this._aid.randXY(1,this.$doop.intern);
		nstr = this._aid.toNLZ(n,4);
		txt = expandMissionText("GNN_"+nstr);
		if(txt[0]==="#"){
			switch(txt[1]){
				case "1": ov = "A1"+this._aid.randXY(1,4); em = 1; break;
				case "2": ov = "A2"+this._aid.randXY(1,4); em = 2; break;
				case "3": ov = "A3"+this._aid.randXY(1,3); em = 3; break;
				default: ov = "A4"+this._aid.randXY(1,4); em = 4; break;
			}
			txt = txt.substr(2);
		} else {
			ov = "A4"+this._aid.randXY(1,4);
			em = 4;
		}
	}
	// Expanded image pool
	extI = this.$doop.expImages[em-1];
	if(extI.length && Math.random()>0.5){
		r = this._aid.randXY(0,extI.length-1);
		head.overlay = {name:extI[r],height:512};
	} else head.overlay = {name:"GNN_"+ov+".png",height:512};
	head.message = "\n\n\n\n\n\n\n\n"+txt;
	worldScripts.Lib_PAD.$config.last.news = txt;
	if(!this.$snoop.audio) head.music = null;
	mission.runScreen(head,this._choices);
	this._setModelDef({AutoPos:1},em);
	return 1;
};
this._choices = function(choice){
	switch(choice){
		case "NEXT": worldScripts.GNN._showScreen(); break;
		case "BACK": player.ship.hudHidden = worldScripts.GNN.$doop.hud;
	}
};
this._updInterface = function(st){
	if((st.isMainStation || (st.scriptInfo && st.scriptInfo.GNN) || st.hasNPCTraffic) && !system.isInterstellarSpace){
		if(this.$snoop.fifo.length){
			player.ship.dockedStation.setInterface("GNN",{
				title:"Galactic News Network. ("+this.$snoop.fifo.length+" available)",
				category:"News",
				summary:"4 established news agencies bringing you the latest news. Directly onto your screen, through your eyeballs and into your brain.",
				callback:this._doScreen.bind(this)}
			);
		} else player.ship.dockedStation.setInterface("GNN",null);
	}
};
this._setStandards = function(obj){
	var o = this._aid.objClone(obj);
	if(o.Agency) o.Pic = null;
	if(!o.Priority) o.Priority = 3;
	if(o.Model) o.Tex = null;
	else {
		o.Ori = null;
		o.Pos = null;
	}
	if(!o.Pos) o.AutoPos = 1;
	return o;
};
this._insertNews = function(obj){
	if(this._aid.typeGet(obj)!=="object" || !obj.ID || !obj.Message) return 1;
	var news = this._setStandards(obj), no;
	if(news.Delay){
		for(var i=0;i<this.$snoop.hot.length;i++){
			if(this.$snoop.hot[i].ID===obj.ID && this.$snoop.hot[i].Message===obj.Message) no = 1;
		}
		if(!no){
			news.Delay += clock.days;
			this.$snoop.hot.push(news);
		}
	} else {
		for(var i=0;i<this.$snoop.fifo.length;i++){
			if(this.$snoop.fifo[i].ID===obj.ID && this.$snoop.fifo[i].Message===obj.Message) no = 1;
		}
		if(!no){
			this.$snoop.fifo.push(news);
			if(player.ship.docked){
				this._resort();
				this._updInterface(player.ship.dockedStation);
			}
		}
	}
	return 0;
};
this._resort = function(){
	if(this.$snoop.fifo.length>1) this.$snoop.fifo = this._aid.arrSortBy(this.$snoop.fifo,'Priority');
};
this._addExtImages = function(arr,ws){
	if(this._aid.typeGet(arr)!=="array" || typeof(ws)!=="string") return false;
	this.$doop.expImages = this._aid.arrConcat(this.$doop.expImages,arr);
	this.$doop.expPrefixes.push(ws);
	return true;
};
this._Help = function(what){
	var h;
	switch(what){
		case "_insertNews": h = "GNN_HELP_insertNews"; break;
		case "_showScreen": h = "GNN_HELP_showScreen"; break;
		case "_addExtImages": h = "GNN_HELP_addExtImages"; break;
		default: h = "GNN_HELP";
	}
	return expandMissionText(h);
};
}).call(this);
