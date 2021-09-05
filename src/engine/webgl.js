import {
  GL_ARRAY_BUFFER,
  GL_BLEND,
  GL_COLOR_BUFFER_BIT,
  GL_CULL_FACE,
  GL_DEPTH_BUFFER_BIT,
  GL_DEPTH_TEST,
  GL_FLOAT,
  GL_FRAGMENT_SHADER,
  GL_LEQUAL,
  GL_LINK_STATUS,
  GL_ONE_MINUS_SRC_ALPHA,
  GL_SRC_ALPHA,
  GL_STATIC_DRAW,
  GL_TRIANGLES,
  GL_VERTEX_SHADER,
} from './gl-constants';

/**
 * @typedef {() => void} ClearFn Function that clears the canvas
 */
/**
 * Clear the canvas
 * @param {WebGLRenderingContext} gl - WebGL Rendering Context
 * @returns {ClearFn} Function that clears the canvas
 */
const clear = (gl) => () => {
  gl.clC(0.0, 0.0, 0.0, 1.0);
  gl.clD(1.0);
  gl.cl(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
};

/**
 * Draw arrays from loaded buffers
 * @callback DrawFn
 * @param {number} count
 * @param {number} offset
 * @returns {void}
 */
/**
 * Draw arrays from loaded buffers
 * @param {WebGLRenderingContext} gl - WebGL Rendering Context
 * @returns {(mode: GLenum) => DrawFn} Draw arrays from loaded buffers
 */
const drawArrays = (gl) => (mode = GL_TRIANGLES) => (count, offset = 0) =>
  gl.drA(mode, offset, count);

/**
 * Create shader
 * @param {WebGLRenderingContext} gl - WebGL Rendering Context
 * @param {GLenum} type - GL_VERTEX_SHADER || GL_FRAGMENT_SHADER
 * @param {string} source - WebGL Shader source
 * @returns {WebGLShader} shader
 */
const createShader = (gl, type, source) => {
  const shader = gl.crS(type);
  gl.shS(shader, source);
  gl.coS(shader);
  return shader;
};

/**
 * Set active shader program
 * @param {WebGLRenderingContext} gl - WebGL Rendering Context
 * @returns {(prg: WebGLProgram) => () => void} Create function that sets active shader program
 */
const useProgram = (gl) => (prg) => () => gl.usP(prg);

/**
 * Use uniform setters
 * @param {WebGLRenderingContext} gl - WebGL Rendering Context
 * @returns {(prg: WebGLProgram) => (variable: string) => any} Create uniform setter obj
 */
const uniformSetter = (gl) => (prg) => (variable) => {
  const loc = gl.geUL(prg, variable);

  return {
    u1f: (...data) => gl.un1f(loc, ...data),
    u2f: (...data) => gl.un2f(loc, ...data),
    u3f: (...data) => gl.un3f(loc, ...data),
    u4f: (...data) => gl.un4f(loc, ...data),
    m3fv: (...data) => gl.unM3fv(loc, ...data),
    m4fv: (...data) => gl.unM4fv(loc, ...data),
    u1i: (...data) => gl.un1i(loc, ...data),
  };
};

/**
 * Set attrib location
 * @param {WebGLRenderingContext} gl - WebGL Rendering Context
 * @returns {(prg: WebGLProgram) => (variable: string) => void} Set attrib loc
 */
const attribLoc = (gl) => (prg) => (variable) => gl.geAL(prg, variable);

/** @callback UsePrg use shader program
 * @returns {void}
 */
/** @callback GetUniform get uniform setter
 * @param {string} variable
 */
/** @callback AttribLoc set given variable's attrib loc
 * @param {string} variable
 * @returns {void}
 */
/**
 * @callback ShaderFromSrcFn
 * @param {string} vSource
 * @param {string} fSource
 * @returns {[UsePrg, GetUniform, AttribLoc]}
 */
/**
 * Create Shader Program
 * @param {WebGLRenderingContext} gl - WebGL Rendering Context
 * @returns {ShaderFns} Shader functions
 */
const createShaderProgram = (gl) => (vShader, fShader) => {
  const prg = gl.crP();
  gl.atS(prg, vShader);
  gl.atS(prg, fShader);
  gl.liP(prg);

  // TODO: remove before final release
  if (!gl.gePP(prg, GL_LINK_STATUS)) {
    console.error('Link failed: ', gl.gePIL(prg));
    console.error('vs info-log: ', gl.geSIL(vShader));
    console.error('fs info-log: ', gl.geSIL(fShader));
    return null;
  }

  return [
    useProgram(gl)(prg),
    uniformSetter(gl)(prg),
    attribLoc(gl)(prg),
  ];
};

/**
 * Create shader program from strings
 * @param {WebGLRenderingContext} gl - WebGL Rendering Context
 * @returns {ShaderFromSrcFn} get shader funcs
 */
const createShaderProgramFromSrc = (gl) => (vsSource, fsSource) => {
  const vShader = createShader(gl, GL_VERTEX_SHADER, vsSource);
  const fShader = createShader(gl, GL_FRAGMENT_SHADER, fsSource);

  return createShaderProgram(gl)(vShader, fShader);
};


/**
 * Bind buffer to type
 * @param {WebGLRenderingContext} gl - WebGL Rendering Context
 * @param {GLenum} type - Buffer type
 * @param {WebGLBuffer} buf - Buffer
 */
const bindBuffer = (gl, type, buf) => gl.biB(type, buf);

/**
 * @typedef {(data: any) => void} SetBufDataFn Set data to buffer
/**
 * Bind buffer and set it's data
 * @param {WebGLRenderingContext} gl - WebGL Rendering Context
 * @param {WebGLBuffer} buf - Buffer
 * @param {GLenum} type - Buffer type (ARRAY_BUFFER)
 * @param {GLenum} mode - Buffer mode (STATIC_DRAW)
 */
const setBufferData = (gl, buf, type = GL_ARRAY_BUFFER, mode = GL_STATIC_DRAW) => (data) => {
  bindBuffer(gl, type, buf);
  gl.buD(type, data, mode);
};

/**
 * @callback AttribSetFn
 * @param {number} loc attrib location
 * @param {number} size
 * @param {number} dataType
 * @param {number} stride
 * @param {number} offset
 * @param {boolean} normalize
 * @returns {() => void} Fn to set the attrib
 */
/**
 * Clear the canvas
 * @param {WebGLRenderingContext} gl - WebGL Rendering Context
 * @param {GLenum} type - Buffer type
 * @param {WebGLBuffer} buf - Buffer
 * @returns {AttribSetFn}
 */
const attribSetter = (gl, type, buf) => (loc, size, dataType = GL_FLOAT, stride = 0, offset = 0, normalize = false) => () => {
  bindBuffer(gl, type, buf);
  gl.enVAA(loc);
  gl.veAP(loc, size, dataType, normalize, stride, offset);
};

/**
 * @callback BindBuf bind buffer
 * @returns {void}
 */
/**
 * Buffer state
 * @callback GetBufferData
 * @param {GLenum} type - Buffer type
 * @param {GLenum} mode - Buffer mode
 * @returns {[SetBufDataFn, AttribSetFn]}
 */
/**
 * Create buffer
 * @param {WebGLRenderingContext} gl - WebGL Rendering Context
 * @returns {GetBufferData}
 */
const createBuffer = (gl) => (type = GL_ARRAY_BUFFER, mode = GL_STATIC_DRAW) => {
  const buf = gl.crB();
  return [
    setBufferData(gl, buf, type, mode),
    // TODO: Return attribSetter from inside setData?
    attribSetter(gl, type, buf),
  ];
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
 * @property {GetBufferData} createBuffer - create buffer
 * @property {(mode: GLenum) => DrawFn} drawArrays - Draw arrays from loaded buffers
 */

/**
 * Create GL context
 * @arg {HTMLCanvasElement} canvas - Canvas element
 *
 * @returns {[WebGLRenderingContext, ClearFn, ShaderFromSrcFn, GetBufferData, (mode: GLenum) => DrawFn]} Rendering functions
 */
export const createGLContext = (canvas) => {
  const gl = canvas.getContext('webgl');
  if (!gl) {
    // TODO remove before release
    alert('Could not get webgl context!');
    return null;
  };

  // create smaller names of all GL methods
  for (let name in gl) {
    if (gl[name].length !== undefined) { // is function?
      gl[name.match(/(^..|[A-Z]|\d.|v$)/g).join('')] = gl[name];
    }
  }

  gl.vi(0, 0, canvas.width, canvas.height);
  gl.en(GL_CULL_FACE);
  gl.en(GL_DEPTH_TEST);
  gl.en(GL_BLEND);
  gl.deF(GL_LEQUAL);
  gl.blF(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

  return [
    clear(gl),
    createShaderProgramFromSrc(gl),
    createBuffer(gl),
    //createTexture: createTexture(gl),
    drawArrays(gl),
  ];
};

// vim: fdm=marker:et:sw=2:
