varying vec2 vTexCoord;
varying vec3 vCol,vNormal;
uniform vec4 pos,ori;

mat3 quatToMatrix(in vec4 q){
	float sqw = q.w*q.w;
	float sqx = q.x*q.x;
	float sqy = q.y*q.y;
	float sqz = q.z*q.z;
	// invs (inverse square length) is only required if quaternion is not already normalised
	float invs = 1.0 / (sqx + sqy + sqz + sqw);
	float m00 = (sqx - sqy - sqz + sqw)*invs; // since sqw + sqx + sqy + sqz =1/invs*invs
	float m11 = (-sqx + sqy - sqz + sqw)*invs;
	float m22 = (-sqx - sqy + sqz + sqw)*invs;
	float tmp1 = q.x*q.y;
	float tmp2 = q.z*q.w;
	float m10 = 2.0 * (tmp1 + tmp2)*invs;
	float m01 = 2.0 * (tmp1 - tmp2)*invs;
	tmp1 = q.x*q.z;
	tmp2 = q.y*q.w;
	float m20 = 2.0 * (tmp1 - tmp2)*invs;
	float m02 = 2.0 * (tmp1 + tmp2)*invs;
	tmp1 = q.y*q.z;
	tmp2 = q.x*q.w;
	float m21 = 2.0 * (tmp1 + tmp2)*invs;
	float m12 = 2.0 * (tmp1 - tmp2)*invs;
	return mat3(vec3(m00,m01,m02),vec3(m10,m11,m12),vec3(m20,m21,m22));
}
void main(void)
{
	vNormal = normalize(gl_NormalMatrix * gl_Normal);
	vCol = quatToMatrix(ori)*vec3(pos-gl_Vertex);
	vTexCoord = gl_MultiTexCoord0.st;
	gl_Position = ftransform();
}
