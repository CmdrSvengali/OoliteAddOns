"use strict";
this.name = "lib_shield";

this.$fcb;
this.$parent;

this.effectSpawned = function(){
	this.$fcb = addFrameCallback(this._updatePosition.bind(this));
};
this.effectRemoved = function(){
	removeFrameCallback(this.$fcb);
};
this._updatePosition = function(){
	if(!this.$parent) return;
	if(player.ship.position){
		this.visualEffect.position = this.$parent.position.subtract(this.$parent.vectorForward.multiply(-120));
		this.visualEffect.position = this.visualEffect.position.add(this.$parent.position.subtract(player.ship.position).direction().multiply(3));
	} else removeFrameCallback(this.$fcb);
};
