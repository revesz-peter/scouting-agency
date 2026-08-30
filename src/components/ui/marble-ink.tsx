"use client"

import type React from "react"
import { forwardRef } from "react"
import { ShaderCanvas } from "@/components/ui/shader-canvas"
import { cn } from "@/lib/utils"

export interface MarbleInkProps extends React.HTMLAttributes<HTMLDivElement> {
  speed?: number
  contrast?: number
}

const fragmentShader = `
// Light liquid surface — inverted noir with subtle iridescence
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
    float val = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 5; i++) {
        val += amp * noise(p);
        p *= 2.0;
        amp *= 0.5;
    }
    return val;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    float t = iTime * 0.2 * u_speed;

    // Liquid distortion
    float n1 = fbm(uv * 4.0 + t * vec2(0.3, 0.1));
    float n2 = fbm(uv * 3.0 + vec2(n1) * 2.0 + t * vec2(-0.1, 0.2));
    float n3 = fbm(uv * 5.0 + vec2(n2, n1) + t * 0.15);

    // Light palette — white surface with grey depth
    vec3 bright = vec3(0.95, 0.95, 0.95);
    vec3 mid = vec3(0.88, 0.88, 0.88);
    vec3 shadow = vec3(0.78, 0.78, 0.78);

    vec3 col = mix(bright, mid, smoothstep(0.3, 0.6, n2));
    col = mix(col, shadow, pow(smoothstep(0.5, 0.8, n3), 2.0) * u_contrast);

    // Iridescence — subtle warm/cool shift
    float iridescence = sin(n2 * 12.0 + t) * 0.015;
    col.r += iridescence;
    col.b -= iridescence;

    // Soft highlights
    float spec = pow(max(0.0, n3 - 0.6) * 3.0, 3.0) * 0.12;
    col += spec;

    fragColor = vec4(col, 1.0);
}
`

export const MarbleInk = forwardRef<HTMLDivElement, MarbleInkProps>(
  ({ className, speed = 1.0, contrast = 1.0, ...props }, ref) => {
    return (
      <div className={cn("w-full h-full", className)} ref={ref} {...props}>
        <ShaderCanvas
          fs={fragmentShader}
          uniforms={{ u_speed: speed, u_contrast: contrast }}
        />
      </div>
    )
  },
)

MarbleInk.displayName = "MarbleInk"
export default MarbleInk
