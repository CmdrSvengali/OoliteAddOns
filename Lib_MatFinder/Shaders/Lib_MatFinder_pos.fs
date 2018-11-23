varying vec2 vTexCoord;
varying vec3 vCol,vNormal;
uniform sampler2D tex0;

void main(){
	vec3 lightVector = normalize(gl_LightSource[1].position.xyz);
	vec3 diffuse = gl_LightSource[1].diffuse.xyz*max(dot(vNormal,lightVector),0.3);
	vec3 col = min(texture2D(tex0,vTexCoord).xyz*diffuse,0.3);
	gl_FragColor = vec4(col+diffuse*max(1.2/vCol,0.15),1.0);
}
