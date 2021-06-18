#version 300 es

in vec4 a_Position;
in vec2 a_TexCoord;
uniform mat4 u_ModelViewMatrix;
out vec2 v_TexCoord;
out vec4 v_Position;

void main() {
    gl_Position = u_ModelViewMatrix * a_Position;
    v_Position = u_ModelViewMatrix * a_Position;
    v_TexCoord = a_TexCoord;
}