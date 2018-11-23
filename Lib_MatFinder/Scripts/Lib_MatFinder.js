/* jshint bitwise:false, forin:false */
/* global expandMissionText,log,mission,player,worldScripts,Ship */
/* (C) Svengali 2016-2018, License CC-by-nc-sa-4.0 */
(function(){
"use strict";
this.name = "Lib_MatFinder";

this.$curMat = {};
this.$storedMats = {};
this.$storedTex = {};
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
this.$defMat = {};
this.$posShader = {
	vertex_shader: "Lib_Matfinder_pos.vs",
	fragment_shader: "Lib_Matfinder_pos.fs",
	textures: ["lib_null.png"],
	uniforms: {
		tex0: {type:"texture",value:0},
		pos: {type:"vector",value:[0,0,0],normalized:false},
		ori: {type:"vector",value:[0,0,0],normalized:false}
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
	mode: "model", // model (default), shaderMat, posShader, shader, subentities, flashers
	modeInd: 0,
	modes: ["model","posShader"],
	modeNames: ["Materials","Positions"],
	moveAmount: {
		x: {ind:1,val:[100,10,1,0.1,0.01]},
		y: {ind:1,val:[100,10,1,0.1,0.01]},
		z: {ind:1,val:[100,10,1,0.1,0.01]}
	},
	oriAmount: {
		x: {ind:1,val:[100,10,1,0.1,0.01]},
		y: {ind:1,val:[100,10,1,0.1,0.01]},
		z: {ind:1,val:[100,10,1,0.1,0.01]}
	},
	shadePos: [0,0,0],
	shadeOri: [1,0,0,0],
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
	if(!this.$storedTex[this.$curMat.dataKey]){
		if(this.$curMat.sd.materials) t1 = this._extData(this.$curMat.sd.materials);
		if(this.$curMat.sd.shaders) t2 = this._extData(this.$curMat.sd.shaders);
		t3 = t1.concat(t2);
		t3 = this._aid.arrUnique(t3);
		this.$storedTex[this.$curMat.dataKey] = t3;
	}
	this._showModel();
};
this._extData = function(obj){
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
	head.choices.GAAA = "Generate materials entry";
	if(this.$curMat.sd.subentities) head.choices.GALS = "Write subentities to Latest.log";
	head.message = expandMissionText("LIB_MATF_NOMAT");
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
		case "": this._showStart(); break;
		default:
			this.$storedMats[this.$curMat.dataKey] = {};
			this.$storedMats[this.$curMat.dataKey][choice] = {};
			this.$curMat.matIndName = choice;
			this._showModel();
	}
};
this._setModelHead = function(){
	var head = this._aid.objClone(this.$finder.modelHead),
		cmd = this.$curMat.dataKey,
		mcm = this.$finder.modelCurMod;
	head.title = "Model: "+cmd+" - M:"+this.$curMat.matInd;
	if(mcm) head.title += " "+this.$finder[mcm];
	head.model = "["+cmd+"]";
	head.spinModel = this.$finder.modelSpin;
	if(mcm){
		switch(mcm){
			case "modelMap":
				head.choices.YMMA = "Set map";
				head.choices.YMMB = "Clear map";
				head.choices.YMMC = "Change modifiers";
				head.choices.YMMD = "Clear modifiers";
				head.choices.YMME = "Confirm";
				if(!this.$storedMats[cmd] || !this.$storedMats[cmd][this.$curMat.matIndName] ||
					!this.$storedMats[cmd][this.$curMat.matIndName][this.$finder.modelMap]){
						this._aid.scrChcUnsel(head.choices,"YMMC");
						this._aid.scrChcUnsel(head.choices,"YMMD");
				}
				break;
			case "modelCol":
				head.choices.YCCA = "Set color";
				head.choices.YCCB = "Clear color";
				head.choices.YCCC = "Confirm";
				break;
			case "modelMapMod":
				head.choices.YMOA = "Set anisotropy";
				head.choices.YMOB = "Set cube_map";
				head.choices.YMOC = "Set extract_channel";
				head.choices.YMOD = "Set mag_filter";
				head.choices.YMOE = "Set min_filter";
				head.choices.YMOF = "Set no_shrink";
				head.choices.YMOG = "Set repeat_s";
				head.choices.YMOH = "Set repeat_t";
				head.choices.YMOI = "Set texture_LOD_bias";
				head.choices.YMOJ = "Confirm";
				break;
		}
	} else {
		if(typeof(this.$curMat.sd.materials)==="object"){
			this.$curMat.sdKeys = Object.keys(this.$curMat.sd.materials);
			if(this.$curMat.sdKeys.length && this.$curMat.sdKeys.length>1){
				head.choices.YYYA = "Next material";
			}
		}
		switch(this.$finder.modelCHCInd){
			case 0:
				head.choices.YYYC = "Subentities: "+(!this.$finder.modelNoSub);
				head.choices.YYYD = "Mode: "+this.$finder.modeNames[this.$finder.modeInd];
				head.choices.YYYE = "Spin model: "+this.$finder.modelSpin;
				head.choices.YYYF = "Closeup: "+(this.$finder.modelCloseUp?" :"+this.$finder.modelCloseUps[this.$finder.modelCloseUpInd]:"Off");
				head.choices.YYYG = "Next";
				head.choices.XXLG = "Write to Latest.log";
				break;
			case 1:
				head.choices.YYOA = "Rear";
				head.choices.YYOB = "User";
				head.choices.YYOC = "Front";
				head.choices.YYOD = "Bottom";
				head.choices.YYOE = "Top";
				head.choices.YYOF = "Left";
				head.choices.YYOG = "Right";
				head.choices.YYYG = "Next";
				break;
			case 2:
				if(this.$finder.mode==="model"){
					head.choices.YYMA = "Change diffuse_map";
					head.choices.YYMB = "Change emission_and_illumination_map";
					head.choices.YYMC = "Change emission_map";
					head.choices.YYMD = "Change illumination_map";
					head.choices.YYME = "Change normal_and_parallax_map";
					head.choices.YYMF = "Change normal_map";
					head.choices.YYMG = "Change specular_map";
				}
				if(this.$finder.mode==="posShader"){
					head.choices.PSZA = "Increase Z";
					head.choices.PSZB = "Decrease Z";
					head.choices.PSZC = "Amount: "+this.$finder.moveAmount.z.val[this.$finder.moveAmount.z.ind];
					head.choices.PSZZ = "Reset position";
				}
				head.choices.YYYG = "Next";
				break;
			case 3:
				if(this.$finder.mode==="model"){
					head.choices.YYCA = "Change ambient_color";
					head.choices.YYCB = "Change diffuse_color";
					head.choices.YYCC = "Change emission_color";
					head.choices.YYCD = "Change emission_modulate_color";
					head.choices.YYCE = "Change illumination_modulate_color";
					head.choices.YYCF = "Change specular_color";
					head.choices.YYCG = "Change specular_modulate_color";
				}
				if(this.$finder.mode==="posShader"){
					head.choices.PSXA = "Increase X";
					head.choices.PSXB = "Decrease X";
					head.choices.PSXC = "Amount: "+this.$finder.moveAmount.x.val[this.$finder.moveAmount.x.ind];
					head.choices.PSZZ = "Reset position";
				}
				head.choices.YYYG = "Next";
				break;
			case 4:
				if(this.$finder.mode==="model"){
					head.choices.YYGA = "Set gloss";
					head.choices.YYGB = "Set shininess";
					head.choices.YYGC = "Set parallax_bias";
					head.choices.YYGD = "Set parallax_scale";
				}
				if(this.$finder.mode==="posShader"){
					head.choices.PSYA = "Increase Y";
					head.choices.PSYB = "Decrease Y";
					head.choices.PSYC = "Amount: "+this.$finder.moveAmount.y.val[this.$finder.moveAmount.y.ind];
					head.choices.PSZZ = "Reset position";
				}
				head.choices.YYYG = "Next";
				break;
		}
	}
	return head;
};
this._showModel = function(){
	var mat,matKeys,md,mki,newMat,high,
		head = this._setModelHead(),
		cdk = this.$curMat.dataKey;
	mission.runScreen(head,this._modelChoices);
	md = mission.displayModel;
	md.orientation = this.$finder.modelOri;
	if(this.$finder.modelCloseUp) md.position = [0,0,md.collisionRadius+this.$finder.modelCloseUps[this.$finder.modelCloseUpInd]];
	if(md){
		if(md.subEntities && md.subEntities.length){
			var sub = md.subEntities.length;
			while(sub){
				if(this.$finder.modelNoSub) md.subEntities[sub-1].remove();
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
				for(var i=0;i<matKeys.length;i++) mki = matKeys[i];
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
		newMat = this._parseMaterial(mat[mki]);
		this._displayMaterial(newMat);
		if(this.$finder.mode==="posShader"){
			high = this._aid.objClone(mat);
			high[mki].vertex_shader = this.$posShader.vertex_shader;
			high[mki].fragment_shader = this.$posShader.fragment_shader;
			if(mat[mki].diffuse_map) high[mki].textures = [mat[mki].diffuse_map];
			else high[mki].textures = this.$posShader.textures;
			high[mki].uniforms = this.$posShader.uniforms;
			high[mki].uniforms.pos.value = this.$finder.shadePos;
			high[mki].uniforms.ori.value = this.$finder.shadeOri;
			md.setMaterials(high,{});
		} else {
			if(this.$finder.modelNoShade){
				if(mat[mki].vertex_shader) delete mat[mki].vertex_shader;
				if(mat[mki].fragment_shader) delete mat[mki].fragment_shader;
				if(mat[mki].textures) delete mat[mki].textures;
				if(mat[mki].uniforms) delete mat[mki].uniforms;
			}
			if(this.$finder.modelHighlightActive){
				high = this._aid.objClone(mat);
				high[mki].emission_color = [1,0,0,1];
				high[mki].emission_map = null;
				md.setMaterials(high,{});
			} else md.setMaterials(mat,{});
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
	var i,xyz;
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
	if(this.$finder.mode==="posShader"){
		xyz = this.$finder.shadePos;
		for(i=0;i<xyz.length;i++) xyz[i] = this._aid.toPrec(xyz[i],4);
		mission.addMessageText(this.$finder.shadePos);
	}
	if(this.$finder.mode==="model") for(i=0;i<mat.MTX.length;i++) mission.addMessageText(this._aid.scrToWidth(mat.MTX[i],22," "));
};
this._modelChoices = function(choice){
	var tr,s,
		c = this.$curMat,
		f = this.$finder;
	this.$finder.modelHead.initialChoicesKey = choice;
	switch(choice){
		case "YYYA": // Next material
			if(c.sd.materials){
				c.matInd++;
				if(c.matInd>Object.keys(c.sd.materials).length-1) c.matInd = 0;
			} else c.matInd = 0;
			s = 1;
			break;
		case "ZYYB": // Back
			f.modelCurMod = null;
			this._showStart();
			break;
		case "YYYC": // Toggle subEntities
			f.modelNoSub = !f.modelNoSub;
			s = 1;
			break;
		case "YYYD": // Toggle modes
			f.modeInd++;
			if(f.modeInd>1) f.modeInd = 0;
//			this.$finder.modelHighlightActive = !this.$finder.modelHighlightActive;
			f.mode = f.modes[f.modeInd];
			s = 1;
			break;
		case "YYYE": // Toggle Spin
			f.modelSpin = !f.modelSpin;
			s = 1;
			break;
		case "YYYF": // Toggle closeup
			f.modelCloseUpInd++;
			if(f.modelCloseUpInd>4) f.modelCloseUpInd = 0;
			f.modelCloseUp = f.modelCloseUps[f.modelCloseUpInd];
			s = 1;
			break;
		case "YYYG": // Next
			f.modelCHCInd++;
			if(f.modelCHCInd>4) f.modelCHCInd = 0;
			s = 1;
			break;
		case "XXLG": // to Latest.log
			switch(f.mode){
				case "model": this._writeLog(1); break;
				case "posShader": this._writeLog(3); break;
			}
			s = 1;
			break;
		case "YYOA": // Orientations
		case "YYOB":
		case "YYOC":
		case "YYOD":
		case "YYOE":
		case "YYOF":
		case "YYOG":
			f.modelSpin = false;
			f.modelOri = f.modelOris[choice];
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
			if(f.moveAmount.x.ind>4) f.moveAmount.x.ind = 0;
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
			if(f.moveAmount.y.ind>4) f.moveAmount.y.ind = 0;
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
			if(f.moveAmount.z.ind>4) f.moveAmount.z.ind = 0;
			s = 1;
			break;
		case "PSZZ": // Reset position
			f.shadePos = [0,0,0];
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
		cur,ex,exa,exb,l,m,tmp,
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
	var m,where,sep;
	switch(mode){
		case 1: m = this.$storedMats[this.$curMat.dataKey]; where = "$defsM"; this.$matLog = ["materials = {"]; break;
		case 2: m = this.$curMat.sd.subentities; where = "$defsSub"; this.$matLog = ["subentities = ("]; break;
		case 3: log(this.name,"Entry for "+this.$curMat.dataKey+": Position: "+this.$finder.shadePos); return;
	}
	var mk = Object.keys(m),
		ek,ev,fk,fv,k,t,tm,tp;
	for(var i=0;i<mk.length;i++){
		switch(mode){
			case 1: this.$matLog.push("\""+mk[i]+"\""+" = {"); ek = Object.keys(m[mk[i]]).sort(); break;
			case 2: this.$matLog.push("{"); ek = Object.keys(m[mk[i]]); break;
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
}).call(this);
