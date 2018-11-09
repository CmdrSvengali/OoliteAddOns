// Experimental shader
varying vec2 vTexCoord;
varying vec3 vpos;
uniform mat3 ooliteNormalMatrix;
uniform mat4 ooliteModelView,ooliteModelViewProjection;

void main()
{
	vec3 n = normalize(ooliteNormalMatrix * gl_Normal);
	vec3 e = -vec3(ooliteModelView * gl_Vertex);
	vec4 VT = gl_Vertex;
	if(dot(e,n)<gl_DepthRange.near+10.0) VT.z *= -1.0;
	vTexCoord = gl_MultiTexCoord0.st;
	gl_Position = ooliteModelViewProjection*VT;
	vpos = VT.xyz;
}
