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
	specular_color: {def:[0.0,0.0,0.0,1.0], typ:"array", use:"Color", range:[0,255]},
	specular_map: {def:null, typ:"string", use:"Texture"},
	specular_modulate_color: {def:[1.0,1.0,1.0,1.0], typ:"array", use:"Color", range:[0,255]},
	texture_LOD_bias: {def:-0.25, typ:"number", use:"Modifier", range:[-1,1], nick:"ld"},
	vertex_shader: {def:null, typ:"string", use:"VS"},
	fragment_shader: {def:null, typ:"String", use:"FS"},
	textures: {def:null, typ:"Array", use:"STexture"},
	uniforms: {def:null, typ:"Object", use:"SBinds"}
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
this.$defMat = {};

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
	logCompact: false,
	modelNoSub: false,
	modelHighlightActive: false,
	modelSpin: true,
	modelNoShade: true,
	modelCloseUp: false,
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
	this.$dataKeys = worldScripts.Lib_Main._lib.$ships; // Get all entries
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
	mn = Object.keys(obj); // material names
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
	head.message = expandMissionText("LIB_MATF_NOMAT");
	head.background = {name:"lib_bg.png",height:512};
	mission.runScreen(head,this._generateChoices);
};
this._generateChoices = function(choice){
	switch(choice){
		case "GAAA": this._setMatName(); break;
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
		if(typeof this.$curMat.sd.materials === "object"){
			this.$curMat.sdKeys = Object.keys(this.$curMat.sd.materials);
			if(this.$curMat.sdKeys.length && this.$curMat.sdKeys.length>1){
				head.choices.YYYA = "Next material";
			}
		}
		switch(this.$finder.modelCHCInd){
			case 0:
				head.choices.YYYC = "Toggle subentities";
				head.choices.YYYD = "Toggle highlite";
				head.choices.YYYE = "Toggle spin model";
				head.choices.YYYF = "Toggle closeup";
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
				head.choices.YYMA = "Change diffuse_map";
				head.choices.YYMB = "Change emission_and_illumination_map";
				head.choices.YYMC = "Change emission_map";
				head.choices.YYMD = "Change illumination_map";
				head.choices.YYME = "Change normal_and_parallax_map";
				head.choices.YYMF = "Change normal_map";
				head.choices.YYMG = "Change specular_map";
				head.choices.YYYG = "Next";
				break;
			case 3:
				head.choices.YYCA = "Change ambient_color";
				head.choices.YYCB = "Change diffuse_color";
				head.choices.YYCC = "Change emission_color";
				head.choices.YYCD = "Change emission_modulate_color";
				head.choices.YYCE = "Change illumination_modulate_color";
				head.choices.YYCF = "Change specular_color";
				head.choices.YYCG = "Change specular_modulate_color";
				head.choices.YYYG = "Next";
				break;
			case 4:
				head.choices.YYGA = "Set gloss";
				head.choices.YYGB = "Set shininess";
				head.choices.YYGC = "Set parallax_bias";
				head.choices.YYGD = "Set parallax_scale";
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
	if(this.$finder.modelCloseUp) md.position = [0,0,md.collisionRadius];
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
	for(var i=0;i<mat.MTX.length;i++) mission.addMessageText(this._aid.scrToWidth(mat.MTX[i],22," "));
};
this._modelChoices = function(choice){
	var tr;
	this.$finder.modelHead.initialChoicesKey = choice;
	switch(choice){
		case "YYYA": // Next material
			if(this.$curMat.sd.materials){
				this.$curMat.matInd++;
				if(this.$curMat.matInd>Object.keys(this.$curMat.sd.materials).length-1) this.$curMat.matInd = 0;
			} else this.$curMat.matInd = 0;
			this._showModel();
			break;
		case "ZYYB": // Back
			this.$finder.modelCurMod = null;
			this._showStart();
			break;
		case "YYYC": // Toggle subEntities
			this.$finder.modelNoSub = !this.$finder.modelNoSub;
			this._showModel();
			break;
		case "YYYD": // Toggle Highlight
			this.$finder.modelHighlightActive = !this.$finder.modelHighlightActive;
			this._showModel();
			break;
		case "YYYE": // Toggle Spin
			this.$finder.modelSpin = !this.$finder.modelSpin;
			this._showModel();
			break;
		case "YYYF": // Toggle closeup
			this.$finder.modelCloseUp = !this.$finder.modelCloseUp;
			this._showModel();
			break;
		case "YYYG": // Next
			this.$finder.modelCHCInd++;
			if(this.$finder.modelCHCInd>4) this.$finder.modelCHCInd = 0;
			this._showModel();
			break;
		case "XXLG": // to Latest.log
			this._writeLog();
			this._showModel();
			break;
		case "YYOA": // Orientations
		case "YYOB":
		case "YYOC":
		case "YYOD":
		case "YYOE":
		case "YYOF":
		case "YYOG":
			this.$finder.modelSpin = false;
			this.$finder.modelOri = this.$finder.modelOris[choice];
			this._showModel();
			break;
		case "YYMA": // Maps
		case "YYMB":
		case "YYMC":
		case "YYMD":
		case "YYME":
		case "YYMF":
		case "YYMG":
			this.$finder.modelMap = this.$finder.modelMaps[choice];
			this.$finder.modelCurMod = "modelMap";
			this._showModel();
			break;
		case "YYCA": // Colors
		case "YYCB":
		case "YYCC":
		case "YYCD":
		case "YYCE":
		case "YYCF":
		case "YYCG":
			this.$finder.modelCol = this.$finder.modelColors[choice];
			this.$finder.modelCurMod = "modelCol";
			this._showModel();
			break;
		case "YYGA": // gloss
		case "YYGB": // shininess
		case "YYGC": // parallax_bias
		case "YYGD": // parallax_scale
			this.$finder.modelSet = this.$finder.modelSets[choice];
			this.$finder.modelCurMod = "modelSet";
			this._enterValue();
			break;
		case "YMMA": //Set map
			this._enterValue();
			break;
		case "YMMB": //Clear map
			delete this.$storedMats[this.$curMat.dataKey][this.$curMat.matIndName][this.$finder[this.$finder.modelCurMod]];
			this._showModel();
			break;
		case "YMMC": //Set map modifiers
			this.$finder.modelCurMod = "modelMapMod";
			this._showModel();
			break;
		case "YMMD": //Clear map modifiers
			tr = this.$storedMats[this.$curMat.dataKey][this.$curMat.matIndName][this.$finder[this.$finder.modelCurMod]];
			if(tr && tr.name) this.$storedMats[this.$curMat.dataKey][this.$curMat.matIndName][this.$finder[this.$finder.modelCurMod]] = tr.name;
			this._showModel();
			break;
		case "YMME": //Confirm
			this.$finder.modelCurMod = null;
			this._showModel();
			break;
		case "YCCA": //Set color
			this._enterValue();
			break;
		case "YCCB": //Clear color
			delete this.$storedMats[this.$curMat.dataKey][this.$curMat.matIndName][this.$finder[this.$finder.modelCurMod]];
			this._showModel();
			break;
		case "YCCC": //Confirm
			this.$finder.modelCurMod = null;
			this._showModel();
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
			this.$finder.modelMapMod = this.$finder.modelMapMods[choice];
			this._enterValue();
			break;
		case "YMOJ": // Confirm
			this.$finder.modelCurMod = "modelMap";
			this._showModel();
			break;
		default:
			log(this.name,"Choice unhandled: "+choice);
			this._showStart();
	}
};
this._enterValue = function(){
	var head = this._aid.objClone(this.$finder.pageHead),
		ex,exa,l,tmp, mcm = this.$finder.modelCurMod,
		dtk = this.$curMat.dataKey;
	head.title = "Model: "+dtk+" - M:"+this.$curMat.matInd;
	if(mcm) head.title += " "+this.$finder[mcm];
	head.model = "["+dtk+"]";
	head.message = expandMissionText("LIB_MATFS_"+this.$finder[mcm]);
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
	if(ex) head.message += "\n\n"+expandMissionText(ex);
	if(exa) head.message += "\n"+exa;
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
this._writeLog = function(){
	var m = this.$storedMats[this.$curMat.dataKey],
		mk = Object.keys(m),
		ek,ev,fk,fv,k,t,tm,tp;
	this.$matLog = ["materials = {"];
	for(var i=0;i<mk.length;i++){
		this.$matLog.push("\""+mk[i]+"\""+" = {");
		ek = Object.keys(m[mk[i]]).sort();
		for(var j=0;j<ek.length;j++){
			this.$matLog.push(ek[j]+" = ");
			t = this.$defsM[ek[j]];
			ev = m[mk[i]][ek[j]];
			switch(t.use){
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
				case "Float": this.$matLog.push(parseFloat(ev)); break;
				case "Int": this.$matLog.push(parseInt(ev)); break;
				default: this.$matLog.push("null"); break;
			}
			this.$matLog.push("; ");
		}
		this.$matLog.push("}; ");
	}
	this.$matLog.push("};");
	log(this.name,"Entry for "+this.$curMat.dataKey+":");
	if(this.$finder.logCompact) log(this.name,this.$matLog.join("").replace(/\s/g,""));
	else log(this.name,this.$matLog.join(""));
};
}).call(this);
