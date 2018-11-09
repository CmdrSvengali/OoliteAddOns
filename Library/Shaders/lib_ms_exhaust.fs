varying vec2 vTexCoord;
uniform sampler2D colorMap;
uniform float Time,Energy;
uniform int Fuel;

void main (void)
{
	if(Energy==0.0) discard;
	vec2 move = vTexCoord;
	float inject = float(Fuel)*0.01;
	move.y += Time;
	vec4 col = texture2D(colorMap,move);
	vec4 injectColor = vec4(0.5,0.0,0.3,0.3);
	vec4 final = mix(col,injectColor,inject);
	gl_FragColor = vec4(final.rgb,0.7-inject)*(Energy/600.0);
}
