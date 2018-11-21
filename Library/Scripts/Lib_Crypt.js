/* jshint bitwise:false, forin:false */
/* global log */
/* (C) Svengali 2016-2018, License CC-by-nc-sa-4.0 */
(function(){
"use strict";
this.name = "Lib_Crypt";

this.startUp = function(){
	var c, crcTable = [];
	for(var n=0;n<256;n++){
		c = n;
		for(var k=0;k<8;k++) c = ((c&1)?(0xEDB88320^(c>>>1)):(c>>>1));
		crcTable[n] = c;
	}
	this.$CRCTable = crcTable;
};

/** _crc32() - Simple CRC with lookup table.
* @str - String.
* @return CRC
*/
this._crc32 = function(str){
	var crc = 0 ^ (-1);
	for(var i=0;i<str.length;i++){
		crc = (crc>>>8)^this.$CRCTable[(crc^str.charCodeAt(i))&0xFF];
	}
	return (crc^(-1))>>>0;
};

/** _decrypt() - Decrypts string.
	@str - String. Minimum length 6 chars.
	@pwd - String. Password. Minimum length 4 chars.
	@return - String/Boolean. String or false.
	Author: Terry Yuen.
*/
this._decrypt = function(str,pwd){
	if(!str || !pwd || str.length<6 || pwd.length<4){log(this.name,"Parameters error."); return false;}
	var prand = "";
	for(var i=0;i<pwd.length;i++) prand += pwd.charCodeAt(i).toString();
	var sPos = Math.floor(prand.length/5);
	var mult = parseInt(prand.charAt(sPos)+prand.charAt(sPos*2)+prand.charAt(sPos*3)+prand.charAt(sPos*4)+prand.charAt(sPos*5),null);
	var incr = Math.round(pwd.length/2);
	var modu = Math.pow(2,31)-1;
	var salt = parseInt(str.substring(str.length-8,str.length),16);
	str = str.substring(0,str.length-8);
	prand += salt;
	while(prand.length>10) prand = (parseInt(prand.substring(0,10),null)+parseInt(prand.substring(10,prand.length),null)).toString();
	prand = (mult*prand+incr)%modu;
	var enc_chr = "",dec_str = "";
	for(var j=0;j<str.length;j+=2){
		enc_chr = parseInt(parseInt(str.substring(j,j+2),16)^Math.floor((prand/modu)*255),null);
		dec_str += String.fromCharCode(enc_chr);
		prand = (mult*prand+incr)%modu;
	}
	return dec_str;
};

/** _encrypt() - Encrypts string.
	@str - String. Minimum length 6 chars.
	@pwd - String. Password. Minimum length 4 chars.
	@return - String/Boolean. String or false.
	Author: Terry Yuen.
*/
this._encrypt = function(str,pwd){
	if(!str || !pwd || str.length<6 || pwd.length<4){log(this.name,"Parameters error in encrypt."); return false;}
	var prand = "";
	for(var i=0;i<pwd.length;i++) prand += pwd.charCodeAt(i).toString();
	var sPos = Math.floor(prand.length/5);
	var mult = parseInt(prand.charAt(sPos)+prand.charAt(sPos*2)+prand.charAt(sPos*3)+prand.charAt(sPos*4)+prand.charAt(sPos*5),null);
	var incr = Math.ceil(pwd.length/2);
	var modu = Math.pow(2,31)-1;
	if(mult<2){log(this.name,"Algorithm cannot find a suitable hash."); return false;}
	var salt = Math.round(Math.random()*1000000000)%100000000;
	prand += salt;
	while(prand.length>10) prand = (parseInt(prand.substring(0,10),null)+parseInt(prand.substring(10,prand.length),null)).toString();
	prand = (mult*prand+incr)%modu;
	var enc_chr = "",enc_str = "";
	for(var j=0;j<str.length;j++){
		enc_chr = parseInt(str.charCodeAt(j)^Math.floor((prand/modu)*255),null);
		if(enc_chr<16) enc_str += "0"+enc_chr.toString(16);
		else enc_str += enc_chr.toString(16);
		prand = (mult*prand+incr)%modu;
	}
	salt = salt.toString(16);
	while(salt.length<8) salt = "0"+salt;
	enc_str += salt;
	return enc_str;
};

/** _getCRC() - Returns simple checksum. Limits every char via &0xff and result via &0x3fff.
*/
this._getCRC = function(str){
	var crc = 0, i = str.length;
	while(i--) crc += (str.charCodeAt(i)&0xff);
	return crc&0x3fff;
};

/** _rot5() - Number rotation. Can be paired with _rot13.
*/
this._rot5 = function(str){
	return (str+'').replace(/[0-9]/g,function(s){return String.fromCharCode(s.charCodeAt(0)+(s<'5'?5:-5));});
};

/** _rot13() - Alphabet rotation. Can be paired with _rot5.
*/
this._rot13 = function(str){
	return (str+'').replace(/[a-z]/gi,function(s){return String.fromCharCode(s.charCodeAt(0)+(s.toLowerCase()<'n'?13:-13));});
};

/** _rot513 - Combined rot5 and rot13.
*/
this._rot513 = function(str){
	var a = this._rot5(str),b = this._rot13(a);
	return b;
};

/** _rot47() - Expanded rotation.
*/
this._rot47 = function(a,b){return++b?String.fromCharCode((a=a.charCodeAt()+47,a>126?a-94:a)):a.replace(/[^ ]/g,this._rot47);};

/** _Vigenere
* input   String.
* key     String. Alphabetical key.
* forward Bool. Set to true for decryption.
* $return String.
*/
this._Vigenere = function(input, key, forward){
	var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
		adjusted_key = "", i, key_char, output = "", key_index = 0, in_tag = false;
	if(key===null) key = "";
	key = key.toUpperCase();
	var key_len = key.length;
	for(i=0;i<key_len;i++){
		key_char = alphabet.indexOf(key.charAt(i));
		if(key_char<0) continue;
		adjusted_key += alphabet.charAt(key_char);
	}
	key = adjusted_key;
	key_len = key.length;
	if (key_len===0){
		key = "a";
		key_len = 1;
	}
	var input_len = input.length;
	for(i=0;i< input_len;i++){
		var input_char = input.charAt(i);
		if(input_char==="<") in_tag = true;
		else if(input_char===">") in_tag = false;
		if(in_tag){
			output += input_char;
			continue;
		}
		var input_char_value = alphabet.indexOf(input_char);
		if(input_char_value<0){
			output += input_char;
			continue;
		}
		var lowercase = input_char_value >= 26 ? true : false;
		if(forward) input_char_value += alphabet.indexOf(key.charAt(key_index));
		else input_char_value -= alphabet.indexOf(key.charAt(key_index));
		input_char_value += 26;
		if(lowercase) input_char_value = input_char_value % 26 + 26;
		else input_char_value %= 26;
		output += alphabet.charAt(input_char_value);
		key_index = (key_index + 1) % key_len;
	}
	return output;
};
}).call(this);
