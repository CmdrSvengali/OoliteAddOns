/* 20 ALU, 20 C, 4 CF (RV601), 54 I, 3 R, 1 H (fp40)
   Settings x=land,y=shape,z=ratio
   Tint linecolor
*/
varying vec2 vTexCoord;
uniform float Time;
uniform vec4 Settings,Tint;
uniform sampler2D colorMap;

const vec2 ac = vec2(1.0,0.0);
float shape = Settings.y;
float spl = 2.7; // Door pos

void main()
{
	float ccc = 1.0;
	vec2 p = vTexCoord.xy-0.5;
	p.y /= Settings.z;
	float px = p.x;
	float py = p.y;
	float pxp = px*px;
	float pyp = py*py;
	// Tunnel (Superellipse)
	float a = acos(dot(normalize(p.xy),ac.xy));
	float r = pow(pow(pxp,shape)+pow(pyp,shape),1.0/shape);
	float ux = 0.1/r+Time; // Tunnel depth
	vec2 uv = vec2(ux,a*0.3183);
	vec3 map = texture2D(colorMap,uv.xy).xyz;
	vec3 col = mix(map.xyz,Tint.xyz,0.3183*step(spl-0.07,ux));
	// Lines
	float lc = 0.1*abs(px/dot(px+py,px-py));
	// Door
	float t1 = Time*0.5;
	float t = max(0.0,t1-0.25*spl);
	float y = abs(py)/t1-t;
	float open = float(t>y);
	float door = float(ux>spl-0.06);
	ccc = 1.0-(open*door);
	lc = lc*(1.0-door)+lc*0.3183;
	col += Tint.xyz*lc;
	gl_FragColor = vec4(col.xyz,ccc);
}
