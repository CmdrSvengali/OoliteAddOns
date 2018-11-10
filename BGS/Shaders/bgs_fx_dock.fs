/* 28 ALU, 28 C, 4 CF (RV601), 82 I, 4 R, 1 H (fp40)
   Settings x=land,y=shape,z=ratio
   Tint linecolor
   Contrast contrast
*/
varying vec2 vTexCoord;
uniform float Time,Contrast;
uniform vec4 Settings,Tint;
uniform sampler2D colorMap;

const vec2 ac = vec2(1.0,0.0);
float shape = Settings.y;
float spl = 2.7; // Door pos

void main()
{
	vec2 p = vTexCoord.xy-0.5;
	p.y /= Settings.z;
	float px = p.x;
	float py = p.y;
	float pxp = px*px;
	float pyp = py*py;
	// Tunnel (Superellipse)
	float len = sqrt(pxp+pyp);
	float a = acos(dot(normalize(p.xy),ac.xy));
	float r = pow(pow(pxp,shape)+pow(pyp,shape),1.0/shape);
	float ux = 0.1/r+Time; // Tunnel depth
	vec2 uv = vec2(ux,a*0.3183);
	vec3 map = texture2D(colorMap,uv.xy).xyz;
	vec3 col = mix(map.xyz,Tint.xyz,float(spl-0.07<ux));
	// Wash out
	float grey = dot(col,vec3(Contrast));
	col *= grey;
	// Door
	float t1 = Time*0.5;
	float t = max(0.0,t1-0.25*spl);
	float y = abs(py)/t1-t;
	float open = float(t>y);
	float border = float(t>y-0.03);
	// Lines
	vec3 tt = Tint.xyz*abs(0.1/dot(px+py,px-py)*len);
	vec3 ref = texture2D(colorMap,vec2(-ux*spl,uv.y)).xyz*tt.xyz;
	float door = float(ux>spl-0.03);
	col = col*(1.0-door)+door*ref;
	col += tt.xyz*(border*door);
	float ccc = 1.0-(open*door);
	// Fake door light
	float dl = float(0.1<Settings.x)*(6.4*len*t-y)*(1.0-door);
	col += clamp(dl,0.0,0.1)*(grey*3.0)*(1.0/len);
	col += tt.xyz*(1.0-float(spl-0.02<ux));
	gl_FragColor = vec4(col.xyz*min(1.0,Time),ccc);
}
