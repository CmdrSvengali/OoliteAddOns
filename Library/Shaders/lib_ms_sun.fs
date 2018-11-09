varying vec2 vTexCoord;
uniform vec4 Suncolor;
void main()
{
	vec2 uv = vTexCoord;
	vec3 lc = Suncolor.rgb;
	float ms = 0.31;
	float d = length(uv-vec2(0.5));
	float c = ms/d;
	if(d>0.48) discard;
	gl_FragColor = vec4(log2(c))+vec4(vec3(c)*lc,1.0);
}
