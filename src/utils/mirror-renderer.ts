// utils/mirror-renderer.ts - 性能优化版本
import { vertexShaderSource, getFragmentShader } from "./shaders";
import { setupWebGL, setupVertexAttributes, cleanupWebGL } from "./webgl-utils";

export interface RenderConfig {
  gl: WebGLRenderingContext;
  canvas: any;
  cameraContext: any;
  effect: string;
  onError?: (error: string) => void;
  frameSkip?: number;
  maxFps?: number; // 新增：最大FPS限制
}

export interface RenderStatus {
  isRendering: boolean;
  currentEffect: string;
  hasResources: boolean;
  frameCount?: number;
  fps?: number;
  droppedFrames?: number; // 新增：丢帧统计
}

export class MirrorRenderer {
  private gl: WebGLRenderingContext;
  private canvas: any;
  private cameraContext: any;
  private program: WebGLProgram | null = null;
  private texture: WebGLTexture | null = null;
  private buffer: WebGLBuffer | null = null;
  private isRendering: boolean = false;
  private startTime: number = 0;
  private currentEffect: string = "normal";
  private onError?: (error: string) => void;
  private frameListener: any = null;

  // 性能控制优化
  private frameSkip: number = 2;
  private frameCounter: number = 0;
  private maxFps: number = 30; // 限制最大FPS
  private lastRenderTime: number = 0;
  private minFrameInterval: number = 1000 / 30; // 对应30fps

  // 性能统计
  private frameCount: number = 0;
  private droppedFrames: number = 0;
  private lastFpsTime: number = 0;
  private currentFps: number = 0;

  // 缓存优化
  private uniformLocations: Map<string, WebGLUniformLocation | null> =
    new Map();
  private attributeLocations: Map<string, number> = new Map();
  private lastFrameData: {
    width?: number;
    height?: number;
    effect?: string;
  } = {};

  constructor(config: RenderConfig) {
    this.gl = config.gl;
    this.canvas = config.canvas;
    this.cameraContext = config.cameraContext;
    this.currentEffect = config.effect;
    this.onError = config.onError;
    this.frameSkip = config.frameSkip || 2;
    this.maxFps = config.maxFps || 30;
    this.minFrameInterval = 1000 / this.maxFps;
  }

  /**
   * 初始化WebGL资源 - 优化版本
   */
  private initWebGLResources(): boolean {
    try {
      this.cleanup();

      const fragmentShaderSource = getFragmentShader(this.currentEffect);
      const result = setupWebGL(
        this.gl,
        vertexShaderSource,
        fragmentShaderSource
      );

      if (!result.program || !result.texture || !result.buffer) {
        this.handleError("Failed to setup WebGL resources");
        return false;
      }

      this.program = result.program;
      this.texture = result.texture;
      this.buffer = result.buffer;

      // 缓存uniform和attribute位置
      this.cacheLocations();

      return true;
    } catch (error) {
      this.handleError(`WebGL initialization error: ${error}`);
      return false;
    }
  }

  /**
   * 缓存uniform和attribute位置以提高性能
   */
  private cacheLocations(): void {
    if (!this.gl || !this.program) return;

    const gl = this.gl;
    const program = this.program;

    // 缓存uniform位置
    const uniforms = [
      "u_texture",
      "u_time",
      "u_resolution",
      "u_textureResolution",
      "u_aspect",
    ];
    uniforms.forEach((name) => {
      this.uniformLocations.set(name, gl.getUniformLocation(program, name));
    });

    // 缓存attribute位置
    const attributes = ["a_position", "a_texCoord"];
    attributes.forEach((name) => {
      this.attributeLocations.set(name, gl.getAttribLocation(program, name));
    });
  }

