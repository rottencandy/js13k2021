/**
 * @typedef {() => void} ClearFn Function that clears the canvas
 */
/**
 * Clear the canvas
 * @param {WebGLRenderingContext} gl - WebGL Rendering Context
 * @returns {ClearFn} Function that clears the canvas
 */
const clear = (gl) => () => {
  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};

/**
 * @typedef {() => void} DrawFn Draw arrays from loaded buffers
 */
/**
 * Draw arrays from loaded buffers
 * @param {WebGLRenderingContext} gl - WebGL Rendering Context
 * @returns {DrawFn} Draw arrays from loaded buffers
 */
const drawArrays = (gl) => (mode = gl.TRIANGLES) => (count, offset = 0) =>
  gl.drawArrays(mode, offset, count);

/**
 * Create shader
 * @param {WebGLRenderingContext} gl - WebGL Rendering Context
 * @param {GLenum} type - gl.VERTEX_SHADER || gl.FRAGMENT_SHADER
 * @param {string} source - WebGL Shader source
 * @returns {WebGLShader} shader
 */
const createShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
};

/**
 * Set active shader program
 * @param {WebGLRenderingContext} gl - WebGL Rendering Context
 * @returns {(prg: WebGLProgram) => () => void} Create function that sets active shader program
 */
const useProgram = (gl) => (prg) => () => gl.useProgram(prg);

/**
 * Use uniform setters
 * @param {WebGLRenderingContext} gl - WebGL Rendering Context
 * @returns {(prg: WebGLProgram) => (variable: string) => any} Create uniform setter obj
 */
const uniformSetter = (gl) => (prg) => (variable) => {
  const loc = gl.getUniformLocation(prg, variable);

  return {
    u1f: (...data) => gl.uniform1f(loc, ...data),
    u2f: (...data) => gl.uniform2f(loc, ...data),
    u3f: (...data) => gl.uniform3f(loc, ...data),
    u4f: (...data) => gl.uniform4f(loc, ...data),
    m3fv: (...data) => gl.uniformMatrix3fv(loc, ...data),
    m4fv: (...data) => gl.uniformMatrix4fv(loc, ...data),
    u1i: (...data) => gl.uniform1i(loc, ...data),
  };
};

/**
 * Set attrib location
 * @param {WebGLRenderingContext} gl - WebGL Rendering Context
 * @returns {(prg: WebGLProgram) => (variable: string) => void} Set attrib loc
 */
const attribLoc = (gl) => (prg) => (variable) => gl.getAttribLocation(prg, variable);

/**
 * @typedef {Object} ShaderFns
 * @param {WebGLProgram} prg shader program
 * @param {() => void} use set program as active
 * @param {(variable: string) => any} getUniform get uniform setter
 * @param {(variable: string) => void} attribLoc set given variable's attrib loc
 */

/**
 * Create Shader Program
 * @param {WebGLRenderingContext} gl - WebGL Rendering Context
 * @returns {ShaderFns} Shader functions
 */
const createShaderProgram = (gl) => (vShader, fShader) => {
  const prg = gl.createProgram();
  gl.attachShader(prg, vShader);
  gl.attachShader(prg, fShader);
  gl.linkProgram(prg);

  // TODO: remove before final release
  if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
    console.error('Link failed: ', gl.getProgramInfoLog(prg));
    console.error('vs info-log: ', gl.getShaderInfoLog(vShader));
    console.error('fs info-log: ', gl.getShaderInfoLog(fShader));
    return null;
  }

  return {
    program: prg,
    use: useProgram(gl)(prg),
    getUniform: uniformSetter(gl)(prg),
    attribLoc: attribLoc(gl)(prg),
  };
};

/**
 * @typedef {(vSource: string, fSource: string) => ShaderFns} ShaderFromSrcFn
 */

/**
 * Create shader program from strings
 * @param {WebGLRenderingContext} gl - WebGL Rendering Context
 * @returns {ShaderFromSrcFn} get shader funcs
 */
const createShaderProgramFromSrc = (gl) => (vsSource, fsSource) => {
  const vShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

  return createShaderProgram(gl)(vShader, fShader);
};


/**
 * Bind buffer to type
 * @param {WebGLRenderingContext} gl - WebGL Rendering Context
 * @param {GLenum} type - Buffer type
 * @param {WebGLBuffer} buf - Buffer
 */
const bindBuffer = (gl, type, buf) => gl.bindBuffer(type, buf);

/**
 * @typedef {(data: any) => void} SetBufDataFn Set data to buffer
/**
 * Bind buffer and set it's data
 * @param {WebGLRenderingContext} gl - WebGL Rendering Context
 * @param {WebGLBuffer} buf - Buffer
 * @param {GLenum} type - Buffer type (ARRAY_BUFFER)
 * @param {GLenum} mode - Buffer mode (STATIC_DRAW)
 */
const setBufferData = (gl, buf, type = gl.ARRAY_BUFFER, mode = gl.STATIC_DRAW) => (data) => {
  bindBuffer(gl, type, buf);
  gl.bufferData(type, data, mode);
};

