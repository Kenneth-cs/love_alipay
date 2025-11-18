import { View, Text } from "@tarojs/components";
import { AtTabs, AtTabsPane, AtIcon } from "taro-ui";
import Taro, { useRouter } from "@tarojs/taro";
import { useState, useEffect } from "react";
import { useLoveStore } from "../../store/loveStore";
import { TipCategory, LoveTip } from "../../types/love";
import "./index.scss";

const Tips = () => {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState(0);
  const [filteredTips, setFilteredTips] = useState<LoveTip[]>([]);

  const {
    tips,
    initializeData,
    getTipsByCategory,
    toggleBookmark,
    updateTipReadCount,
  } = useLoveStore();

  // 分类标签
  const tabList = [
    { title: '全部', key: 'all' },
    { title: '心理学', key: TipCategory.PSYCHOLOGY },
    { title: '沟通技巧', key: TipCategory.COMMUNICATION },
    { title: '约会规划', key: TipCategory.DATE_PLANNING },
    { title: '形象管理', key: TipCategory.APPEARANCE },
    { title: '关系维护', key: TipCategory.RELATIONSHIP },
    { title: '危机处理', key: TipCategory.CRISIS },
  ];

  useEffect(() => {
    initializeData();

    // 监听从主页传来的分类切换事件
    const handleCategoryChange = (category: TipCategory) => {
      const tabIndex = tabList.findIndex(tab => tab.key === category);
      if (tabIndex > 0) {
        setCurrentTab(tabIndex);
      }
    };

    Taro.eventCenter.on('setTipCategory', handleCategoryChange);

    return () => {
      Taro.eventCenter.off('setTipCategory', handleCategoryChange);
    };
  }, []);

  useEffect(() => {
    // 处理从首页传来的分类参数（兼容旧的URL参数方式）
    const { category } = router.params;
    if (category) {
      const tabIndex = tabList.findIndex(tab => tab.key === category);
      if (tabIndex > 0) {
        setCurrentTab(tabIndex);
      }
    }
  }, [router.params]);

  useEffect(() => {
    updateFilteredTips();
  }, [currentTab, tips]);

  const updateFilteredTips = () => {
    let result: LoveTip[] = [];
    
    // 分类过滤
    if (currentTab === 0) {
      result = tips;
    } else {
      const category = tabList[currentTab]?.key as TipCategory;
      result = getTipsByCategory(category);
    }

    setFilteredTips(result);
  };

  const handleTabClick = (index: number) => {
    setCurrentTab(index);
  };

  const handleTipClick = (tip: LoveTip) => {
    updateTipReadCount(tip.id);
    Taro.navigateTo({
      url: `/pages/tip-detail/index?id=${tip.id}`,
    });
  };

  const handleBookmarkClick = (e: any, tipId: string) => {
    e.stopPropagation();
    toggleBookmark(tipId);
  };

  const getCategoryIcon = (category: TipCategory) => {
    const iconMap = {
      [TipCategory.PSYCHOLOGY]: '🧠',
      [TipCategory.COMMUNICATION]: '🗣️',
      [TipCategory.DATE_PLANNING]: '📅',
      [TipCategory.APPEARANCE]: '✨',
      [TipCategory.RELATIONSHIP]: '💕',
      [TipCategory.CRISIS]: '🚨',
    };
    return iconMap[category] || '📝';
  };

  const getCategoryName = (category: TipCategory) => {
    const nameMap = {
      [TipCategory.PSYCHOLOGY]: '心理学',
      [TipCategory.COMMUNICATION]: '沟通技巧',
      [TipCategory.DATE_PLANNING]: '约会规划',
      [TipCategory.APPEARANCE]: '形象管理',
      [TipCategory.RELATIONSHIP]: '关系维护',
      [TipCategory.CRISIS]: '危机处理',
    };
    return nameMap[category] || '未知';
  };

  const getCategoryColor = (category: TipCategory) => {
    const colorMap = {
      [TipCategory.PSYCHOLOGY]: '#6c5ce7',
      [TipCategory.COMMUNICATION]: '#00b894',
      [TipCategory.DATE_PLANNING]: '#e17055',
      [TipCategory.APPEARANCE]: '#fdcb6e',
      [TipCategory.RELATIONSHIP]: '#fd79a8',
      [TipCategory.CRISIS]: '#e84393',
    };
    return colorMap[category] || '#74b9ff';
  };

  return (
    <View className="tips-page">
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

      {/* 分类标签 */}
      <AtTabs
        current={currentTab}
        tabList={tabList}
        onClick={handleTabClick}
        scroll
        className="category-tabs"
      >
        {tabList.map((tab, index) => (
          <AtTabsPane current={currentTab} index={index} key={tab.key}>
            <View className="tips-container">
              {filteredTips.length > 0 ? (
                <View className="tips-list">
                  {filteredTips.map((tip) => (
                    <View
                      key={tip.id}
                      className="tip-card"
                      onClick={() => handleTipClick(tip)}
                    >
                      <View className="card-header">
                        <View className="category-info">
                          <View
                            className="category-icon"
                            style={{ backgroundColor: getCategoryColor(tip.category) }}
                          >
                            <Text className="icon-text">
                              {getCategoryIcon(tip.category)}
                            </Text>
                          </View>
                          <Text className="category-name">
                            {getCategoryName(tip.category)}
                          </Text>
                        </View>
                        <View className="card-actions">
                          <View
                            className="action-btn"
                            onClick={(e) => handleBookmarkClick(e, tip.id)}
                          >
                            <AtIcon
                              value="bookmark"
                              size="18"
                              color={tip.isBookmarked ? "#ff6b9d" : "#666"}
                            />
                          </View>
                        </View>
                      </View>
                      <Text className="tip-title">{tip.title}</Text>
                      <Text className="tip-summary">{tip.content.length > 100 ? tip.content.substring(0, 100) + '...' : tip.content}</Text>
                      <View className="tip-meta">
                        <Text className="read-count">阅读 {tip.readCount} 次</Text>
                        <View className="tip-tags">
                          {tip.tags.slice(0, 2).map((tag) => (
                            <Text key={tag} className="tag">#{tag}</Text>
                          ))}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="empty-state">
                  <Text className="empty-icon">📝</Text>
                  <Text className="empty-text">暂无支招内容</Text>
                </View>
              )}
            </View>
          </AtTabsPane>
        ))}
      </AtTabs>
    </View>
  );
};

export default Tips;