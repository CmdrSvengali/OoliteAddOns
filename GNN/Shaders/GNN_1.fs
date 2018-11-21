// GNN, 7 ALU
varying vec2 vTexCoord;
uniform sampler2D colorMap;
uniform float Time;

void main()
{
	vec3 color = texture2D(colorMap, vTexCoord).rgb;
	float sum = max(sin(vTexCoord.x-Time),0.0);
	gl_FragColor = vec4(color+color*sum,1.0);
}
