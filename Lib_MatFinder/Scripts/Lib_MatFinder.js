/* jshint bitwise:false, forin:false */
/* global expandMissionText,log,mission,player,worldScripts,Ship */
/* (C) Svengali 2016-2018, License CC-by-nc-sa-4.0 */
(function(){
"use strict";
this.name = "Lib_MatFinder";

this.$curMat = {};
this.$storedMats = {};
this.$storedTex = {};
this.$storedPos = {};
this.$defsM = {
	ambient_color: {def:[1.0,1.0,1.0,1.0], typ:"array", use:"Color", range:[0,255]},
	anisotropy: {def:0.5, typ:"number", use:"Modifier", range:[0,1], nick:"an"},
	cube_map: {def:false, typ:"boolean", use:"Modifier", nick:"cb"},
	diffuse_color: {def:[1.0,1.0,1.0,1.0], typ:"array", use:"Color", range:[0,255]},
	diffuse_map: {def:null, typ:"string", use:"Texture"},
	emission_and_illumination_map: {def:null, typ:"string", use:"Texture"},
	emission_color: {def:[0.0,0.0,0.0,1.0], typ: "array", use:"Color", range:[0,255]},
	emission_map: {def:null, typ:"string", use:"Texture"},
	emission_modulate_color: {def:[1.0,1.0,1.0,1.0], typ:"array", use:"Color", range:[0,255]},
	extract_channel: {def:null, typ:"string", use:"Modifier", values:["r","g","b","a"], nick:"ex"},
	gloss: {def:0.375, typ:"number", use:"Float", range:[0,1]},
	illumination_map: {def:null, typ:"string", use:"Texture"},
	illumination_modulate_color: {def:[1.0,1.0,1.0,1.0], typ:"array", use:"Color", range:[0,255]},
	mag_filter: {def:"linear", typ:"string", use:"Modifier", values:["linear","nearest"], nick:"mg"},
	min_filter: {def:"linear", typ:"string", use:"Modifier", values:["linear","nearest","mipmap"], nick:"mn"},
	name: {def:null, typ:"string", use:"Modifier", nick:"na"},
	normal_and_parallax_map: {def:null, typ:"string", use:"Texture"},
	normal_map: {def:null, typ:"string", use:"Texture"},
	no_shrink: {def:false, typ:"boolean", use:"Modifier", nick:"ns"},
	parallax_bias: {def:0, typ:"number", use:"Float", range:[0,1]},
	parallax_scale: {def:0.01, typ:"number", use:"Float", range:[0,1]},
	repeat_s: {def:false, typ:"boolean", use:"Modifier", nick:"rs"},
	repeat_t: {def:false, typ:"boolean", use:"Modifier", nick:"rt"},
	shininess: {def:128, typ:"number", use:"Int", range:[0,128]},
	specular_color: {def:[0.2,0.2,0.2,1.0], typ:"array", use:"Color", range:[0,255]},
	specular_map: {def:null, typ:"string", use:"Texture"},
	specular_modulate_color: {def:[1.0,1.0,1.0,1.0], typ:"array", use:"Color", range:[0,255]},
	texture_LOD_bias: {def:-0.25, typ:"number", use:"Modifier", range:[-1,1], nick:"ld"},
	vertex_shader: {def:null, typ:"string", use:"VS"},
	fragment_shader: {def:null, typ:"string", use:"FS"},
	textures: {def:null, typ:"array", use:"STexture"},
	uniforms: {def:null, typ:"object", use:"SBinds"}
};
this.$defsC = {
	named:{
		blackColor: {def:"blackColor", typ:"String", nick:"blackColor"},
		darkGrayColor: {def:"darkGrayColor", typ:"String", nick:"darkGrayColor"},
		lightGrayColor: {def:"lightGrayColor", typ:"String", nick:"lightGrayColor"},
		whiteColor: {def:"whiteColor", typ:"String", nick:"whiteColor"},
		grayColor: {def:"grayColor", typ:"String", nick:"grayColor"},
		redColor: {def:"redColor", typ:"String", nick:"redColor"},
		greenColor: {def:"greenColor", typ:"String", nick:"greenColor"},
		blueColor: {def:"blueColor", typ:"String", nick:"blueColor"},
		cyanColor: {def:"cyanColor", typ:"String", nick:"cyanColor"},
		yellowColor: {def:"yellowColor", typ:"String", nick:"yellowColor"},
		magentaColor: {def:"magentaColor", typ:"String", nick:"magentaColor"},
		orangeColor: {def:"orangeColor", typ:"String", nick:"orangeColor"},
		purpleColor: {def:"purpleColor", typ:"String", nick:"purpleColor"},
		brownColor: {def:"brownColor", typ:"String", nick:"brownColor"},
		clearColor: {def:"clearColor", typ:"String", nick:"clearColor"}
	},
	hsva:{
		hue: {def:0, typ:"Number", nick:"h", range:[0,360]}, // required
		saturation: {def:1, typ:"Number", nick:"s", range:[0,1]},
		brightness: {def:1, typ:"Number", nick:"b", range:[0,1]},
		value: {def:1, typ:"Number", nick:"v", range:[0,1]},
		alpha: {def:1, typ:"Number", nick:"a", range:[0,1]},
		opacity: {def:1, typ:"Number", nick:"a", range:[0,1]}
	},
	rgba:{
		red: {def:0, typ:"Number", nick:"r", range:[0,255]},
		green: {def:0, typ:"Number", nick:"g", range:[0,255]},
		blue: {def:0, typ:"Number", nick:"b", range:[0,255]},
		alpha: {def:1, typ:"Number", nick:"a", range:[0,255]},
		opacity: {def:1, typ:"Number", nick:"a", range:[0,255]}
	}
};
this.$defsSub = {
	allow_docking: {def:true, typ:"boolean", use:"SubEnt"},
	allow_launching: {def:true, typ:"boolean", use:"SubEnt"},
	bright_fraction: {def:0.5, typ:"number", use:"SubEnt"},
	colors: {def:[[1,0,0,1]], typ:"array", use:"SubEnt"},
	disallowed_docking_collides: {def:false, typ:"boolean", use:"SubEnt"},
	dock_label: {def:"the docking bay", typ:"string", use:"SubEnt"},
	fire_rate: {def:0.5, typ:"number", use:"SubEnt", range:[0.25,99]},
	frequency: {def:2, typ:"number", use:"SubEnt"},
	initially_on: {def:true, typ:"boolean", use:"SubEnt"},
	is_dock: {def:1, typ:"number", use:"SubEnt", yep:1},
	orientation: {def:{x:1,y:0,z:0,w:0}, typ:"quaternion", use:"SubEnt", yep:1},
	phase: {def:0, typ:"number", use:"SubEnt"},
	position: {def:{x:0,y:0,z:0}, typ:"vector", use:"SubEnt", yep:1},
	size: {def:8, typ:"number", use:"SubEnt", range:[0,99]},
	subentity_key: {def:"", typ:"string", use:"SubEnt", yep:1},
	type: {def:"standard", typ:"string", use:"SubEnt", yep:1},
	weapon_energy: {def:25, typ:"number", use:"SubEnt", range:[0,100]},
	weapon_range: {def:6000, typ:"number", use:"SubEnt", range:[0,7500]}
};
this.$defsEx = {
	n: {def:"-", typ:"string", use:""},
	ind: {def:0, typ:"number", use:""},
	pos: {def:[0,0,0], typ:"array", use:"Pos"},
	size: {def:[0,0,0], typ:"array", use:"Pos"}
};
this.$defMat = {};
this.$posShader = {
	vertex_shader: "Lib_MatFinder_pos.vs",
	fragment_shader: "Lib_MatFinder_pos.fs",
	textures: ["lib_null.png"],
	uniforms: {
		tex0: {type:"texture",value:0},
		pos: {type:"vector",value:[0,0,0],normalized:false},
		size: {type:"vector",value:[0,0,0],normalized:false}
	}
};

this.startUp = function(){
	for(var p in this.$defsM){
		if(this.$defsM[p].use==="Modifier") continue;
		this.$defMat[p] = this.$defsM[p].def;
	}
};
this.$finder = {
	hud:null,
	pageHead:{
		choices:{ZZZA:{text:" ",unselectable:true},ZZZN:"Next",ZZZZ:"Exit"},
		initialChoicesKey: null,
		title:"Select entity",
		background:{name:"lib_bg.png",height:512},
		screenID:this.name
	},
	pageInd:0,
	pagesMax:0,
	modelHead:{
		choices:{ZYYB:"Back to main list"},
		initialChoicesKey: null,
		title:"",
		model:null,
		background:{name:"Lib_MatFinder_BG.png",height:512},
		screenID:this.name
	},
	gen: null,
	mode: "model", // model (default), shaderMat, posShader, shader, subentities, flashers
	modeInd: 0,
	modes: ["model","posShader"],
	modeNames: ["Materials","Positions"],
	modePages: [5,5],
	moveAmount: {
		x: {ind:1,val:[100,10,1,0.1,0.01]},
		y: {ind:1,val:[100,10,1,0.1,0.01]},
		z: {ind:1,val:[100,10,1,0.1,0.01]}
	},
	oriAmount: {
		x: {ind:1,val:[90,10,1,0.1,0.01]},
		y: {ind:1,val:[90,10,1,0.1,0.01]},
		z: {ind:1,val:[90,10,1,0.1,0.01]}
	},
	shadePos: [0,0,0],
	shadePosInd: 0,
	shaderLevel: 0,
	sizeX: 0,
	sizeY: 0,
	sizeXInd: 1,
	sizeYInd: 1,
	sizes: [10,1,0.1,0.01],
	logCompact: false,
	modelNoSub: false,
	modelHighlightActive: false,
	modelSpin: true,
	modelNoShade: true,
	modelCloseUp: false,
	modelCloseUpInd: 0,
	modelCloseUps: [0,10,30,50,100],
	modelCHCInd: 0,
	modelCurMod: null,
	modelOri: [0,0,1,0],
	modelOris: {YYOA:[1,0,0,0],YYOB:[1,1,1,0],YYOC:[0,0,1,0],YYOD:[-1,1,0,0],YYOE:[1,1,0,0],YYOF:[1,0,1,0],YYOG:[-1,0,1,0]},
	modelOrisUser: {ind:0,val:[[1,1,1,0],[1,-1,0,1],[-1,1,1,0],[1,1,0,1]]},
	modelMap: null,
	modelMaps: {YYMA:"diffuse_map",YYMB:"emission_and_illumination_map",YYMC:"emission_map",YYMD:"illumination_map",YYME:"normal_and_parallax_map",YYMF:"normal_map",YYMG:"specular_map"},
	modelMapMod: null,
	modelMapMods: {YMOA:"anisotropy",YMOB:"cube_map",YMOC:"extract_channel",YMOD:"mag_filter",YMOE:"min_filter",YMOF:"no_shrink",YMOG:"repeat_s",YMOH:"repeat_t",YMOI:"texture_LOD_bias"},
	modelCol: null,
	modelColors:{YYCA:"ambient_color",YYCB:"diffuse_color",YYCC:"emission_color",YYCD:"emission_modulate_color",YYCE:"illumination_modulate_color",YYCF:"specular_color",YYCG:"specular_modulate_color"},
	modelSet: null,
	modelSets: {YYGA:"gloss",YYGB:"shininess",YYGC:"parallax_bias",YYGD:"parallax_scale"},
	colorNamed: ["blackColor","darkGrayColor","lightGrayColor","whiteColor","grayColor","redColor","greenColor","blueColor","cyanColor","yellowColor","magentaColor","orangeColor","purpleColor","brownColor","clearColor"],
	colorHue: ["hue","saturation","brightness","value","alpha","opacity"],
	colorRGB: ["red","green","blue","alpha","opacity"]
};
this.startUpComplete = function(){
	this._aid = worldScripts.Lib_Main._lib;
	this.$dataKeys = worldScripts.Lib_Main._lib.$ships;
	this.$finder.shaderLevel = this._aid.ooShaders();
	this._addInterface();
	this.$finder.pagesMax = Math.ceil(this.$dataKeys.length/24);
	worldScripts.Lib_GUI.$IDRules.Lib_MatFinder = {mus:1};
};
this.shipDockedWithStation = function(){
	if(!player.ship.docked) return;
	this._addInterface();
};
this._addInterface = function(){
	player.ship.dockedStation.setInterface(this.name,{
		title: "Lib_MatFinder",
		category: "Development",
		summary: "Materials Finder",
		callback: this._showStart.bind(this)
	});
};
this._showStart = function(id){
	var f = this.$finder;
	if(id==="Lib_MatFinder") this.$finder.hud = player.ship.hudHidden;
	player.ship.hudHidden = true;
	var c={},o=this._aid.objClone(f.pageHead);
	o.exitScreen = "GUI_SCREEN_INTERFACES";
	for(var i=f.pageInd*24;i<f.pageInd*24+24;i++) if(this.$dataKeys.length>i+1) c[this.$dataKeys[i]] = this.$dataKeys[i];
	o.choices = this._aid.objMerge(c,o.choices);
	o.title += " ("+(f.pageInd+1)+"/"+f.pagesMax+")";
	mission.runScreen(o,this._pageChoices);
};
this._pageChoices = function(choice){
	this.$finder.pageHead.initialChoicesKey = choice;
	switch(choice){
		case "ZZZN":
			this.$finder.pageInd++;
			if(this.$finder.pageInd>=this.$finder.pagesMax) this.$finder.pageInd = 0;
			this._showStart();
			break;
		case "ZZZZ":
			player.ship.hudHidden = this.$finder.hud;
			break;
		default:
			this.$curMat.matInd = 0;
			this._getModelData(choice);
	}
};
this._getModelData = function(obj){
	var t1=[],t2=[],t3;
	this.$curMat.sd = Ship.shipDataForKey(obj);
	if(!this.$curMat.sd){
		this._showStart();
		return;
	}
	this.$curMat.dataKey = obj;
	this.$finder.modelCurMod = null;
	if(!this.$curMat.sd.materials && !this.$storedMats[this.$curMat.dataKey]){
		this._showGenerate();
		return;
	}
	if(!this.$storedTex[this.$curMat.dataKey]){ // Get textures
		if(this.$curMat.sd.materials) t1 = this._extTexData(this.$curMat.sd.materials);
		if(this.$curMat.sd.shaders) t2 = this._extTexData(this.$curMat.sd.shaders);
		t3 = t1.concat(t2);
		t3 = this._aid.arrUnique(t3);
		this.$storedTex[this.$curMat.dataKey] = t3;
	}
	this._getPosData();
	this._showModel();
};
this._getPosData = function(){
	if(!this.$storedPos[this.$curMat.dataKey]){ // Get positions
		var w = ["exhaust","weapon_position_aft","weapon_position_forward","weapon_position_port","weapon_position_starboard",
			"aft_eject_position","missile_launch_position","view_position_aft","view_position_forward","view_position_port",
			"view_position_starboard","scoop_position"],
			o = [{n:"-",ind:0,pos:[0,0,0],size:[0,0,0]}], t;
		for(var i=0;i<w.length;i++){
			t = w[i];
			if(this.$curMat.sd[t]) o = o.concat(this._extPosData(this.$curMat.sd[t],t));
		}
		this.$storedPos[this.$curMat.dataKey] = o;
	}
};
this._extPosData = function(obj,id){
	var a,i,r = [];
	if(typeof(obj)==="string"){
		a = obj.replace(/\.\s{1,99}/g,".").replace(/\s{1,99}/g," ");
		a = a.split(" ");
		if(a.length===3) r.push({n:id,ind:0,pos:[a[0],a[1],a[2]],size:[0.1,0.1,0]});
	} else {
		for(i=0;i<obj.length;i++){
			a = obj[i].replace(/\.\s{1,99}/g,".").replace(/\s{1,99}/g," ");
			a = a.split(" ");
			if(a.length===3) r.push({n:id,ind:i,pos:[a[0],a[1],a[2]],size:[0,0,0]});
			else r.push({n:id,ind:i,pos:[a[0],a[1],a[2]],size:[a[3],a[4],1]});
		}
	}
	return r;
};
this._extTexData = function(obj){
	var mn,t1,t2,r = [];
	mn = Object.keys(obj);
	for(var i=0;i<mn.length;i++){
		t1 = JSON.stringify(obj[mn[i]]);
		t2 = t1.match(/[A-Za-z0-9_-]*.png/g);
		if(t2 && t2.length) r = r.concat(t2);
	}
	return r;
};
this._showGenerate = function(){
	var head = this._aid.objClone(this.$finder.modelHead);
	head.title = "Model: "+this.$curMat.dataKey+" - M:"+this.$curMat.matInd;
	head.model = "["+this.$curMat.dataKey+"]";
	head.message = expandMissionText("LIB_MATF_NOMAT");
	head.choices.GAAA = "Generate materials entry";
	if(this.$curMat.sd.subentities){
		head.choices.GALS = "Write subentities to Latest.log";
		head.message += "\n\n"+expandMissionText("LIB_MATF_NOMAT_UPD");
	}
	head.background = {name:"lib_bg.png",height:512};
	mission.runScreen(head,this._generateChoices);
};
this._generateChoices = function(choice){
	switch(choice){
		case "GAAA": this._setMatName(); break;
		case "GALS": this._writeLog(2); this._showGenerate(); break;
		default: this._showStart();
	}
};
this._setMatName = function(){
	var head = this._aid.objClone(this.$finder.modelHead);
	head.title = "Model: "+this.$curMat.dataKey+" - M:"+this.$curMat.matInd;
	head.model = "["+this.$curMat.dataKey+"]";
	head.message = expandMissionText("LIB_MATF_GENMAT");
	head.textEntry = true;
	head.background = {name:"lib_bg.png",height:512};
	mission.runScreen(head,this._generatedChoices);
};
this._generatedChoices = function(choice){
	switch(choice){
		case "":
			if(this.$finder.gen){
				this.$finder.gen = null;
				this._showModel();
			} else this._showStart();
			break;
		default:
			if(!this.$storedMats[this.$curMat.dataKey]) this.$storedMats[this.$curMat.dataKey] = {};
			if(!this.$storedMats[this.$curMat.dataKey][choice]) this.$storedMats[this.$curMat.dataKey][choice] = {};
			this.$curMat.matIndName = choice;
			this._getPosData();
			this._showModel();
	}
};
this._setModelHead = function(){
	var head = this._aid.objClone(this.$finder.modelHead),
		c = this.$curMat,
		f = this.$finder,
		hc = head.choices,
		cmd = this.$curMat.dataKey,
		mcm = f.modelCurMod;
	head.title = "Model: "+cmd+" - M:"+c.matInd;
	if(mcm) head.title += " "+f[mcm];
	head.model = "["+cmd+"]";
	head.spinModel = f.modelSpin;
	if(mcm){
		switch(mcm){
			case "modelMap":
				hc.YMMA = "Set map";
				hc.YMMB = "Clear map";
				hc.YMMC = "Change modifiers";
				hc.YMMD = "Clear modifiers";
				hc.YMME = "Confirm";
				if(!this.$storedMats[cmd] || !this.$storedMats[cmd][c.matIndName] ||
					!this.$storedMats[cmd][c.matIndName][f.modelMap]){
						this._aid.scrChcUnsel(hc,"YMMC");
						this._aid.scrChcUnsel(hc,"YMMD");
				}
				break;
			case "modelCol":
				hc.YCCA = "Set color";
				hc.YCCB = "Clear color";
				hc.YCCC = "Confirm";
				break;
			case "modelMapMod":
				hc.YMOA = "Set anisotropy";
				hc.YMOB = "Set cube_map";
				hc.YMOC = "Set extract_channel";
				hc.YMOD = "Set mag_filter";
				hc.YMOE = "Set min_filter";
				hc.YMOF = "Set no_shrink";
				hc.YMOG = "Set repeat_s";
				hc.YMOH = "Set repeat_t";
				hc.YMOI = "Set texture_LOD_bias";
				hc.YMOJ = "Confirm";
				break;
		}
	} else {
		if(this.$storedMats[cmd] && Object.keys(this.$storedMats[cmd]).length>1) hc.YYYA = "Next material";
		switch(f.modelCHCInd){
			case 0:
				if(f.mode==="posShader" && this.$storedPos[cmd] && this.$storedPos[cmd].length) hc.PSPS = "Cycle positions";
				hc.XXLG = "Write to Latest.log";
				hc.YYYC = "Subentities: "+(!f.modelNoSub);
				hc.YYYD = "Mode: "+f.modeNames[f.modeInd];
				hc.YYYE = "Spin model: "+f.modelSpin;
				hc.YYYF = "Closeup: "+(f.modelCloseUp?" :"+f.modelCloseUps[f.modelCloseUpInd]:"Off");
				hc.YYYG = "Next";
				break;
			case 1:
				hc.YYOA = "Rear";
				hc.YYOB = "User >";
				hc.YYOC = "Front";
				hc.YYOD = "Bottom";
				hc.YYOE = "Top";
				hc.YYOF = "Left";
				hc.YYOG = "Right";
				hc.YYYG = "Next";
				break;
			case 2:
				if(f.mode==="model"){
					hc.YYMA = "Change diffuse_map";
					hc.YYMB = "Change emission_and_illumination_map";
					hc.YYMC = "Change emission_map";
					hc.YYMD = "Change illumination_map";
					hc.YYME = "Change normal_and_parallax_map";
					hc.YYMF = "Change normal_map";
					hc.YYMG = "Change specular_map";
				}
				if(f.mode==="posShader"){
					hc.PSZA = "Increase Z";
					hc.PSZB = "Decrease Z";
					hc.PSZC = "Amount: "+f.moveAmount.z.val[f.moveAmount.z.ind];
					hc.PSZZ = "Reset position";
				}
				hc.YYYG = "Next";
				break;
			case 3:
				if(f.mode==="model"){
					hc.YYCA = "Change ambient_color";
					hc.YYCB = "Change diffuse_color";
					hc.YYCC = "Change emission_color";
					hc.YYCD = "Change emission_modulate_color";
					hc.YYCE = "Change illumination_modulate_color";
					hc.YYCF = "Change specular_color";
					hc.YYCG = "Change specular_modulate_color";
				}
				if(f.mode==="posShader"){
					hc.PSXA = "Increase X";
					hc.PSXB = "Decrease X";
					hc.PSXC = "Amount: "+f.moveAmount.x.val[f.moveAmount.x.ind];
					hc.PSZZ = "Reset position";
				}
				hc.YYYG = "Next";
				break;
			case 4:
				if(f.mode==="model"){
					hc.YYGA = "Set gloss";
					hc.YYGB = "Set shininess";
					hc.YYGC = "Set parallax_bias";
					hc.YYGD = "Set parallax_scale";
				}
				if(f.mode==="posShader"){
					hc.PSYA = "Increase Y";
					hc.PSYB = "Decrease Y";
					hc.PSYC = "Amount: "+f.moveAmount.y.val[f.moveAmount.y.ind];
					hc.PSZZ = "Reset position";
				}
				hc.YYYG = "Next";
				break;
			case 5:
				if(f.mode==="model"){
					hc.GENM = "Generate new material";
					hc.YHLM = "Hightlight material";
				}
				if(f.mode==="posShader"){
					hc.PSSA = "Increase Size X";
					hc.PSSB = "Decrease Size X";
					hc.PSSC = "Amount X: "+f.sizes[f.sizeXInd];
					hc.PSSD = "Increase Size Y";
					hc.PSSE = "Decrease Size Y";
					hc.PSSF = "Amount Y: "+f.sizes[f.sizeYInd];
					hc.PSSZ = "Reset Size";
				}
				hc.YYYG = "Next";
				break;
		}
	}
	switch(f.mode){
		case "model": break;
		case "posShader": head.background = {name:"Lib_MatFinder_BG_Pos.png",height:512}; break;
	}
	return head;
};
this._showModel = function(){
	var i,mat,matKeys,md,mki,newMat,high,xyz,
		head = this._setModelHead(),
		cdk = this.$curMat.dataKey,
		f = this.$finder;
	mission.runScreen(head,this._modelChoices);
	md = mission.displayModel;
	md.orientation = f.modelOri;
	if(f.modelCloseUp) md.position = [0,0,md.collisionRadius+f.modelCloseUps[f.modelCloseUpInd]];
	if(md){
		if(md.subEntities && md.subEntities.length){
			var sub = md.subEntities.length;
			while(sub){
				if(f.modelNoSub) md.subEntities[sub-1].remove();
				else if(this.$storedMats[md.subEntities[sub-1].dataKey]){
					md.subEntities[sub-1].setMaterials(this.$storedMats[md.subEntities[sub-1].dataKey],{});
				}
				sub--;
			}
		}
		mat = md.getMaterials();
		if(!mat || !Object.keys(mat).length){ // virtual
			if(this.$storedMats[cdk]) mat = this._aid.objClone(this.$storedMats[cdk]);
		}
		if(mat){
			matKeys = Object.keys(mat);
			if(this.$storedMats[cdk]) mat = this._aid.objClone(this.$storedMats[cdk]);
			else {
				for(i=0;i<matKeys.length;i++) mki = matKeys[i];
				this.$storedMats[cdk] = mat;
			}
			mki = matKeys[this.$curMat.matInd];
			this.$curMat.matIndName = mki;
		} else {
			log(this.name,"Applying default material.");
			mat = this._aid.objClone(this.$defMat);
			if(this.$storedMats[cdk]) mat = this.$storedMats[cdk];
			else this.$storedMats[cdk] = mat;
			this.$curMat.matIndName = mki;
		}
		switch(f.mode){
			case "model":
				newMat = this._parseMaterial(mat[mki]);
				this._displayMaterial(newMat);
				if(f.modelNoShade){
					if(mat[mki].vertex_shader) delete mat[mki].vertex_shader;
					if(mat[mki].fragment_shader) delete mat[mki].fragment_shader;
					if(mat[mki].textures) delete mat[mki].textures;
					if(mat[mki].uniforms) delete mat[mki].uniforms;
				}
				if(f.modelHighlightActive){
					high = this._aid.objClone(mat);
					high[mki].emission_color = [1,0,0,1];
					high[mki].emission_map = null;
					md.setMaterials(high,{});
				} else md.setMaterials(mat,{});
				break;
			case "posShader":
				high = this._aid.objClone(mat);
				high[mki].vertex_shader = this.$posShader.vertex_shader;
				high[mki].fragment_shader = this.$posShader.fragment_shader;
				if(mat[mki].diffuse_map) high[mki].textures = [mat[mki].diffuse_map];
				else high[mki].textures = this.$posShader.textures;
				high[mki].uniforms = this.$posShader.uniforms;
				high[mki].uniforms.pos.value = f.shadePos;
				high[mki].uniforms.size.value = [f.sizeX,f.sizeY,(parseFloat(f.sizeX)+parseFloat(f.sizeY))*0.5];
				md.setMaterials(high,{});
				xyz = this.$finder.shadePos;
				for(i=0;i<xyz.length;i++) xyz[i] = this._aid.toPrec(xyz[i],4);
				mission.addMessageText(this.$finder.shadePos);
				mission.addMessageText("X:"+this._aid.toPrec(this.$finder.sizeX,4)+" Y:"+this._aid.toPrec(this.$finder.sizeY,4));
				if(this.$storedPos[cdk] && this.$storedPos[cdk][f.shadePosInd]) mission.addMessageText(this.$storedPos[cdk][f.shadePosInd].n+":"+this.$storedPos[cdk][f.shadePosInd].ind);
				mission.addMessageText("Dist: "+this._aid.toPrec(Vector3D(xyz).magnitude()/md.collisionRadius,4));
				break;
		}
	}
};
this._parseMaterial = function(mat){
	var c,t,nm={MTX:[]},df,nc;
	for(var p in mat){
		c = mat[p];
		t = this._aid.typeGet(c);
		if(this.$defsM.hasOwnProperty(p)){
			df = this.$defsM[p];
			switch(df.use){
				case "Texture":
					nc = "";
					if(t==='object'){
						for(var m in c){
							if(this.$defsM.hasOwnProperty(m)){
								if(m==="name"){
									nm.MTX.push(""+(nm.MTX.length+1)+": "+c[m]);
									nc += "TX:"+nm.MTX.length+" ";
								} else nc += this.$defsM[m].nick+":"+c[m]+" ";
							}
						}
						nm[p] = nc;
					} else {
						if(t){
							nm.MTX.push(""+(nm.MTX.length+1)+": "+c);
							nc += "TX:"+nm.MTX.length+" ";
						} else nc = null;
						nm[p] = nc;
					}
					break;
				case "Color":
					switch(t){
						case "object":
							nc = "";
							if(c.hasOwnProperty("hue")){
								for(var hsv in c) nc += this.$defsC.hsva[hsv].nick+":"+c[hsv]+" ";
							} else {
								for(var rgb in c) nc += this.$defsC.rgba[rgb].nick+":"+c[rgb]+" ";
							}
							nm[p] = nc;
						break;
						default: nm[p] = c; // array or string, e.g. "redColor"
					}
					break;
				default: nm[p] = c.toString();
			}
		}
	}
	return nm;
};
this._displayMaterial = function(mat){
	var i;
	mission.addMessageText(
		this._aid.scrToWidth(""+(mat.diffuse_map ? mat.diffuse_map : "-"),20," ")+
		this._aid.scrToWidth(""+(mat.ambient_color ? mat.ambient_color : "-"),11,0,0,1));
	mission.addMessageText(
		this._aid.scrToWidth(""+(mat.emission_map ? mat.emission_map : "-"),20," ")+
		this._aid.scrToWidth(""+(mat.diffuse_color ? mat.diffuse_color : "-"),11,0,0,1));
	mission.addMessageText(
		this._aid.scrToWidth(""+(mat.illumination_map ? mat.illumination_map : "-"),20," ")+
		this._aid.scrToWidth(""+(mat.emission_color ? mat.emission_color : "-"),11,0,0,1));
	mission.addMessageText(
		this._aid.scrToWidth(""+(mat.emission_and_illumination_map ? mat.emission_and_illumination_map : "-"),20," ")+
		this._aid.scrToWidth(""+(mat.emission_modulate_color ? mat.emission_modulate_color : "-"),11,0,0,1));
	mission.addMessageText(
		this._aid.scrToWidth(""+(mat.normal_map ? mat.normal_map : "-"),20," ")+
		this._aid.scrToWidth(""+(mat.illumination_modulate_color ? mat.illumination_modulate_color : "-"),11,0,0,1));
	mission.addMessageText(
		this._aid.scrToWidth(""+(mat.normal_and_parallax_map ? mat.normal_and_parallax_map : "-"),20," ")+
		this._aid.scrToWidth(""+(mat.specular_color ? mat.specular_color : "-"),11,0,0,1));
	mission.addMessageText(
		this._aid.scrToWidth(""+(mat.specular_map ? mat.specular_map : "-"),20," ")+
		this._aid.scrToWidth(""+(mat.specular_modulate_color ? mat.specular_modulate_color : "-"),11,0,0,1));
	mission.addMessageText(
		this._aid.scrToWidth(""+(mat.gloss ? mat.gloss : "-"),20," ")+
		this._aid.scrToWidth(""+(mat.parallax_bias ? mat.parallax_bias : "-"),11,0,0,1));
	mission.addMessageText(
		this._aid.scrToWidth(""+(mat.shininess ? mat.shininess : "-"),20," ")+
		this._aid.scrToWidth(""+(mat.parallax_scale ? mat.parallax_scale : "-"),11,0,0,1));
	if(this.$finder.mode==="model") for(i=0;i<mat.MTX.length;i++) mission.addMessageText(this._aid.scrToWidth(mat.MTX[i],22," "));
};
this._modelChoices = function(choice){
/*
	var md = mission.displayModel;
	if(md){
		if(md.position) log("","POS:"+mission.displayModel.position);
		if(md.orientation) log("","ORI:"+mission.displayModel.orientation);
	}
*/
	var tr,s,
		c = this.$curMat,
		f = this.$finder;
	this.$finder.modelHead.initialChoicesKey = choice;
	switch(choice){
		case "YYYA": // Next material
			c.matInd++;
			if(c.matInd>Object.keys(this.$storedMats[c.dataKey]).length-1) c.matInd = 0;
			s = 1;
			break;
		case "ZYYB": // Back
			f.modelCurMod = null;
			f.shadePosInd = 0;
			this._showStart();
			break;
		case "YYYC": // Toggle subEntities
			f.modelNoSub = !f.modelNoSub;
			s = 1;
			break;
		case "YYYD": // Toggle modes
			f.modeInd++;
			if(f.modeInd>f.modes.length-1) f.modeInd = 0;
			f.mode = f.modes[f.modeInd];
			s = 1;
			break;
		case "YYYE": // Toggle Spin
			f.modelSpin = !f.modelSpin;
			s = 1;
			break;
		case "YYYF": // Toggle closeup
			f.modelCloseUpInd++;
			if(f.modelCloseUpInd>f.modelCloseUps.length-1) f.modelCloseUpInd = 0;
			f.modelCloseUp = f.modelCloseUps[f.modelCloseUpInd];
			s = 1;
			break;
		case "YYYG": // Next
			f.modelCHCInd++;
			if(f.modelCHCInd>f.modePages[f.modeInd]) f.modelCHCInd = 0;
			s = 1;
			break;
		case "XXLG": // to Latest.log
			switch(f.mode){
				case "model": this._writeLog(1); break;
				case "posShader": this._writePos(3); break;
			}
			s = 1;
			break;
		case "YHLM": // Hightlight
			this.$finder.modelHighlightActive = !this.$finder.modelHighlightActive;
			s = 1;
			break;
		case "GENM":
			f.gen = "material";
			this._setMatName();
			break;
		case "YYOA": // Orientations
		case "YYOB":
		case "YYOC":
		case "YYOD":
		case "YYOE":
		case "YYOF":
		case "YYOG":
			f.modelSpin = false;
			if(choice==="YYOB"){
				f.modelOri = f.modelOrisUser.val[f.modelOrisUser.ind];
				f.modelOrisUser.ind++;
				if(f.modelOrisUser.ind>f.modelOrisUser.val.length-1) f.modelOrisUser.ind = 0;
			} else f.modelOri = f.modelOris[choice];
			s = 1;
			break;
		case "YYMA": // Maps
		case "YYMB":
		case "YYMC":
		case "YYMD":
		case "YYME":
		case "YYMF":
		case "YYMG":
			f.modelMap = f.modelMaps[choice];
			f.modelCurMod = "modelMap";
			s = 1;
			break;
		case "YYCA": // Colors
		case "YYCB":
		case "YYCC":
		case "YYCD":
		case "YYCE":
		case "YYCF":
		case "YYCG":
			f.modelCol = f.modelColors[choice];
			f.modelCurMod = "modelCol";
			s = 1;
			break;
		case "YYGA": // gloss
		case "YYGB": // shininess
		case "YYGC": // parallax_bias
		case "YYGD": // parallax_scale
			f.modelSet = f.modelSets[choice];
			f.modelCurMod = "modelSet";
			this._enterValue();
			break;
		case "YMMA": //Set map
			this._enterValue();
			break;
		case "YMMB": //Clear map
			delete this.$storedMats[c.dataKey][c.matIndName][f[f.modelCurMod]];
			s = 1;
			break;
		case "YMMC": //Set map modifiers
			f.modelCurMod = "modelMapMod";
			s = 1;
			break;
		case "YMMD": //Clear map modifiers
			tr = this.$storedMats[c.dataKey][c.matIndName][f[f.modelCurMod]];
			if(tr && tr.name) this.$storedMats[c.dataKey][c.matIndName][f[f.modelCurMod]] = tr.name;
			s = 1;
			break;
		case "YMME": //Confirm
			f.modelCurMod = null;
			s = 1;
			break;
		case "YCCA": //Set color
			this._enterValue();
			break;
		case "YCCB": //Clear color
			delete this.$storedMats[c.dataKey][c.matIndName][f[f.modelCurMod]];
			s = 1;
			break;
		case "YCCC": //Confirm
			f.modelCurMod = null;
			s = 1;
			break;
		case "YMOA": // anisotropy
		case "YMOB": // cube_map
		case "YMOC": // extract_channel
		case "YMOD": // mag_filter
		case "YMOE": // min_filter
		case "YMOF": // no_shrink
		case "YMOG": // repeat_s
		case "YMOH": // repeat_t
		case "YMOI": // texture_LOD_bias
			f.modelMapMod = f.modelMapMods[choice];
			this._enterValue();
			break;
		case "YMOJ": // Confirm
			f.modelCurMod = "modelMap";
			s = 1;
			break;
		case "PSPS": // Cycle positions
			f.shadePosInd++;
			if(f.shadePosInd>this.$storedPos[c.dataKey].length-1) f.shadePosInd = 0;
			f.shadePos = this.$storedPos[c.dataKey][f.shadePosInd].pos;
			f.sizeX = parseFloat(this.$storedPos[c.dataKey][f.shadePosInd].size[0]);
			f.sizeY = parseFloat(this.$storedPos[c.dataKey][f.shadePosInd].size[1]);
			s = 1;
			break;
		case "PSXA": // Increase X
			f.shadePos[0] += f.moveAmount.x.val[f.moveAmount.x.ind];
			s = 1;
			break;
		case "PSXB": // Decrease X
			f.shadePos[0] -= f.moveAmount.x.val[f.moveAmount.x.ind];
			s = 1;
			break;
		case "PSXC": // Amount X
			f.moveAmount.x.ind++;
			if(f.moveAmount.x.ind>f.moveAmount.x.val.length-1) f.moveAmount.x.ind = 0;
			s = 1;
			break;
		case "PSYA": // Increase Y
			f.shadePos[1] += f.moveAmount.y.val[f.moveAmount.y.ind];
			s = 1;
			break;
		case "PSYB": // Decrease Y
			f.shadePos[1] -= f.moveAmount.y.val[f.moveAmount.y.ind];
			s = 1;
			break;
		case "PSYC": // Amount Y
			f.moveAmount.y.ind++;
			if(f.moveAmount.y.ind>f.moveAmount.y.val.length-1) f.moveAmount.y.ind = 0;
			s = 1;
			break;
		case "PSZA": // Increase Z
			f.shadePos[2] += f.moveAmount.z.val[f.moveAmount.z.ind];
			s = 1;
			break;
		case "PSZB": // Decrease Z
			f.shadePos[2] -= f.moveAmount.z.val[f.moveAmount.z.ind];
			s = 1;
			break;
		case "PSZC": // Amount Z
			f.moveAmount.z.ind++;
			if(f.moveAmount.z.ind>f.moveAmount.z.val.length-1) f.moveAmount.z.ind = 0;
			s = 1;
			break;
		case "PSZZ": // Reset position
			f.shadePos = [0,0,0];
			s = 1;
			break;
		case "PSSA": // Increase Size X
			f.sizeX += f.sizes[f.sizeXInd];
			s = 1;
			break;
		case "PSSB": // Decrease Size X
			f.sizeX -= f.sizes[f.sizeXInd];
			if(f.sizeX<0) f.sizeX = 0;
			s = 1;
			break;
		case "PSSC": // Amount Size X
			f.sizeXInd++;
			if(f.sizeXInd>f.sizes.length-1) f.sizeXInd = 0;
			s = 1;
			break;
		case "PSSD": // Increase Size Y
			f.sizeY += f.sizes[f.sizeYInd];
			s = 1;
			break;
		case "PSSE": // Decrease Size Y
			f.sizeY -= f.sizes[f.sizeYInd];
			if(f.sizeY<0) f.sizeY = 0;
			s = 1;
			break;
		case "PSSF": // Amount Size
			f.sizeYInd++;
			if(f.sizeYInd>f.sizes.length-1) f.sizeYInd = 0;
			s = 1;
			break;
		case "PSSZ": // Reset Size
			f.sizeX = 0;
			f.sizeY = 0;
			s = 1;
			break;
		default:
			log(this.name,"Choice unhandled: "+choice);
			this._showStart();
	}
	if(s) this._showModel();
};
this._enterValue = function(){
	var head = this._aid.objClone(this.$finder.pageHead),
		ex,exa,l,m,tmp,
		mcm = this.$finder.modelCurMod,
		dtk = this.$curMat.dataKey;
	head.title = "Model: "+dtk+" - M:"+this.$curMat.matInd;
	if(mcm) head.title += " "+this.$finder[mcm];
	head.model = "["+dtk+"]";
	m = expandMissionText("LIB_MATFS_"+this.$finder[mcm]);
	switch(mcm){
		case "modelCol": ex = "LIB_MATFS_ColorDesc"; break;
		case "modelMap": ex = "LIB_MATFS_MapDesc"; exa = "";
			tmp = this.$storedTex[dtk];
			if(tmp){
				l = Math.min(tmp.length,24);
				for(var i=0;i<l;i+=2) exa += (i+1)+": "+this._aid.scrToWidth((l>i?tmp[i]:""),14," ")+(l>i+1?"  "+(i+2)+": "+this._aid.scrToWidth(tmp[i+1],14," "):"")+"\n";
			} else exa += "None";
			break;
		case "modelSet": break;
		case "modelMapMod": break;
	}
	if(ex) m += "\n\n"+expandMissionText(ex);
	if(exa) m += "\n"+exa;
	head.message = m;
	head.textEntry = true;
	mission.runScreen(head,this._valueChoices);
};
this._valueChoices = function(choice){
	var a,b,c,clr,tmp,tmpb = null,v = null,
		dtk = this.$curMat.dataKey,
		min = this.$curMat.matIndName,
		mcm = this.$finder.modelCurMod,
		mm = this.$finder.modelMap,
		mmm = this.$finder.modelMapMod,
		d = this.$defsM[this.$finder[mcm]];
	if(choice==="clr"){
		if(mcm==="modelMapMod"){
			if(this.$storedMats[dtk] && this.$storedMats[dtk][min] && this.$storedMats[dtk][min][mm]){
				tmp = this.$storedMats[dtk][min][mm];
				if(typeof(tmp)==="object"){
					delete tmp[mmm];
					if(Object.keys(tmp).length===1) tmp = tmp.name;
					this.$storedMats[dtk][min][mm] = tmp;
				}
			}
		} else {
			delete this.$storedMats[dtk][min][this.$finder[mcm]];
		}
	} else if(choice && choice!==""){
		switch(mcm){
			case "modelCol":
				if(choice[0]==="["){ // array
					v = choice.replace(/[^\d,.]/gi,"");
					v = v.split(",");
					if(v.length!==3 && v.length!==4) v = null;
					else {
						for(var q=0;q<v.length;q++){
							if(isNaN(v[q])){
								v = null;
								break;
							}
							v[q] = this._aid.clamp(v[q],d.range[0],d.range[1]);
						}
					}
				} else if(choice[0]==="{"){ // dictionary
					c = {};
					v = choice.replace(/[{}\s]/g,"");
					v = v.replace(/[^a-z=;\d.]/gi,"");
					if(v[v.length-1]===";") v = v.substr(0,v.length-1);
					a = v.split(";");
					if(v.indexOf("hue")!==-1){ // hsba
						for(var x=0;x<a.length;x++){
							b = a[x].split("=");
							if(b.length===2){
								b[1] = parseFloat(b[1]);
								if(!isNaN(b[1]) && this.$finder.colorHue.indexOf(b[0])!==-1){
									d = this.$defsC.hsva[b[0]];
									c[b[0]] = this._aid.clamp(b[1],d.range[0],d.range[1]);
								}
							}
						}
					} else { // rgba
						for(var y=0;y<a.length;y++){
							b = a[y].split("=");
							if(b.length===2){
								b[1] = parseFloat(b[1]);
								if(!isNaN(b[1]) && this.$finder.colorRGB.indexOf(b[0])!==-1){
									d = this.$defsC.rgba[b[0]];
									c[b[0]] = this._aid.clamp(b[1],d.range[0],d.range[1]);
								}
							}
						}
					}
					if(Object.keys(c).length) v = c;
					else v = null;
				} else { // string
					if(choice.indexOf("Color")!==-1){ // blueColor
						if(this.$finder.colorNamed.indexOf(choice)!==-1) v = choice;
					} else { // 1 0 0 1 or 255 0 0 255
						v = choice.replace(/,/gi," ");
						v = v.replace(/[^\d .]/gi,"");
						v = v.replace(/ {1,99}/gi," ");
						v = v.split(" ");
						if(v.length!==3 && v.length!==4) v = null;
						else {
							for(var w=0;w<v.length;w++){
								if(isNaN(v[w])){
									v = null;
									break;
								}
								v[w] = this._aid.clamp(v[w],d.range[0],d.range[1]);
							}
							if(v) v = v.join(" ");
						}
					}
				}
				break;
			case "modelMap":
				if(this.$storedMats[dtk] && this.$storedMats[dtk][min] && this.$storedMats[dtk][min][this.$finder[mcm]]){
					tmp = this.$storedMats[dtk][min][this.$finder[mcm]];
				}
				if(choice.length<3){
					a = parseInt(choice);
					if(typeof(a)==="number" && !isNaN(a)){
						a = Math.abs(a-1);
						if(this.$storedTex[dtk].length>a){
							b = this.$storedTex[dtk][a];
						}
					}
				} else {
					if(/.png/.test(choice)){ // Can't check if texture exists
						b = choice;
						if(!this.$storedTex[dtk]) this.$storedTex[dtk] = [b];
						else if(this.$storedTex[dtk].indexOf(b)===-1) this.$storedTex[dtk].push(b);
					}
				}
				if(typeof(tmp)==="object"){
					tmp.name = b;
					v = tmp;
				} else v = b;
				break;
			case "modelSet":
				clr = 1;
				if(d.use==="Float") a = parseFloat(choice);
				else a = parseInt(choice);
				if(typeof(a)==="number" && !isNaN(a)){
					v = this._aid.clamp(a,d.range[0],d.range[1]);
				}
				break;
			case "modelMapMod":
				if(this.$storedMats[dtk] && this.$storedMats[dtk][min] && this.$storedMats[dtk][min][mm]){
					tmp = this.$storedMats[dtk][min][mm];
				}
				switch(d.typ){
					case "boolean":
						if(choice==="true" || choice==="1") b = true;
						if(choice==="false" || choice==="0") b = false;
						break;
					case "number":
						a = parseFloat(choice);
						if(typeof(a)==="number" && !isNaN(a)){
							b = this._aid.clamp(a,d.range[0],d.range[1]);
						}
						break;
					case "string":
						if(d.values.indexOf(choice)!==-1) b = choice;
						break;
				}
				if(b!=='undefined'){
					if(typeof(tmp)==="string") tmp = {name:tmp};
					tmp[mmm] = b;
					tmpb = tmp;
				}
				break;
		}
		if(v!==null) this.$storedMats[dtk][min][this.$finder[mcm]] = v;
		if(tmpb!==null) this.$storedMats[dtk][min][mm] = tmpb;
	} else {
		if(mcm==="modelSet") clr = 1;
	}
	if(clr) this.$finder.modelCurMod = null;
	this._showModel();
};
this._writeLog = function(mode){
	var m,where;
	switch(mode){
		case 1: m = this.$storedMats[this.$curMat.dataKey]; where = "$defsM"; this.$matLog = ["materials = {"]; break;
		case 2: m = this.$curMat.sd.subentities; where = "$defsSub"; this.$matLog = ["subentities = ("]; break;
	}
	var mk = Object.keys(m),
		ek,ev,fk,fv,k,t,tm,tp;
	for(var i=0;i<mk.length;i++){
		switch(mode){
			case 1: this.$matLog.push("\""+mk[i]+"\""+" = {"); ek = Object.keys(m[mk[i]]).sort(); break;
			case 2: this.$matLog.push("{"); ek = Object.keys(m[mk[i]]).sort(function(a,b){if(a>b)return -1;if(b>a) return 1; return 0;}); break;
		}
		for(var j=0;j<ek.length;j++){
			t = this[where][ek[j]];
			ev = m[mk[i]][ek[j]];
			if(mode===2 && !t.yep){
				if(t.def==ev) continue;
				if(t.typ==="array" && t.def.join("")===ev.join("")) continue;
			}
			this.$matLog.push(ek[j]+" = ");
			switch(t.use){
				case "SubEnt":
					tp = this._aid.typeGet(ev);
					switch(tp){
						case "string": this.$matLog.push("\""+ev+"\""); break;
						case "number": this.$matLog.push(this._aid.toPrec(ev,4)); break;
						case "array": // colors
							this.$matLog.push("(");
							for(k=0;k<ev.length;k++){
								this.$matLog.push("("+this._aid.toPrec(ev[k][0],4)+","+this._aid.toPrec(ev[k][1],4)+","+this._aid.toPrec(ev[k][2],4)+","+this._aid.toPrec(ev[k][3],4)+")");
								if(k<ev.length-1) this.$matLog.push(",");
							}
							this.$matLog.push(")");
							break;
						case "object": // position, orientation
							if(t.typ==="vector") this.$matLog.push("("+this._aid.toPrec(ev.x,4)+","+this._aid.toPrec(ev.y,4)+","+this._aid.toPrec(ev.z,4)+")");
							if(t.typ==="quaternion") this.$matLog.push("("+this._aid.toPrec(ev.w,4)+","+this._aid.toPrec(ev.x,4)+","+this._aid.toPrec(ev.y,4)+","+this._aid.toPrec(ev.z,4)+")");
							break;
					}
					break;
				case "Color":
					tp = this._aid.typeGet(ev);
					if(tp==="string") this.$matLog.push("\""+ev+"\"");
					else if(tp==="array") this.$matLog.push("("+ev+")");
					else {
						this.$matLog.push("{");
						fk = Object.keys(m[mk[i]][ek[j]]);
						for(k=0;k<fk.length;k++){
							this.$matLog.push(fk[k]+" = ");
							fv = m[mk[i]][ek[j]][fk[k]];
							this.$matLog.push(fv+"; ");
						}
						this.$matLog.push("}");
					}
					break;
				case "Texture":
					tp = this._aid.typeGet(ev);
					if(tp==="string") this.$matLog.push("\""+ev+"\"");
					else {
						this.$matLog.push("{");
						fk = Object.keys(m[mk[i]][ek[j]]);
						for(k=0;k<fk.length;k++){
							this.$matLog.push(fk[k]+" = ");
							fv = m[mk[i]][ek[j]][fk[k]];
							tm = this.$defsM[fk[k]].typ;
							if(tm==="string") this.$matLog.push("\""+fv+"\"; ");
							else this.$matLog.push(fv+"; ");
						}
						this.$matLog.push("}");
					}
					break;
				case "Float": this.$matLog.push(this._aid.toPrec(ev,4)); break;
				case "Int": this.$matLog.push(this._aid.toPrec(ev,4)); break;
				default: this.$matLog.push("null"); break;
			}
			this.$matLog.push("; ");
		}
		if(mode===1) this.$matLog.push("}; ");
		else if(mode===2){
			if(i<mk.length-1) this.$matLog.push("}, ");
			else this.$matLog.push("} ");
		}
	}
	switch(mode){
		case 1: this.$matLog.push("};"); break;
		case 2: this.$matLog.push(");"); break;
	}
	log(this.name,"Entry for "+this.$curMat.dataKey+":");
	if(this.$finder.logCompact) log(this.name,this.$matLog.join("").replace(/\s/g,""));
	else log(this.name,this.$matLog.join(""));
};
this._writePos = function(){
	var w = this.$storedPos[this.$curMat.dataKey], // array
		pos = [
			["aft_eject_position = "],
			["exhaust = ("],
			["missile_launch_position = "],
			["scoop_position = "],
			["view_position_aft = "],
			["view_position_forward = "],
			["view_position_port = "],
			["view_position_starboard = "],
			["weapon_position_aft = "],
			["weapon_position_forward = "],
			["weapon_position_port = "],
			["weapon_position_starboard = "]
		],s,ind,sep,j,k;
	for(var i=1;i<w.length;i++){
		s = 0; ind = 0; sep = 0;
		switch(w[i].n){
			case "aft_eject_position": ind = 0; break;
			case "exhaust": s = 1; ind = 1; break;
			case "missile_launch_position": ind = 2; break;
			case "scoop_position": ind = 3; break;
			case "view_position_aft": ind = 4; break;
			case "view_position_forward": ind = 5; break;
			case "view_position_port": ind = 6; break;
			case "view_position_starboard": ind = 7; break;
			case "weapon_position_aft": ind = 8; sep = 1; break;
			case "weapon_position_forward": ind = 9; sep = 1; break;
			case "weapon_position_port": ind = 10; sep = 1; break;
			case "weapon_position_starboard": ind = 11; sep = 1; break;
		}
		if(sep && w[i].ind===1) pos[ind][0] += "(";
		if(w[i].ind) pos[ind].push(",");
		if(s) pos[ind].push("\""+w[i].pos[0]+" "+w[i].pos[1]+" "+w[i].pos[2]+" "+w[i].size[0]+" "+w[i].size[1]+" 1\"");
		else pos[ind].push("\""+w[i].pos[0]+" "+w[i].pos[1]+" "+w[i].pos[2]+"\"");
	}
	pos[1].push(")");
	for(j=0;j<12;j++){
		if(j>7 && pos[j].length>2) pos[j].push(");");
		else pos[j].push(";");
	}
	log(this.name,"Entry for "+this.$curMat.dataKey+":");
	for(k=0;k<12;k++) if((k!==1 && pos[k].length>2) || (k===1 && pos[k].length>3)) log(this.name,pos[k].join(""));
};
// Convert degrees to radians.
this._radians = function(degrees){return degrees*Math.PI/180;}; 
// Convert radians to degrees.
this._degrees = function(radians){return radians*180/Math.PI;};
}).call(this);
