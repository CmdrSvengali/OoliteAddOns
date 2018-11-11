/*
* HTML Virtual Keyboard Interface Script - v1.49
*   Copyright (c) 2011 - GreyWyvern
*
*  - Licenced for free distribution under the BSDL
*    http://www.opensource.org/licenses/bsd-license.php
*
* Add a script-driven keyboard interface to text fields, password
* fields and textareas.
*
* See http://www.greywyvern.com/code/javascript/keyboard for examples
* and usage instructions.
*
* This script is modified to match the needs for the Keyconfiguration!
*/
// jshint bitwise:false
/* global $debug,displaySet,KC_CurrentSet,KC_Default,KC_HardcodedIDs,VKI_kt,VKI_layout,KC_RegKeys,KC_setID,VKI_target,VKI_titles */
var VKI_attach, VKI_close;
(function(){
	var self = this;
	var metas = document.getElementsByTagName("meta");
	for(var i=0;i<metas.length;i++){
		switch(metas[i].name){
			case "KCVersion": this.VKI_version = metas[i].content; break;
			case "KCOOVersion": this.VKI_ooversion = metas[i].content; break;
		}
	}
	this.VKI_showVersion = true;
	this.VKI_target = false;
	this.VKI_shift = this.VKI_shiftlock = false;
	this.VKI_altgr = this.VKI_altgrlock = false;
	this.VKI_dead = false;
	this.VKI_deadBox = true; // Show the dead keys checkbox
	this.VKI_deadkeysOn = true; // Turn dead keys on by default
	this.VKI_colorBox = true; // Allow user to open Legend/Options
	this.VKI_colorkeysOn = true; // Use coloring schemata (if VKI_deadkeysOn)
	this.VKI_colorPreOn = true; // Use coloring for hardcoded keys (if VKI_deadkeysOn)
	this.VKI_numberPad = true; // Allow user to open and close the number pad
	this.VKI_numberPadOn = false; // Show number pad by default
	this.VKI_legendPad = true; // Allow user to open and close the legend
	this.VKI_legendPadOn = false; // Show legend by default
	this.VKI_kts = this.VKI_kt = "Oolite"; // Default keyboard layout, modified
	this.VKI_langAdapt = false; // Use lang attribute of input to select keyboard
	this.VKI_size = 4; // Default keyboard size (1-5)
	this.VKI_sizeAdj = true; // Allow user to adjust keyboard size
	this.VKI_clearPasswords = false; // Clear password fields on focus
	this.VKI_imageURI = "Data/keyboard.png"; // If empty string, use imageless mode
	this.VKI_clickless = 0; // 0 = disabled, > 0 = delay in ms
	this.VKI_activeTab = 0; // Tab moves to next: 1 = element, 2 = keyboard enabled element
	this.VKI_enterSubmit = true; // Submit forms when Enter is pressed
	this.VKI_keyCenter = 3;
	this.VKI_isIElt8 = /*@if(@_jscript_version < 5.8)!@end@*/false;
	this.VKI_isIE6 = /*@if(@_jscript_version == 5.6)!@end@*/false;
	this.VKI_isIE = /*@cc_on!@*/false;
	this.VKI_isWebKit = RegExp("KHTML").test(navigator.userAgent);
	this.VKI_isOpera = RegExp("Opera").test(navigator.userAgent);
	this.VKI_isMoz = (!this.VKI_isWebKit && navigator.product == "Gecko");
	this.VKI_isMac = RegExp("Mac").test(navigator.userAgent);
	if(!this.VKI_isMac && navigator.oscpu) this.VKI_isMac = RegExp("Mac").test(navigator.oscpu);
	if(!this.VKI_isMac && navigator.appVersion) this.VKI_isMac = RegExp("Mac").test(navigator.appVersion);
	this.VKI_isWin = RegExp("Windows").test(navigator.userAgent);

	/* ***** i18n text strings ************************************* */
	this.VKI_i18n = {
		'00': "Display Number Pad",
		'01': "Display virtual keyboard interface",
		'02': "Select keyboard layout",
		'03': "Assigned keys",
		'04': "On",
		'05': "Off",
		'06': "Close the keyboard",
		'07': "Clear",
		'08': "Clear this input",
		'09': "Version",
		'10': "Decrease keyboard size",
		'11': "Increase keyboard size",
		'12': "Display legend and options",
		'13': "Use color-schemata",
		'14': "Mark predefined keys"
	};

	/* ***** Create keyboards ************************************** */
	this.VKI_layout = {};
	// - Lay out each keyboard in rows of sub-arrays.  Each sub-array
	//   represents one key.
	//
	// - Each sub-array consists of two slots described as follows:
	//     example: ["a", "A"]
	//
	//          a) Normal character
	//          A) Character + Shift/Caps
	//
	// - Note that any characters beyond the normal ASCII set should be
	//   entered in escaped Unicode format.  (eg \u00a3 = Pound symbol)
	//   You can find Unicode values for characters here:
	//     http://unicode.org/charts/
	//
	// - All keyboards must use the same number of keys. The key between left Shift and z
	//   (see Oolite keyboard) is a twin for the last non-empty key in the qwerty row.
	//   The Oolite keyboard should be used as template for any other layout.
	//
	var mc = {hom:"HOM",end:"END",pu:"PU",pd:"PD"};
	if(this.VKI_isMac) mc = {hom:"\u2196",end:"\u2198",pu:"\u21de",pd:"\u21df"};
	this.VKI_layout.Oolite = {
		'name': "Oolite",
		'keys': [
			[["ESC","ESC"],["F1","F1"],["F2","F2"],["F3","F3"],["F4","F4"],["F5","F5"],["F6","F6"],["F7","F7"],["F8","F8"],["F9","F9"],["F10","F10"],["F11","F11"],[mc.pu,mc.pu],[mc.pd,mc.pd],["MBL","MBL"],["MBD","MBD"]],
			[["`","~"],["1","!"],["2","@"],["3","#"],["4","$"],["5","%"],["6","^"],["7","&"],["8","*"],["9","("],["0",")"],["-","_"],["=","+"],["Bksp","Bksp"]],
			[["Tab","Tab"],["q","Q"],["w","W"],["e","E"],["r","R"],["t","T"],["y","Y"],["u","U"],["i","I"],["o","O"],["p","P"],["[","{"],["]","}"],["\\","|"],[]],
			[["Caps","Caps"],["a","A"],["s","S"],["d","D"],["f","F"],["g","G"],["h","H"],["j","J"],["k","K"],["l","L"],[";",":"],["'",'"'],["Enter","Enter"]],
			[["Shift","Shift"],["\\","|"],["z","Z"],["x","X"],["c","C"],["v","V"],["b","B"],["n","N"],["m","M"],[",","<"],[".",">"],["/","?"],["Shift","Shift"]],
			[[],[mc.hom,mc.hom],[mc.end,mc.end],["DEL","DEL"],["INS","INS"],["SPC","SPC"],["CR\u02c4","CR\u02c4"],["CR\u02c5","CR\u02c5"],["CR\u02c2","CR\u02c2"],["CR\u02c3","CR\u02c3"],[]]
		],
		'maps': {},
		'lang': ["oo"],
		"regs": /[ a-zA-Z0-9`~!@#\$%\^&\*\(\)-_=\+\[{\]}\|;:'\",<\.>\/?]/g
	};
	this.VKI_layout.French = {
		'name': "French",
		'keys': [
			[["ESC","ESC"],["F1","F1"],["F2","F2"],["F3","F3"],["F4","F4"],["F5","F5"],["F6","F6"],["F7","F7"],["F8","F8"],["F9","F9"],["F10","F10"],["F11","F11"],[mc.pu,mc.pu],[mc.pd,mc.pd],["MBL","MBL"],["MBD","MBD"]],
			[["\u00b2","\u00b3"],["&","1"],["\u00e9","2"],['"',"3"],["'","4"],["(","5"],["-","6"],["\u00e8","7"],["_","8"],["\u00e7","9"],["\u00e0","0"],[")","\u00b0"],["=","+"],["Bksp","Bksp"]],
			[["Tab","Tab"],["a","A"],["z","Z"],["e","E"],["r","R"],["t","T"],["y","Y"],["u","U"],["i","I"],["o","O"],["p","P"],["^","\u00a8"],["$","\u00a3"],["<",">"],[]],
			[["Caps","Caps"],["q","Q"],["s","S"],["d","D"],["f","F"],["g","G"],["h","H"],["j","J"],["k","K"],["l","L"],["m","M"],["\u00f9","%"],["Enter","Enter"]],
			[["Shift","Shift"],["<",">"],["w","W"],["x","X"],["c","C"],["v","V"],["b","B"],["n","N"],[",","?"],[";","."],[":","/"],["!","\u00a7"],["Shift","Shift"]],
			[[],[mc.hom,mc.hom],[mc.end,mc.end],["DEL","DEL"],["INS","INS"],["SPC","SPC"],["CR\u02c4","CR\u02c4"],["CR\u02c5","CR\u02c5"],["CR\u02c2","CR\u02c2"],["CR\u02c3","CR\u02c3"],[]]
		],
		'maps': {},
		'lang': ["fr"],
		"regs": /[ a-zA-Z0-9²³&é\"'\(\-è_çà\)°=\+\^¨\$£<>ù%,\?;\.:\/!§]/g
	};
	this.VKI_layout.German = {
		'name': "German",
		'keys': [
			[["ESC","ESC"],["F1","F1"],["F2","F2"],["F3","F3"],["F4","F4"],["F5","F5"],["F6","F6"],["F7","F7"],["F8","F8"],["F9","F9"],["F10","F10"],["F11","F11"],[mc.pu,mc.pu],[mc.pd,mc.pd],["MBL","MBL"],["MBD","MBD"]],
			[["^","\u00b0"],["1","!"],["2",'"'],["3","§"],["4","$"],["5","%"],["6","&"],["7","/"],["8","("],["9",")"],["0","="],["ß","?"],["´","`"],["Bksp","Bksp"]],
			[["Tab","Tab"],["q","Q"],["w","W"],["e","E"],["r","R"],["t","T"],["z","Z"],["u","U"],["i","I"],["o","O"],["p","P"],["ü","Ü"],["+","*"],["<",">"],[]],
			[["Caps","Caps"],["a","A"],["s","S"],["d","D"],["f","F"],["g","G"],["h","H"],["j","J"],["k","K"],["l","L"],["ö","Ö"],["ä","Ä"],["Enter","Enter"]],
			[["Shift","Shift"],["<",">"],["y","Y"],["x","X"],["c","C"],["v","V"],["b","B"],["n","N"],["m","M"],[",",";"],[".",":"],["-","_"],["Shift","Shift"]],
			[[],[mc.hom,mc.hom],[mc.end,mc.end],["DEL","DEL"],["INS","INS"],["SPC","SPC"],["CR\u02c4","CR\u02c4"],["CR\u02c5","CR\u02c5"],["CR\u02c2","CR\u02c2"],["CR\u02c3","CR\u02c3"],[]]
		],
		'maps': {},
		'lang': ["de"],
		"regs": /[ a-zA-Z0-9\^°!\"§\$%&\/\(\)=ß\?´`üÜ\+*<>öÖäÄ,;\.:\-_]/g
	};
	this.VKI_layout.Italian = {
		'name': "Italian",
		'keys': [
			[["ESC","ESC"],["F1","F1"],["F2","F2"],["F3","F3"],["F4","F4"],["F5","F5"],["F6","F6"],["F7","F7"],["F8","F8"],["F9","F9"],["F10","F10"],["F11","F11"],[mc.pu,mc.pu],[mc.pd,mc.pd],["MBL","MBL"],["MBD","MBD"]],
			[["\\","|"],["1","!"],["2",'"'],["3","\u00a3"],["4","$"],["5","%"],["6","&"],["7","/"],["8","("],["9",")"],["0","="],["'","?"],["\u00ec","^"],["Bksp","Bksp"]],
			[["Tab","Tab"],["q","Q"],["w","W"],["e","E"],["r","R"],["t","T"],["y","Y"],["u","U"],["i","I"],["o","O"],["p","P"],["\u00e8","\u00e9"],["+","*"],["<",">"],[]],
			[["Caps","Caps"],["a","A"],["s","S"],["d","D"],["f","F"],["g","G"],["h","H"],["j","J"],["k","K"],["l","L"],["\u00f2","\u00e7"],["\u00e0","\u00b0"],["Enter","Enter"]],
			[["Shift","Shift"],["<",">"],["z","Z"],["x","X"],["c","C"],["v","V"],["b","B"],["n","N"],["m","M"],[",",";"],[".",":"],["-","_"],["Shift","Shift"]],
			[[],[mc.hom,mc.hom],[mc.end,mc.end],["DEL","DEL"],["INS","INS"],["SPC","SPC"],["CR\u02c4","CR\u02c4"],["CR\u02c5","CR\u02c5"],["CR\u02c2","CR\u02c2"],["CR\u02c3","CR\u02c3"],[]]
		],
		'maps': {},
		'lang': ["it"],
		"regs": /[ \\a-zA-Z0-9\|!\"£\$%&\/\(\)='\?ì\^èéù§<>òçà°,;\.:\-_]/g
	};
	this.VKI_layout.Russian = {
		'name': "Russian",
		'keys': [
			[["ESC","ESC"],["F1","F1"],["F2","F2"],["F3","F3"],["F4","F4"],["F5","F5"],["F6","F6"],["F7","F7"],["F8","F8"],["F9","F9"],["F10","F10"],["F11","F11"],[mc.pu,mc.pu],[mc.pd,mc.pd],["MBL","MBL"],["MBD","MBD"]],
			[["\u0451","\u0401"],["1","!"],["2",'"'],["3","\u2116"],["4",";"],["5","%"],["6",":"],["7","?"],["8","*"],["9","("],["0",")"],["-","_"],["=","+"],["Bksp","Bksp"]],
			[["Tab","Tab"],["\u0439","\u0419"],["\u0446","\u0426"],["\u0443","\u0423"],["\u043A","\u041A"],["\u0435","\u0415"],["\u043D","\u041D"],["\u0433","\u0413"],["\u0448","\u0428"],["\u0449","\u0429"],["\u0437","\u0417"],["\u0445","\u0425"],["\u044A","\u042A"],["/","|"],[]],
			[["Caps","Caps"],["\u0444","\u0424"],["\u044B","\u042B"],["\u0432","\u0412"],["\u0430","\u0410"],["\u043F","\u041F"],["\u0440","\u0420"],["\u043E","\u041E"],["\u043B","\u041B"],["\u0434","\u0414"],["\u0436","\u0416"],["\u044D","\u042D"],["Enter","Enter"]],
			[["Shift","Shift"],["/","|"],["\u044F","\u042F"],["\u0447","\u0427"],["\u0441","\u0421"],["\u043C","\u041C"],["\u0438","\u0418"],["\u0442","\u0422"],["\u044C","\u042C"],["\u0431","\u0411"],["\u044E","\u042E"],[".",","],["Shift","Shift"]],
			[[],[mc.hom,mc.hom],[mc.end,mc.end],["DEL","DEL"],["INS","INS"],["SPC","SPC"],["CR\u02c4","CR\u02c4"],["CR\u02c5","CR\u02c5"],["CR\u02c2","CR\u02c2"],["CR\u02c3","CR\u02c3"],[]]
		],
		'maps': {},
		'lang': ["ru"],
		"regs": /[ 0-9ёЁ!\"№;%:\?\*\(\)-_=\+йЙцЦуУкКеЕнНгГшШщЩзЗхХъЪ\/|фФыЫвВаАпПрРоОлЛдДжЖэЭяЯчЧсСмМиИтТьЬбБюЮ\.,]/g
	};
/*
	this.VKI_layout.UK = {
		'name': "UK",
		'keys': [
			[["ESC","ESC"],["F1","F1"],["F2","F2"],["F3","F3"],["F4","F4"],["F5","F5"],["F6","F6"],["F7","F7"],["F8","F8"],["F9","F9"],["F10","F10"],["F11","F11"],[mc.pu,mc.pu],[mc.pd,mc.pd],["MBL","MBL"],["MBD","MBD"]],
			[["`","\u00ac"],["1","!"],["2",'"'],["3","\u00a3"],["4","$"],["5","%"],["6","^"],["7","&"],["8","*"],["9","("],["0",")"],["-","_"],["=","+"],["Bksp","Bksp"]],
			[["Tab","Tab"],["q","Q"],["w","W"],["e","E"],["r","R"],["t","T"],["y","Y"],["u","U"],["i","I"],["o","O"],["p","P"],["[","{"],["]","}"],["\\","|"],[]],
			[["Caps","Caps"],["a","A"],["s","S"],["d","D"],["f","F"],["g","G"],["h","H"],["j","J"],["k","K"],["l","L"],[";",":"],["'","@"],["Enter","Enter"]],
			[["Shift","Shift"],["\\","|"],["z","Z"],["x","X"],["c","C"],["v","V"],["b","B"],["n","N"],["m","M"],[",","<"],[".",">"],["/","?"],["Shift","Shift"]],
			[[],[mc.hom,mc.hom],[mc.end,mc.end],["DEL","DEL"],["INS","INS"],["SPC","SPC"],["CR\u02c4","CR\u02c4"],["CR\u02c5","CR\u02c5"],["CR\u02c2","CR\u02c2"],["CR\u02c3","CR\u02c3"],[]]
		],
		'maps': {},
		'lang': ["gb"],
		"regs": /[ a-zA-Z0-9`!\"£\$%\^&\*\(\)-_=\+\[{\]}\|;:'@,<\.>\/?]/g
	};
*/
	/* ***** Define Assigned Keys ********************************** */
	this.VKI_deadkey = {};
	this.VKI_deadkey['<'] = {
		'a': "\u00e4"
	};
	this.VKI_titles = {};

	/* ***** Define Symbols **************************************** */
	this.VKI_symbol = {
		'\u00a0':"NB\nSP", '\u200b':"ZW\nSP", '\u200c':"ZW\nNJ", '\u200d':"ZW\nJ", "US1":"US1", "US2":"US2",
		"F1":"F1", "F2":"F2", "F3":"F3", "F4":"F4", "F5":"F5", "F6":"F6", "F7":"F7", "F8":"F8", "F9":"F9", "F10":"F10", "F11":"F11",
		"ESC":"ESC", "HOM":"HOM", "END":"END", "DEL":"DEL", "INS":"INS", "PU":"PU", "PD":"PD", "MBL":"MB\nL", "MBD":"MB\nD",
		"CR\u02c2":"CR\u02c2", "CR\u02c3":"CR\u02c3", "CR\u02c4":"CR\u02c4", "CR\u02c5":"CR\u02c5",
		"N0":"N0", "N1":"N1", "N2":"N2", "N3":"N3", "N4":"N4", "N5":"N5", "N6":"N6", "N7":"N7", "N8":"N8", "N9":"N9"
	};

	/* ***** Layout Number Pad ************************************* */
	this.VKI_numpad = [
		[["N7"], ["N8"], ["N9"]],
		[["N4"], ["N5"], ["N6"]],
		[["N1"], ["N2"], ["N3"]],
		[[], ["N0"], []]
	];

	/* ***** Layout Legend Pad ************************************* */
	this.VKI_legendpad = [
		[["Hardcoded"]],
		[["Steering"]],
		[["Nav"]],
		[["Fight"]],
		[["Speed"]],
		[["Equip"]],
		[["Cargo"]],
		[["Docking"]],
		[["GUI"]],
		[["Misc"]],
		[[""]]
	];
	this.legendPadStyles = [
		"deadkey",
		"deadkeysteering",
		"deadkeynav",
		"deadkeyfight",
		"deadkeyspeed",
		"deadkeyequip",
		"deadkeycargo",
		"deadkeydocking",
		"deadkeygui",
		"deadkeymisc"
	];

	/* ****************************************************************
	* Attach the keyboard to an element
	*/
	VKI_attach = function(elem) {
		if (elem.getAttribute("VKI_attached")) return false;
		if (self.VKI_imageURI) {
			var keybut = document.createElement('img');
			keybut.src = self.VKI_imageURI;
			keybut.alt = self.VKI_i18n['01'];
			keybut.className = "keyboardInputInitiator";
			keybut.title = self.VKI_i18n['01'];
			keybut.elem = elem;
			keybut.onclick = function(e) {
				e = e || event;
				if (e.stopPropagation) e.stopPropagation();
				else e.cancelBubble = true;
				self.VKI_show(this.elem);
			};
			elem.parentNode.insertBefore(keybut, (elem.dir == "rtl") ? elem : elem.nextSibling);
		} else {
			elem.onfocus = function() {
				if (self.VKI_target != this) {
					if (self.VKI_target) self.VKI_close();
					self.VKI_show(this);
				}
			};
			elem.onclick = function() {
				if (!self.VKI_target) self.VKI_show(this);
			};
		}
		elem.setAttribute("VKI_attached", 'true');
		if (self.VKI_isIE) {
			elem.onclick = elem.onselect = elem.onkeyup = function(e) {
				if ((e || event).type != "keyup" || !this.readOnly) this.range = document.selection.createRange();
			};
		}
		VKI_addListener(elem, 'click', function(e) {
			if (self.VKI_target == this) {
				e = e || event;
				if (e.stopPropagation) e.stopPropagation();
				else e.cancelBubble = true;
			}
			return false;
		}, false);
		if (self.VKI_isMoz) elem.addEventListener('blur', function() { this.setAttribute('_scrollTop', this.scrollTop); }, false);
	};

	/* ***** Find tagged input elements ***************** */
	function VKI_buildKeyboardInputs() {
		var inputElems = [
			document.getElementsByTagName('input')
		];
		for (var x = 0, elem; elem = inputElems[x++];)
			for (var y = 0, ex; ex = elem[y++];)
				if (ex.nodeName == "TEXTAREA" || ex.type == "text" || ex.type == "password")
					if (ex.className.indexOf("keyboardInput") > -1) VKI_attach(ex);
		VKI_addListener(document.documentElement, 'click', function(e) { self.VKI_close(); }, false);
	}

	/* ****************************************************************
	* Common mouse event actions
	*
	*/
	function VKI_mouseEvents(elem) {
		if (elem.nodeName == "TD") {
			if (!elem.click) elem.click = function() {
				var evt = this.ownerDocument.createEvent('MouseEvents');
				evt.initMouseEvent('click', true, true, this.ownerDocument.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
				this.dispatchEvent(evt);
			};
			elem.VKI_clickless = 0;
			VKI_addListener(elem, 'dblclick', function() { return false; }, false);
		}
		VKI_addListener(elem, 'mouseover', function() {
			if (this.nodeName == "TD" && self.VKI_clickless) {
				var _self = this;
				clearTimeout(this.VKI_clickless);
				this.VKI_clickless = setTimeout(function() { _self.click(); }, self.VKI_clickless);
			}
			if (self.VKI_isIE) this.className += " hover";
		}, false);
		VKI_addListener(elem, 'mouseout', function() {
			if (this.nodeName == "TD") clearTimeout(this.VKI_clickless);
			if (self.VKI_isIE) this.className = this.className.replace(/ ?(hover|pressed) ?/g, "");
		}, false);
		VKI_addListener(elem, 'mousedown', function() {
			if (this.nodeName == "TD") clearTimeout(this.VKI_clickless);
			if (self.VKI_isIE) this.className += " pressed";
		}, false);
		VKI_addListener(elem, 'mouseup', function() {
			if (this.nodeName == "TD") clearTimeout(this.VKI_clickless);
			if (self.VKI_isIE) this.className = this.className.replace(/ ?pressed ?/g, "");
		}, false);
	}

	/* ***** Build the keyboard interface ************************** */
	this.VKI_keyboard = document.createElement('table');
	this.VKI_keyboard.id = "keyboardInputMaster";
	this.VKI_keyboard.dir = "ltr";
	this.VKI_keyboard.cellSpacing = "0";
	this.VKI_keyboard.reflow = function() {
		this.style.width = "50px";
		this.style.width = "";
	};
	VKI_addListener(this.VKI_keyboard, 'click', function(e) {
		e = e || event;
		if (e.stopPropagation) e.stopPropagation();
		else e.cancelBubble = true;
		return false;
	}, false);

	if (!this.VKI_layout[this.VKI_kt]) return alert('No keyboard named "' + this.VKI_kt + '"');
	this.VKI_langCode = {};
	var thead = document.createElement('thead');
	var tr = document.createElement('tr');
	var th = document.createElement('th');
	th.colSpan = "2";
	var kbSelect = document.createElement('div');
	kbSelect.title = this.VKI_i18n['02'];
	VKI_addListener(kbSelect, 'click', function() {
		var ol = this.getElementsByTagName('ol')[0];
		if (!ol.style.display) {
			ol.style.display = "block";
			var li = ol.getElementsByTagName('li');
			for (var x = 0, scr = 0; x < li.length; x++) {
				if (this.VKI_kt == li[x].firstChild.nodeValue) {
					li[x].className = "selected";
					scr = li[x].offsetTop - li[x].offsetHeight * 2;
				} else li[x].className = "";
			}
			setTimeout(function() { ol.scrollTop = scr; }, 0);
		} else ol.style.display = "";
	}, false);
	kbSelect.appendChild(document.createTextNode(this.VKI_kt));
	kbSelect.appendChild(document.createTextNode(this.VKI_isIElt8 ? " \u2193" : " \u25be"));
	kbSelect.langCount = 0;
	var ol = document.createElement('ol');
	for (var ktype in this.VKI_layout) {
		if (typeof this.VKI_layout[ktype] == "object") {
			if (!this.VKI_layout[ktype].lang) this.VKI_layout[ktype].lang = [];
			for (var x = 0; x < this.VKI_layout[ktype].lang.length; x++)
				this.VKI_langCode[this.VKI_layout[ktype].lang[x].toLowerCase().replace(/-/g, "_")] = ktype;
			var li = document.createElement('li');
			li.title = this.VKI_layout[ktype].name;
			VKI_addListener(li, 'click', function(e) {
				e = e || event;
				if (e.stopPropagation) e.stopPropagation();
				else e.cancelBubble = true;
				this.parentNode.style.display = "";
				var prevKT = self.VKI_kt; // store current layout
				self.VKI_kts = self.VKI_kt = kbSelect.firstChild.nodeValue = this.firstChild.nodeValue;
				self.VKI_buildKeys();
				self.VKI_Remap(prevKT,self.VKI_kt);
				self.VKI_position(true);
			}, false);
			VKI_mouseEvents(li);
			li.appendChild(document.createTextNode(ktype));
			ol.appendChild(li);
			kbSelect.langCount++;
		}
	}
	kbSelect.appendChild(ol);
	if (kbSelect.langCount > 1) th.appendChild(kbSelect);
	this.VKI_langCode.index = [];
	for (var prop in this.VKI_langCode)
		if (prop != "index" && typeof this.VKI_langCode[prop] == "string") this.VKI_langCode.index.push(prop);
	this.VKI_langCode.index.sort();
	this.VKI_langCode.index.reverse();

	var span;
	if (this.VKI_numberPad) {
		span = document.createElement('span');
		span.appendChild(document.createTextNode("#"));
		span.title = this.VKI_i18n['00'];
		VKI_addListener(span, 'click', function() {
			kbNumpad.style.display = (!kbNumpad.style.display) ? "none" : "";
			self.VKI_position(true);
		}, false);
		VKI_mouseEvents(span);
		th.appendChild(span);
	}

	if (this.VKI_legendPad) {
		span = document.createElement('span');
		span.appendChild(document.createTextNode("O"));
		span.title = this.VKI_i18n['12'];
		VKI_addListener(span, 'click', function() {
			kbLegendpad.style.display = (!kbLegendpad.style.display) ? "none" : "";
			self.VKI_position(true);
		}, false);
		VKI_mouseEvents(span);
		th.appendChild(span);
	}

	this.VKI_kbsize = function(e) {
		self.VKI_size = Math.min(5, Math.max(1, self.VKI_size));
		self.VKI_keyboard.className = self.VKI_keyboard.className.replace(/ ?keyboardInputSize\d ?/, "");
		if (self.VKI_size != 2) self.VKI_keyboard.className += " keyboardInputSize" + self.VKI_size;
		self.VKI_position(true);
		if (self.VKI_isOpera) self.VKI_keyboard.reflow();
	};
	if (this.VKI_sizeAdj) {
		var small = document.createElement('small');
		small.title = this.VKI_i18n['10'];
		VKI_addListener(small, 'click', function() {
			--self.VKI_size;
			self.VKI_kbsize();
		}, false);
		VKI_mouseEvents(small);
		small.appendChild(document.createTextNode(this.VKI_isIElt8 ? "\u2193" : "\u21d3"));
		th.appendChild(small);
		var big = document.createElement('big');
		big.title = this.VKI_i18n['11'];
		VKI_addListener(big, 'click', function() {
			++self.VKI_size;
			self.VKI_kbsize();
		}, false);
		VKI_mouseEvents(big);
		big.appendChild(document.createTextNode(this.VKI_isIElt8 ? "\u2191" : "\u21d1"));
		th.appendChild(big);
	}

	span = document.createElement('span');
	span.appendChild(document.createTextNode(this.VKI_i18n['07']));
	span.title = this.VKI_i18n['08'];
	VKI_addListener(span, 'click', function() {
		self.VKI_target.value = "";
		self.VKI_target.focus();
		return false;
	}, false);
	VKI_mouseEvents(span);
	th.appendChild(span);

	var strong = document.createElement('strong');
	strong.appendChild(document.createTextNode('X'));
	strong.title = this.VKI_i18n['06'];
	VKI_addListener(strong, 'click', function() { self.VKI_close(); }, false);
	VKI_mouseEvents(strong);
	th.appendChild(strong);

	tr.appendChild(th);
	thead.appendChild(tr);
	this.VKI_keyboard.appendChild(thead);

	var tbody = document.createElement('tbody');
	tr = document.createElement('tr');
	var td = document.createElement('td');
	var div = document.createElement('div');

	if (this.VKI_deadBox) {
		var label = document.createElement('label');
		var checkbox = document.createElement('input');
		checkbox.type = "checkbox";
		checkbox.title = this.VKI_i18n['03'] + ": " + ((this.VKI_deadkeysOn) ? this.VKI_i18n['04'] : this.VKI_i18n['05']);
		checkbox.defaultChecked = this.VKI_deadkeysOn;
		VKI_addListener(checkbox, 'click', function() {
			this.title = self.VKI_i18n['03'] + ": " + ((this.checked) ? self.VKI_i18n['04'] : self.VKI_i18n['05']);
			self.VKI_modify("");
			return true;
		}, false);
		label.appendChild(checkbox);
		checkbox.checked = this.VKI_deadkeysOn;
		div.appendChild(label);
		this.VKI_deadkeysOn = checkbox;
	} else this.VKI_deadkeysOn.checked = this.VKI_deadkeysOn;

	if (this.VKI_showVersion) {
		var vr = document.createElement('var');
		vr.title = this.VKI_i18n['09'] + " " + this.VKI_version;
		vr.appendChild(document.createTextNode("v" + this.VKI_version));
		div.appendChild(vr);
	}
	td.appendChild(div);
	tr.appendChild(td);

	var kbNumpad = document.createElement('td');
	kbNumpad.id = "keyboardInputNumpad";
	if (!this.VKI_numberPadOn) kbNumpad.style.display = "none";
	var ntable = document.createElement('table');
	ntable.cellSpacing = "0";
	var ntr,ntbody,ntd;
	ntbody = document.createElement('tbody');
	for (var xa = 0; xa < this.VKI_numpad.length; xa++) {
		ntr = document.createElement('tr');
		for (var y = 0; y < this.VKI_numpad[xa].length; y++) {
			ntd = document.createElement('td');
			VKI_addListener(ntd, 'click', VKI_keyClick, false);
			VKI_mouseEvents(ntd);
			ntd.appendChild(document.createTextNode(this.VKI_numpad[xa][y]));
			ntr.appendChild(ntd);
		}
		ntbody.appendChild(ntr);
	}
	ntable.appendChild(ntbody);
	kbNumpad.appendChild(ntable);
	tr.appendChild(kbNumpad);
	tbody.appendChild(tr);

	var kbLegendpad = document.createElement('td');
	kbLegendpad.id = "keyboardInputLegendpad";
	if (!this.VKI_legendPadOn) kbLegendpad.style.display = "none";
	ntable = document.createElement('table');
	ntable.cellSpacing = "0";
	ntbody = document.createElement('tbody');
	for (var x = 0; x < this.VKI_legendpad.length; x++) {
		ntr = document.createElement('tr');
		for (var y = 0; y < this.VKI_legendpad[x].length; y++) {
			ntd = document.createElement('td');
			ntd.className = this.legendPadStyles[x];
			ntd.appendChild(document.createTextNode(this.VKI_legendpad[x][y]));
			ntr.appendChild(ntd);
		}
		ntbody.appendChild(ntr);
	}
	ntable.appendChild(ntbody);
	kbLegendpad.appendChild(ntable);
	tr.appendChild(kbLegendpad);
	tbody.appendChild(tr);

	if (this.VKI_colorBox) {
		var labelb = document.createElement('label');
		var checkboxb = document.createElement('input');
		checkboxb.type = "checkbox";
		checkboxb.title = this.VKI_i18n['13'] + ": " + ((this.VKI_colorkeysOn) ? this.VKI_i18n['04'] : this.VKI_i18n['05']);
		checkboxb.defaultChecked = this.VKI_colorkeysOn;
		VKI_addListener(checkboxb, 'click', function() {
			this.title = self.VKI_i18n['13'] + ": " + ((this.checked) ? self.VKI_i18n['04'] : self.VKI_i18n['05']);
			self.VKI_modify("");
			return true;
		}, false);
		labelb.appendChild(checkboxb);
		checkboxb.checked = this.VKI_colorkeysOn;
		ntd.appendChild(labelb);
		this.VKI_colorkeysOn = checkboxb;

		var labelc = document.createElement('label');
		var checkboxc = document.createElement('input');
		checkboxc.type = "checkbox";
		checkboxc.title = this.VKI_i18n['14'] + ": " + ((this.VKI_colorPreOn) ? this.VKI_i18n['04'] : this.VKI_i18n['05']);
		checkboxc.defaultChecked = this.VKI_colorPreOn.checked;
		VKI_addListener(checkboxc, 'click', function() {
			this.title = self.VKI_i18n['14'] + ": " + ((this.checked) ? self.VKI_i18n['04'] : self.VKI_i18n['05']);
			self.VKI_modify("");
			displaySet(1);
			return true;
		}, false);
		labelc.appendChild(checkboxc);
		checkboxc.checked = this.VKI_colorPreOn;
		ntd.appendChild(labelc);
		this.VKI_colorPreOn = checkboxc;
	} else {
		this.VKI_colorkeysOn.checked = this.VKI_colorkeysOn;
		this.VKI_colorPreOn.checked = this.VKI_colorPreOn;
	}
	this.VKI_keyboard.appendChild(tbody);

	if (this.VKI_isIE6) {
		this.VKI_iframe = document.createElement('iframe');
		this.VKI_iframe.style.position = "absolute";
		this.VKI_iframe.style.border = "0px none";
		this.VKI_iframe.style.filter = "mask()";
		this.VKI_iframe.style.zIndex = "999999";
		this.VKI_iframe.src = this.VKI_imageURI;
	}

	/* ****************************************************************
	* Private table cell attachment function for generic characters
	*
	*/
	function VKI_keyClick() {
		var done = false, character = "\xa0";
		var cur,curclash=0,tidclash;
		if (this.firstChild.nodeName.toLowerCase() != "small") {
			if ((character = this.firstChild.nodeValue) == "\xa0") return false;
		} else character = this.firstChild.getAttribute('char');
		if (self.VKI_deadkeysOn.checked && self.VKI_dead) {
			if (self.VKI_dead != character) {
				if (character != " ") {
					if (self.VKI_deadkey[self.VKI_dead] && self.VKI_deadkey[self.VKI_dead][character]) {
						self.VKI_insert(self.VKI_deadkey[self.VKI_dead][character]);
						done = true;
					}
				} else {
					self.VKI_insert(self.VKI_dead);
					done = true;
				}
			} else done = true;
		} self.VKI_dead = false;
		if (!done) {
			if (self.VKI_deadkeysOn.checked && self.VKI_deadkey[character]) {
				cur = VKI_titles[character][0].split(","); // cur key
				for(var i=0;i<cur.length;i++) curclash |= KC_Default[cur[i].trim()][KC_setID][1];
				tidclash = KC_Default[VKI_target.id][KC_setID][1]; // new key clashtype
				if(!(curclash&tidclash)) self.VKI_insert(character);
				else {
					self.VKI_dead = character;
					this.className += " dead";
				}
			} else self.VKI_insert(character);
		}
		self.VKI_modify("");
		return false;
	}

	/* ****************************************************************
	* Build or rebuild the keyboard keys
	*
	*/
	this.VKI_buildKeys = function() {
		this.VKI_shift = this.VKI_shiftlock = this.VKI_altgr = this.VKI_altgrlock = this.VKI_dead = false;
		var container = this.VKI_keyboard.tBodies[0].getElementsByTagName('div')[0];
		var tables = container.getElementsByTagName('table');
		for (var xa = tables.length - 1; xa >= 0; xa--) container.removeChild(tables[xa]);

		for (var x = 0, hasDeadKey = false, lyt; lyt = this.VKI_layout[this.VKI_kt].keys[x++];) {
			var table = document.createElement('table');
			table.cellSpacing = "0";
			if (lyt.length <= this.VKI_keyCenter) table.className = "keyboardInputCenter";
			var tbody = document.createElement('tbody');
			var tr = document.createElement('tr');
			for (var y = 0, lkey; lkey = lyt[y++];) {
				var td = document.createElement('td');
				if (this.VKI_symbol[lkey[0]]) {
					var text = this.VKI_symbol[lkey[0]].split("\n");
					var small = document.createElement('small');
					small.setAttribute('char', lkey[0]);
					for (var z = 0; z < text.length; z++) {
						if (z) small.appendChild(document.createElement("br"));
						small.appendChild(document.createTextNode(text[z]));
					}
					td.appendChild(small);
				} else td.appendChild(document.createTextNode(lkey[0] || "\xa0"));

				var className = [];
				if (this.VKI_deadkeysOn.checked)
					for (var key in this.VKI_deadkey){
						if (key === lkey[0]) { className.push("deadkey"); break; }
					}
				if (lyt.length > this.VKI_keyCenter && y == lyt.length) className.push("last");
				if (lkey[0] == "SPC" || lkey[1] == "SPC") className.push("space"); // modified
				td.className = className.join(" ");
				// Add key:number and number:key pairs
				var idx = x*100+y,idy=x*100+y+50;
				this.VKI_layout[this.VKI_kt].maps[lkey[0]] = idx;
				this.VKI_layout[this.VKI_kt].maps[idx] = lkey[0];
				this.VKI_layout[this.VKI_kt].maps[lkey[1]] = idy;
				this.VKI_layout[this.VKI_kt].maps[idy] = lkey[1];
				switch (lkey[1]) {
					case "Caps":
					case "Shift":
					case "Alt":
					case "AltGr":
					case "AltLk":
						VKI_addListener(td, 'click', (function(type) { return function() { self.VKI_modify(type); return false; };})(lkey[1]), false);
						break;
					case "Bksp":
						VKI_addListener(td, 'click', function() {
							self.VKI_target.focus();
							if (self.VKI_target.setSelectionRange && !self.VKI_target.readOnly) {
								var rng = [self.VKI_target.selectionStart, self.VKI_target.selectionEnd];
								if (rng[0] < rng[1]) rng[0]++;
								self.VKI_target.value = self.VKI_target.value.substr(0, rng[0] - 1) + self.VKI_target.value.substr(rng[1]);
								self.VKI_target.setSelectionRange(rng[0] - 1, rng[0] - 1);
							} else if (self.VKI_target.createTextRange && !self.VKI_target.readOnly) {
								try {
									self.VKI_target.range.select();
								} catch(e) { self.VKI_target.range = document.selection.createRange(); }
								if (!self.VKI_target.range.text.length) self.VKI_target.range.moveStart('character', -1);
								self.VKI_target.range.text = "";
							} else self.VKI_target.value = self.VKI_target.value.substr(0, self.VKI_target.value.length - 1);
							self.VKI_target.focus();
							return true;
						}, false);
						break;
					case "Enter":
						VKI_addListener(td, 'click', function() {
							if (self.VKI_target.nodeName != "TEXTAREA") {
								if (self.VKI_enterSubmit && self.VKI_target.form) {
									for (var zb = 0, subm = false; zb < self.VKI_target.form.elements.length; zb++)
										if (self.VKI_target.form.elements[zb].type == "submit") subm = true;
									if (!subm) self.VKI_target.form.submit();
								}
								self.VKI_close();
							} else self.VKI_insert("\n");
							return true;
						}, false);
						break;
					default:
						VKI_addListener(td, 'click', VKI_keyClick, false);
				}
				VKI_mouseEvents(td);
				tr.appendChild(td);
				for (var zc = 0; zc < 4; zc++)
					if (this.VKI_deadkey[lkey[zc] = lkey[zc] || ""]) hasDeadKey = true;
			}
			tbody.appendChild(tr);
			table.appendChild(tbody);
			container.appendChild(table);
		}
		// Add Numpad key:number and number:key pairs
		for(var np=0;np<12;np++){
			this.VKI_layout[this.VKI_kt].maps["N"+np] = 701+np;
			this.VKI_layout[this.VKI_kt].maps[701+np] = "N"+np;
		}
		if (this.VKI_deadBox){
			this.VKI_deadkeysOn.style.display = (hasDeadKey) ? "inline" : "none";
		}
		if (this.VKI_isIE6) {
			this.VKI_iframe.style.width = this.VKI_keyboard.offsetWidth + "px";
			this.VKI_iframe.style.height = this.VKI_keyboard.offsetHeight + "px";
		}
		if(this.VKI_modify) this.VKI_modify();
	};

	this.VKI_buildKeys();
	VKI_addListener(this.VKI_keyboard, 'selectstart', function() { return false; }, false);
	this.VKI_keyboard.unselectable = "on";
	if (this.VKI_isOpera) VKI_addListener(this.VKI_keyboard, 'mousedown', function() { return false; }, false);

	/* ****************************************************************
	* Controls modifier keys
	*
	*/
	this.VKI_modify = function(type) {
		switch (type) {
			case "Alt":
			case "AltGr": this.VKI_altgr = !this.VKI_altgr; break;
			case "AltLk": this.VKI_altgr = 0; this.VKI_altgrlock = !this.VKI_altgrlock; break;
			case "Caps": this.VKI_shift = 0; this.VKI_shiftlock = !this.VKI_shiftlock; break;
			case "Shift": this.VKI_shift = !this.VKI_shift; break;
		}
		var vchar = 0;
		if (!this.VKI_shift != !this.VKI_shiftlock) vchar += 1;
		if (!this.VKI_altgr != !this.VKI_altgrlock) vchar += 2;

		var tables = this.VKI_keyboard.tBodies[0].getElementsByTagName('div')[0].getElementsByTagName('table');
		var paH = KC_HardcodedIDs;
		for (var x = 0; x < tables.length; x++) {
			var tds = tables[x].getElementsByTagName('td');
			for (var y = 0; y < tds.length; y++) {
				var className = [], lkey = this.VKI_layout[this.VKI_kt].keys[x][y];
				switch (lkey[1]) {
					case "Alt":
					case "AltGr":
						if (this.VKI_altgr) className.push("pressed");
						break;
					case "AltLk":
						if (this.VKI_altgrlock) className.push("pressed");
						break;
					case "Shift":
						if (this.VKI_shift) className.push("pressed");
						break;
					case "Caps":
						if (this.VKI_shiftlock) className.push("pressed");
						break;
					case "Enter":
					case "Bksp": break;
					default:
						if (type) {
							tds[y].removeChild(tds[y].firstChild);
							if (this.VKI_symbol[lkey[vchar]]) {
								var text = this.VKI_symbol[lkey[vchar]].split("\n");
								var small = document.createElement('small');
								small.setAttribute('char', lkey[vchar]);
								for (var z = 0; z < text.length; z++) {
									if (z) small.appendChild(document.createElement("br"));
									small.appendChild(document.createTextNode(text[z]));
								}
								tds[y].appendChild(small);
							} else tds[y].appendChild(document.createTextNode(lkey[vchar] || "\xa0"));
						}
						if (this.VKI_deadkeysOn.checked) {
							var character = tds[y].firstChild.nodeValue || tds[y].firstChild.className;
							if(tds[y].firstChild.nodeName==="SMALL"){ // modified, special handling for Extras
								character = tds[y].firstChild.firstChild.nodeValue;
								if(tds[y].firstChild.childNodes.length===3) character += tds[y].firstChild.lastChild.nodeValue;
								if(this.VKI_deadkey[character]){
									if(this.VKI_colorPreOn.checked && !this.VKI_titles[character][2]) className.push("deadkey");
									if(this.VKI_colorkeysOn.checked && this.VKI_titles[character][2]){
										className.push(this.VKI_titles[character][1]);
									} else if(!this.VKI_colorkeysOn.checked && this.VKI_titles[character][2]) className.push("deadkey");
								}
							}
							if (this.VKI_dead) {
								if (character == this.VKI_dead) className.push("pressed");
								if (this.VKI_deadkey[this.VKI_dead] && this.VKI_deadkey[this.VKI_dead][character]) className.push("target");
							}
							if (this.VKI_deadkey[character]){
								if(this.VKI_colorPreOn.checked && !this.VKI_titles[character][2]) className.push("deadkey");
								if(this.VKI_colorkeysOn.checked && this.VKI_titles[character][2]){
									className.push(this.VKI_titles[character][1]);
								} else if(!this.VKI_colorkeysOn.checked && this.VKI_titles[character][2]) className.push("deadkey");
								tds[y].setAttribute('title', this.VKI_titles[character][0]); // modified, key names
							} else tds[y].removeAttribute("title", 0);
							if(this.VKI_colorPreOn.checked && paH.indexOf(VKI_layout[VKI_kt].maps[character])!==-1){
								className = ["deadkey"];
								if(tds[y].title) tds[y].title += ",Hardcoded";
								else tds[y].title = "Hardcoded";
							}
						} else tds[y].removeAttribute("title", 0);
				}
				if (y == tds.length - 1 && tds.length > this.VKI_keyCenter) className.push("last");
				if (lkey[0] == "SPC" || lkey[1] == "SPC") className.push("space"); // modified
				tds[y].className = className.join(" ");
			}
		}
		// Numpad colors
		var paE,paT;
		var pa = this.VKI_keyboard.tBodies[0].getElementsByTagName('tr')[0].getElementsByTagName("td").keyboardInputNumpad.getElementsByTagName("td");
		for(var paddy=0;paddy<12;paddy++){
			paE = pa[paddy];
			paT = this.VKI_titles[paE.textContent];
			if(this.VKI_deadkeysOn.checked){
				if(paT && paE.textContent !== ""){
					if(!this.VKI_colorkeysOn.checked) paE.className = "deadkey";
					else paE.className = this.VKI_titles[paE.textContent][1];
					paE.title = this.VKI_titles[paE.textContent][0];
				} else paE.className = "";
				if(this.VKI_colorPreOn.checked && paH.indexOf(paE.textContent)!==-1){
					paE.className = "deadkey";
				}
			} else paE.className = "";
		}
	};

	/* ****************************************************************
	* Remap
	*
	*/
	this.VKI_Remap = function(from,to,noupd,usew) {
	var q1=VKI_layout[from].maps,
			w1=VKI_layout[to].maps,
			q2,q3,q4,q5,
			w2,
			cset = {};
		for(var p in q1){
			// p = "212" - ß
			if(!p || p==='undefined') continue;
			if(p.length===3 && !isNaN(parseInt(p))){
				q2 = q1[p]; // eg "-"
				if(!q2 || q2==='undefined') continue;
				w2 = w1[p]; // eg "ß"
				if(usew) q3 = VKI_titles[w2]; //eg [ "key_hud_toggle", "deadkeymisc", 9 ]
				else q3 = VKI_titles[q2]; //eg [ "key_hud_toggle", "deadkeymisc", 9 ]
				if(!q3) continue;
				q4 = q3[0].split(","); // eg [ "key_hud_toggle" ]
				for(var i=0;i<q4.length;i++){
					q5 = q4[i].trim();
					if(q4==="Hardcoded") continue;
					cset[q5] = w2;
				}
			}
		}
		KC_RegKeys = VKI_layout[to].regs;
		KC_CurrentSet = cset;
		if(!noupd) displaySet(1);
	};
	/* ****************************************************************
	* Insert text at the cursor
	*
	*/
	this.VKI_insert = function(text) {
		this.VKI_target.focus();
		this.KC_CurrentSet[this.VKI_target.id] = text; // modified
		if (this.VKI_target.maxLength) this.VKI_target.maxlength = this.VKI_target.maxLength;
		if (typeof this.VKI_target.maxlength == "undefined" || this.VKI_target.maxlength < 0 || this.VKI_target.value.length < this.VKI_target.maxlength) {
			if (this.VKI_target.setSelectionRange && !this.VKI_target.readOnly && !this.VKI_isIE) {
				var rng = [this.VKI_target.selectionStart, this.VKI_target.selectionEnd];
				this.VKI_target.value = this.VKI_target.value.substr(0, rng[0]) + text + this.VKI_target.value.substr(rng[1]);
				if (text == "\n" && this.VKI_isOpera) rng[0]++;
				this.VKI_target.setSelectionRange(rng[0] + text.length, rng[0] + text.length);
			} else if (this.VKI_target.createTextRange && !this.VKI_target.readOnly) {
				try {
					this.VKI_target.range.select();
				} catch(e) { this.VKI_target.range = document.selection.createRange(); }
				this.VKI_target.range.text = text;
				this.VKI_target.range.collapse(true);
				this.VKI_target.range.select();
			} else this.VKI_target.value += text;
			if (this.VKI_shift) this.VKI_modify("Shift");
			if (this.VKI_altgr) this.VKI_modify("AltGr");
			this.VKI_target.focus();
		} else if (this.VKI_target.createTextRange && this.VKI_target.range)
			this.VKI_target.range.select();
		this.displaySet(); // modified
	};

	/* ****************************************************************
	* Show the keyboard interface
	*
	*/
	this.VKI_show = function(elem) {
		if (!this.VKI_target) {
			this.VKI_target = elem;
			elem.style.borderBottom = "2px solid #c4baed"; // active input
			elem.style.borderRight = "2px solid #c4baed";
			if (this.VKI_langAdapt && this.VKI_target.lang) {
				var chg = false, lang = this.VKI_target.lang.toLowerCase().replace(/-/g, "_");
				for (var x = 0; !chg && x < this.VKI_langCode.index.length; x++)
					if (lang.indexOf(this.VKI_langCode.index[x]) == 0)
						chg = kbSelect.firstChild.nodeValue = this.VKI_kt = this.VKI_langCode[this.VKI_langCode.index[x]];
				if (chg) this.VKI_buildKeys();
			}
			if (this.VKI_isIE) {
				if (!this.VKI_target.range) {
					this.VKI_target.range = this.VKI_target.createTextRange();
					this.VKI_target.range.moveStart('character', this.VKI_target.value.length);
				}
				this.VKI_target.range.select();
			}
			try { this.VKI_keyboard.parentNode.removeChild(this.VKI_keyboard); } catch (e) {}
			if (this.VKI_clearPasswords && this.VKI_target.type == "password") this.VKI_target.value = "";

			var ele = this.VKI_target;
			this.VKI_target.keyboardPosition = "absolute";
			do {
				if (VKI_getStyle(ele, "position") == "fixed") {
					this.VKI_target.keyboardPosition = "fixed";
					break;
				}
			} while (ele = ele.offsetParent);

			if (this.VKI_isIE6) document.body.appendChild(this.VKI_iframe);
			document.body.appendChild(this.VKI_keyboard);
			this.VKI_keyboard.style.position = this.VKI_target.keyboardPosition;
			if (this.VKI_isOpera) this.VKI_keyboard.reflow();

			this.VKI_position(true);
			if (self.VKI_isMoz || self.VKI_isWebKit) this.VKI_position(true);
			this.VKI_target.blur();
			this.VKI_target.focus();
		} else this.VKI_close();
		if($debug) document.getElementById("debug").style.visibility = "visible";
	};

	/* ****************************************************************
	* Position the keyboard
	*
	*/
	this.VKI_position = function(force) {
		if (self.VKI_target) {
			var kPos = VKI_findPos(self.VKI_keyboard), wDim = VKI_innerDimensions(), sDis = VKI_scrollDist();
			var place = false, fudge = self.VKI_target.offsetHeight + 3;
			if (force !== true) {
				if (kPos[1] + self.VKI_keyboard.offsetHeight - sDis[1] - wDim[1] > 0) {
					place = true;
					fudge = -self.VKI_keyboard.offsetHeight - 3;
				} else if (kPos[1] - sDis[1] < 0) place = true;
			}
			if (place || force === true) {
				var iPos = VKI_findPos(self.VKI_target), scr = self.VKI_target;
				while (scr = scr.parentNode) {
					if (scr == document.body) break;
					if (scr.scrollHeight > scr.offsetHeight || scr.scrollWidth > scr.offsetWidth) {
						if (!scr.getAttribute("VKI_scrollListener")) {
							scr.setAttribute("VKI_scrollListener", true);
							VKI_addListener(scr, 'scroll', function() { self.VKI_position(true); }, false);
						} // Check if the input is in view
						var pPos = VKI_findPos(scr), oTop = iPos[1] - pPos[1], oLeft = iPos[0] - pPos[0];
						var top = oTop + self.VKI_target.offsetHeight;
						var left = oLeft + self.VKI_target.offsetWidth;
						var bottom = scr.offsetHeight - oTop - self.VKI_target.offsetHeight;
						var right = scr.offsetWidth - oLeft - self.VKI_target.offsetWidth;
						self.VKI_keyboard.style.display = (top < 0 || left < 0 || bottom < 0 || right < 0) ? "none" : "";
						if (self.VKI_isIE6) self.VKI_iframe.style.display = (top < 0 || left < 0 || bottom < 0 || right < 0) ? "none" : "";
					}
				}
				self.VKI_keyboard.style.top = iPos[1] - ((self.VKI_target.keyboardPosition == "fixed" && !self.VKI_isIE && !self.VKI_isMoz) ? sDis[1] : 0) + fudge + "px";
				self.VKI_keyboard.style.left = Math.max(10, Math.min(wDim[0] - self.VKI_keyboard.offsetWidth - 25, iPos[0])) + "px";
				if (self.VKI_isIE6) {
					self.VKI_iframe.style.width = self.VKI_keyboard.offsetWidth + "px";
					self.VKI_iframe.style.height = self.VKI_keyboard.offsetHeight + "px";
					self.VKI_iframe.style.top = self.VKI_keyboard.style.top;
					self.VKI_iframe.style.left = self.VKI_keyboard.style.left;
				}
			}
			if (force === true) self.VKI_position();
		}
	};

	/* ****************************************************************
	* Close the keyboard interface
	*
	*/
	this.VKI_close = VKI_close = function() {
		if (this.VKI_target) {
			this.VKI_target.style.border = "";
			try {
				this.VKI_keyboard.parentNode.removeChild(this.VKI_keyboard);
				if (this.VKI_isIE6) this.VKI_iframe.parentNode.removeChild(this.VKI_iframe);
			} catch (e) {}
			if (this.VKI_kt != this.VKI_kts) {
				kbSelect.firstChild.nodeValue = this.VKI_kt = this.VKI_kts;
				this.VKI_buildKeys();
			}
			kbSelect.getElementsByTagName('ol')[0].style.display = "";
			this.VKI_target.focus();
			if (this.VKI_isIE) {
				setTimeout(function() { self.VKI_target = false; }, 0);
			} else this.VKI_target = false;
		}
	};

	/* ***** Private functions *************************************** */
	function VKI_addListener(elem, type, func, cap) {
		if (elem.addEventListener) {
			elem.addEventListener(type, function(e) { func.call(elem, e); }, cap);
		} else if (elem.attachEvent)
			elem.attachEvent('on' + type, function() { func.call(elem); });
	}

	function VKI_findPos(obj) {
		var curleft = 0, curtop = 0, scr = obj;
		while ((scr = scr.parentNode) && scr != document.body) {
			curleft -= scr.scrollLeft || 0;
			curtop -= scr.scrollTop || 0;
		}
		do {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		} while (obj = obj.offsetParent);
		return [curleft, curtop];
	}

	function VKI_innerDimensions() {
		if (self.innerHeight) {
			return [self.innerWidth, self.innerHeight];
		} else if (document.documentElement && document.documentElement.clientHeight) {
			return [document.documentElement.clientWidth, document.documentElement.clientHeight];
		} else if (document.body)
			return [document.body.clientWidth, document.body.clientHeight];
		return [0, 0];
	}

	function VKI_scrollDist() {
		var html = document.getElementsByTagName('html')[0];
		if (html.scrollTop && document.documentElement.scrollTop) {
			return [html.scrollLeft, html.scrollTop];
		} else if (html.scrollTop || document.documentElement.scrollTop) {
			return [html.scrollLeft + document.documentElement.scrollLeft, html.scrollTop + document.documentElement.scrollTop];
		} else if (document.body.scrollTop)
			return [document.body.scrollLeft, document.body.scrollTop];
		return [0, 0];
	}

	function VKI_getStyle(obj, styleProp) {
		var y;
		if (obj.currentStyle) {
			y = obj.currentStyle[styleProp];
		} else if (window.getComputedStyle)
			y = window.getComputedStyle(obj, null)[styleProp];
		return y;
	}

	VKI_addListener(window, 'resize', this.VKI_position, false);
	VKI_addListener(window, 'scroll', this.VKI_position, false);
	this.VKI_kbsize();
	VKI_addListener(window, 'load', VKI_buildKeyboardInputs, false);
})();
