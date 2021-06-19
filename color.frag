#version 300 es
#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_Sampler;
uniform float u_FocalAperture;
uniform float u_FocusDistance;
uniform vec2 u_TexResolution;
in vec2 v_TexCoord;
in vec4 v_Position;
out vec4 fragColor;

void main() {
    float distance = length(vec3(v_Position));
    vec3 final_color = vec3(0.0);
    int size = int(u_FocalAperture*(abs(1.0-u_FocusDistance/distance)));
    for (int i=-size; i <= size; ++i) {
        for (int j=-size; j <= size; ++j) {
            final_color += texture(u_Sampler, v_TexCoord + vec2(i, j) / u_TexResolution).rgb;
        }
    }
    fragColor = vec4(final_color / float((2*size+1)*(2*size+1)), 1.0);
}