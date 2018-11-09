varying vec2 vTexCoord;
uniform float Time;
uniform vec4 Dest;
uniform sampler2D colorMap;

void main()
{
	float b = max(Time-Dest.y,0.0);
	float t = b*0.02;
	vec2 sv = (vec2(0.5)-vTexCoord)*t;
	vec2 hv = normalize(sv)*t+t;
	vec3 result = texture2D(colorMap,vTexCoord+hv+hv).rgb;
	result += texture2D(colorMap,vTexCoord+sv*t).rgb;
	float dist = distance(vTexCoord,vec2(0.5));
	result *= smoothstep(clamp(0.49-t,0.0,0.49),-0.04,dist);
	result *= clamp(min(Dest.x-b,2.0),0.0,Dest.x);
	float glob = length(result);
	if(glob<0.15 || b<0.01) discard;
	gl_FragColor = vec4(result*glob,1.0);
}
