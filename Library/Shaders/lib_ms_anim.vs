varying vec3 vNormal,vPos;
varying vec4 vFTC;
varying float vFade;
uniform float Time;
uniform vec4 Dest; // duration, pics, blend

float Offset(float loo)
{
	int l = int(Dest.y);
	float off = 0.0;
	float s = 1.0/Dest.y;
	for(int i=1;i<l;i++){
		off += step(s*float(i),loo);
	}
	return off;
}
void CrossFade(in vec2 vpc)
{
	float lt = mod(Time/Dest.x,1.0);
	float fa = Offset(lt);
	float fb = fa+1.0;
	float fpt = (lt*Dest.y-fa);
	float vO = vpc.t;
	vFTC.st = vec2(vpc.s,(fa+vO)/Dest.y);
	vFTC.pq = vec2(vpc.s,(fb+vO)/Dest.y);
	vFade = smoothstep(0.0,Dest.z/Dest.y,fpt);
}
void main()
{
	vNormal = normalize(gl_NormalMatrix*gl_Normal);
	vPos = vec3(gl_ModelViewMatrix*gl_Vertex);
	gl_TexCoord[0] = gl_TextureMatrix[0]*gl_MultiTexCoord0;
	CrossFade(gl_TexCoord[0].st);
	gl_Position = ftransform();
}
