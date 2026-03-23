"use client";

import { useState, useEffect, useCallback } from "react";
import { ShaderCanvas } from "@/components/ui/shader-canvas";

const INTERVAL = 8000;

const liquidNoirFs = `
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
    float t = iTime * 0.12;
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
`;

const marbleInkFs = `
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
    float t = iTime * 0.15;
    vec2 q = vec2(fbm(uv * 3.0 + t * 0.3), fbm(uv * 3.0 + vec2(1.7, 9.2) + t * 0.2));
    vec2 r = vec2(fbm(uv * 3.0 + q * 4.0 + vec2(8.3, 2.8) + t * 0.1),
                  fbm(uv * 3.0 + q * 4.0 + vec2(5.1, 3.4) + t * 0.15));
    float f = fbm(uv * 3.0 + r * 2.0);
    vec3 white = vec3(0.14, 0.13, 0.13);
    vec3 vein = vec3(0.06, 0.05, 0.06);
    vec3 warm = vec3(0.10, 0.09, 0.10);
    vec3 col = mix(white, warm, smoothstep(0.3, 0.7, f));
    float veinPattern = smoothstep(0.48, 0.52, f);
    col = mix(col, vein, veinPattern * 0.6);
    col *= 0.92 + 0.08 * f;
    fragColor = vec4(col, 1.0);
}
`;

const SHADERS = [
  { fs: liquidNoirFs, uniforms: {} },
  { fs: marbleInkFs, uniforms: {} },
];

export function ShaderCycle() {
  const [active, setActive] = useState(0);
  const [next, setNext] = useState<number | null>(null);
  const [nextReady, setNextReady] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setNext((active + 1) % SHADERS.length);
      setNextReady(false);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, [active]);

  const onNextReady = useCallback(() => {
    setNextReady(true);
  }, []);

  useEffect(() => {
    if (next !== null && nextReady) {
      const timeout = setTimeout(() => {
        setActive(next);
        setNext(null);
        setNextReady(false);
      }, 1500); // crossfade duration
      return () => clearTimeout(timeout);
    }
  }, [next, nextReady]);

  const current = SHADERS[active];

  return (
    <div className="absolute inset-0" style={{ overflowAnchor: "none" }}>
      <ShaderCanvas
        key={`shader-${active}`}
        fs={current.fs}
        uniforms={current.uniforms}
        className="absolute inset-0"
      />
      {next !== null && (
        <div
          className="absolute inset-0 transition-opacity duration-[1500ms]"
          style={{ opacity: nextReady ? 1 : 0 }}
        >
          <ShaderCanvas
            key={`shader-${next}`}
            fs={SHADERS[next].fs}
            uniforms={SHADERS[next].uniforms}
            onReady={onNextReady}
          />
        </div>
      )}
    </div>
  );
}
