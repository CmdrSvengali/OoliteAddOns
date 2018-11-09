varying vec2 vTexCoord;
varying vec3 v_pos,v_normal;
uniform vec4 Dest,Sizes;

void main(void)
{
	vec3 pos = v_pos-Dest.xyz;
	pos.x /= Sizes.x;
	pos.y /= Sizes.y;
	vec3 str = v_pos-Dest.xyz;
	gl_FragColor = vec4(1.0/length(pos))+vec4(1.0/str*0.06,1.0);
}
