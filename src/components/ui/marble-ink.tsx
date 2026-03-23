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
// Marble/ink in water effect — high fashion, editorial
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
    for (int i = 0; i < 6; i++) {
        val += amp * noise(p);
        p *= 2.0;
        amp *= 0.5;
    }
    return val;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    float t = iTime * 0.15 * u_speed;

    // Warped domain for marble veins
    vec2 q = vec2(fbm(uv * 3.0 + t * 0.3), fbm(uv * 3.0 + vec2(1.7, 9.2) + t * 0.2));
    vec2 r = vec2(fbm(uv * 3.0 + q * 4.0 + vec2(8.3, 2.8) + t * 0.1),
                  fbm(uv * 3.0 + q * 4.0 + vec2(5.1, 3.4) + t * 0.15));

    float f = fbm(uv * 3.0 + r * 2.0);

    // Marble palette — grey stone with cool undertones
    vec3 white = vec3(0.62, 0.60, 0.58);
    vec3 vein = vec3(0.38, 0.36, 0.34);
    vec3 warm = vec3(0.55, 0.52, 0.50);

    vec3 col = mix(white, warm, smoothstep(0.3, 0.7, f));
    // Veins
    float veinPattern = smoothstep(0.48, 0.52, f) * u_contrast;
    col = mix(col, vein, veinPattern * 0.6);

    // Subtle depth
    col *= 0.92 + 0.08 * f;

    fragColor = vec4(col, 1.0);
}
`

export const MarbleInk = forwardRef<HTMLDivElement, MarbleInkProps>(
  ({ className, speed = 1.0, contrast = 1.0, ...props }, ref) => {
    return (
      <div className={cn("w-full h-full", className)} ref={ref} {...(props as any)}>
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
