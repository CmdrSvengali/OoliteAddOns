/* 15 ALU, 15 C, 4 CF (RV601), 35 I, 2 R, 0 H (fp40)
   Settings 
   Tint color
*/
varying vec2 vTexCoord;
uniform float Time;
uniform vec4 Settings,Tint;
uniform sampler2D colorMap;

void main()
{
	float b = max(Time-Settings.y,0.0);
	float t = b*0.02;
	vec2 sv = (0.5-vTexCoord)*t;
	vec2 hv = normalize(sv)*t+t;
	float dist = distance(vTexCoord,vec2(0.5));
	vec3 c = texture2D(colorMap,vTexCoord+hv*hv).rgb*Tint.rgb*3.0;
	c *= smoothstep(clamp(0.49-t,0.0,0.49),-0.04,dist);
	c *= clamp(min(Settings.x-b,2.0),0.0,Settings.x);
	float glob = dot(c,c);
	gl_FragColor = vec4(c*glob,glob);
}
