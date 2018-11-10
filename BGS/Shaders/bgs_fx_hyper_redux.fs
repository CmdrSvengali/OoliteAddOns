/* 18 ALU, 18 C, 4 CF (RV601), 32 I, 3 R, 1 H (fp40)
   Settings x-galactic jump, y-misjump, z-aspect ratio
   Look offset
*/
varying vec2 vTexCoord;
uniform sampler2D colorMap;
uniform float Time;
uniform vec4 Settings,Look;

const vec4 foggy = vec4(0.06,0.05,0.1,0.08);
float rv = float(0.0>=Look.z);

void main()
{
	vec2 coords = vTexCoord.xy+Look.xy;
	coords.x *= Settings.z;
	vec2 cen = vec2(0.5*Settings.z-coords.x,0.5-coords.y);
	float t = (Time*Look.z)+1.0;
	float len = sqrt((cen.x*cen.x)+(cen.y*cen.y))+rv;
	float rlen = 1.0/len;
	float slen = rlen*0.04;
	float rear = 1.0+rv*(rlen+t);
	// Texture
	vec4 txc = texture2D(colorMap,(coords.xy*rlen)+t);
	txc.r += (Settings.y*len)*0.2;
	vec4 color = mix(foggy.rgba*exp(t*rear),txc.rgba,exp(-slen));
	float ccc = 1.0-float(color.a>3.19);
	color.g -= (Settings.x*len)*0.1;
	gl_FragColor = vec4(color.rgb,ccc);
}
