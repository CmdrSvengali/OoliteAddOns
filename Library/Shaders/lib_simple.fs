varying vec2 vTexCoord;
uniform float Intensity;
uniform vec4 Tint;
uniform sampler2D ColorMap;

void main(void)
{
	vec4 color = texture2D(ColorMap,vTexCoord);
	color.rgb *= Tint.rgb;
	if(color.a<0.1) discard;
	gl_FragColor = vec4(color.rgb,Intensity);
}
