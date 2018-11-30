// 15 ALU, 15 C, 3 CF (RV610)
varying vec2 vTexCoord;
varying vec3 vCol,vNormal,vVertex;
uniform sampler2D tex0;
uniform vec4 pos,size;
uniform float radius;

void main(){
	vec3 lightVector = normalize(gl_LightSource[1].position.xyz);
	float diffuse = max(dot(vNormal,lightVector),0.3);
	vec3 col = min(texture2D(tex0,vTexCoord).xyz*diffuse,0.3);
	float p = distance(pos.xyz,vVertex.xyz);
	col *= step(p,radius)*0.75+0.25;
	float s = 1.0/p/length(vCol/size.xyz*0.33);
	gl_FragColor = vec4(col+floor(s)+diffuse*max(1.2/vCol,0.15),1.0);
}
