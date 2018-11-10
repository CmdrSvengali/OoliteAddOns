// Chronicle, 13 ALU
uniform sampler2D colorMap;
uniform float Time;
varying vec2 vTexCoord;

void main()
{
	float blend = min(Time,0.5);
	float dispersal = sin(Time*0.1);
	vec2 image_center = vec2(0.5);
	vec2 sample_vector = (image_center - vTexCoord) * dispersal;
	vec2 halo_vector = normalize(sample_vector) * Time;
	vec3 result = texture2D(colorMap, vTexCoord + halo_vector).rgb;
	for (int i = 0; i < 2; ++i)
	{
		vec2 offset = sample_vector * float(i);
		result += texture2D(colorMap, vTexCoord + offset).rgb;
	}
	gl_FragColor = vec4(result*blend,1.0);
}
