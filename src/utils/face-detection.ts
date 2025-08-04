// utils/face-detector.ts
import * as faceapi from 'face-api.js';

export interface FaceData {
  leftEye: [number, number];
  rightEye: [number, number];
  mouth: [number, number];
  detected: boolean;
}

export class FaceDetector {
  private isInitialized: boolean = false;
  private isLoading: boolean = false;
  
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    if (this.isLoading) return false;
    
    this.isLoading = true;
    
    try {
      // 加载轻量级模型以提高性能
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models')
      ]);
      
      this.isInitialized = true;
      this.isLoading = false;
      console.log('Face detector initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to load face-api models:', error);
      this.isLoading = false;
      return false;
    }
  }
  
  async detectFace(canvas: HTMLCanvasElement): Promise<FaceData> {
    const defaultFaceData: FaceData = {
      leftEye: [0.35, 0.4],
      rightEye: [0.65, 0.4],
      mouth: [0.5, 0.6],
      detected: false
    };
    
    if (!this.isInitialized) {
      return defaultFaceData;
    }
    
    try {
      const detection = await faceapi
        .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions({
          inputSize: 224,
          scoreThreshold: 0.5
        }))
        .withFaceLandmarks(true);
        
      if (!detection) {
        return defaultFaceData;
      }
      
      const landmarks = detection.landmarks;
      const { width, height } = canvas;
      
      // 获取眼睛和嘴巴的关键点
      const leftEyePoints = landmarks.getLeftEye();
      const rightEyePoints = landmarks.getRightEye();
      const mouthPoints = landmarks.getMouth();
      
      // 计算中心点
      const leftEyeCenter = this.calculateCenter(leftEyePoints);
      const rightEyeCenter = this.calculateCenter(rightEyePoints);
      const mouthCenter = this.calculateCenter(mouthPoints);
      
      return {
        leftEye: [leftEyeCenter.x / width, leftEyeCenter.y / height],
        rightEye: [rightEyeCenter.x / width, rightEyeCenter.y / height],
        mouth: [mouthCenter.x / width, mouthCenter.y / height],
        detected: true
      };
    } catch (error) {
      console.error('Face detection error:', error);
      return defaultFaceData;
    }
  }
  
  private calculateCenter(points: faceapi.Point[]): { x: number, y: number } {
    let sumX = 0, sumY = 0;
    
    for (const point of points) {
      sumX += point.x;
      sumY += point.y;
    }
    
    return {
      x: sumX / points.length,
      y: sumY / points.length
    };
  }
  
  isReady(): boolean {
    return this.isInitialized;
  }
}
