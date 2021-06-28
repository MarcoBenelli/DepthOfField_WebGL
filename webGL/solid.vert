#version 300 es

in vec4 a_Position;
in vec2 a_TexCoord;
uniform mat4 u_ModelViewMatrix;
uniform mat4 u_ProjMatrix;
uniform float u_FocalApertureV;
uniform float u_FocusDistanceV;
uniform int u_MaxBlurV;
uniform bool u_HyperbolicV; // if true 1/x-1 else x-1
uniform bool u_SquaredV; // if true x*x else abs(x)
uniform bool u_SagV; // Scatter-as-Gather
out vec2 v_TexCoord;
out vec4 v_Position;
flat out int v_Radius;

void main() {
    v_Position = u_ModelViewMatrix * a_Position;
    gl_Position = u_ProjMatrix * v_Position;
    v_TexCoord = a_TexCoord;

    if (!u_SagV) {
        float distance = length(vec3(v_Position));
        float size = distance/u_FocusDistanceV;
        if (u_HyperbolicV) {
            size = 1.0/size;
        }
        size -= 1.0;
        if (u_SquaredV) {
            size *= size;
        } else {
            size = abs(size);
        }
        v_Radius = min(int(u_FocalApertureV*size), u_MaxBlurV);
    }
}