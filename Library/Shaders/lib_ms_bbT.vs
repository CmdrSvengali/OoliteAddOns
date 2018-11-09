varying vec2 vTexCoord;
uniform float Time;
uniform vec4 Dest;

void main()
{
	float t = Dest.x-((Time-Dest.y)*Dest.z);
	vTexCoord = gl_MultiTexCoord0.st;
	gl_Position = gl_ProjectionMatrix*(gl_ModelViewMatrix*vec4(0.0,0.0,-1.0,1.0)+vec4(gl_Vertex.x*t,gl_Vertex.y*t,0.0,0.0));
}
