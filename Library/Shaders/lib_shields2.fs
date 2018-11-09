varying vec2 vTexCoord;
varying vec3 vpos;
uniform sampler2D ColorMap;
uniform float Time,Slide,Hex;
uniform vec4 Tint;

const float oops = 0.866025;
float hex(in vec2 pos){
	pos.x += fract(floor(pos.y)*0.5);
	vec2 p = abs(fract(pos.xy)*vec2(1.73205,1.5)-vec2(oops,0.75));
	float d = dot(p.xy,vec2(-0.5,oops))-0.433;
	float b = float(d>0.0);
	return min(d,oops-p.x)*b+min(-d,p.x)*(1.0-b);
}

void main (void)
{
/*
	vec2 move = vTexCoord;
	float s = hex(move*Hex);
	move.y -= Time*0.005*Slide;
	vec3 color = (texture2D(ColorMap,move-s).rgb*Tint.rgb)-s;
	if(dot(color,vec3(0.5))<-0.5) discard;
	gl_FragColor = vec4(color.rgb+s,s);
*/

	vec2 p = (vpos.xy-sin(Time-2.0)*Slide)/vpos.z;
	p = min(vec2(1.0),p);
	vec2 i = p;
	float c = 0.0;
	float r = length(p+vec2(sin(Time),sin(Time*0.433+2.0))*3.0);
	float t = r-Time/2.6;
	i -= p + vec2(cos(t - i.x-r) + sin(t + i.y),sin(t - i.y) + cos(t + i.x)+r);
	c += 1.0/length(vec2((sin(i.x+t)/0.15),(cos(i.y+t)/0.15)));
	c *= 0.5;
	c = min(c,0.35);
	if(c<0.1) discard;
	gl_FragColor = vec4(vec3(c)*Tint.rgb,c);

}
