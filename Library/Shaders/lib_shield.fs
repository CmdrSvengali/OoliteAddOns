// 38 ALU
varying vec2 vTexCoord;
uniform float Time,Intensity;
uniform vec4 Tint;

void main(void)
{
	vec2 p =  vTexCoord * 10.0;
	vec2 i = p;
	float c = 0.1;
	float t = Time;
	i = p + vec2(cos(t - i.x) + sin(t + i.y),sin(t - i.y) + cos(t + i.x));
	c += 1.0/length(vec2(p.x / (sin(i.x+t)*57.0),p.y / (cos(i.y+t)*57.0)));
	i = p + vec2(cos(t - i.x) + sin(t + i.y),sin(t - i.y) + cos(t + i.x));
	c += 1.0/length(vec2(p.x / (sin(i.x+t)*57.0),p.y / (cos(i.y+t)*57.0)));
	c = 1.5 - sqrt(c);
	vec4 texColor = Tint * (1.0 / (1.8 - (c + 0.05)));
	gl_FragColor = vec4(texColor.rgb,Intensity);
}
