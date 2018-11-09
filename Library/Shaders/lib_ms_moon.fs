varying vec3 vTexCoord;
varying float vIntense;
uniform samplerCube colorMap;
uniform vec4 Suncolor;

void main(void)
{
	gl_FragColor = textureCube(colorMap,vTexCoord)*max(2.0*vIntense,0.2)*Suncolor;
}
