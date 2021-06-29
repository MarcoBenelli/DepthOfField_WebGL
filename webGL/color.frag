#version 300 es
#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_Sampler;
uniform float u_FocalApertureF;
uniform float u_FocusDistanceF;
uniform int u_MaxBlurF;
uniform bool u_HyperbolicF;// if true 1/x-1 else x-1
uniform bool u_SquaredF;// if true x*x else abs(x)
uniform bool u_SagF;// Scatter-as-Gather
uniform vec2 u_TexResolution;
in vec2 v_TexCoord;
in vec4 v_Position;
flat in int v_Radius;
out vec4 fragColor;

void main() {
    int radius;
    if (u_SagF) {
        float distance = length(vec3(v_Position));
        float size = distance/u_FocusDistanceF;
        if (u_HyperbolicF) {
            size = 1.0/size;
        }
        size -= 1.0;
        if (u_SquaredF) {
            size *= size;
        } else {
            size = abs(size);
        }
        radius = min(int(u_FocalApertureF*size), u_MaxBlurF);
    } else {
        radius = v_Radius;
    }
    vec3 final_color = vec3(0.0);
    int total = 0;
    for (int i=-radius; i <= radius; ++i) {
        for (int j=-radius; j <= radius; ++j) {
            if (i*i + j*j <= radius*radius) {
                final_color += texture(u_Sampler, v_TexCoord + vec2(i, j) / u_TexResolution).rgb;
                total++;
            }
        }
    }
    fragColor = vec4(final_color / float(total), 1.0);
}