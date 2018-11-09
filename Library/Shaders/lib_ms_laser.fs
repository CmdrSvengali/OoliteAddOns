uniform int Fuel;

const float tau = 6.283;
vec3 hue(float x)
{
	return clamp(2.0*cos(vec3(tau*x)+(tau*vec3(0.0,2.0,1.0)/3.0)),-1.0,1.0)*0.5+0.5;
}
void main()
{
	vec3 lc = hue(float(Fuel));
	gl_FragColor = vec4(lc,1.0);
}
