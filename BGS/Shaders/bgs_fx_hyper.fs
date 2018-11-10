/* 28 ALU, 28 C, 4 CF (RV601), 85 I, 4 R, 1 H (fp40)
   Settings x-galactic jump, y-misjump, z-aspect ratio
   Look offset
*/
varying vec2 vTexCoord;
uniform sampler2D colorMap;
uniform float Time;
uniform vec4 Settings,Look;

const float oops = 0.866025;
const vec4 foggy = vec4(0.06,0.05,0.1,0.08);
float rv = float((0.0>=Look.z));
float hex(in vec2 pos){
	pos.x += fract(floor(pos.y)*0.5);
	vec2 p = abs(fract(pos.xy)*vec2(1.73205,1.5)-vec2(oops,0.75));
	float d = dot(p.xy,vec2(-0.5,oops))-0.433;
	float b = float(d>0.0);
	return min(d,oops-p.x)*b+min(-d,p.x)*(1.0-b);
}
void main()
{
	vec2 coords = vTexCoord.xy+Look.xy;
	coords.x *= Settings.z;
	float t = Time*Look.z+1.0;
	vec2 cen = vec2(0.5*Settings.z-coords.x,0.5-coords.y);
	float api = asin(dot(normalize(cen),vec2(0.0,-1.0)));
	float len = sqrt((cen.x*cen.x)+(cen.y*cen.y))+rv;
	float rlen = 1.0/len;
	float tlen = rlen+t;
	float rear = 1.0+rv*tlen;
	float slen = rlen*0.04;
	// Texture
	vec4 txc = texture2D(colorMap,(coords.xy*rlen)+t);
	vec4 color = mix(foggy.rgba*exp(t*rear),txc.rgba,exp(-slen));
	float ccc = 1.0-float(color.a>3.19);
	// Stars
	float sta = floor(api*61.0);
	float stb = fract(sta*oops)*slen;
	float stc = fract((t+sta)*0.17+stb)/stb;
	color += max(0.0,1.0-(8.0*stc));
	// Tunnel
	float h = hex(vec2(api*2.23,tlen*5.0))+0.16;
	float grid = 0.03/h;
	float lg = len*grid;
	vec3 tun = vec3(-0.2);
	// Extras
	tun.g -= Settings.x*lg;
	color += (color.g/h)*lg;
	tun.r += Settings.y*lg;
	// Output
	gl_FragColor = vec4(color.rgb+tun.rgb,ccc);
}
