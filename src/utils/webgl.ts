/**
 * WebGL 工具函数
 */

// 创建着色器
export function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('着色器编译错误:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }

  return shader
}

// 创建着色器程序
export function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
  const program = gl.createProgram()
  if (!program) return null

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('程序链接错误:', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }

  return program
}

// 创建纹理
export function createTexture(gl: WebGLRenderingContext): WebGLTexture | null {
  const texture = gl.createTexture()
  if (!texture) return null

  gl.bindTexture(gl.TEXTURE_2D, texture)
  
  // 设置纹理参数
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

  return texture
}

// 更新纹理数据
export function updateTexture(gl: WebGLRenderingContext, texture: WebGLTexture, width: number, height: number, data: any) {
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data)
}

// 设置顶点属性
export function setupVertexAttribute(gl: WebGLRenderingContext, program: WebGLProgram, attributeName: string, size: number, stride: number, offset: number) {
  const location = gl.getAttribLocation(program, attributeName)
  if (location === -1) return

  gl.enableVertexAttribArray(location)
  gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, offset)
}

// 设置 uniform 变量
export function setUniform(gl: WebGLRenderingContext, program: WebGLProgram, uniformName: string, value: any, type: string = 'float') {
  const location = gl.getUniformLocation(program, uniformName)
  if (!location) return

  switch (type) {
    case 'float':
      gl.uniform1f(location, value)
      break
    case 'vec2':
      gl.uniform2fv(location, value)
      break
    case 'vec3':
      gl.uniform3fv(location, value)
      break
    case 'vec4':
      gl.uniform4fv(location, value)
      break
    case 'int':
      gl.uniform1i(location, value)
      break
    case 'mat4':
      gl.uniformMatrix4fv(location, false, value)
      break
  }
}

// 检查 WebGL 支持
export function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!gl
  } catch (e) {
    return false
  }
}

// 获取 WebGL 扩展
export function getWebGLExtensions(gl: WebGLRenderingContext) {
  return {
    OES_texture_float: gl.getExtension('OES_texture_float'),
    OES_texture_half_float: gl.getExtension('OES_texture_half_float'),
    WEBGL_lose_context: gl.getExtension('WEBGL_lose_context'),
    OES_standard_derivatives: gl.getExtension('OES_standard_derivatives')
  }
}
