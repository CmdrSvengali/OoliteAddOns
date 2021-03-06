varying vec3 vNormal,vPos;
varying vec4 vFTC;
varying float vFade;
uniform sampler2D colorMap;

vec4 SignPixelColor()
{
	vec4 f1Color = texture2D(colorMap,vFTC.st);
	vec4 f2Color = texture2D(colorMap,vFTC.pq);
	return (1.0-vFade)*f1Color+vFade*f2Color;
}
void main()
{
	vec3 signGlow = SignPixelColor().rgb;
	gl_FragColor = vec4(signGlow,1.0);
}
