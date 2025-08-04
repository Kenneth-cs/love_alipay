import { View, Text } from "@tarojs/components";
import { AtButton, AtIcon } from "taro-ui";
import Taro from "@tarojs/taro";
import { useShare } from "../../utils/share-utils";
import "./index.scss";

const Index = () => {
  const handleGoToMirror = () => {
    Taro.navigateTo({
      url: "/pages/mirror/index",
    });
  };

  const handleGoToAbout = () => {
    Taro.navigateTo({
      url: "/pages/about/index",
    });
  };

  useShare();

  return (
    <View className="index-page">
      {/* 主容器 */}
      <View className="at-row at-row__align--center main-wrapper">
        <View className="at-col">
          {/* Logo 和标题区域 */}
          <View className="at-row at-row__justify--center logo-section">
            <View className="at-col at-col--auto">
              <View className="logo-container">
                <View className="logo-circle">
                  <Text className="logo-emoji">🪞</Text>
                </View>
                <Text className="app-title">神奇哈哈镜</Text>
                <Text className="app-subtitle">Magic Mirror</Text>
              </View>
            </View>
          </View>

          {/* 介绍文字 */}
          <View className="at-row at-row__justify--center intro-section">
            <View className="at-col at-col-11">
              <View className="intro-card">
                <Text className="intro-text">
                  「神奇哈哈镜」一键解锁镜像、扭曲、炫彩等12种奇幻特效，从鱼眼漩涡到油画像素，秒变创意视觉大师！
                </Text>
              </View>
            </View>
          </View>

          {/* 特性展示 */}
          <View className="features-section">
            <View className="features-container">
              <View className="feature-card">
                <View className="feature-icon-wrapper">
                  <Text className="feature-icon">✨</Text>
                </View>
                <Text className="feature-title">12+特效</Text>
                <Text className="feature-desc">多样选择</Text>
              </View>
              <View className="feature-card">
                <View className="feature-icon-wrapper">
                  <Text className="feature-icon">🎨</Text>
                </View>
                <Text className="feature-title">高清画质</Text>
                <Text className="feature-desc">细节呈现</Text>
              </View>
              <View className="feature-card">
                <View className="feature-icon-wrapper">
                  <Text className="feature-icon">⚡</Text>
                </View>
                <Text className="feature-title">即时生成</Text>
                <Text className="feature-desc">快速体验</Text>
              </View>
            </View>
          </View>

          {/* 按钮区域 */}
          <View className="at-row at-row__justify--center button-section">
            <View className="at-col at-col-10">
              <AtButton
                type="primary"
                size="normal"
                onClick={handleGoToMirror}
                className="main-button"
              >
                开始体验神奇效果
              </AtButton>

              <AtButton
                type="secondary"
                size="normal"
                onClick={handleGoToAbout}
                className="sub-button"
              >
                了解更多
              </AtButton>
            </View>
          </View>
        </View>
      </View>

      {/* 底部标语 */}
      <View className="footer-section">
        <Text className="footer-slogan">科技改变视界 · 创意无限可能</Text>
      </View>
    </View>
  );
};

export default Index;
