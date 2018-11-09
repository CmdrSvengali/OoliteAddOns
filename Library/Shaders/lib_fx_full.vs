/* Fullscreen shader, tex offset */
varying vec2 vTexCoord;

void main(void)
{
	vec4 Position = gl_Vertex;
	gl_Position = vec4(Position.xy,0.0,1.0);
	vTexCoord = Position.xy+0.5;
}
