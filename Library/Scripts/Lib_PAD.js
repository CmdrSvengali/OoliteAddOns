/* jshint bitwise:false, forin:false */
/* global clock,expandMissionText,mission,missionVariables,player,worldScripts */
/* (C) Svengali & BlackWolf 2016-2018, License CC-by-nc-sa-4.0 */
(function(){
"use strict";
this.name = "Lib_PAD";

this.$data = {
	categories:{GALCOP:"GalCop",GUILDS:"Guilds",INFOS:"Infos",LOGS:"Logbook",PERSONS:"Persons",SYSTEMS:"Systems",ZZX:"Search",ZZY:"Player data",ZZZ:"Exit"},
	GALCOP:{
		GENERIC:{name:"",entry:"2084004:01:01:01",enlisted:"",kills:0,missions:[],awards:[],info:[],t0:11,t1:0,t2:0,t3:0,t4:0,t5:0},
		NAVY:{name:"",entry:"",enlisted:"",kills:0,missions:[],awards:[],info:[],t0:21,t1:0,t2:0,t3:0,t4:0,t5:0}
	},
	GUILDS:{
		GENERIC:{name:"",entry:"2084004:01:01:01",enlisted:"Trade Guild Member",kills:0,missions:[],awards:[],info:[],t0:20,t1:0,t2:0,t3:0,t4:0,t5:0}
	},
	INFOS:{
		GENERIC:{name:"Lave Academy",location:"Lave",beacon:"None",purpose:"Flight Exam",special:["Exam 1st grade."],notes:[],t0:20,t1:0,t2:0,t3:0,t4:0,t5:0}
	},
	LOGS:{
		GENERIC:{list:["2084004:01:01 Starting my career."]}
	},
	PERSONS:{
		GENERIC:{name:"",origin:"",species:"",gender:"",age:0,ship:"",rank:"",info:[],notes:[],t0:0,t1:0,t2:0,t3:0,t4:0,t5:0}
	},
	SYSTEMS:{
		GENERIC:{name:"Lave G1",info:["Located in the south-west of Galaxy 1.","Part of the Old Worlds.","Seat of the Galactic Co-operative of Worlds."],notes:[],t0:0,t1:0,t2:0,t3:0,t4:0,t5:0}
	}
};
this.$config = {
	curCat:"GALCOP",
	def:{XXX:"Page up",YYY:"Page down",ZZZ:"Back"},
	defSpecies:["Bird","Feline","Frog","Human","Humanoid","Insect","Lizard","Lobster","Rodent"],
	defGender:["Male","Female","Neutral","Android"],
	defImages:[
		{t1:"lib_user.png",s:3,g:0,a:[26,27]},
		{t1:"lib_avatar01.png",s:3,g:1,a:[23,36]},{t1:"lib_avatar02.png",s:3,g:1,a:[23,32]},{t1:"lib_avatar03.png",s:3,g:1,a:[23,32]},
		{t1:"lib_avatar04.png",s:3,g:0,a:[26,37]},{t1:"lib_avatar05.png",s:3,g:0,a:[24,33]},{t1:"lib_avatar06.png",s:3,g:0,a:[44,63]},
		{t1:"lib_avatar07.png",s:8,g:1,a:[23,43]},{t1:"lib_avatar08.png",s:8,g:0,a:[30,43]},{t1:"lib_avatar09.png",s:0,g:0,a:[28,43]},
		{t1:"lib_avatar10.png",s:0,g:1,a:[28,43]},{t1:"lib_avatar11.png",s:1,g:1,a:[28,43]},{t1:"lib_avatar12.png",s:1,g:0,a:[34,48]},
		{t1:"lib_avatar13.png",s:1,g:1,a:[24,41]},{t1:"lib_avatar14.png",s:1,g:0,a:[24,41]},{t1:"lib_avatar15.png",s:2,g:2,a:[24,41]},
		{t1:"lib_avatar16.png",s:2,g:2,a:[24,41]},{t1:"lib_avatar17.png",s:5,g:2,a:[24,51]},{t1:"lib_avatar18.png",s:5,g:2,a:[24,51]},
		{t1:"lib_avatar19.png",s:6,g:0,a:[24,151]},{t1:"lib_avatar20.png",s:6,g:1,a:[24,111]},{t1:"lib_avatar21.png",s:8,g:1,a:[21,31]},
		{t1:"lib_avatar22.png",s:8,g:0,a:[24,35]}
	],
	defTemps:{
		GALCOP:{
			disp:{name:"",entry:"",enlisted:"",kills:0,missions:[],awards:[],info:[]},
			silent:{missions:5,awards:5,info:5,t0:1,t1:1,t2:1,t3:1,t4:1,t5:1,model:"lib_ms_helper6y"}
		},
		GUILDS:{
			disp:{name:"",entry:"",enlisted:"",kills:0,missions:[],awards:[],info:[]},
			silent:{missions:5,awards:5,info:5,t0:1,t1:1,t2:1,t3:1,t4:1,t5:1,model:"lib_ms_helper6y"}
		},
		INFOS:{
			disp:{name:"",location:"",beacon:"",purpose:"",special:[],notes:[],$crypt:""},
			silent:{special:10,$crypt:1,notes:5,t0:1,t1:1,t2:1,t3:1,t4:1,t5:1,model:"lib_ms_helper6y"}
		},
		LOGS:{
			disp:{list:[]},silent:{list:20,model:null}
		},
		PERSONS:{
			disp:{name:"",origin:"",species:"Human",gender:"Male",age:0,rank:"",ship:"",info:[],notes:[]},
			silent:{info:7,notes:5,t0:1,t1:1,t2:1,t3:1,t4:1,t5:1,model:"lib_ms_helper6y"}
		},
		SYSTEMS:{
			disp:{name:"",info:[],notes:[],$hide:""},
			silent:{info:10,notes:5,$hide:1,t0:1,t1:1,t2:1,t3:1,t4:1,t5:1,model:"lib_ms_helper6y"}
		}
	},
	defOrgs:[null,
		"lib_pad_org1.png","lib_pad_org2.png","lib_pad_org3.png","lib_pad_org4.png","lib_pad_org5.png","lib_pad_org6.png",
		"lib_pad_org7.png","lib_pad_org8.png","lib_pad_org9.png","lib_pad_org10.png","lib_pad_org11.png","lib_pad_org12.png",
		"lib_pad_org13.png","lib_pad_org14.png","lib_pad_org15.png","lib_pad_org16.png","lib_pad_org17.png","lib_pad_org18.png",
		"lib_pad_org19.png","lib_pad_org20.png","lib_pad_org21.png","lib_pad_org22.png","lib_pad_org23.png","lib_pad_org24.png",
		"lib_pad_org25.png","lib_pad_org26.png","lib_pad_org27.png","lib_pad_org28.png","lib_pad_org29.png","lib_pad_org30.png",
		"lib_pad_org31.png"
	],
	defRanks:[null,
		"lib_pad_rank1.png","lib_pad_rank2.png","lib_pad_rank3.png","lib_pad_rank4.png","lib_pad_rank5.png","lib_pad_rank6.png",
		"lib_pad_rank7.png","lib_pad_rank8.png","lib_pad_rank9.png"
	],
	defAwards:[null,
		"lib_pad_medal1.png","lib_pad_medal2.png","lib_pad_medal3.png","lib_pad_medal4.png","lib_pad_medal5.png","lib_pad_medal6.png",
		"lib_pad_medal7.png","lib_pad_medal8.png","lib_pad_medal9.png","lib_pad_medal10.png","lib_pad_medal11.png","lib_pad_medal12.png",
		"lib_pad_medal13.png","lib_pad_medal14.png","lib_pad_medal15.png","lib_pad_medal16.png","lib_pad_medal17.png"
	],
	defFFF:[null,"lib_pad_rank1.png"],
	defGGG:[null,"lib_pad_rank1.png"],
	defTex:["t0","t1","t2","t3","t4","t5"],
	defTexLookUp:["defOrgs","defImages","defRanks","defAwards","defFFF","defGGG"],
	defHead:{
		exitScreen:"GUI_SCREEN_INTERFACES",
		message:"",
		background:{name:"lib_pad_text_bg.png",height:512},
		screenID:this.name,
		spinModel:false
	},
	hide:["$crypt","$hide"],
	HUD:0,
	last:{
		news:"",
		add:"",
		upd:""
	},
	lastSearch:"",
	noteAdd:"",
	page:"INIT",
	pageInd:0,
	setInd:0,
	setGal:0,
	relInd:0,
	ps:{
		age:26,
		gender:"Male",
		species:"Human",
		origin:"Lave",
		image:"lib_user.png"
	},
	psUpd:1
};
this.startUp = function(){
	var d = this.$data,
		load;
	this._aid = worldScripts.Lib_Main._lib;
	worldScripts.Lib_GUI.$IDRules.Lib_PAD = {mus:1};
	if(missionVariables.LIB_PAD_DATA){
		load = JSON.parse(missionVariables.LIB_PAD_DATA);
		d.GALCOP.GENERIC = load.GALCOP;
		d.GALCOP.NAVY = load.NAVY;
		d.GUILDS.GENERIC = load.GUILDS;
		d.INFOS.GENERIC = load.INFOS;
		d.LOGS.GENERIC = load.LOGS;
		d.PERSONS.GENERIC = load.PERSONS;
		d.SYSTEMS.GENERIC = load.SYSTEMS;
		this.$config.ps = JSON.parse(missionVariables.LIB_PAD_PS);
		this.$config.last = JSON.parse(missionVariables.LIB_PAD_LAST);
	}
	this._updatePlayer(1);
	this.$Search = {
		"GALCOP.GENERIC": [0,[],[]],
		"GALCOP.NAVY": [0,[],[]],
		"GUILDS.GENERIC": [0,[],[]],
		"INFOS.GENERIC": [0,[],[]],
		"LOGS.GENERIC": [0,[],[]],
		"PERSONS.GENERIC": [0,[],[]],
		"SYSTEMS.GENERIC": [0,[],[]]
	};
	this._fillSearch();
};
this._fillSearch = function(){
	var d = this.$data;
	this.$Search["GALCOP.GENERIC"][0] = this._getEntries(d.GALCOP.GENERIC);
	this.$Search["GALCOP.NAVY"][0] = this._getEntries(d.GALCOP.NAVY);
	this.$Search["GUILDS.GENERIC"][0] = this._getEntries(d.GUILDS.GENERIC);
	this.$Search["INFOS.GENERIC"][0] = this._getEntries(d.INFOS.GENERIC);
	this.$Search["LOGS.GENERIC"][0] = this._getEntries(d.LOGS.GENERIC);
	this.$Search["PERSONS.GENERIC"][0] = this._getEntries(d.PERSONS.GENERIC);
	this.$Search["SYSTEMS.GENERIC"][0] = this._getEntries(d.SYSTEMS.GENERIC);
};
this.startUpComplete = function(){
	this._addInterface();
};
// store only GENERIC, NAVY, last and player data
this.playerWillSaveGame = function(){
	var d = this.$data,
		store = {
			GALCOP: d.GALCOP.GENERIC,
			NAVY: d.GALCOP.NAVY,
			GUILDS: d.GUILDS.GENERIC,
			INFOS: d.INFOS.GENERIC,
			LOGS: d.LOGS.GENERIC,
			PERSONS: d.PERSONS.GENERIC,
			SYSTEMS: d.SYSTEMS.GENERIC
		};
	missionVariables.LIB_PAD_DATA = JSON.stringify(store);
	missionVariables.LIB_PAD_PS = JSON.stringify(this.$config.ps);
	missionVariables.LIB_PAD_LAST = JSON.stringify(this.$config.last);
};
this.shipDockedWithStation = function(){
	if(!player.ship.docked) return;
	this._addInterface();
};
this._limit = function(who,how){
	for(var k in who) if(typeof(who[k])==="object" && who[k].length) who[k] = who[k].splice(-how[k]);
	return who;
};
this._getEntries = function(obj){
	var ownProps = Object.keys(obj), i = ownProps.length, o, res = "", ex = ["t0","t1","t2","t3","t4","t5"];
	while(i--){
		if(ex.indexOf(ownProps[i])!==-1) continue;
		o = obj[ownProps[i]];
		if(typeof(o)==="object") res += this._getEntries(o);
		else res += "|"+o;
	}
	return res;
};
/** function _addPageInCategory
* path    String. Dotted path, e.g. "GALCOP.NAVY".
* content Object.
* parent  Array. Member of other pages.
* sil     Bool. Silent mode. Does not add to latest additions.
* $return true on success, otherwise false.
*/
this._addPageInCategory = function(path,content,parent,sil){
	var con = this.$config,
		d = this.$data,
		q = this._aid.objGet(d,path),
		s = path.split("."),
		obj = this._aid.objClone(content),
		temp = this._aid.objClone(con.defTemps[s[0]].disp),
		i;
	if(q || !temp) return false;
	for(i=0;i<6;i++) temp[con.defTex[i]] = 0;
	temp = this._aid.objMerge(temp,obj,1);
	temp = this._limit(temp,con.defTemps[s[0]].silent);
	this._aid.objSet(d,path,temp);
	if(!sil) con.last.add = s.join(":");
	con.psUpd = 1;
	this.$Search[path] = [this._getEntries(temp),[],[]];
	if(parent){
		this.$Search[path][1] = parent;
		for(i=0;i<parent.length;i++){
			this.$Search[parent[i]][2].push(path);
		}
	}
	return true;
};
/** _setPageEntry
* path   String. Dotted path, e.g. "LOGS.GENERIC.list".
* value  Primitive. Value.
* sil    Bool. Silent mode. Does not add to latest additions.
* $return true on success, otherwise false.
*/
this._setPageEntry = function(path,value,sil){
	var d = this.$data,
		q = this._aid.objGet(d,path),
		s = path.split("."),
		o = {},
		n = clock.clockString.substr(0,13),
		p;
	if(typeof(q)==="undefined") return false;
	switch(this._aid.typeGet(q)){
		case "array":
			if(s[2]==="list") q.push(n+" "+value);
			else if(q.indexOf(value)<0) q.push(value);
			o[s[2]] = q;
			q = this._limit(o,this.$config.defTemps[s[0]].silent)[s[2]];
			break;
		case "number":
			if(value==="++") q++;
			else q = value;
			break;
		default: q = value;
	}
	this._aid.objSet(d,path,q);
	p = this._aid.objGet(d,s[0]+"."+s[1]);
	if(!sil) this.$config.last.upd = s[0]+":"+s[1]+" - "+n+" "+value;
	this.$Search[s[0]+"."+s[1]][0] = this._getEntries(p);
	return true;
};
/** _getData
* path String. Dotted path, e.g. "GALCOP.NAVY".
* $return Object or null.
*/
this._getData = function(path){
	var q = this._aid.objGet(this.$data,path);
	if(q) return this._aid.objClone(q);
	return null;
};
this._addInterface = function(){
	player.ship.dockedStation.setInterface(this.name,{
		title: "P.A.D.",
		category: "Captains Log",
		summary: "Personal Assistance Device",
		callback: this._showStart.bind(this)
	});
};
this._updatePlayer = function(ex){
	var a,b,c,i, ps = this.$config.ps;
	a = this.$data.PERSONS.GENERIC;
	a.name = player.name;
	a.ship = player.ship.displayName;
	a.species = ps.species;
	a.origin = ps.origin;
	a.gender = ps.gender;
	a.age = ps.age;
	a.rank = player.rank;
	a.t1 = ps.image;
	b = this.$data.GALCOP;
	c = Object.keys(b);
	for(i=0;i<c.length;i++){
		b[c[i]].name = player.name;
		b[c[i]].t1 = ps.image;
	}
	b.GENERIC.kills = player.score;
	b = this.$data.GUILDS;
	c = Object.keys(b);
	for(i=0;i<c.length;i++){
		b[c[i]].name = player.name;
		b[c[i]].t1 = ps.image;
	}
	b.GENERIC.kills = player.score;
	this.$config.psUpd = 0;
	if(!ex) this._fillSearch();
};
this._showStart = function(ini){
	var c = this.$config;
	if(ini==="Lib_PAD"){
		c.psUpd = 1;
		if(!player.ship.hudHidden) c.HUD = 1;
	}
	player.ship.hudHidden = true;
	if(c.psUpd) this._updatePlayer();
	c.curCat = "INIT";
	var head = this._aid.objClone(c.defHead);
	head.choices = this.$data.categories;
	head.message = "Last News:\n"+c.last.news+"\n\nLast Update:\n"+c.last.upd+"\n\nLast Addition:\n"+c.last.add;
	head.background = {name:"lib_pad_bg.png",height:512};
	head.title = "Personal Assistance Device";
	mission.runScreen(head,this._choices);
};
this._showCategory = function(ick,note){
	var con = this.$config,
		cat = con.curCat,
		d = this.$data[cat],
		ind = con.pageInd,
		max = Object.keys(d),
		p = d[con.page],
		temps = Object.keys(con.defTemps),
		i,md,m,min,template,
		tt = con.defTex,
		head = this._aid.objClone(con.defHead),
		pm = this.$Search[cat+"."+con.page];
	con.relInd = 0;
	head.choices = this._aid.objClone(con.def);
	head.initialChoicesKey = ick;
	head.model = con.defTemps[cat].silent.model;
	head.title = cat+(ind!==0?"-"+max[ind]:"")+" ("+(ind+1)+"/"+max.length+")";
	if(max.length<2){
		head.choices = this._aid.scrChcUnsel(head.choices,'XXX');
		head.choices = this._aid.scrChcUnsel(head.choices,'YYY');
	}
	if(p.list){
		if(!p.list.length) head.message = "No entries yet.";
		else {
			min = p.list.length-1;
			max = Math.max(0,min-20);
			for(i=min;i>=max;i--) head.message += this._aid.scrAddLine([[p.list[i],30]],"","\n");
		}
	} else {
		if(temps.indexOf(cat)>-1){
			template = con.defTemps[cat];
			m = this._fillTemplate(p,template);
			head.message = m[0];
		} else {
			head.message = "No entries yet.";
		}
		if(m[1].silent.notes){
			if(con.page==="GENERIC") head.choices.ZZW = "Add note";
			else head.choices.ZZW = {text:"Add note",unselectable:true};
		}
		if(m[1].$crypt) head.choices.ZZV = "Decrypt";
	}
	if(pm[1].length || pm[2].length) head.choices.ZZU = "Related info";
	if(note) head.message += note;
	mission.runScreen(head,this._choices);
	md = mission.displayModel;
	if(md){
		md.orientation = [1,0,1,0]; // invisible
		md.position = [50,8,150];
		for(i=0;i<tt.length;i++){
			if(m[1][tt[i]]){
				md.subEntities[i].setMaterials({"lib_null.png":{emission_map:m[1][tt[i]]}});
				md.subEntities[i].orientation = [-1,0,1,0];
			}
		}
		md.subEntities[0].position = [100,60,160]; // organisation
		md.subEntities[2].position = [25,14,-10]; // rank/enlisted
		md.subEntities[3].position = [25,-7,-10]; // medal
		md.subEntities[4].position = [25,-28,-10]; // tex
		md.subEntities[5].position = [140,75,-80]; // tex
	}
};
this._fillTemplate = function(obj,temp,ps){
	var con = this.$config,
		a = this._aid.objClone(obj),
		b = this._aid.objClone(temp),
		ca = Object.keys(b.disp),
		m = "",i,j,min,max,fill,spec,
		tt = con.defTex,
		tts = con.defTexLookUp;
	for(i=0;i<ca.length;i++){
		if(con.hide.indexOf(ca[i])!==-1) continue;
		if(a[ca[i]]){
			if(this._aid.typeGet(a[ca[i]])==="array"){
				if(ps) continue; // opt out for gallery
				fill = b.silent[ca[i]]-1;
				if(a[ca[i]].length){
					min = a[ca[i]].length-1;
					max = Math.max(0,a[ca[i]].length-b.silent[ca[i]]);
					for(j=min;j>=max;j--){
						if(j===min) m += this._aid.scrAddLine([[ca[i].toUpperCase()+": ",7],[a[ca[i]][j],23]],"","\n");
						else m += this._aid.scrAddLine([[" ",7],[a[ca[i]][j],23]]," ","\n");
					}
					if(fill>min){ // Fill up
						fill -= min;
						while(fill--) m += "\n";
					}
				} else { // Fill up
					for(j=fill;j>=0;j--){
						if(j===fill) m += this._aid.scrAddLine([[ca[i].toUpperCase()+": ",7],["-",23]],"","\n");
						else m += "\n";
					}
				}
			} else m += this._aid.scrAddLine([[ca[i].toUpperCase()+": ",7],[a[ca[i]],23]],"","\n");
		} else m += this._aid.scrAddLine([[ca[i].toUpperCase()+": ",7],["-",23]],"","\n");
	}
	for(i=0;i<tt.length;i++){
		spec = a[tt[i]];
		if(spec && b.silent[tt[i]]){
			if(typeof(spec)==="number"){
				if(spec>0 && spec<con[tts[i]].length) b[tt[i]] = con[tts[i]][spec];
			} else b[tt[i]] = spec;
		}
	}
	if(a.$crypt && b.silent.$crypt) b.$crypt = a.$crypt;
	return [m,b];
};
this._showPlayer = function(){
	this._updatePlayer();
	var arr = ["LIB_PAD_AVATAR","LIB_PAD_SPECIES","LIB_PAD_ORIGIN","LIB_PAD_GENDER","LIB_PAD_AGE"],
		c = this.$config,m,md,mdt,min,i,
		head = this._aid.objClone(c.defHead);
	head.textEntry = true;
	head.model = "lib_ms_helper";
	head.title = "Personal Assistance Device";
	if(c.setInd===0) head.model = "lib_ms_helper12x"; // Gallery
	m = this._fillTemplate(this.$data.PERSONS.GENERIC,c.defTemps.PERSONS,1);
	head.message = m[0];
	head.message += "\n"+expandMissionText(arr[c.setInd]);
	mission.runScreen(head,this._pSettings);
	md = mission.displayModel;
	if(md && m && m[1].t1){
		md.setMaterials({"lib_null.png":{emission_map:m[1].t1}});
		md.orientation = [1,0,0,0];
		if(this.$config.setInd===0){
			mdt = c.defImages;
			min = Math.min(mdt.length,c.setGal+12);
			for(i=c.setGal;i<min;i++) md.subEntities[i-c.setGal].setMaterials({"lib_null.png":{diffuse_map:"lib_pad"+(i-c.setGal+1)+".png",emission_map:mdt[i].t1}});
			md.position = [0,-12,150];
		} else md.position = [50,40,150];
	}
};
this._pSettings = function(choice){
	var c = this.$config, cint = parseInt(choice), mdt, v;
	if(choice){
		switch(c.setInd){
			case 0:
				if(/\.png/.test(choice)){ // No way to test if image exists. Undocumented.
					c.ps.image = choice;
				} else {
					if(!isNaN(cint)){
						mdt = c.defImages;
						if(cint===0){ // Next gallery
							c.setInd--;
							c.setGal += 12;
							if(c.setGal>mdt.length-1) c.setGal = 0;
						} else {
							if(cint<=mdt.length && cint>0){
								v = mdt[c.setGal+cint-1];
								if(!v) v = {t1:"lib_user.png",s:3,g:0,a:[26,27]};
								c.ps.image = v.t1;
								c.ps.species = c.defSpecies[v.s];
								c.ps.gender = c.defGender[v.g];
								c.ps.age = this._aid.randXY(v.a[0],v.a[1]);
							} else c.setInd--;
						}
					} else c.setInd--;
				}
				break;
			case 1: c.ps.species = choice; break;
			case 2: c.ps.origin = choice; break;
			case 3: c.ps.gender = choice; break;
			case 4: if(!isNaN(cint) && cint>0 && cint<300) c.ps.age = cint; break;
		}
	}
	c.setInd++;
	if(c.setInd<5) this._showPlayer();
	else {
		c.curCat = "INIT";
		c.page = "INIT";
		c.pageInd = 0;
		c.psUpd = 1;
		this._showStart(1);
	}
};
this._choices = function(choice){
	var con = this.$config,
		c = Object.keys(this.$data.categories),
		cat = con.curCat,
		d = this.$data[cat],
		ind = con.pageInd,
		max,p1,p2,act,p3,p4;
	if(!cat || cat==="INIT"){
		switch(choice){
			case "ZZZ": // Bye
				if(con.HUD) player.ship.hudHidden = false;
				con.HUD = 0;
				con.curCat = "";
				con.page = "INIT";
				con.pageInd = 0;
				break;
			case "ZZY": // Player settings
				con.setInd = 0;
				this._showPlayer();
				break;
			case "ZZX": // Search
				this._showSearch();
				break;
			default:
				ind = c.indexOf(choice);
				if(ind>-1){
					con.curCat = choice;
					con.page = "GENERIC";
					con.pageInd = 0;
					this._showCategory(choice);
				}
		}
	} else {
		max = Object.keys(d);
		switch(choice){
			case "XXX": // Page up
				ind++;
				if(ind>=max.length) ind = 0;
				con.page = max[ind];
				con.pageInd = ind;
				this._showCategory(choice);
				break;
			case "YYY": // Page down
				ind--;
				if(ind<0) ind = max.length-1;
				con.page = max[ind];
				con.pageInd = ind;
				this._showCategory(choice);
				break;
			case "ZZU": // Parent/Members
				this._showRelated();
				break;
			case "ZZV": // De-Crypt
				p1 = d[con.page].$crypt.split(".");
				p2 = p1.shift();
				act = this._aid.objGet(worldScripts[p2],p1.join("."),1);
				if(act){
					p3 = d[con.page].special.join("|");
					p4 = worldScripts.Lib_Crypt._rot513(p3);
					d[con.page].special = p4.split("|");
					d[con.page].$crypt = 0;
					this.$Search[con.curCat+"."+con.page][0] = this._getEntries(d[con.page]);
					this._showCategory(choice);
				} else this._showCategory(choice,"Could not decrypt.");
				break;
			case "ZZW": // Add note
				this._showAddNote(cat+"."+con.page);
				break;
			case "ZZZ": // Back
				con.curCat = "INIT";
				con.page = "INIT";
				con.pageInd = 0;
				this._showStart(1);
				break;
		}
	}
};
this._showAddNote = function(path){
	var m = this._aid.objGet(this.$data,path+".notes"),
		f = m.slice(0).reverse(),
		head = this._aid.objClone(this.$config.defHead);
	head.textEntry = true;
	head.title = "Add note ("+path+")";
	this.$config.noteAdd = path;
	for(var i=0;i<10;i++){
		if(i<f.length) head.message += this._aid.scrAddLine([[f[i],23]],"","\n");
		else head.message += "\n";
	}
	mission.runScreen(head,this._noteAdded);
};
this._noteAdded = function(choice){
	if(choice && choice!==""){
		this._setPageEntry(this.$config.noteAdd+".notes",choice);
		this._showCategory("ZZW","Note added.");
	} else this._showCategory("ZZW");
	this.$config.noteAdd = "";
};
this._showSearch = function(){
	var c = this.$config,
		head = this._aid.objClone(c.defHead);
	if(c.psUpd) this._updatePlayer();
	head.textEntry = true;
	head.message = null;
	head.messageKey = "LIB_PAD_SEARCH";
	head.title = "Personal Assistance Device";
	mission.runScreen(head,this._pSearch);
};
this._pSearch = function(choice){
	var res = null,i,max,
		head = this._aid.objClone(this.$config.defHead);
	head.choices = {ZZZ:"Back"};
	head.title = "Search Results"+(choice?" for "+choice:"");
	if(choice){
		res = this._searchSData(choice);
		this.$config.lastSearch = choice;
	}
	if(res && res.length){
		max = Math.min(res.length,20);
		for(i=0;i<max;i++) head.choices[res[i]] = res[i].split(".").join(" : ");
		for(i=0;i<26-max;i++) head.choices["ZZY"+i] = {text:"",unselectable:true};
	} else head.message = "Nothing found.";
	mission.runScreen(head,this._pSearchRes);
};
this._pSearchRes = function(path){
	var con = this.$config,
		d = this.$data,
		k,ind;
	switch(path){
		case "ZZZ": this._showStart(1); break;
		default:
			path = path.split(".");
			con.curCat = path[0];
			con.page = path[1];
			k = Object.keys(d[path[0]]);
			ind = k.indexOf(path[1]);
			con.pageInd = ind;
			this._showCategory(path[1]);
	}
};
// Returns array with pathes
this._searchSData = function(word){
	var w = new RegExp(word),
		s = this.$Search,
		k = Object.keys(s),
		kl = k.length,
		d,
		res = [];
	for(var i=0;i<kl;i++){
		d = s[k[i]][0];
		if(w.test(d)) res.push(k[i]);
		if(res.length>20) break;
	}
	return res;
};
this._showRelated = function(){
	var con = this.$config,
		head = this._aid.objClone(con.defHead),
		pm = this.$Search[con.curCat+"."+con.page],
		pma = pm[1],
		pmb = pm[2],
		i;
	head.choices = this._aid.objClone(con.def);
	head.title = "Related to "+con.curCat+"."+con.page;
	head.overlay = {name:"lib_pad_text_ovcatmem.png",height:512};
	for(i=5*con.relInd;i<5+(5*con.relInd);i++){
		if(pma.length>i) head.choices["A"+pma[i]] = pma[i];
		else head.choices["BZZZ"+i] = {text:"",unselectable:true};
	}
	head.choices.CZZZ = {text:"",unselectable:true};
	for(i=15*con.relInd;i<15+(15*con.relInd);i++){
		if(pmb.length>i) head.choices["D"+pmb[i]] = pmb[i];
		else head.choices["EZZZ"+i] = {text:"",unselectable:true};
	}
	head.choices.FZZZ = {text:"",unselectable:true};
	head.choices.GZZZ = {text:"",unselectable:true};
	head.choices.HZZZ = {text:"",unselectable:true};
	if(pma.length<6 && pmb.length<16){
		head.choices = this._aid.scrChcUnsel(head.choices,'XXX');
		head.choices = this._aid.scrChcUnsel(head.choices,'YYY');
	}
	mission.runScreen(head,this._related);
};
this._related = function(path){
	var con = this.$config,
		pm = this.$Search[con.curCat+"."+con.page],
		pma = pm[1],
		pmb = pm[2],
		d = this.$data,
		k,ind;
	switch(path){
		case "XXX":
			con.relInd++;
			if(pma.length<=con.relInd*5 && pmb.length<=con.relInd*15) con.relInd = 0;
			this._showRelated();
			break;
		case "YYY":
			con.relInd--;
			if(con.relInd<0) con.relInd = Math.max(Math.ceil(pmb.length/15)-1,Math.ceil(pma.length/5)-1);
			this._showRelated();
			break;
		case "ZZZ": this._showCategory(); break;
		default:
			path = path.substr(1);
			path = path.split(".");
			con.curCat = path[0];
			con.page = path[1];
			k = Object.keys(d[path[0]]);
			ind = k.indexOf(path[1]);
			con.pageInd = ind;
			this._showCategory(path[1]);
	}
};
this._Help = function(what){
	var h;
	switch(what){
		case "_addPageInCategory": h = "LIB_PAD_HELP_addPageInCategory"; break;
		case "_setPageEntry": h = "LIB_PAD_HELP_setPageEntry"; break;
		case "_getData": h = "LIB_PAD_HELP_getData"; break;
		default: h = "LIB_PAD_HELP";
	}
	return expandMissionText(h);
};
}).call(this);