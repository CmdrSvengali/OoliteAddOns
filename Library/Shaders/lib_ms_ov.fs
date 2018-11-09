varying vec2 vTexCoord;
uniform sampler2D colorMap;
uniform float Energy;
uniform bool Lights;

void main()
{
	float br = clamp(10.0-Energy,0.0,4.0);
	vec4 color = texture2D(colorMap,vTexCoord.xy);
	if(color.a<0.9 || !Lights) discard;
	color *= max(smoothstep(0.5,4.0,br),0.5);
	gl_FragColor = color;
}
