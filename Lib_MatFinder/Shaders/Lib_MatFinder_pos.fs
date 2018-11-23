varying vec2 vTexCoord;
varying vec3 vCol,vNormal,vVertex;
uniform sampler2D tex0;
uniform vec4 pos,ori,size;

void main(){
	vec3 lightVector = normalize(gl_LightSource[1].position.xyz);
	vec3 diffuse = gl_LightSource[1].diffuse.xyz*max(dot(vNormal,lightVector),0.3);
	vec3 col = min(texture2D(tex0,vTexCoord).xyz*diffuse,0.3);
	float s = 1.0/distance(pos.xyz,vVertex)*(size.z/length(vCol.xy));
	gl_FragColor = vec4(col+s+diffuse*max(1.2/vCol,0.15),1.0);
}
