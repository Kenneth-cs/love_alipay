import { View, Text } from "@tarojs/components";
import { AtTabs, AtTabsPane, AtIcon } from "taro-ui";
import Taro from "@tarojs/taro";
import { useState, useEffect } from "react";
import { useLoveStore } from "../../store/loveStore";
import { LoveScript, LoveTip } from "../../types/love";
import "./index.scss";

const Favorites = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [favoriteScripts, setFavoriteScripts] = useState<LoveScript[]>([]);

  const {
    scripts,
    tips,
    favorites,
    bookmarkedTips,
    initializeData,
    toggleFavorite,
    toggleBookmark,
    updateScriptUseCount,
    updateTipReadCount,
  } = useLoveStore();

  const tabList = [
    { title: '话术收藏', key: 'scripts' },
    { title: '支招收藏', key: 'tips' },
  ];

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    // 直接使用 store 中的收藏数据
    setFavoriteScripts(favorites);
  }, [favorites]);

  const handleTabClick = (index: number) => {
    setCurrentTab(index);
  };

  const handleScriptClick = (script: LoveScript) => {
    updateScriptUseCount(script.id);
    Taro.navigateTo({
      url: `/pages/script-detail/index?id=${script.id}`,
    });
  };

  const handleTipClick = (tip: LoveTip) => {
    updateTipReadCount(tip.id);
    Taro.navigateTo({
      url: `/pages/tip-detail/index?id=${tip.id}`,
    });
  };

  const handleRemoveFavorite = (e: any, scriptId: string) => {
    e.stopPropagation();
    toggleFavorite(scriptId);
  };

  const handleRemoveBookmark = (e: any, tipId: string) => {
    e.stopPropagation();
    toggleBookmark(tipId);
  };

  const handleCopyScript = (e: any, content: string) => {
    e.stopPropagation();
    Taro.setClipboardData({
      data: content,
      success: () => {
        Taro.showToast({
          title: '已复制到剪贴板',
          icon: 'success',
        });
      },
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#52c41a';
      case 'medium': return '#faad14';
      case 'hard': return '#f5222d';
      default: return '#666';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '简单';
      case 'medium': return '中等';
      case 'hard': return '困难';
      default: return '';
    }
  };

  const getCategoryName = (category: string) => {
    const categoryMap = {
      'greeting': '打招呼',
      'chat': '聊天话题',
      'compliment': '夸赞',
      'humor': '幽默',
      'care': '关心',
      'date': '约会',
      'confession': '表白',
      'comfort': '安慰',
      'apology': '道歉',
      'goodnight': '晚安',
      'psychology': '心理学',
      'communication': '沟通技巧',
      'date_planning': '约会规划',
      'appearance': '形象管理',
      'relationship': '关系维护',
      'crisis': '危机处理',
    };
    return categoryMap[category] || '未知';
  };

  return (
    <View className="favorites-page">
      {/* 返回首页按钮 */}
      <View className="header-bar">
        <View className="back-home-btn" onClick={() => {
          Taro.navigateBack({
            delta: 1,
            fail: () => {
              Taro.reLaunch({ url: '/pages/index/index' });
            }
          });
        }}>
          <AtIcon value="home" size="20" color="#ff6b9d" />
          <Text className="btn-text">返回首页</Text>
        </View>
      </View>

      {/* 头部统计 */}
      <View className="header-stats">
        <View className="stats-container">
          <View className="stat-item">
            <Text className="stat-number">{favoriteScripts.length}</Text>
            <Text className="stat-label">话术收藏</Text>
          </View>
          <View className="stat-divider" />
          <View className="stat-item">
            <Text className="stat-number">{bookmarkedTips.length}</Text>
            <Text className="stat-label">支招收藏</Text>
          </View>
        </View>
      </View>

      {/* 分类标签 */}
      <AtTabs
        current={currentTab}
        tabList={tabList}
        onClick={handleTabClick}
        className="category-tabs"
      >
        {/* 话术收藏 */}
        <AtTabsPane current={currentTab} index={0}>
          <View className="content-container">
            {favoriteScripts.length > 0 ? (
              <View className="scripts-list">
                {favoriteScripts.map((script) => (
                  <View
                    key={script.id}
                    className="script-card"
                    onClick={() => handleScriptClick(script)}
                  >
                    <View className="card-header">
                      <View className="title-section">
                        <Text className="script-title">{script.title}</Text>
                        <View className="script-meta">
                          <Text className="category-tag">
                            {getCategoryName(script.category)}
                          </Text>
                          <Text
                            className="difficulty-tag"
                            style={{ color: getDifficultyColor(script.difficulty) }}
                          >
                            {getDifficultyText(script.difficulty)}
                          </Text>
                        </View>
                      </View>
                      <View className="action-buttons">
                        <View
                          className="action-btn"
                          onClick={(e) => handleCopyScript(e, script.content)}
                        >
                          <AtIcon value="file-generic" size="18" color="#666" />
                        </View>
                        <View
                          className="action-btn remove"
                          onClick={(e) => handleRemoveFavorite(e, script.id)}
                        >
                          <AtIcon value="trash" size="18" color="#ff4757" />
                        </View>
                      </View>
                    </View>

                    <Text className="script-content">{script.content}</Text>

                    <View className="card-footer">
                      <View className="tags">
                        {script.tags.slice(0, 2).map((tag) => (
                          <Text key={tag} className="tag">#{tag}</Text>
                        ))}
                      </View>
                      <Text className="use-count">使用 {script.useCount} 次</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="empty-state">
                <Text className="empty-icon">💔</Text>
                <Text className="empty-text">还没有收藏的话术</Text>
                <Text className="empty-tip">去发现一些喜欢的话术吧</Text>
                <View
                  className="empty-action"
                  onClick={() => Taro.switchTab({ url: '/pages/scripts/index' })}
                >
                  <Text className="action-text">去看看话术</Text>
                </View>
              </View>
            )}
          </View>
        </AtTabsPane>

        {/* 支招收藏 */}
        <AtTabsPane current={currentTab} index={1}>
          <View className="content-container">
            {bookmarkedTips.length > 0 ? (
              <View className="tips-list">
                {bookmarkedTips.map((tip) => (
                  <View
                    key={tip.id}
                    className="tip-card"
                    onClick={() => handleTipClick(tip)}
                  >
                    <View className="card-header">
                      <View className="title-section">
                        <Text className="tip-title">{tip.title}</Text>
                        <Text className="category-name">
                          {getCategoryName(tip.category)}
                        </Text>
                      </View>
                      <View
                        className="remove-btn"
                        onClick={(e) => handleRemoveBookmark(e, tip.id)}
                      >
                        <AtIcon value="trash" size="18" color="#ff4757" />
                      </View>
                    </View>

                    <Text className="tip-preview">
                      {tip.content.substring(0, 100)}...
                    </Text>

                    <View className="card-footer">
                      <View className="tags">
                        {tip.tags.slice(0, 3).map((tag) => (
                          <Text key={tag} className="tag">#{tag}</Text>
                        ))}
                      </View>
                      <Text className="read-count">阅读 {tip.readCount} 次</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="empty-state">
                <Text className="empty-icon">📚</Text>
                <Text className="empty-text">还没有收藏的支招</Text>
                <Text className="empty-tip">去学习一些实用的恋爱技巧吧</Text>
                <View
                  className="empty-action"
                  onClick={() => Taro.switchTab({ url: '/pages/tips/index' })}
                >
                  <Text className="action-text">去看看支招</Text>
                </View>
              </View>
            )}
          </View>
        </AtTabsPane>
      </AtTabs>
    </View>
  );
};

export default Favorites;