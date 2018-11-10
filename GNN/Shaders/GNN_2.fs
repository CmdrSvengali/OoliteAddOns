// Rooters, 13 ALU
varying vec2 vTexCoord;
uniform sampler2D colorMap,fxMap;
uniform float Time;

void main(void)
{
	float t = Time*0.2;
	mat2 rot = mat2(cos(t),-sin(t),sin(t),cos(t));
	vec2 coords = (2.0*vTexCoord-1.0)*rot+vec2(1.25,1.25);
	float blend = min(Time*0.2,1.4);
	vec3 color = texture2D(colorMap,coords*0.4).rgb*0.6;
	color += color*texture2D(fxMap,coords*rot).rgb*2.0;
	gl_FragColor = vec4(color,blend);
}