// TODO: Take an array of pinters to enable at once?
/**
 * @typedef {Function} AttribSetFn
 * @param {number} loc attrib location
 * @param {number} size
 * @param {number} dataType
 * @param {number} stride
 * @param {number} offset
 * @param {boolean=false} normalize
 * @returns {() => void} Fn to set the attrib
 */
/**
 * Clear the canvas
 * @param {WebGLRenderingContext} gl - WebGL Rendering Context
 * @param {GLenum} type - Buffer type
 * @param {WebGLBuffer} buf - Buffer
 * @returns {AttribSetFn}
 */
const attribSetter = (gl, type, buf) => (loc, size, dataType = gl.FLOAT, stride = 0, offset = 0, normalize = false) => () => {
  bindBuffer(gl, type, buf);
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, size, dataType, normalize, stride, offset);
};

/**
 * @typedef {Object} BufferData
 * @property {WebGLBuffer} buf - Buffer
 * @property {() => void} bind - Bind buffer
 * @property {SetBufDataFn} setData - Bind and set buffer data
 * @property {AttribSetFn} attribSetter - Bind & set attrib data
 */
/**
 * @typedef {Function} GetBufferData
 * @param {GLenum} type - Buffer type
 * @param {GLenum} mode - Buffer mode
 */
/**
 * Create buffer
 * @param {WebGLRenderingContext} gl - WebGL Rendering Context
 * @returns {GetBufferData} buffer state
 */
const createBuffer = (gl) => (type = gl.ARRAY_BUFFER, mode = gl.STATIC_DRAW) => {
  const buf = gl.createBuffer();
  return {
    buffer: buf,
    bind: () => bindBuffer(gl, type, buf),
    setData: setBufferData(gl, buf, type, mode),
    // TODO: Return attribSetter from inside setData?
    attribSetter: attribSetter(gl, type, buf),
  };
};

// TODO: texture functions
//const bindTexture = (gl) => (type) => (buf) => gl.bindTexture(type, buf);

//const setTexure = (gl) => (type) => (buf) => (...data) => {
//  bindTexture(gl)(type)(buf);
//  gl.texImage2D(type, ...data);
//};

// A 1x1 blue pixel
//const placeholderTex = (gl) => [
//  0,
//  gl.RGBA,
//  1,
//  1,
//  0,
//  gl.RGBA,
//  gl.UNSIGNED_BYTE,
//  new Uint8Array([0, 0, 255, 255])
//];

//const texAttribSetter = (gl) => (type) => (buf) => (loc) => (size, dataType = gl.FLOAT, stride = 0, offset = 0, normalize = false) => () => {
//  bindTexture(gl)(type)(buf);
//  gl.enableVertexAttribArray(loc);
//  gl.vertexAttribPointer(loc, size, dataType, normalize, stride, offset);
//};

//const setTexData = (gl) => (type = gl.ARRAY_BUFFER) => (mode = gl.STATIC_DRAW) => (data) => gl.bufferData(type, data, mode);

//const createTexture = (gl) => (type = gl.TEXTURE_2D, mode = gl.STATIC_DRAW) => {
//  const texBuf = gl.createTexture();
//  setTexure(gl)(type)(texBuf)(...placeholderTex(gl));
//  return {
//    // Bind texture
//    bind: () => bindTexture(gl)(type)(texBuf),
//    // Bind buffer and set buffer data
//    setData: setTexData(gl)(type)(mode),
//    // Bind buffer and set texture data
//    setTex: () => setTexure(gl)(type)(texBuf),
//    // Bind buffer and specify how shader reads it
//    attribSetter: texAttribSetter(gl)(type)(texBuf),
//    // TODO: Move into setTex and run with a flag?
//    genMipmap: () => gl.generateMipmap(type),
//  };
//};

/**
 * WebGL context-aware rendering functions
 * @typedef {Object} WebGLFuncs
 * @property {WebGLRenderingContext} gl - WebGL rendering context
 * @property {ClearFn} clear - Clear the canvas
 * @property {ShaderFromSrcFn} CreateShaderProg - Create shader program from src
 * @property {GetBufferData} createBuffer
 * @property {DrawFn} drawArrays - Draw arrays from loaded buffers
 */

/**
 * Create GL context
 * @arg {HTMLCanvasElement} canvas - Canvas element
 *
 * @returns {WebGLFuncs} Rendering functions
 */
export const createGLContext = (canvas) => {
  const gl = canvas.getContext('webgl');
  if (!gl) {
    // TODO remove before release
    alert('Could not get webgl context!');
    return null;
  };

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  return {
    gl,
    clear: clear(gl),
    createShaderProg: createShaderProgramFromSrc(gl),
    createBuffer: createBuffer(gl),
    //createTexture: createTexture(gl),
    // Draw arrays using active program and buffer
    drawArrays: drawArrays(gl),
  };
};

// vim: fdm=marker:et:sw=2: