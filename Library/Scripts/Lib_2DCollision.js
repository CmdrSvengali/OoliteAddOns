/* jshint bitwise:false, forin:false */
/* (C) Svengali 2016-2018, License CC-by-nc-sa-4.0 */
(function(){
"use strict";
this.name = "Lib_2DCollision";

/** _inBox() - Checks if point is inside the bounding box
	@box - Array. 4 positions in a.x,a.y,b.x,b.y
	@pos - Vector. Position to be checked
	@return - Boolean. True if inside
*/
this._inBox = function(box,pos){
	if(pos.x<box[0] || pos.x>box[1] || pos.y<box[2] || pos.y>box[3]) return false;
	return true;
};

/** _inPoly() - Checks if a point is inside a polygon
	@nvert - Number of vertices in the polygon
	@vertx, verty - Arrays containing the x- and y-coordinates of the polygon's vertices
	@pos - Vector. x- and y-coordinate of the test point
	@con - Boolean. Concave shapes may need to set it
	@return - Boolean. True if inside
*/
this._inPoly = function(nvert,vertx,verty,pos,con){
	var i,j,c = false,r1=0;
	for(i=0,j=nvert-1;i<nvert;j=i++){
		if(((verty[i]>pos.y)!==(verty[j]>pos.y)) && (pos.x<(vertx[j]-vertx[i])*(pos.y-verty[i])/(verty[j]-verty[i])+vertx[i])){
			c = !c;
			r1++;
		}
		if(!con && r1>1) break;
	}
	return c;
};

/** _onLine() - Checks if point is on a specified line
	@pa - Vector. Starting point of the line
	@pb - Vector. End point of the line
	@pc - Vector. Position to be checked
	@tol - Number. Tolerance. Default 0.01
	@return - Boolean. True if on line (within tolerance)
*/
this._onLine = function(pa,pb,pc,tol){
	var s,rnum,denom,check,distLine,distSegment,dist1,dist2;
	if(typeof(tol)!=='number') tol = 0.01;
	rnum = (pc.x-pa.x)*(pb.x-pa.x)+(pc.y-pa.y)*(pb.y-pa.y);
	denom = (pb.x-pa.x)*(pb.x-pa.x)+(pb.y-pa.y)*(pb.y-pa.y);
	check = rnum/denom;
	s = ((pa.y-pc.y)*(pb.x-pa.x)-(pa.x-pc.x)*(pb.y-pa.y))/denom;
	distLine = Math.abs(s)*Math.sqrt(denom);
	if(check>=0 && check<=1) distSegment = distLine;
	else {
		dist1 = (pc.x-pa.x)*(pc.x-pa.x)+(pc.y-pa.y)*(pc.y-pa.y);
		dist2 = (pc.x-pb.x)*(pc.x-pb.x)+(pc.y-pb.y)*(pc.y-pb.y);
		if(dist1<dist2) distSegment = Math.sqrt(dist1);
		else distSegment = Math.sqrt(dist2);
	}
	return (distSegment<tol);
};
}).call(this);