  /**
   * 开始渲染 - 优化版本
   */
  start(): boolean {
    if (this.isRendering) {
      console.log("Already rendering, stopping previous render");
      this.stop();
    }

    if (!this.initWebGLResources()) {
      return false;
    }

    this.isRendering = true;
    this.startTime = Date.now();
    this.frameCount = 0;
    this.droppedFrames = 0;
    this.frameCounter = 0;
    this.lastFpsTime = this.startTime;
    this.lastRenderTime = this.startTime;

    this.startCameraFrameListener();

    console.log("MirrorRenderer started with optimized rendering");
    return true;
  }

  /**
   * 启动相机帧监听 - 优化版本
   */
  private startCameraFrameListener(): void {
    if (!this.cameraContext) {
      this.handleError("Camera context not available");
      return;
    }

    this.frameListener = this.cameraContext.onCameraFrame((frame: any) => {
      if (!this.isRendering) return;

      const currentTime = Date.now();

      // FPS限制检查
      if (currentTime - this.lastRenderTime < this.minFrameInterval) {
        this.droppedFrames++;
        return;
      }

      this.frameCounter++;
      if (this.frameCounter % this.frameSkip !== 0) {
        return;
      }

      try {
        this.processFrameData(frame, currentTime);
        this.lastRenderTime = currentTime;
      } catch (error) {
        console.error("Frame processing error:", error);
      }
    });

    if (this.frameListener && typeof this.frameListener.start === "function") {
      this.frameListener.start();
    }
  }

  /**
   * 处理相机帧数据 - 优化版本
   */
  private processFrameData(frame: any, currentTime: number): void {
    if (!this.gl || !this.program || !this.texture || !this.buffer) {
      return;
    }

    this.updateFpsStats(currentTime);

    // 检查是否需要重新处理数据
    const needsProcessing = this.shouldProcessFrame(frame);

    let processedData: Uint8Array;
    if (needsProcessing) {
      const imgData = new Uint8Array(frame.data);
      processedData = this.applyEffect(imgData, frame.width, frame.height);
    } else {
      // 直接使用原始数据
      processedData = new Uint8Array(frame.data);
    }

    this.renderFrameData(processedData, frame.width, frame.height, currentTime);
  }

  /**
   * 判断是否需要CPU端处理帧数据
   */
  private shouldProcessFrame(frame: any): boolean {
    // 只有特定效果需要CPU处理
    const cpuEffects = ["redRemove", "mirror"];
    return cpuEffects.includes(this.currentEffect);
  }

  /**
   * 应用效果处理 - 优化版本
   */
  private applyEffect(
    imgData: Uint8Array,
    width: number,
    height: number
  ): Uint8Array {
    // 使用对象池避免频繁内存分配
    const processedData = this.getProcessedDataBuffer(imgData.length);

    switch (this.currentEffect) {
      case "redRemove":
        this.applyRedRemoveEffect(imgData, processedData);
        break;

      case "mirror":
        this.applyMirrorEffect(imgData, processedData, width, height);
        break;

      default:
        processedData.set(imgData);
        break;
    }

    return processedData;
  }

  // 对象池用于复用内存
  private processedDataPool: Uint8Array[] = [];
  private getProcessedDataBuffer(size: number): Uint8Array {
    let buffer = this.processedDataPool.pop();
    if (!buffer || buffer.length !== size) {
      buffer = new Uint8Array(size);
    }
    return buffer;
  }

  private returnProcessedDataBuffer(buffer: Uint8Array): void {
    if (this.processedDataPool.length < 3) {
      // 限制池大小
      this.processedDataPool.push(buffer);
    }
  }

