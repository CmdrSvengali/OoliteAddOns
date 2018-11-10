// 13 ALU
varying vec2 vTexCoord;
uniform float Time;
uniform sampler2D colorMap,fxMap;

void main(void)
{
	float t = Time*0.05;
	vec2 cen = vec2(0.5)-vTexCoord;
	float len = sqrt((cen.x*cen.x)+(cen.y*cen.y));
	float rlen = 1.0/len;
	vec3 Noi = texture2D(fxMap,(cen*rlen)+t).rgb*vec3(0.8,0.5,0.0);
	vec3 Col = texture2D(colorMap,vTexCoord).rgb;
	len *= 2.0-rlen;
	float rim = max(0.0,rlen*len-2.5*len)*8.0;
	gl_FragColor = vec4(2.0*Col+Col*Noi*0.4+Noi*rim,1.0);
}
