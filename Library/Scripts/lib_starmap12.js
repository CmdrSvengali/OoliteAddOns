/* global addFrameCallback,player,removeFrameCallback,Vector3D */
/* (C) Svengali 2016-2018, License CC-by-nc-sa-4.0 */
(function(){
"use strict";
this.name = "lib_starmap12";

this.$upd = [];
this.$c = 0;
this.$pos = null;
this.$pmag = 0;
this.$ps = player.ship;
this.$defs = null;
this.$mul = 0.00015;
this.$hide = true;
this.$PSC = 0;
this.effectSpawned = function(){
	this.$fcb = addFrameCallback(this._repos.bind(this));
};
this.effectRemoved = function(){
	removeFrameCallback(this.$fcb);
};
this._repos = function(){
	if(!this.$ps.isValid || !this.$ps.isInSpace){
		this.visualEffect.remove();
		return;
	}
	if(!this.$defs || (!this.visualEffect.shaderFloat1 && !this.$hide)) return;
	else {
		var ul = this.$upd.length;
		this.visualEffect.position = this.$ps.position.add(this.$ps.vectorForward.multiply(400)).add(this.$ps.vectorUp.multiply(80)).add(this.$ps.vectorRight.multiply(80));
		switch(this.$c){
			case 0: if(ul) this._updatePos(this.$upd[0]); break;
			case 1: if(ul>1) this._updatePos(this.$upd[1]); break;
			case 2: if(ul>2) this._updatePos(this.$upd[2]); break;
			case 3: if(ul>3) this._updatePos(this.$upd[3]); break;
			case 4: if(ul>4) this._updatePos(this.$upd[4]); break;
			case 5: if(ul>5) this._updatePos(this.$upd[5]); break;
			case 6: if(ul>6) this._updatePos(this.$upd[6]); break;
			case 7: if(ul>7) this._updatePos(this.$upd[7]); break;
			case 8: if(ul>8) this._updatePos(this.$upd[8]); break;
			case 9: if(ul>9) this._updatePos(this.$upd[9]); break;
			case 10: if(ul>10) this._updatePos(this.$upd[10]); break;
			case 11: if(ul>11) this._updatePos(this.$upd[11]); break;
		}
		this.$c++;
		this.$c %= 12;
	}
};
this._updatePos = function(obj){
	if(!obj.ent) return;
	if(!obj.ent.isValid || !obj.ent.isInSpace){
		this.visualEffect.subEntities[obj.sub].shaderVector1 = [0,0,1];
		obj.ent = null;
	} else {
		this.$pos = obj.ent.position;
		this.$pmag = this.$pos.magnitude();
		if(this.$PSC){
			if(this.$pmag>1199998.8) this.$pos = Vector3D.interpolate(this.$ps.position,this.$pos,1199998.8/this.$pmag);
			this.visualEffect.subEntities[obj.sub].position = this.$pos.subtract(this.$ps.position).multiply(this.$mul);
		} else {
			if(this.$pmag>1199998.8) this.$pos = Vector3D.interpolate(this.$defs,this.$pos,1199998.8/this.$pmag);
			this.visualEffect.subEntities[obj.sub].position = this.$pos.subtract(this.$defs).multiply(this.$mul);
		}
	}
};
}).call(this);
