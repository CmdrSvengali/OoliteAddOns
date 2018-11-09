varying vec2 vTexCoord;
uniform vec4 Dest;

void main(void)
{
	float maxZ = clamp(8.0-Dest.z,1.0,8.0);
	float maxY = clamp(maxZ-Dest.y,1.0-maxZ,maxZ-1.0);
	float maxX = clamp(-8.0+Dest.x,-(maxZ-1.0),(maxZ-1.0));
	vec2 Position = gl_Vertex.xy;
	gl_Position = vec4(Position.xy+vec2(maxX,maxY),-1.0,maxZ);
	Position += 1.0;
	vTexCoord = Position.xy*0.5;
	vTexCoord.y = 1.0-vTexCoord.y;
}
