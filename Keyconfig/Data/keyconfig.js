/*
keyconfig.js - Script for creating a user keyconfiguration.
Copyright © 2012-2015 Svengali

Licenced for free distribution under the BSDL
http://www.opensource.org/licenses/bsd-license.php

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

Special thanks to Eric Walch, Michael Werle, PhantorGorth, El Viejo and Gimi

More infos about key handling (and it's inconsistancies) in JS
can be found at: http://unixpapa.com/js/key.html

*/
// jshint bitwise:false
/* global displaySet,escape,legendPadStyles,unescape,VKI_deadkey,VKI_isMac,VKI_isMoz,VKI_kt,VKI_layout,VKI_modify,VKI_ooversion,VKI_Remap,VKI_target,VKI_titles,VKI_version */
(function(){
/* Keyconfig settings.
* Adding new keys requires a changed table in keyconfig.html.
*
* [0]=version, [1]=v1.77, [2]=v1.80, [3]=v1.82, [4]=Alternative A, [5]=Alternative B, [6]=BBC, [7]=Empty
*
* version:		[introduced, removed]
*
* layout keys:	[keycode, clashtype, coloring]
*
* clashtype is used to mark duplicated entries (bitmask):
*   1=Inflight, 2=Docked, 4=Docking Comp, 8=GUI (other than inflight views), 16=Pause, 32=OXZManager, 64=GUI Charts, 128=GUI Market
* coloring just selects the background-color based on this.KC_StyleAtt:
*   1=Steering, 2=Nav, 3=Fight, 4=Speed, 5=Equip, 6=Cargo, 7=Docking, 8=GUI, 9=Misc
*/
var mc = {hom:303,end:304,pu:307,pd:308};
if(this.VKI_isMac) mc = {hom:"\u2196",end:"\u2198",pu:"\u21de",pd:"\u21df"};
this.KC_Default = {
	key_roll_left:					[[0,0],			[253,1,1],[253,1,1],[253,1,1],				[253,1,1],[253,1,1],[",",1,1],			["",1,1]],
	key_roll_right:					[[0,0],			[252,1,1],[252,1,1],[252,1,1],				[252,1,1],[252,1,1],[".",1,1],			["",1,1]],
	key_pitch_forward:				[[0,0],			[255,1,1],[255,1,1],[255,1,1],				[255,1,1],[255,1,1],["s",1,1],			["",1,1]],
	key_pitch_back:					[[0,0],			[254,1,1],[254,1,1],[254,1,1],				[254,1,1],[254,1,1],["x",1,1],			["",1,1]],
	key_yaw_left:					[[0,0],			[",",1,1],[",",1,1],[",",1,1],				[",",1,1],[",",1,1],[253,1,1],			["",1,1]],
	key_yaw_right:					[[0,0],			[".",1,1],[".",1,1],[".",1,1],				[".",1,1],[".",1,1],[252,1,1],			["",1,1]],
	key_mouse_control:				[[0,0],			["M",31,1],["M",31,1],["M",31,1],			[mc.pd,31,1],[mc.pd,31,1],["M",31,1],	["",31,1]],
	key_prev_compass_mode:			[[0,0],			["|",1,2],["|",1,2],["|",1,2],				["-",1,2],["K",1,2],["|",1,2],			["",1,2]],
	key_next_compass_mode:			[[0,0],			["\\",1,2],["\\",1,2],["\\",1,2],			["=",1,2],["k",1,2],["\\",1,2],			["",1,2]],
	key_scanner_zoom:				[[0,0],			["z",1,2],["z",1,2],["z",1,2],				[">",1,2],[250,1,2],["z",1,2],			["",1,2]],
	key_scanner_unzoom:				[[0,0],			["Z",1,2],["Z",1,2],["Z",1,2],				["<",1,2],[251,1,2],["Z",1,2],			["",1,2]],
	key_fire_lasers:				[[0,0],			["a",1,3],["a",1,3],["a",1,3],				["a",1,3],[32,1,3],["a",1,3],			["",1,3]],
	key_weapons_online_toggle:		[[0,0],			["_",1,3],["_",1,3],["_",1,3],				["W",1,3],["o",1,3],["_",1,3],			["",1,3]],
	key_ident_system:				[[0,0],			["r",1,3],["r",1,3],["r",1,3],				["r",1,3],["r",1,3],["r",1,3],			["",1,3]],
	key_untarget_missile:			[[0,0],			["u",1,3],["u",1,3],["u",1,3],				["u",1,3],["u",1,3],["u",1,3],			["",1,3]],
	key_next_target:				[[0,0],			["+",1,3],["+",1,3],["+",1,3],				[";",1,3],["\\",1,3],["+",1,3],			["",1,3]],
	key_previous_target:			[[0,0],			["-",1,3],["-",1,3],["-",1,3],				["'",1,3],["z",1,3],["-",1,3],			["",1,3]],
	key_launch_missile:				[[0,0],			["m",1,3],["m",1,3],["m",1,3],				["m",1,3],["\t",1,3],["m",1,3],			["",1,3]],
	key_next_missile:				[[0,0],			["y",1,3],["y",1,3],["y",1,3],				["y",1,3],["w",1,3],["y",1,3],			["",1,3]],
	key_target_incoming_missile:	[[0,0],			["T",1,3],["T",1,3],["T",1,3],				["T",1,3],["i",1,3],["T",1,3],			["",1,3]],
	key_target_missile:				[[0,0],			["t",1,3],["t",1,3],["t",1,3],				["t",1,3],["t",1,3],["t",1,3],			["",1,3]],
	key_ecm:						[[0,0],			["e",1,3],["e",1,3],["e",1,3],				["e",1,3],["e",1,3],["e",1,3],			["",1,3]],
	key_launch_escapepod:			[[0,0],			[27,1,3],[27,1,3],[27,1,3],					[27,1,3],[mc.end,1,3],[27,1,3],			["",1,3]],
	key_increase_speed:				[[0,0],			["w",1,4],["w",1,4],["w",1,4],				["w",1,4],["d",1,4],[32,1,4],			["",1,4]],
	key_decrease_speed:				[[0,0],			["s",1,4],["s",1,4],["s",1,4],				["s",1,4],["s",1,4],["/",1,4],			["",1,4]],
	key_jumpdrive:					[[0,0],			["j",1,4],["j",1,4],["j",1,4],				["j",1,4],["j",1,4],["j",1,4],			["",1,4]],
	key_inject_fuel:				[[0,0],			["i",1,4],["i",1,4],["i",1,4],				["i",1,4],["f",1,4],["i",1,4],			["",1,4]],
	key_galactic_hyperspace:		[[0,0],			["g",1,4],["g",1,4],["g",1,4],				["G",1,4],["g",1,4],["g",1,4],			["",1,4]],
	key_hyperspace:					[[0,0],			["h",1,4],["h",1,4],["h",1,4],				["H",1,4],["h",1,4],["h",1,4],			["",1,4]],
	key_prime_equipment:			[[0,0],			["N",1,5],["N",1,5],["N",1,5],				["[",1,5],["0",1,5],["N",1,5],			["",1,5]],
	key_activate_equipment:			[[0,0],			["n",1,5],["n",1,5],["n",1,5],				["]",1,5],["-",1,5],["n",1,5],			["",1,5]],
	key_mode_equipment:				[[0,0],			["b",1,5],["b",1,5],["b",1,5],				["\\",1,5],["=",1,5],["b",1,5],			["",1,5]],
	key_comms_log:					[[0,0],			["`",1,5],["`",1,5],["`",1,5],				["\t",1,5],["9",1,5],["`",1,5],			["",1,5]],
	key_fastactivate_equipment_a:	[["1.80",0],	["",1,5],["0",1,5],["0",1,5],				["0",1,5],["[",1,5],["0",1,5],			["",1,5]],
	key_fastactivate_equipment_b:	[["1.80",0],	["",1,5],["\t",1,5],["\t",1,5],				["|",1,5],["]",1,5],["\t",1,5],			["",1,5]],
	key_cloaking_device:			[[0,"1.78"],	["0",1,5],["0",1,5],["0",1,5],				["c",1,5],["[",1,5],["0",1,5],			["",1,5]],
	key_energy_bomb:				[[0,"1.78"],	["\t",1,5],["\t",1,5],["\t",1,5],			["|",1,5],["]",1,5],["\t",1,5],			["",1,5]],
	key_cycle_mfd:					[["1.80",0],	["",207,5],[";",207,5],[";",207,5],			["z",207,5],["m",207,5],[";",207,5],	["",207,5]],
	key_switch_mfd:					[["1.80",0],	["",207,5],[":",207,5],[":",207,5],			["x",207,5],["M",207,5],[":",207,5],	["",207,5]],
	key_dump_cargo:					[[0,0],			["d",1,6],["D",1,6],["D",1,6],				[306,1,6],[306,1,6],["d",1,6],			["",1,6]],
	key_rotate_cargo:				[[0,0],			["R",1,6],["R",1,6],["R",1,6],				["R",1,6],["/",1,6],["R",1,6],			["",1,6]],
	key_autopilot:					[[0,0],			["c",1,7],["c",1,7],["c",1,7],				["D",1,7],[";",1,7],["c",1,7],			["",1,7]],
	key_autodock:					[[0,0],			["C",1,7],["C",1,7],["C",1,7],				["d",1,7],["'",1,7],["C",1,7],			["",1,7]],
	key_docking_clearance_request:	[[0,0],			["L",1,7],["L",1,7],["L",1,7],				[":",1,7],["l",1,7],["L",1,7],			["",1,7]],
	key_docking_music:				[[0,0],			["s",4,7],["s",4,7],["s",4,7],				[mc.pu,4,7],[mc.pu,4,7],["k",4,7],		["",4,7]],
	key_view_forward:				[["1.80",0],	["",207,8],["1",207,8],["1",207,8],			["1",207,8],["1",207,8],["1",207,8],	["",207,8]],
	key_view_aft:					[["1.80",0],	["",207,8],["2",207,8],["2",207,8],			["2",207,8],["2",207,8],["2",207,8],	["",207,8]],
	key_view_port:					[["1.80",0],	["",207,8],["3",207,8],["3",207,8],			["3",207,8],["3",207,8],["3",207,8],	["",207,8]],
	key_view_starboard:				[["1.80",0],	["",207,8],["4",207,8],["4",207,8],			["4",207,8],["4",207,8],["4",207,8],	["",207,8]],
	key_gui_screen_status:			[["1.80",0],	["",207,8],["5",207,8],["5",207,8],			["5",207,8],["5",207,8],["5",207,8],	["",207,8]],
	key_gui_chart_screens:			[["1.80",0],	["",207,8],["6",207,8],["6",207,8],			["6",207,8],["6",207,8],["6",207,8],	["",207,8]],
	key_gui_system_data:			[["1.80",0],	["",207,8],["7",207,8],["7",207,8],			["7",207,8],["7",207,8],["7",207,8],	["",207,8]],
	key_gui_market:					[["1.80",0],	["",207,8],["8",207,8],["8",207,8],			["8",207,8],["8",207,8],["8",207,8],	["",207,8]],
	key_gui_arrow_left:				[["1.80",0],	["",250,8],[253,250,8],[253,250,8],			[253,250,8],[253,250,8],[253,250,8],	["",250,8]],
	key_gui_arrow_right:			[["1.80",0],	["",250,8],[252,250,8],[252,250,8],			[252,250,8],[252,250,8],[252,250,8],	["",250,8]],
	key_gui_arrow_up:				[["1.80",0],	["",250,8],[255,250,8],[255,250,8],			[255,250,8],[255,250,8],[255,250,8],	["",250,8]],
	key_gui_arrow_down:				[["1.80",0],	["",250,8],[254,250,8],[254,250,8],			[254,250,8],[254,250,8],[254,250,8],	["",250,8]],
	key_map_info:					[[0,0],			["i",64,8],["i",64,8],["i",64,8],			["M",64,8],["b",64,8],["i",64,8],		["",64,8]],
	key_map_home:					[[0,0],			[mc.hom,64,8],[mc.hom,64,8],[mc.hom,64,8],	[mc.hom,64,8],["x",64,8],[302,64,8],	["",64,8]],
	key_chart_highlight:			[["1.80",0],	["",64,8],["?",64,8],["?",64,8],			["?",64,8],["c",64,8],["?",64,8],		["",64,8]],
	key_advanced_nav_array:			[[0,0],			["^",64,8],["^",64,8],["^",64,8],			["N",64,8],["n",64,8],["^",64,8],		["",64,8]],
	key_contract_info:				[[0,"1.78"],	["?",74,8],["?",74,8],["?",74,8],			["C",74,8],["c",74,8],["?",74,8],		["",74,8]],
	key_custom_view:				[[0,0],			["v",1,2],["v",1,2],["v",1,2],				["V",1,2],["v",1,2],["v",1,2],			["",1,2]],
	key_market_filter_cycle:		[["1.82",0],	["",128,8],["",128,8],["?",128,8],			["?",128,8],["[",128,8],["[",128,8],	["",128,8]],
	key_market_sorter_cycle:		[["1.82",0],	["",128,8],["",128,8],["/",128,8],			["/",128,8],["]",128,8],["]",128,8],	["",128,8]],
	key_pausebutton: 				[[0,0],			["p",223,9],["p",223,9],["p",223,9],		["p",223,9],[27,223,9],["p",223,9],		["",223,9]],
	key_show_fps:					[[0,0],			["F",16,9],["F",16,9],["F",16,9],			["F",16,9],["=",16,9],["F",16,9],		["",16,9]],
	key_hud_toggle:					[[0,0],			["o",16,9],["o",16,9],["o",16,9],			[mc.end,16,9],["-",16,9],["o",16,9],	["",16,9]],
	key_snapshot:					[[0,0],			["*",239,9],["*",239,9],["*",239,9],		[249,239,9],["p",239,9],["*",239,9],	["",239,9]],
	key_dump_target_state:			[[0,0],			["H",1,9],["H",1,9],["H",1,9],				[250,1,9],[mc.hom,1,9],["H",1,9],		["",1,9]],
	key_inc_field_of_view:			[["1.82",0],	["",1,9],["",1,9],["l",1,9],				["l",1,9],["+",1,9],["k",1,9],			["l",1,9]],
	key_dec_field_of_view:			[["1.82",0],	["",1,9],["",1,9],["k",1,9],				["k",1,9],["_",1,9],["l",1,9],			["k",1,9]],
	key_oxzmanager_setfilter:		[["1.82",0],	["",32,9],["",32,9],["f",32,9],				["f",32,9],["f",32,9],["f",32,9],		["",32,9]],
	key_oxzmanager_showinfo:		[["1.82",0],	["",32,9],["",32,9],["i",32,9],				["i",32,9],["i",32,9],["i",32,9],		["",32,9]],
	key_oxzmanager_extract:			[["1.82",0],	["",32,9],["",32,9],["x",32,9],				["x",32,9],["x",32,9],["x",32,9],		["",32,9]]
};
// Hardcoded keys
this.KC_Hardcoded = {
	"1.77":["Q","1","2","3","4","5","6","7","8","F1","F2","F3","F4","F5","F6","F7","F8","N0","N1","N2","N3","N4","N5","N6","N7","N8","N9"],
	"1.80":["Q","F1","F2","F3","F4","F5","F6","F7","F8"],
	"1.82":["Q","F1","F2","F3","F4","F5","F6","F7","F8"]
};
this.KC_HardcodedIDs = [];
this.KC_Remap = {}; // Currently only used to exclude keys from clashtype checks and writing configuration
this.KC_StyleAtt = legendPadStyles; // Get styles for used keys
this.KC_ClashTypes = []; // Holds clash types
this.KC_AvailableKeys = []; // Holds key names
this.KC_CurrentSet = {}; // Current configuration
this.KC_Duplicates = []; // Holds only values from current config
this.KC_RegKeys = VKI_layout.Oolite.regs; // RegExp to check valid entries via direct keyboard input
this.KC_setID = 3; // Default v1.82
this.KC_Compat = "1.82";
this.KC_Twonhas = ["PD","PU","F1","F2","F3","F4","F5","F6","F7","F8","N0","N1","N2","N3","N4","N5","N6","N7","N8","N9"];
this.$debug = false;
this.KC = {c1:"#D8D8D8",c2:"#BF8360",c3:"#FFFFFF",c4:"#FFC0C0",c5:"#E0F0E0"};

// Check JS, fill lists and change the values for Macs
this.JSCheck = function(){
	if(VKI_isMoz) this.KC_AvailableKeys = Object.keys(this.KC_Default);
	else for(var prop in this.KC_Default) this.KC_AvailableKeys.push(prop);
	var e = document.getElementById("JSCheck");
	e.firstChild.nodeValue = "A quick and dirty tool to create your own keyconfig.plist. ";
	e.style.backgroundColor = this.KC.c5;
	if(this.$debug) document.getElementById("debug").style.visibility = "visible";
	for(var i=0;i<this.KC_AvailableKeys.length;i++){
		this.KC_CurrentSet[this.KC_AvailableKeys[i]] = this.KC_Default[this.KC_AvailableKeys[i]][this.KC_setID][0];
		this.KC_ClashTypes[i] = this.KC_Default[this.KC_AvailableKeys[i]][this.KC_setID][1];
	}
	document.getElementsByTagName("button")[2].className = "keyboardButtonActive"; // Preselect v1.82 layout
	document.getElementById("Compatibility").selectedIndex = 2;
	this.compatibility(VKI_ooversion,1);
	this.displaySet(1);
	this.fillHardcoded();
	this.fillListHardcoded();
	return;
};
this.fillListHardcoded = function()
{
	var a = document.getElementById("ListHardcoded");
	var b = Object.keys(this.KC_Hardcoded),c,d,e,f,g,vd,ve,vf,vg;
	e = this.KC_Hardcoded[b[0]];
	d = Math.ceil(e.length/2);
	f = this.KC_Hardcoded[b[1]];
	g = this.KC_Hardcoded[b[2]];
	for(var i=0;i<d;i++){
		c = document.createElement("div");
		vd = e[i];
		if(e.indexOf(vd)===-1) ve = "-"; else ve = "Y";
		if(f.indexOf(vd)===-1) vf = "-"; else vf = "Y";
		if(g.indexOf(vd)===-1) vg = "-"; else vg = "Y";
		c.appendChild(this.addSpan("columnA",vd));
		c.appendChild(this.addSpan("columnB",ve));
		c.appendChild(this.addSpan("columnC",vf));
		c.appendChild(this.addSpan("columnD",vg));
		vd = e[i+d];
		if(vd){
			if(e.indexOf(vd)===-1) ve = "-"; else ve = "Y";
			if(f.indexOf(vd)===-1) vf = "-"; else vf = "Y";
			if(g.indexOf(vd)===-1) vg = "-"; else vg = "Y";
			c.appendChild(this.addSpan("columnA",vd));
			c.appendChild(this.addSpan("columnB",ve));
			c.appendChild(this.addSpan("columnC",vf));
			c.appendChild(this.addSpan("columnD",vg));
		}
		c.appendChild(document.createElement("br"));
		if((i&1)) c.className = "rowB";
		a.appendChild(c);
	}
};
this.addSpan = function(cl,ih)
{
	var a = document.createElement("span");
	a.className = cl;
	a.innerHTML = ih;
	return a;
};
// Fill the compatibility object
this.compatibility = function(what,noupd){
	var w;
	this.KC_Compat = what;
	this.KC_Remap = {};
	for(var i=0;i<this.KC_AvailableKeys.length;i++){
		w = this.KC_Default[this.KC_AvailableKeys[i]];
		if(w[0][1] && !this.cmpVersion(w[0][1],what)) this.KC_Remap[this.KC_AvailableKeys[i]] = 1;
		if(w[0][0] && this.cmpVersion(w[0][0],what)===2) this.KC_Remap[this.KC_AvailableKeys[i]] = 1;
	}
	this.fillHardcoded();
	if(!noupd) this.displaySet(1);
	this.displayDbg();
};
this.cmpVersion = function(strA,strB){
	var x = strA.replace(/[^\d\.]/g,"").split('.'),y = strB.split('.');
	if(!x.length) return(0);
	for(var i=0;i<x.length;i++){
		if(i>y.length-1) return(2);
		if(x[i]>y[i]) return(2);
		if(x[i]<y[i]) return(0);
	}
	return(1);
};
this.fillHardcoded = function(){
	var hard = this.KC_Hardcoded[this.KC_Compat],w,x;
	this.KC_HardcodedIDs = [];
	for(var p=0;p<hard.length;p++){
		w = hard[p];
		x = VKI_layout.Oolite.maps[w];
		this.KC_HardcodedIDs.push(VKI_layout.Oolite.maps[w]);
	}
};
// Change layout
this.showLayout = function(n){
	var prevKT;
	if(VKI_kt!=="Oolite") prevKT = VKI_kt;
	this.KC_setID = n;
	for(var i=0;i<this.KC_AvailableKeys.length;i++){
		this.KC_CurrentSet[this.KC_AvailableKeys[i]] = this.KC_Default[this.KC_AvailableKeys[i]][this.KC_setID][0]; // eg "b"
		this.KC_ClashTypes[i] = this.KC_Default[this.KC_AvailableKeys[i]][this.KC_setID][1];
	}
	this.displaySet(1);
	var e = document.getElementsByTagName("button");
	for(var j=0;j<e.length;j++){
		if(n===j+1) e[j].className = "keyboardButtonActive";
		else e[j].className = "keyboardButton";
	}
	if(prevKT){
		VKI_Remap("Oolite",prevKT,1,0);
		this.fillHardcoded();
	}
	this.displaySet(1);
	this.displayDbg();
	return;
};
this.displayDbg = function(){
	document.getElementById("LayHardcoded").value = this.KC_HardcodedIDs;
	document.getElementById("LayRegs").value = VKI_layout[VKI_kt].regs.toString();
	document.getElementById("LayMaps").value = JSON.stringify(VKI_layout[VKI_kt].maps).split(",").join(",\n");
	document.getElementById("LayVKITitles").value = JSON.stringify(VKI_titles).split(",").join(",\n");
	document.getElementById("LayVKIDeadkey").value = JSON.stringify(VKI_deadkey).split(",").join(",\n");
	document.getElementById("LayCurSet").value = JSON.stringify(this.KC_CurrentSet).split(",").join(",\n");
};
this.buildReg = function(){
	var a = VKI_layout[VKI_kt].keys;
	var out = "", tmp, ex = ["Bksp","Tab","Caps","Enter","Shift"];
	var alpha = "", Beta = "", Num = "", Slash = "";
	var mask = /[\|\+\-\?\.\*\^\$\)\]\}\"\/]|[\{\[\(]/g;
	var maskb = /[\\]/g;
	for(var o=1;o<5;o++){
		for(var i=0;i<a[o].length;i++){
			tmp = a[o][i];
			if(tmp){
				if(ex.indexOf(tmp[0])!==-1 || out.indexOf(tmp[0])!==-1) out += " ";
				else if(RegExp(mask).test(tmp[0])) out += " \\"+tmp[0];
				else if(RegExp(maskb).test(tmp[0])) Slash = "\\\\";
				else if(RegExp(/[A-Z]/).test(tmp[0])) Beta = "A-Z";
				else if(RegExp(/[a-z]/).test(tmp[0])) alpha = "a-z";
				else if(RegExp(/[0-9]/).test(tmp[0])) Num = "0-9";
				else out += " "+tmp[0];
				if(tmp[1] && tmp[1]!==""){
					if(ex.indexOf(tmp[1])!==-1 || out.indexOf(tmp[1])!==-1) out += " ";
					else if(RegExp(mask).test(tmp[1])) out += " \\"+tmp[1];
					else if(RegExp(maskb).test(tmp[1])) Slash = "\\\\";
					else if(RegExp(/[A-Z]/).test(tmp[1])) Beta = "A-Z";
					else if(RegExp(/[a-z]/).test(tmp[1])) alpha = "a-z";
					else if(RegExp(/[0-9]/).test(tmp[1])) Num = "0-9";
					else out += " "+tmp[1];
				}
			}
		}
	}
	out = out.replace(/ /g,"");
	out = "[ "+Slash+alpha+Beta+Num+out+"]";
	document.getElementsByName("LayBuildRegs")[0].value = out;
};
// Display settings
this.displaySet = function(mod){
	VKI_deadkey = {};
	VKI_titles = {};
	this.KC_Duplicates = [];
	for(var i=0;i<this.KC_AvailableKeys.length;i++){
		var t = this.KC_AvailableKeys[i];
		if(!this.KC_CurrentSet[t]) this.KC_CurrentSet[t] = "";
		var test = this.KC_getConv(escape(this.KC_CurrentSet[t]),1);
		document.getElementById(this.KC_AvailableKeys[i]).value = test;
		VKI_deadkey[test] = {test:test};
		var st = "deadkey",stn = 0;
		if(this.KC_Default[this.KC_AvailableKeys[i]][this.KC_setID].length>2){
			stn = this.KC_Default[this.KC_AvailableKeys[i]][this.KC_setID][2];
			st = this.KC_StyleAtt[stn];
		}
		if(!VKI_titles[test]) VKI_titles[test] = [this.KC_AvailableKeys[i],st,stn];
		else {
			VKI_titles[test][0] = VKI_titles[test][0]+", "+this.KC_AvailableKeys[i];
			if(!VKI_titles[test][2] || VKI_titles[test][2]>stn){
				VKI_titles[test][1] = st;
				VKI_titles[test][2] = stn;
			}
		}
		if(!this.KC_Remap[this.KC_AvailableKeys[i]]) this.KC_Duplicates.push(test);
		else this.KC_Duplicates.push("");
	}
	this.KC_MarkDuplicates();
	if(mod) VKI_modify();
	return;
};
// User input, onblur
this.userKey = function(who,str){
	var t;
	if(!str || str===""){
		t = this.KC_CurrentSet[who];
		this.KC_CurrentSet[who] = "";
	} else {
		if(str.search(this.KC_RegKeys)!==-1) this.KC_CurrentSet[who] = str;
		else this.KC_CurrentSet[who][0] = this.KC_Default[who][this.KC_setID][0];
	}
	if(this.KC_CurrentSet[who].length===2 && !VKI_target && this.KC_Twonhas.indexOf(this.KC_CurrentSet[who])===-1) this.KC_CurrentSet[who] = this.KC_Default[who][this.KC_setID][0];
	if(t) this.displaySet(1);
	else this.displaySet();
	this.KC_MarkDuplicates();
	return;
};
// Quick User input, onkeyup. Fails when Alt+number is used.
this.userCheckKey = function(who,str){
	if(str===null) document.getElementById(who).style.backgroundColor = this.KC.c3;
	else {
		if(str.search(this.KC_RegKeys)===-1) document.getElementById(who).style.backgroundColor = this.KC.c4;
		else document.getElementById(who).style.backgroundColor = this.KC.c3;
	}
	return;
};
// Quick check for duplicated values
this.arrHasDupes = function(Arr){
	var i,j,n,r=[];
	n=Arr.length;
	for(i=0;i<n;i++){
		for(j=i+1;j<n;j++){
			if(Arr[i]==="") r.push([i,i]);
			if (Arr[i]==Arr[j]) r.push([i,j]);
		}
	}
	return(r);
};
// Mark conflicts
this.KC_MarkDuplicates = function(){
	var flagV = this.KC_HardcodedIDs,cfa=0,cfb=0,cfc=0;
	for(var b=0;b<this.KC_AvailableKeys.length;b++){
		var clr = document.getElementById(this.KC_AvailableKeys[b]);
		if(this.KC_Remap[this.KC_AvailableKeys[b]]){
			clr.style.backgroundColor = this.KC.c1;
			cfa++;
		} else if(flagV.indexOf(VKI_layout[VKI_kt].maps[clr.value])!==-1){
			clr.style.background = this.KC.c2;
			cfb++;
		} else clr.style.backgroundColor = this.KC.c3;
	}
	var chk = this.arrHasDupes(this.KC_Duplicates);
	if(chk.length){
		var o = chk.length, e = [], d1, d2;
		for(var i=0;i<o;i++){
			d1 = document.getElementById(this.KC_AvailableKeys[chk[i][0]]);
			d2 = document.getElementById(this.KC_AvailableKeys[chk[i][1]]);
			if(this.KC_Remap[this.KC_AvailableKeys[chk[i][0]]] || this.KC_Remap[this.KC_AvailableKeys[chk[i][1]]]) continue;
			if((this.KC_ClashTypes[chk[i][0]]&this.KC_ClashTypes[chk[i][1]])){
				d1.style.backgroundColor = this.KC.c4;
				d2.style.backgroundColor = this.KC.c4;
				e.push(chk[i][0]);
				e.push(chk[i][1]);
				cfc++;
			} else {
				if(this.VKI_isIE){ // indexOf workaround
					var a1=0,a2=0;
					if(e.length){
						for(var te=0;te<e.length;te++){
							if(chk[i][0]===e[te]) a1 = 1;
							if(chk[i][1]===e[te]) a2 = 1;
						}
					}
					if(!a1) d1.style.backgroundColor = this.KC.c5;
					if(!a2) d2.style.backgroundColor = this.KC.c5;
				} else {
					if(!e.length || e.indexOf(chk[i][0])===-1) d1.style.backgroundColor = this.KC.c5;
					if(!e.length || e.indexOf(chk[i][1])===-1) d2.style.backgroundColor = this.KC.c5;
				}
			}
		}
	}
	if(cfb) document.getElementById("cfb").style.backgroundColor = this.KC.c2;
	else document.getElementById("cfb").style.backgroundColor = this.KC.c3;
	if(cfc) document.getElementById("cfc").style.backgroundColor = this.KC.c4;
	else document.getElementById("cfc").style.backgroundColor = this.KC.c3;
	if(cfb || cfc) document.getElementById("cfa").style.color = this.KC.c3;
	else document.getElementById("cfa").style.color = "#000000";
};
// Fill output textarea
this.createOutput = function(){
	var txt = "", head = "", desc, prevKT,b,c,d;
	if(VKI_kt!=="Oolite"){
		prevKT = VKI_kt;
		VKI_Remap(VKI_kt,"Oolite");
	}
	for(var i=0;i<this.KC_AvailableKeys.length;i++){
		var a = this.KC_AvailableKeys[i];
		desc = null;
		if(!this.KC_CurrentSet[a] || this.KC_CurrentSet[a]===""){
			txt += "\t//";
			while(a.length<30) a += " ";
			txt += a + " = \"\";\n";
		} else {
			b = escape(this.KC_CurrentSet[a]);
			c = 0;
			if(typeof(this.KC_CurrentSet[a])==='number'){
				c = 1;
				d = this.KC_getConv(b.toString());
				desc = d[2];
			} else {
				d = this.KC_getConv(b);
				b = d[0];
				c = d[1]; // number flag
				desc = d[2];
			}
			if(this.KC_Remap[a]) txt += "\t//"; // Hardcoded
			else txt += "\t";
			while(a.length<30) a += " ";
			if(!c) txt += a + "= \"" + b + "\";";
			else txt += a + "= " + b + ";";
			if(desc) txt += " // "+desc+"\n";
			else txt += "\n";
		}
	}
	txt += "}\n";
	head = "{ // Generic Keyconfig "+VKI_version+" - for Oolite "+this.KC_Compat;
	if(this.KC_Compat==="1.82") head = head+" (up to 1.88).\n";
	txt = head+txt;
	document.getElementsByName("output")[0].value = txt;
	if(prevKT) VKI_Remap("Oolite",prevKT);
	this.KC_MarkDuplicates();
	return;
};
// Read-in textarea
this.readIn = function(){
	var vKey=false,vValue=false,num,bad=[],emflag=false,cKey,cSet={},f,o,prevKT,c=0,rem;
	var cont=document.getElementsByName("output")[0].value;
	if(cont){
		if(VKI_kt!=="Oolite"){
			prevKT = VKI_kt;
			VKI_Remap(prevKT,"Oolite",1,0);
			displaySet(1);
		}
		cont = cont.replace(/\/\*[\s\S]*?\*\//g,'\n');
		cont = cont.split("\n");
		for(o=0;o<cont.length;o++){
			if(RegExp(/^\s*$/).test(cont[o])) continue; // Strip empty lines
			if(RegExp("//").test(cont[o])){ // Check comments
				f = cont[o].indexOf("//");
				if(f!==-1) cont[o] = cont[o].substr(0,f);
			}
			cont[o] = cont[o].replace(/" ";/g,"32;"); // -> SPC
			cont[o] = cont[o].replace(/";";/g,"59;"); // -> Semicolon
			cont[o] = cont[o].replace(/"=";/g,"61;"); // -> Equals
			cont[o] = cont[o].replace(/[\s;]/g,""); // Strip whitespaces and semicolon
			vKey=false;
			vValue=false;
			emflag=false;
			if(cont[o].search(/[;=]/g)===-1) continue;
			if(cont[o][0]==="{" || cont[o][0]==="/" || cont[o][0]==="}") continue;
			cKey = cont[o].split("=");
			if(cKey.length){
				cKey[0] = cKey[0].replace(/[\s"]/g,"");
				if(cKey.length>1) cKey[1] = cKey[1].replace(/[\s"]/g,"");
				for(var av=0;av<this.KC_AvailableKeys.length;av++){
					if(this.KC_AvailableKeys[av]===cKey[0]){
						vKey = true;
						break;
					}
				}
				if(!vKey){
					bad.push(cKey);
					continue;
				}
				num = parseInt(cKey[1]);
				if(!isNaN(num) && typeof(num)==='number'){
					// see MyOpenGLView.h
					if((num>-1&&num<10) || num===27 || num===32 || (num>240&&num<256) || (num>300&&num<309) || (num>309&&num<320)){
						cKey[1] = num;
						vValue = true;
					} else if(num>33 && num<126){ // Check ASCII values
						cKey[1] = String.fromCharCode(num); // includes Numpad v1.77
						vValue = true;
					} else {
						bad.push(cKey);
						emflag=true;
					}
				} else {
					if(cKey[1].length===1 && cKey[1].search(this.KC_RegKeys)!==-1) vValue = true;
					if(cKey[1].length===2 && cKey[1].search(/[\t\\]/g)!==-1) vValue = true;
					if(!vValue){
						bad.push(""+cKey[0]+" : "+cKey[1]+" : "+cKey[1].length);
						continue;
					}
				}
				if(!emflag){
					cSet[cKey[0]] = this.KC_getConv(escape(cKey[1]),1);
					c++;
				}
			}
		}
		if(bad.length) alert("Invalid input!\n\n"+bad.join("\n")+"\n\n");
		else if(c<51) alert("Incomplete keyconfig.\nMissing keys are marked as empty - output will comment out these keys.\n");
		this.KC_CurrentSet = cSet;
		this.displaySet(1);
		var e = document.getElementsByTagName("button");
		for(var j=0;j<e.length;j++) e[j].className = "keyboardButton";
		//document.getElementsByName("output")[0].value = null;
		if(prevKT) VKI_Remap("Oolite",prevKT,1,0);
		this.displaySet(1);
	}
	this.displayDbg();
	return;
};
this.KC_getConv = function(val, mode){
	var strA="",strB="",numflag=0,desc;
	switch(val){
		case "%21": strA = "!"; strB = "!"; break;
		case "%22": strA = '"'; strB = 34; numflag = 1; desc='"'; break;
		case "%23": strA = "#"; strB = "#"; break;
		case "%24": strA = "$"; strB = "$"; break;
		case "%25": strA = "%"; strB = "%"; break;
		case "%26": strA = "&"; strB = "&"; break;
		case "%27": strA = "'"; strB = "'"; break;
		case "%28": strA = "("; strB = "("; break;
		case "%29": strA = ")"; strB = ")"; break;
		case "%2C": strA = ","; strB = ","; break;
		case "%3A": strA = ":"; strB = ":"; break;
		case "%3B": strA = ";"; strB = ";"; break;
		case "%3C": strA = "<"; strB = "<"; break;
		case "%3D": strA = "="; strB = "="; break;
		case "%3E": strA = ">"; strB = ">"; break;
		case "%3F": strA = "?"; strB = "?"; break;
		case "%5B": strA = "["; strB = "["; break;
		case "%5D": strA = "]"; strB = "]"; break;
		case "%5E": strA = "^"; strB = "^"; break;
		case "%60": strA = "`"; strB = "`"; break;
		case "%7B": strA = "{"; strB = "{"; break;
		case "%7C": strA = "|"; strB = "|"; break;
		case "%7D": strA = "}"; strB = "}"; break;
		case "%5C": strA = "\\"; strB = "\\\\"; break;
		case "%5C%5C": strA = "\\"; strB = "\\\\"; break;
		case "241": strA = "F1"; desc="F1"; break;
		case "242": strA = "F2"; desc="F2"; break;
		case "243": strA = "F3"; desc="F3"; break;
		case "244": strA = "F4"; desc="F4"; break;
		case "245": strA = "F5"; desc="F5"; break;
		case "246": strA = "F6"; desc="F6"; break;
		case "247": strA = "F7"; desc="F7"; break;
		case "248": strA = "F8"; desc="F8"; break;
		case "249": strA = "F9"; desc="F9"; break;
		case "250": strA = "F10"; desc="F10"; break;
		case "251": strA = "F11"; desc="F11"; break;
		case "F1": strA = "F1"; strB = 241; numflag = 1; desc="F1"; break;
		case "F2": strA = "F2"; strB = 242; numflag = 1; desc="F2"; break;
		case "F3": strA = "F3"; strB = 243; numflag = 1; desc="F3"; break;
		case "F4": strA = "F4"; strB = 244; numflag = 1; desc="F4"; break;
		case "F5": strA = "F5"; strB = 245; numflag = 1; desc="F5"; break;
		case "F6": strA = "F6"; strB = 246; numflag = 1; desc="F6"; break;
		case "F7": strA = "F7"; strB = 247; numflag = 1; desc="F7"; break;
		case "F8": strA = "F8"; strB = 248; numflag = 1; desc="F8"; break;
		case "F9": strA = "F9"; strB = 249; numflag = 1; desc="F9"; break;
		case "F10": strA = "F10"; strB = 250; numflag = 1; desc="F10"; break;
		case "F11": strA = "F11"; strB = 251; numflag = 1; desc="F11"; break;
		case "%20": strA = "SPC"; strB = 32; numflag = 1; desc="Space"; break;
		case "32": strA = "SPC"; desc="Space"; break;
		case "SPC": strA = "SPC"; strB = 32; numflag = 1; break;
		case "%09": strA = "Tab"; strB = "\\t"; desc="Tab"; break;
		case "%5Ct": strA = "Tab"; strB = "\\t"; desc="Tab"; break;
		case "Tab": strA = "Tab"; strB = "\\t"; break;
		case "27": strA = "ESC"; desc="ESC"; break;
		case "ESC": strA = "ESC"; strB = 27; numflag = 1; desc="ESC"; break;
		case "252": strA = "CR\u02c3"; desc="Cursor left"; break;
		case "253": strA = "CR\u02c2"; desc="Cursor right"; break;
		case "254": strA = "CR\u02c5"; desc="Cursor up"; break;
		case "255": strA = "CR\u02c4"; desc="Cursor down"; break;
		case "CR%u02C2": strA = "CR\u02c2"; strB = 253; numflag = 1; desc="Cursor left"; break;
		case "CR%u02C3": strA = "CR\u02c3"; strB = 252; numflag = 1; desc="Cursor right"; break;
		case "CR%u02C4": strA = "CR\u02c4"; strB = 255; numflag = 1; desc="Cursor up"; break;
		case "CR%u02C5": strA = "CR\u02c5"; strB = 254; numflag = 1; desc="Cursor down"; break;
		case "%u2196": strA = "\u2196"; strB = 303; numflag = 1; desc="Home"; break;
		case "303": if(VKI_isMac) strA = "\u2196"; else strA = "HOM"; desc="Home"; break;
		case "HOM": if(VKI_isMac) strA = "\u2196"; else strA = "HOM"; strB = 303; numflag = 1; desc="Home"; break;
		case "%u2198": strA = "\u2198"; strB = 304; numflag = 1; desc="End"; break;
		case "304": if(VKI_isMac) strA = "\u2198"; else strA = "END"; desc="End"; break;
		case "END": if(VKI_isMac) strA = "\u2198"; else strA = "END"; strB = 304; numflag = 1; desc="End"; break;
		case "%u21DE": strA = "\u21de"; strB = 307; numflag = 1; desc="Page up"; break;
		case "307": if(VKI_isMac) strA = "\u21de"; else strA = "PU"; desc="Page up"; break;
		case "PU": if(VKI_isMac) strA = "\u21de"; else strA = "PU"; strB = 307; numflag = 1; desc="Page up"; break;
		case "%u21DF": strA = "\u21df"; strB = 308; numflag = 1; desc="Page down"; break;
		case "308": if(VKI_isMac) strA = "\u21df"; else strA = "PD"; desc="Page down"; break;
		case "PD": if(VKI_isMac) strA = "\u21df"; else strA = "PD"; strB = 308; numflag = 1; desc="Page down"; break;
		case "305": strA = "INS"; desc="Insert"; break;
		case "INS": strA = "INS"; strB = 305; numflag = 1; desc="Insert"; break;
		case "306": strA = "DEL"; desc="Delete"; break;
		case "DEL": strA = "DEL"; strB = 306; numflag = 1; desc="Delete"; break;
		case "310": strA = "N0"; break;
		case "311": strA = "N1"; break;
		case "312": strA = "N2"; break;
		case "313": strA = "N3"; break;
		case "314": strA = "N4"; break;
		case "315": strA = "N5"; break;
		case "316": strA = "N6"; break;
		case "317": strA = "N7"; break;
		case "318": strA = "N8"; break;
		case "319": strA = "N9"; break;
		case "N0": strA = "N0"; strB = 310; numflag = 1; desc="Numpad 0"; break;
		case "N1": strA = "N1"; strB = 311; numflag = 1; desc="Numpad 1"; break;
		case "N2": strA = "N2"; strB = 312; numflag = 1; desc="Numpad 2"; break;
		case "N3": strA = "N3"; strB = 313; numflag = 1; desc="Numpad 3"; break;
		case "N4": strA = "N4"; strB = 314; numflag = 1; desc="Numpad 4"; break;
		case "N5": strA = "N5"; strB = 315; numflag = 1; desc="Numpad 5"; break;
		case "N6": strA = "N6"; strB = 316; numflag = 1; desc="Numpad 6"; break;
		case "N7": strA = "N7"; strB = 317; numflag = 1; desc="Numpad 7"; break;
		case "N8": strA = "N8"; strB = 318; numflag = 1; desc="Numpad 8"; break;
		case "N9": strA = "N9"; strB = 319; numflag = 1; desc="Numpad 9"; break;
		case "301": strA = "MBL"; desc="Mouse Button L"; break;
		case "MBL": strA = "MBL"; strB = 301; numflag = 1; desc="Mouse Button L"; break;
		case "302": strA = "MBD"; desc="Mouse Button Dbl"; break;
		case "MBD": strA = "MBD"; strB = 302; numflag = 1; desc="Mouse Button Dbl"; break;
		default: strA = unescape(val); strB = unescape(val);
	}
	if(mode) return(strA);
	return([strB,numflag,desc]);
};
this.JSCheck();
this.displaySet();
})();