  /**
   * 优化的红色移除效果
   */
  private applyRedRemoveEffect(
    imgData: Uint8Array,
    processedData: Uint8Array
  ): void {
    for (let i = 0; i < imgData.length; i += 4) {
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];

      // 优化的红色检测
      if (r >= 100 && r >= g << 1 && r >= b << 1) {
        processedData[i] = 0;
        processedData[i + 1] = 0;
        processedData[i + 2] = 0;
        processedData[i + 3] = 0;
      } else {
        processedData[i] = r;
        processedData[i + 1] = g;
        processedData[i + 2] = b;
        processedData[i + 3] = imgData[i + 3];
      }
    }
  }

  /**
   * 优化的镜像效果
   */
  private applyMirrorEffect(
    imgData: Uint8Array,
    processedData: Uint8Array,
    width: number,
    height: number
  ): void {
    const rowSize = width * 4;

    for (let y = 0; y < height; y++) {
      const rowStart = y * rowSize;

      for (let x = 0; x < width; x++) {
        const srcIndex = rowStart + x * 4;
        const dstIndex = rowStart + (width - 1 - x) * 4;

        // 批量复制4个字节
        processedData[dstIndex] = imgData[srcIndex];
        processedData[dstIndex + 1] = imgData[srcIndex + 1];
        processedData[dstIndex + 2] = imgData[srcIndex + 2];
        processedData[dstIndex + 3] = imgData[srcIndex + 3];
      }
    }
  }

  /**
   * 渲染帧数据 - 优化版本
   */
  private renderFrameData(
    data: Uint8Array,
    width: number,
    height: number,
    currentTime: number
  ): void {
    if (!this.gl || !this.program || !this.texture || !this.buffer) {
      return;
    }

    const gl = this.gl;
    const shaderTime = (currentTime - this.startTime) / 1000;

    // 只在必要时切换程序
    gl.useProgram(this.program);

    // 使用缓存的位置设置顶点属性
    this.setupVertexAttributesOptimized();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    // 只在尺寸变化时更新纹理参数
    if (
      this.lastFrameData.width !== width ||
      this.lastFrameData.height !== height
    ) {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        width,
        height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        data
      );
      this.lastFrameData.width = width;
      this.lastFrameData.height = height;
    } else {
      // 使用更快的子纹理更新
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        0,
        0,
        width,
        height,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        data
      );
    }

    this.setUniformsOptimized(shaderTime, width, height);

    // 只在必要时清除
    if (this.needsClear()) {
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // 回收缓冲区
    this.returnProcessedDataBuffer(data);
  }

  /**
   * 优化的顶点属性设置
   */
  private setupVertexAttributesOptimized(): void {
    if (!this.gl || !this.buffer) return;

    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    const positionLocation = this.attributeLocations.get("a_position");
    const texCoordLocation = this.attributeLocations.get("a_texCoord");

    if (positionLocation !== undefined && positionLocation >= 0) {
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);
    }

    if (texCoordLocation !== undefined && texCoordLocation >= 0) {
      gl.enableVertexAttribArray(texCoordLocation);
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8);
    }
  }

  /**
   * 优化的uniform设置
   */
  private setUniformsOptimized(
    time: number,
    textureWidth?: number,
    textureHeight?: number
  ): void {
    if (!this.gl) return;

    const gl = this.gl;

    // 使用缓存的位置设置uniforms
    const textureLocation = this.uniformLocations.get("u_texture");
    if (textureLocation) {
      gl.uniform1i(textureLocation, 0);
    }

    const timeLocation = this.uniformLocations.get("u_time");
    if (timeLocation) {
      gl.uniform1f(timeLocation, time);
    }

    const resolutionLocation = this.uniformLocations.get("u_resolution");
    if (resolutionLocation) {
      gl.uniform2f(resolutionLocation, this.canvas.width, this.canvas.height);
    }

    const textureResolutionLocation = this.uniformLocations.get(
      "u_textureResolution"
    );
    if (textureResolutionLocation && textureWidth && textureHeight) {
      gl.uniform2f(textureResolutionLocation, textureWidth, textureHeight);
    }

    const aspectLocation = this.uniformLocations.get("u_aspect");
    if (aspectLocation) {
      const aspect = this.canvas.width / this.canvas.height;
      gl.uniform1f(aspectLocation, aspect);
    }
  }

  /**
   * 判断是否需要清除画布
   */
  private needsClear(): boolean {
    // 某些效果可能不需要清除
    const noClearEffects = ["normal", "mirror", "vmirror"];
    return !noClearEffects.includes(this.currentEffect);
  }

  /**
   * 切换效果 - 优化版本
   */
  changeEffect(effect: string): boolean {
    if (effect === this.currentEffect) {
      return true;
    }

    const wasRendering = this.isRendering;
    this.currentEffect = effect;
    this.lastFrameData = {}; // 清除缓存

    if (wasRendering) {
      this.initWebGLResources();
    }

    return true;
  }

  /**
   * 更新FPS统计 - 优化版本
   */
  private updateFpsStats(currentTime: number): void {
    this.frameCount++;
    if (currentTime - this.lastFpsTime >= 1000) {
      this.currentFps = Math.round(
        (this.frameCount * 1000) / (currentTime - this.lastFpsTime)
      );
      this.frameCount = 0;
      this.lastFpsTime = currentTime;
    }
  }

  /**
   * 清理WebGL资源 - 优化版本
   */
  private cleanup(): void {
    if (this.gl && (this.program || this.texture || this.buffer)) {
      cleanupWebGL(this.gl, this.program, this.texture, this.buffer);
      this.program = null;
      this.texture = null;
      this.buffer = null;
    }

    // 清理缓存
    this.uniformLocations.clear();
    this.attributeLocations.clear();
    this.lastFrameData = {};

    // 清理对象池
    this.processedDataPool.length = 0;
  }

  /**
   * 获取当前状态 - 增强版本
   */
  getStatus(): RenderStatus {
    return {
      isRendering: this.isRendering,
      currentEffect: this.currentEffect,
      hasResources: !!(this.program && this.texture && this.buffer),
      frameCount: this.frameCount,
      fps: this.currentFps,
      droppedFrames: this.droppedFrames,
    };
  }

  /**
   * 动态调整性能参数
   */
  adjustPerformance(): void {
    if (this.currentFps < 20) {
      // 性能不足时增加跳帧
      this.frameSkip = Math.min(this.frameSkip + 1, 5);
      this.maxFps = Math.max(this.maxFps - 5, 15);
    } else if (this.currentFps > 25 && this.frameSkip > 1) {
      // 性能充足时减少跳帧
      this.frameSkip = Math.max(this.frameSkip - 1, 1);
      this.maxFps = Math.min(this.maxFps + 2, 30);
    }

    this.minFrameInterval = 1000 / this.maxFps;
  }

  // 其他方法保持不变...
  stop(): void {
    this.isRendering = false;

    if (this.frameListener && typeof this.frameListener.stop === "function") {
      this.frameListener.stop();
    }
    this.frameListener = null;

    this.cleanup();
  }

  updateConfig(config: Partial<RenderConfig>): void {
    if (config.frameSkip !== undefined) {
      this.frameSkip = config.frameSkip;
    }
    if (config.onError !== undefined) {
      this.onError = config.onError;
    }
    if (config.maxFps !== undefined) {
      this.maxFps = config.maxFps;
      this.minFrameInterval = 1000 / this.maxFps;
    }
  }

  pause(): void {
    this.isRendering = false;
    if (this.frameListener && typeof this.frameListener.stop === "function") {
      this.frameListener.stop();
    }
  }

  resume(): boolean {
    if (this.isRendering) {
      return true;
    }

    if (!this.program || !this.texture || !this.buffer) {
      return this.start();
    }

    this.isRendering = true;
    this.startCameraFrameListener();
    return true;
  }

  destroy(): void {
    this.stop();
    this.gl = null as any;
    this.canvas = null;
    this.cameraContext = null;
    this.onError = undefined;
  }

  private handleError(message: string): void {
    console.error("MirrorRenderer:", message);
    if (this.onError) {
      this.onError(message);
    }
  }
}
