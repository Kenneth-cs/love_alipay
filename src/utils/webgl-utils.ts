// webgl-utils.ts
export const setupWebGL = (gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string) => {
  // 创建着色器
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  
  if (!vertexShader || !fragmentShader) {
    console.error('Failed to create shaders');
    return { program: null, texture: null, buffer: null };
  }

  // 创建程序
  const program = createProgram(gl, vertexShader, fragmentShader);
  if (!program) {
    console.error('Failed to create program');
    return { program: null, texture: null, buffer: null };
  }

  // 设置顶点数据
  const positions = new Float32Array([
    -1, -1,  0, 1,
     1, -1,  1, 1,
    -1,  1,  0, 0,
     1,  1,  1, 0,
  ]);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  // 创建纹理
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  
  // 设置纹理参数
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  // 清理着色器（程序链接后就不需要了）
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return { program, texture, buffer };
};

// 添加清理函数
export const cleanupWebGL = (gl: WebGLRenderingContext, program: WebGLProgram | null, texture: WebGLTexture | null, buffer: WebGLBuffer | null) => {
  if (program) {
    gl.deleteProgram(program);
  }
  if (texture) {
    gl.deleteTexture(texture);
  }
  if (buffer) {
    gl.deleteBuffer(buffer);
  }
};

// 设置顶点属性的独立函数
export const setupVertexAttributes = (gl: WebGLRenderingContext, program: WebGLProgram, buffer: WebGLBuffer) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);

  gl.enableVertexAttribArray(texCoordLocation);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8);
};

const createShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (!shader) {
    console.error('Failed to create shader');
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
};

const createProgram = (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null => {
  const program = gl.createProgram();
  if (!program) {
    console.error('Failed to create program');
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
};
