"use client"

import type React from "react"
import { forwardRef } from "react"
import { ShaderCanvas } from "@/components/ui/shader-canvas"
import { cn } from "@/lib/utils"

export interface LiquidNoirProps extends React.HTMLAttributes<HTMLDivElement> {
  speed?: number
}

const fragmentShader = `
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

    float n1 = fbm(uv * 4.0 + t * vec2(0.3, 0.1));
    float n2 = fbm(uv * 3.0 + vec2(n1) * 2.0 + t * vec2(-0.1, 0.2));
    float n3 = fbm(uv * 5.0 + vec2(n2, n1) + t * 0.15);

    vec3 deep = vec3(0.03, 0.03, 0.04);
    vec3 mid = vec3(0.08, 0.07, 0.09);
    vec3 highlight = vec3(0.18, 0.16, 0.20);

    vec3 col = mix(deep, mid, smoothstep(0.3, 0.6, n2));
    col = mix(col, highlight, pow(smoothstep(0.5, 0.8, n3), 2.0));

    float iridescence = sin(n2 * 12.0 + t) * 0.02;
    col.r += iridescence;
    col.b -= iridescence;

    float spec = pow(max(0.0, n3 - 0.6) * 3.0, 3.0) * 0.3;
    col += spec;

    fragColor = vec4(col, 1.0);
}
`

export const LiquidNoir = forwardRef<HTMLDivElement, LiquidNoirProps>(
  ({ className, speed = 1.0, ...props }, ref) => {
    return (
      <div className={cn("w-full h-full", className)} ref={ref} {...(props as any)}>
        <ShaderCanvas
          fs={fragmentShader}
          uniforms={{ u_speed: speed }}
        />
      </div>
    )
  },
)

LiquidNoir.displayName = "LiquidNoir"
export default LiquidNoir
