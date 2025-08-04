import { View, Text, Canvas } from "@tarojs/components";
import Taro, { useReady } from "@tarojs/taro";
import { useState } from "react";
import dayjs from "dayjs";
import { useShare } from "../../utils/share-utils";
import { PosterGenerator } from "../../utils/poster-generator";
import "./index.scss";

const About = () => {
  const [canvasSize, setCanvasSize] = useState({ width: 750, height: 1334 });
  const posterGenerator = new PosterGenerator();

  useReady(() => {
    // 获取屏幕尺寸并设置Canvas大小
    const systemInfo = Taro.getSystemInfoSync();
    const width = Math.floor(systemInfo.screenWidth * 0.9);
    const height = Math.floor(systemInfo.screenHeight * 0.9);
    setCanvasSize({ width, height });
  });

  const appInfo = {
    version: "1.0.0",
    author: "开发团队",
    description:
      "「神奇哈哈镜」一键解锁镜像、扭曲、炫彩等12种奇幻特效，从鱼眼漩涡到油画像素，秒变创意视觉大师！基于先进的图像处理技术，为您带来前所未有的视觉体验。无论是日常自拍还是创意摄影，都能让您的作品瞬间脱颖而出，成为朋友圈的焦点。",
    buildTime: dayjs().format("YYYY-MM-DD"),
    features: [
      "12+种神奇特效滤镜",
      "实时摄像头预览",
      "高清图片处理",
      "一键拍照保存",
      "简单易用界面",
      "快速分享功能",
    ],
  };

  useShare();

  const handleFeedback = () => {
    Taro.navigateToMiniProgram({
      appId: "wxebadf544ddae62cb",
      path: "pages/webview/index?sid=23036727&hash=5583&navigateBackMiniProgram=true",
      fail: () => {
        Taro.navigateTo({
          url: `/pages/webview/index?url=${encodeURIComponent(
            "https://wj.qq.com/s2/23036727/5583/"
          )}`,
        });
      },
    });
  };

  const handleShare = async () => {
    try {
      await posterGenerator.generatePoster();
    } catch (error) {
      console.error("分享失败:", error);
    }
  };

  return (
    <View className="about-page">
      {/* 主容器 */}
      <View className="at-row at-row__align--center main-wrapper">
        <View className="at-col">
          {/* 应用介绍区域 */}
          <View className="at-row at-row__justify--center intro-section">
            <View className="at-col at-col-11">
              <View className="intro-card">
                <View className="section-header">
                  <Text className="section-icon">✨</Text>
                  <Text className="section-title">内容简介</Text>
                </View>
                <Text className="description-text">{appInfo.description}</Text>
              </View>
            </View>
          </View>

          {/* 主要功能 */}
          <View className="at-row at-row__justify--center features-section">
            <View className="at-col at-col-11">
              <View className="section-card">
                <View className="section-header">
                  <Text className="section-icon">✨</Text>
                  <Text className="section-title">主要功能</Text>
                </View>
                <View className="features-grid">
                  <View className="at-row at-row--wrap">
                    {appInfo.features.map((feature, index) => (
                      <View key={index} className="at-col at-col-6 feature-col">
                        <View className="feature-item">
                          <Text className="feature-dot">•</Text>
                          <Text className="feature-text">{feature}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* 操作按钮 */}
          <View className="at-row at-row__justify--center actions-section">
            <View className="at-col at-col-11">
              <View className="actions-card">
                <View className="action-item" onClick={handleFeedback}>
                  <View className="action-icon-wrapper feedback">
                    <Text className="action-icon">📝</Text>
                  </View>
                  <View className="action-content">
                    <Text className="action-title">意见反馈</Text>
                    <Text className="action-desc">帮助我们改进产品</Text>
                  </View>
                  <Text className="action-arrow">›</Text>
                </View>

                <View className="action-item" onClick={handleShare}>
                  <View className="action-icon-wrapper share">
                    <Text className="action-icon">🚀</Text>
                  </View>
                  <View className="action-content">
                    <Text className="action-title">分享应用</Text>
                    <Text className="action-desc">推荐给更多朋友</Text>
                  </View>
                  <Text className="action-arrow">›</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 底部信息 */}
      <View className="footer-section">
        <Text className="copyright">© 2025 神奇哈哈镜</Text>
        <Text className="powered">让创意无限可能</Text>
      </View>

      {/* 隐藏的Canvas用于绘制海报 */}
      <Canvas 
        canvasId="posterCanvas" 
        className="poster-canvas"
        style={{
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`
        }}
      />
    </View>
  );
};

export default About;
