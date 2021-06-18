#version 300 es
#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_Sampler;
uniform vec3 u_Camera;
in vec2 v_TexCoord;
in vec4 v_Position;
out vec4 fragColor;

void main() {
    float distance = distance(u_Camera, vec3(v_Position));
    vec3 final_color = vec3(0.0);
    int size = int(distance);
    for (int i=-size; i <= size; ++i) {
        for (int j=-size; j <= size; ++j) {
            final_color += texture(u_Sampler, (v_TexCoord+vec2(float(i), float(j)))).rgb;
        }
    }
    //fragColor = vec4(texture(u_Sampler, v_TexCoord).rgb * min(distance, 1.0), 1.0);
    fragColor = vec4(final_color / float((size*2+1)*(size*2+1)), 1.0);
}