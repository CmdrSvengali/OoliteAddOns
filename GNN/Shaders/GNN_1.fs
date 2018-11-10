// GNN, 9 ALU
uniform sampler2D colorMap,fxMap;
uniform float Time;
varying vec2 vTexCoord;

void main()
{
	vec2 dir = vec2(0.25);
	vec3 endColor = texture2D(colorMap, vTexCoord).rgb;
	vec3 sum = endColor;
	for (int i = 0; i < 3; i++)
	{
		sum += texture2D(fxMap, dir * Time).rgb;
	}
	sum *= 0.25*clamp(sin(3.14*(vTexCoord.x-Time)),0.0,1.0);
	gl_FragColor = vec4(mix(endColor,sum,endColor.g),1.0);
}
