// 8 ALU, 8 C, 4 CF (RV610) - 13 I, 2 R, 0 H (fp40)
varying vec2 vTexCoord;
uniform sampler2D emissionMap;
uniform float Time,OnOff;
uniform vec4 Settings,MC;

void main(void)
{
	vec4 col = texture2D(emissionMap,vTexCoord)*MC;
	float ccc = col.a;
	ccc *= OnOff*(1.0-Settings.z);
	if(ccc==0.0) discard;
	col += Settings.y*(sin(Time*8.0)+1.0)*0.1;
	gl_FragColor = vec4(col.rgb,ccc);
}
