/* global addFrameCallback,player,removeFrameCallback */
/* (C) Svengali 2016-2018, License CC-by-nc-sa-4.0 */
(function(){
"use strict";
this.name = "lib_fx";

this.$time = 0;
// Set on spawning
this.$repos = 250; 
this.$reposTil = 0;
this.$ridTime = 4;
this.$look = 0;
this.$view = 0;
this.$offset = 0;
this.$glare = player.ship.sunGlareFilter;
player.ship.sunGlareFilter = 1;

this.effectSpawned = function(){
	this.$fcb = addFrameCallback(this._repos.bind(this));
};
this.effectRemoved = function(){
	removeFrameCallback(this.$fcb);
};
this._repos = function(delta){
	var ps = player.ship,vF=ps.vectorForward,lv,v,pos,npos,sgf;
	if(!ps.isValid || this.$time>this.$ridTime){
		this.visualEffect.remove();
		return;
	}
	this.$time += delta;
	if(!delta) return;
	if(this.$glare<1 && this.$time>this.$reposTil-1){
		if(ps.sunGlareFilter-delta>this.$glare) ps.sunGlareFilter -= delta;
		else ps.sunGlareFilter = this.$glare;
	}
	if(this.$reposTil && this.$time>this.$reposTil) this.$repos = 0;
	if(this.$repos){
		if(this.$view){
			switch(ps.viewDirection){
				case "VIEW_AFT": pos = ps.position.add(ps.viewPositionAft); break;
				case "VIEW_PORT": pos = ps.position.add(ps.viewPositionPort); break;
				case "VIEW_STARBOARD": pos = ps.position.add(ps.viewPositionStarboard); break;
				case "VIEW_FORWARD": pos = ps.position.add(ps.viewPositionForward); break;
				default: pos = ps.position;
			}
			pos = pos.add(vF.multiply(this.$repos));
		} else pos = ps.position.add(vF.multiply(this.$repos)).add(ps.vectorUp.multiply(this.$offset));
		this.visualEffect.position = pos;
		this.visualEffect.orientation = ps.orientation;
		if(this.$look){
			switch(ps.viewDirection){
				case "VIEW_AFT": lv = [0,0,-1.07]; break;
				case "VIEW_PORT": lv = [-3,0,1.4]; break;
				case "VIEW_STARBOARD": lv = [3,0,1.4]; break;
				case "VIEW_FORWARD": lv = [0,0,1.4]; break;
				default: lv = [0,0,1.4];
			}
			this.visualEffect.shaderVector2 = lv;
		}
	}
};
}).call(this);
