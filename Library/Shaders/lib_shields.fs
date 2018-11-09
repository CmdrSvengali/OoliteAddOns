varying vec4 Color;
varying vec2 vTexCoord;
uniform sampler2D noiseMap;
uniform float Time;
uniform vec4 Settings;

void main (void)
{
	float ccc = 0.15;
	vec2 dis = vTexCoord;
	float sTime = Time*Settings.z;
	dis.x += sTime;
	dis.y -= sTime;
	vec3 noiseVec = normalize(texture2D(noiseMap,dis.xy).xyz*0.3)*Color.rgb;
	ccc *= 1.0-float(noiseVec.z<Settings.y); // discard
	gl_FragColor = vec4(Color.rgb*1.5,ccc);
}
