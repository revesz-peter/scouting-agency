"use client"

import { useRef, useEffect } from "react"

interface ShaderCanvasProps {
  fs: string
  uniforms?: Record<string, number>
  className?: string
  onReady?: () => void
}

const VERTEX_SHADER = `attribute vec3 aVertexPosition;
void main(void) { gl_Position = vec4(aVertexPosition, 1.0); }`

export function ShaderCanvas({ fs, uniforms = {}, className, onReady }: ShaderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<{
    gl: WebGLRenderingContext
    raf: number
    program: WebGLProgram
    vs: WebGLShader
    fsShader: WebGLShader
    buf: WebGLBuffer
  } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl")
    if (!gl || gl.isContextLost()) return

    let fsSrc = "precision mediump float;\n"
    fsSrc += "uniform float iTime;\n"
    fsSrc += "uniform vec3 iResolution;\n"
    for (const name of Object.keys(uniforms)) {
      fsSrc += `uniform float ${name};\n`
    }
    fsSrc += fs
    fsSrc += `\nvoid main(void) {
  vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}`

    const vs = gl.createShader(gl.VERTEX_SHADER)
    if (!vs) return
    gl.shaderSource(vs, VERTEX_SHADER)
    gl.compileShader(vs)
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      gl.deleteShader(vs)
      return
    }

    const fsShader = gl.createShader(gl.FRAGMENT_SHADER)
    if (!fsShader) { gl.deleteShader(vs); return }
    gl.shaderSource(fsShader, fsSrc)
    gl.compileShader(fsShader)
    if (!gl.getShaderParameter(fsShader, gl.COMPILE_STATUS)) {
      gl.deleteShader(vs)
      gl.deleteShader(fsShader)
      return
    }

    const program = gl.createProgram()
    if (!program) { gl.deleteShader(vs); gl.deleteShader(fsShader); return }
    gl.attachShader(program, vs)
    gl.attachShader(program, fsShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fsShader)
      return
    }
    gl.useProgram(program)

    const buf = gl.createBuffer()
    if (!buf) return
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1,1,0, -1,1,0, 1,-1,0, -1,-1,0]), gl.STATIC_DRAW)
    const pos = gl.getAttribLocation(program, "aVertexPosition")
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0)

    const timeLoc = gl.getUniformLocation(program, "iTime")
    const resLoc = gl.getUniformLocation(program, "iResolution")
    const customLocs: Record<string, WebGLUniformLocation | null> = {}
    for (const name of Object.keys(uniforms)) {
      customLocs[name] = gl.getUniformLocation(program, name)
    }

    const resize = () => {
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener("resize", resize)

    stateRef.current = { gl, raf: 0, program, vs, fsShader, buf }

    let firstFrame = true
    const startTime = performance.now()
    const draw = () => {
      if (gl.isContextLost()) return
      const t = (performance.now() - startTime) / 1000
      gl.uniform1f(timeLoc, t)
      gl.uniform3f(resLoc, canvas.width, canvas.height, 1)
      for (const [name, val] of Object.entries(uniforms)) {
        if (customLocs[name]) gl.uniform1f(customLocs[name], val)
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      if (firstFrame) {
        firstFrame = false
        onReady?.()
      }
      stateRef.current!.raf = requestAnimationFrame(draw)
    }
    stateRef.current.raf = requestAnimationFrame(draw)

    return () => {
      const s = stateRef.current
      if (s) {
        cancelAnimationFrame(s.raf)
        gl.deleteProgram(s.program)
        gl.deleteShader(s.vs)
        gl.deleteShader(s.fsShader)
        gl.deleteBuffer(s.buf)
        stateRef.current = null
      }
      window.removeEventListener("resize", resize)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <canvas ref={canvasRef} className={className} style={{ width: "100%", height: "100%", display: "block" }} />
}
