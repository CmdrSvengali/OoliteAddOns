// 8 ALU, 8 C, 4 CF (RV610) - 13 I, 2 R, 1 H (fp40)
varying vec2 vTexCoord;
uniform sampler2D emissionMap;
uniform float Time,Energy;
uniform bool Lights;
uniform vec4 MC;

void main(void)
{
	vec4 col = texture2D(emissionMap,vTexCoord)*MC;
	float ccc = col.a;
	ccc *= step(1.0,Energy);
	if(ccc==0.0) discard;
	col.r += float(Lights)*(sin(Time*8.0)+1.0)*0.1;
	gl_FragColor = vec4(col.rgb,ccc);
}
