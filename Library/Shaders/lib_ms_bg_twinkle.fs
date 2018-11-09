varying vec2 vTexCoord;
uniform float Time;
uniform vec4 Dest;

float rand(vec2 co){
   return fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43758.5453);
}
void main(){
	float ccc = 1.0;
	float star = 0.0;
	float z = step(0.993,rand(gl_FragCoord.xy));
	float r=rand(gl_FragCoord.xy*mod(Dest.z,4.0));
	star= r*(0.25*sin(Time*0.18+30.0*r)+0.25)*1.4;
	star *= z;
	ccc = float(star>0.1); // discard
	gl_FragColor = vec4(star,star,star,ccc);
}
