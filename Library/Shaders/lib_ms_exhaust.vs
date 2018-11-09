varying vec2 vTexCoord;
uniform float Energy;
uniform int Fuel;
uniform vec4 Dest;

void main()
{
	vTexCoord = gl_MultiTexCoord0.st;
	float inject = 1.0-float(Fuel)*0.005;
	vec4 d = gl_Vertex;
	d.x *= Dest.x;
	d.y *= Dest.y;
	if(gl_Vertex.z<-0.5) d.w = inject*(1.0/sqrt(Energy))*8.5;
	gl_Position = gl_ModelViewProjectionMatrix*d;
}
