import { makeAutoObservable } from 'mobx'

export interface MirrorEffect {
  name: string
  value: string
  shader: string
}

class MirrorStore {
  // 当前选择的效果
  currentEffect: string = 'normal'
  
  // 是否正在录制
  isRecording: boolean = false
  
  // 摄像头是否已授权
  cameraAuthorized: boolean = false
  
  // 可用的效果列表
  effects: MirrorEffect[] = [
    { name: '正常', value: 'normal', shader: 'normal' },
    { name: '凸镜效果', value: 'convex', shader: 'convex' },
    { name: '凹镜效果', value: 'concave', shader: 'concave' },
    { name: '波浪效果', value: 'wave', shader: 'wave' },
    { name: '漩涡效果', value: 'swirl', shader: 'swirl' },
    { name: '鱼眼效果', value: 'fisheye', shader: 'fisheye' }
  ]

  constructor() {
    makeAutoObservable(this)
  }

  // 设置当前效果
  setCurrentEffect(effect: string) {
    this.currentEffect = effect
  }

  // 设置录制状态
  setRecording(recording: boolean) {
    this.isRecording = recording
  }

  // 设置摄像头授权状态
  setCameraAuthorized(authorized: boolean) {
    this.cameraAuthorized = authorized
  }

  // 获取当前效果信息
  getCurrentEffectInfo() {
    return this.effects.find(effect => effect.value === this.currentEffect) || this.effects[0]
  }

  // 切换到下一个效果
  nextEffect() {
    const currentIndex = this.effects.findIndex(effect => effect.value === this.currentEffect)
    const nextIndex = (currentIndex + 1) % this.effects.length
    this.currentEffect = this.effects[nextIndex].value
  }

  // 切换到上一个效果
  prevEffect() {
    const currentIndex = this.effects.findIndex(effect => effect.value === this.currentEffect)
    const prevIndex = currentIndex === 0 ? this.effects.length - 1 : currentIndex - 1
    this.currentEffect = this.effects[prevIndex].value
  }
}

// 创建全局 store 实例
export const mirrorStore = new MirrorStore()

// 应用全局状态
class AppStore {
  // 当前页面
  currentPage: string = 'index'
  
  // 应用信息
  appInfo = {
    name: '哈哈镜小程序',
    version: '1.0.0',
    author: '开发团队'
  }

  constructor() {
    makeAutoObservable(this)
  }

  setCurrentPage(page: string) {
    this.currentPage = page
  }
}

export const appStore = new AppStore()

// 导出所有 store
export default {
  mirrorStore,
  appStore
}
