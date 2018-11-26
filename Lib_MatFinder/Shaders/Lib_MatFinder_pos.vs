// 11 ALU, 11 C, 9 CF (RV610)
varying vec2 vTexCoord;
varying vec3 vCol,vNormal,vVertex;
uniform vec4 pos;

void main(void)
{
	vVertex = gl_Vertex.xyz;
	vNormal = normalize(gl_NormalMatrix*gl_Normal);
	vCol = vec3(pos-gl_Vertex);
	vTexCoord = gl_MultiTexCoord0.st;
	gl_Position = ftransform();
}
