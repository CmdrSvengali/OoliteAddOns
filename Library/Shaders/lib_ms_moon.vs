varying vec3 vTexCoord;
varying float vIntense;
uniform float Scale;

void main(void)
{
	vec3 vt = gl_Vertex.xyz*Scale;
	vec4 EC = gl_ModelViewProjectionMatrix*vec4(vt,1.0);
	vec3 tnorm = normalize((gl_NormalMatrix*gl_Normal).xyz);
	vIntense = dot(normalize(gl_LightSource[1].position.xyz-EC.xyz),tnorm);
	gl_Position = EC;
	vTexCoord = gl_Vertex.xyz;
}
