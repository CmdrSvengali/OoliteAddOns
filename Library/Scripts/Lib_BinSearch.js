/* jshint bitwise:false, forin:false */
/* global _lib_BinSearch */
/* (C) Svengali 2016-2018, License CC-by-nc-sa-4.0 */
(function(){
"use strict";
this.name = "Lib_BinSearch";

/** This search tree uses two corresponding entries.
*	Must be instantiated! 
*	this.$myTree = new worldScripts.Lib_BinSearch._lib_BinSearch();
*/
this._lib_BinSearch = function(){this._lbs = null;};
_lib_BinSearch.prototype = {
	constructor: _lib_BinSearch,

	/** add() - Adds nodes to the search tree with the corresponding entry.
	@key - String. Add node with key.
	@val - Object. Corresponding entry
	*/
	add: function(key,val){
		var node = {key: key,left: null,right: null, val: val},cur;
		if(this._lbs === null) this._lbs = node;
		else {
			cur = this._lbs;
			while(true){
				if(key < cur.key){
					if(cur.left === null){
						cur.left = node;
						break;
					} else cur = cur.left;
				} else if(key > cur.key){
					if(cur.right === null){
						cur.right = node;
						break;
					} else cur = cur.right;
				} else break;
			}
		}
		return;
	},

	/** contains() - Returns corresponing entry or false.
	@key - String. Search for entry.
	@return - Object. Corresponding entry or false.
	*/
	contains: function(key){
		var found = false,cur = this._lbs;
		while(!found && cur){
			if(key < cur.key) cur = cur.left;
			else if(key > cur.key) cur = cur.right;
			else found = true;
		}
		if(!found) return false;
		return cur.val;
	},

	traverse: function(process){
		function inOrder(node){
			if(node){
				if(node.left !== null) inOrder(node.left);
				process.call(this,node);
				if(node.right !== null) inOrder(node.right);
			}
		}
		inOrder(this._lbs);
	},

	/** size() - Returns the number of nodes in the search tree.
	@return - Number. Number of nodes.
	*/
	size: function(){
		var length = 0;
		this.traverse(function(node){length++;});
		return length;
	},

	/** toArray() - Returns an array containing all nodes in the search tree. The nodes are processed in-order.
	@return - Array. Entries.
	*/
	toArray: function(){
		var result = [];
		this.traverse(function(node){result.push(node.key,node.val);});
		return result;
	},

	/** toString() - Returns a comma-separated string consisting of all entries. The nodes are processed in-order.
	@separator - String. Optional. If specified separates the elements.
	@return - String. Concatenation of all entries.
	*/
	toString: function(separator){
		if(separator) return this.toArray().join(separator);
		else return this.toArray().toString();
	}
};
}).call(this);
