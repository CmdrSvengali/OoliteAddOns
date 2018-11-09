uniform float Energy;

void main()
{
	vec4 d = gl_Vertex;
	if(gl_Vertex.z<-0.5){
		d = vec4(0.0,0.0,1.0,Energy);
	}
	gl_Position = gl_ModelViewProjectionMatrix*d;
}
