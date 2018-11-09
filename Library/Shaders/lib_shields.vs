varying vec4 Color;
varying vec2 vTexCoord;
uniform float Time;

vec3 sphere(vec3 domain)
{
	vec3 range;
	range.x = cos(domain.y)*sin(domain.x);
	range.y = sin(domain.y)*sin(domain.x);
	range.z = cos(domain.z);
	return range;
}
void main()
{
	vec3 p0 = gl_Vertex.xyz+Time;
	vec3 normal = sphere(p0);
	vec3 vertex = gl_Vertex.xyz;
	normal = normalize(gl_NormalMatrix*normal);
	vec3 position = vec3(gl_ModelViewMatrix*vec4(vertex,1.0));
	vec3 lightVec = normalize(vec3(1.0)-position);
	float diffuse = max(dot(lightVec,normal),0.125);
	Color = vec4(vec3(-2.0,-2.0,1.0)*diffuse,1.0);
	gl_Position = gl_ModelViewProjectionMatrix*vec4(vertex,1.0);
	vTexCoord = gl_MultiTexCoord0.st;
}
