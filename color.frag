#version 300 es
#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_Sampler;
in vec2 v_TexCoord;
in vec4 v_Position;
out vec4 fragColor;

void main() {
    float distance = length(vec3(v_Position));
    vec3 final_color = vec3(0.0);
    int size = int(500.0*(abs(1.0-3.02/distance)));
    for (int i=-size; i <= size; ++i) {
        for (int j=-size; j <= size; ++j) {
            final_color += texture(u_Sampler, v_TexCoord + vec2(i, j) / 300.0).rgb;
        }
    }
    //fragColor = vec4(texture(u_Sampler, v_TexCoord).rgb * min(distance, 1.0), 1.0);
    fragColor = vec4(final_color / float((2*size+1)*(2*size+1)), 1.0);
}