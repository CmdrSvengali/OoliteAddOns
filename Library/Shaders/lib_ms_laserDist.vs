uniform float Time;
uniform vec4 Dest;

void main()
{
	float t = step(Time,Dest.y+0.3)*step(Dest.y,Time);
	vec4 d = gl_Vertex;
	if(t>0.0 && gl_Vertex.z<-0.5){
		d = vec4(0.0,0.0,1.0,t*Dest.x);
	}
	gl_Position = gl_ModelViewProjectionMatrix*d;
}
