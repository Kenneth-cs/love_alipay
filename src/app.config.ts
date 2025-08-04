export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/mirror/index',
    'pages/about/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '神奇哈哈镜',
    navigationBarTextStyle: 'black'
  },
  permission: {
    'scope.camera': {
      desc: '需要使用摄像头进行拍照和录制'
    },
    // 'scope.writePhotosAlbum': {
    //   desc: '需要保存照片和视频到相册'
    // }
  }
})
