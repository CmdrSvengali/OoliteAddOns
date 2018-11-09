/* Billboard shader */
varying vec2 vTexCoord;
uniform vec4 Pos;

void main(void)
{
	gl_Position = gl_ProjectionMatrix*(gl_ModelViewMatrix*vec4(0.0,0.0,0.0,1.0)+vec4(gl_Vertex.xy+Pos.xy,0.0,0.0));
	vTexCoord = gl_MultiTexCoord0.st;
}
