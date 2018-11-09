varying vec2 vTexCoord;
varying vec3 v_pos,v_normal;

void main()
{
	v_pos = vec3(gl_Vertex);
	v_normal = gl_NormalMatrix*gl_Normal;
	vTexCoord = gl_MultiTexCoord0.st;
	gl_Position = gl_ModelViewProjectionMatrix*gl_Vertex;
}
