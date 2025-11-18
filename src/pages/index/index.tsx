import { View, Text, Swiper, SwiperItem, Image } from "@tarojs/components";
import { AtButton, AtIcon } from "taro-ui";
import Taro from "@tarojs/taro";
import { useState, useEffect } from "react";
import { useLoveStore } from "../../store/loveStore";
import { LoveCategory, TipCategory } from "../../types/love";
import "./index.scss";

const Index = () => {
  const { scripts, tips, initializeData, getScriptsByCategory, getTipsByCategory } = useLoveStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    initializeData();
    // 更新时间
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 分类数据 - 重新设计图标和颜色
  const scriptCategories = [
    { key: LoveCategory.GREETING, name: '打招呼', icon: '👋', color: '#FF6B9D', bgColor: '#FFE8F1' },
    { key: LoveCategory.CHAT, name: '聊天话题', icon: '💬', color: '#4ECDC4', bgColor: '#E8FFFE' },
    { key: LoveCategory.COMPLIMENT, name: '夸赞', icon: '💖', color: '#45B7D1', bgColor: '#E8F4FD' },
    { key: LoveCategory.HUMOR, name: '幽默', icon: '😄', color: '#F9CA24', bgColor: '#FEF7E0' },
    { key: LoveCategory.CARE, name: '关心', icon: '🤗', color: '#6C5CE7', bgColor: '#F0EDFF' },
    { key: LoveCategory.DATE, name: '约会', icon: '💕', color: '#FD79A8', bgColor: '#FFE8F3' },
    { key: LoveCategory.CONFESSION, name: '表白', icon: '💌', color: '#E17055', bgColor: '#FDEEE9' },
    { key: LoveCategory.COMFORT, name: '安慰', icon: '🤲', color: '#00B894', bgColor: '#E8FDF9' },
  ];

  const tipCategories = [
    { key: TipCategory.PSYCHOLOGY, name: '心理学', icon: '🧠', color: '#A29BFE' },
    { key: TipCategory.COMMUNICATION, name: '沟通技巧', icon: '🗣️', color: '#FD79A8' },
    { key: TipCategory.DATE_PLANNING, name: '约会规划', icon: '📅', color: '#FDCB6E' },
    { key: TipCategory.APPEARANCE, name: '形象管理', icon: '✨', color: '#6C5CE7' },
  ];

  const handleCategoryClick = (category: LoveCategory) => {
    // 跳转到话术页面，通过全局状态传递分类信息
    Taro.navigateTo({
      url: '/pages/scripts/index',
      success: () => {
        // 通过事件或全局状态传递分类信息
        Taro.eventCenter.trigger('setScriptCategory', category);
      }
    });
  };

  const handleTipCategoryClick = (category: TipCategory) => {
    Taro.navigateTo({
      url: '/pages/tips/index',
      success: () => {
        Taro.eventCenter.trigger('setTipCategory', category);
      }
    });
  };

  const handleViewAllScripts = () => {
    Taro.navigateTo({
      url: '/pages/scripts/index',
    });
  };

  const handleViewAllTips = () => {
    Taro.navigateTo({
      url: '/pages/tips/index',
    });
  };

  // 获取推荐话术 - 增加更多推荐
  const getRecommendedScripts = () => {
    const greeting = getScriptsByCategory(LoveCategory.GREETING).slice(0, 3);
    const chat = getScriptsByCategory(LoveCategory.CHAT).slice(0, 3);
    const compliment = getScriptsByCategory(LoveCategory.COMPLIMENT).slice(0, 2);
    return [...greeting, ...chat, ...compliment];
  };

  // 获取时间问候语
  const getTimeGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return { text: '深夜好', emoji: '🌙', color: '#6C5CE7' };
    if (hour < 12) return { text: '早上好', emoji: '🌅', color: '#FD79A8' };
    if (hour < 18) return { text: '下午好', emoji: '☀️', color: '#FDCB6E' };
    return { text: '晚上好', emoji: '🌆', color: '#A29BFE' };
  };

  const timeGreeting = getTimeGreeting();

  return (
    <View className="index-page">
      {/* 简洁的顶部横幅 */}
      <View className="header-banner">
        <View className="banner-content">
          <Text className="banner-title">💕 恋爱话术助手</Text>
          <Text className="banner-subtitle">简单实用的恋爱话术，让沟通更有魅力</Text>
          <View className="quick-stats">
            <Text className="stats-text">已收录 {scripts.length} 条实用话术</Text>
          </View>
        </View>
      </View>

      {/* 使用说明 - 简洁版 */}
      <View className="section intro-section">
        <Text className="intro-title">💡 使用指南</Text>
        <View className="steps">
          <View className="step-item">
            <Text className="step-number">1</Text>
            <Text className="step-text">选择场景分类</Text>
          </View>
          <View className="step-item">
            <Text className="step-number">2</Text>
            <Text className="step-text">找到合适话术</Text>
          </View>
          <View className="step-item">
            <Text className="step-number">3</Text>
            <Text className="step-text">复制直接使用</Text>
          </View>
        </View>
      </View>

      {/* 话术分类 - 简洁版 */}
      <View className="section">
        <View className="section-header">
          <Text className="section-title">💬 选择话术分类</Text>
        </View>
        
        <View className="category-grid">
          {scriptCategories.slice(0, 6).map((category) => (
            <View
              key={category.key}
              className="category-card"
              onClick={() => handleCategoryClick(category.key)}
            >
              <Text className="category-icon">{category.icon}</Text>
              <Text className="category-name">{category.name}</Text>
              <Text className="category-count">{getScriptsByCategory(category.key).length}条</Text>
            </View>
          ))}
        </View>
        
        <View className="view-all-btn" onClick={handleViewAllScripts}>
          <Text className="view-all-text">查看全部话术</Text>
        </View>
      </View>

      {/* 快捷入口 - 简洁版 */}
      <View className="section">
        <View className="quick-actions">
          <View
            className="action-btn"
            onClick={() => Taro.navigateTo({ url: '/pages/favorites/index' })}
          >
            <AtIcon value="heart" size="20" color="#FF6B9D" />
            <Text className="action-text">我的收藏</Text>
          </View>
          
          <View
            className="action-btn"
            onClick={handleViewAllTips}
          >
            <AtIcon value="bookmark" size="20" color="#4ECDC4" />
            <Text className="action-text">恋爱技巧</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Index;
