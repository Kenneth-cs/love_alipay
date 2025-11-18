import { View, Text } from "@tarojs/components";
import { AtTabs, AtTabsPane, AtIcon, AtFloatLayout, AtLoadMore } from "taro-ui";
import Taro, { useRouter } from "@tarojs/taro";
import { useState, useEffect } from "react";
import { useLoveStore } from "../../store/loveStore";
import { LoveCategory, LoveScript } from "../../types/love";
import "./index.scss";

const Scripts = () => {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState(0);
  const [filteredScripts, setFilteredScripts] = useState<LoveScript[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const {
    scripts,
    displayedScripts,
    isLoading,
    hasMoreScripts,
    initializeData,
    getScriptsByCategory,
    getScriptsByCategoryPaginated,
    loadMoreScripts,
    resetPagination,
    toggleFavorite,
    updateScriptUseCount,
    isFavorite,
  } = useLoveStore();

  // 分类标签
  const tabList = [
    { title: '全部', key: 'all' },
    { title: '打招呼', key: LoveCategory.GREETING },
    { title: '聊天', key: LoveCategory.CHAT },
    { title: '夸赞', key: LoveCategory.COMPLIMENT },
    { title: '幽默', key: LoveCategory.HUMOR },
    { title: '关心', key: LoveCategory.CARE },
    { title: '约会', key: LoveCategory.DATE },
    { title: '表白', key: LoveCategory.CONFESSION },
    { title: '安慰', key: LoveCategory.COMFORT },
    { title: '道歉', key: LoveCategory.APOLOGY },
    { title: '晚安', key: LoveCategory.GOODNIGHT },
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await initializeData();
      setLoading(false);
    };
    loadData();

    // 监听从主页传来的分类切换事件
    const handleCategoryChange = (category: LoveCategory) => {
      const tabIndex = tabList.findIndex(tab => tab.key === category);
      if (tabIndex > 0) {
        setCurrentTab(tabIndex);
      }
    };

    Taro.eventCenter.on('setScriptCategory', handleCategoryChange);

    return () => {
      Taro.eventCenter.off('setScriptCategory', handleCategoryChange);
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

  // 初始化分页数据
  useEffect(() => {
    if (scripts.length > 0) {
      initializePaginatedData();
    }
  }, [currentTab, selectedDifficulty, scripts]);

  const initializePaginatedData = () => {
    resetPagination();
    const category = currentTab === 0 ? 'all' : tabList[currentTab]?.key as LoveCategory;
    
    // 获取第一页数据
    const firstPageScripts = getScriptsByCategoryPaginated(category, 0);
    
    // 更新displayedScripts状态（这会触发useEffect更新filteredScripts）
    // 需要直接调用store的方法来更新displayedScripts
    const state = useLoveStore.getState();
    useLoveStore.setState({
      displayedScripts: firstPageScripts,
      currentPage: 0,
      hasMoreScripts: firstPageScripts.length === state.pageSize
    });
  };

  // 加载更多数据
  const handleLoadMore = () => {
    const category = currentTab === 0 ? 'all' : tabList[currentTab]?.key as LoveCategory;
    loadMoreScripts(category);
  };

  // 监听displayedScripts变化，更新filteredScripts
  useEffect(() => {
    let result = displayedScripts;
    
    // 根据难度筛选
    if (selectedDifficulty !== 'all') {
      result = result.filter(script => script.difficulty === selectedDifficulty);
    }

    setFilteredScripts(result);
  }, [displayedScripts, selectedDifficulty]);

  const handleTabClick = (index: number) => {
    setCurrentTab(index);
  };

  const handleScriptClick = (script: LoveScript) => {
    updateScriptUseCount(script.id);
    Taro.navigateTo({
      url: `/pages/script-detail/index?id=${script.id}`,
    });
  };

  const handleFavoriteClick = (e: any, scriptId: string) => {
    e.stopPropagation();
    toggleFavorite(scriptId);
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

  return (
    <View className="scripts-page">
      {/* 顶部按钮栏 - 一左一右布局 */}
      <View className="top-action-bar">
        <View className="home-btn" onClick={() => {
          Taro.navigateBack({
            delta: 1,
            fail: () => {
              Taro.reLaunch({ url: '/pages/index/index' });
            }
          });
        }}>
          <AtIcon value="home" size="18" color="#fff" />
          <Text className="btn-text">返回首页</Text>
        </View>
        
        <View className="filter-btn" onClick={() => setShowFilter(true)}>
          <AtIcon value="filter" size="18" color="#fff" />
          <Text className="btn-text">筛选</Text>
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
            <View className="scripts-container">
              {loading ? (
                <View className="loading-container">
                  <AtLoadMore status="loading" />
                </View>
              ) : filteredScripts.length > 0 ? (
                <View className="scripts-list">
                  {filteredScripts.map((script) => (
                    <View
                      key={script.id}
                      className="script-card"
                      onClick={() => handleScriptClick(script)}
                    >
                      <View className="card-header">
                        <View className="title-section">
                          <Text className="script-title">{script.title}</Text>
                          <View className="script-meta">
                            <Text
                              className="difficulty-tag"
                              style={{ color: getDifficultyColor(script.difficulty) }}
                            >
                              {getDifficultyText(script.difficulty)}
                            </Text>
                            <Text className="use-count">使用 {script.useCount} 次</Text>
                          </View>
                        </View>
                        <View className="card-actions">
                          <View
                            className="action-btn"
                            onClick={(e) => handleCopyScript(e, script.content)}
                          >
                            <AtIcon value="copy" size="18" color="#666" />
                          </View>
                          <View
                            className="action-btn"
                            onClick={(e) => handleFavoriteClick(e, script.id)}
                          >
                            <AtIcon
                              value="heart"
                              size="18"
                              color={isFavorite(script.id) ? "#ff6b9d" : "#666"}
                            />
                          </View>
                        </View>
                      </View>
                      <Text className="script-content">{script.content}</Text>
                      <View className="script-tags">
                        {script.tags.slice(0, 3).map((tag) => (
                          <Text key={tag} className="tag">#{tag}</Text>
                        ))}
                      </View>
                    </View>
                  ))}
                  
                  {/* 加载更多按钮 */}
                  {hasMoreScripts && (
                    <View className="load-more-container">
                      <AtLoadMore
                        status={isLoading ? "loading" : "more"}
                        moreText="加载更多话术"
                        loadingText="加载中..."
                        onClick={handleLoadMore}
                      />
                    </View>
                  )}
                </View>
              ) : (
                <View className="empty-state">
                  <Text className="empty-icon">🔍</Text>
                  <Text className="empty-text">暂无话术数据</Text>
                </View>
              )}
            </View>
          </AtTabsPane>
        ))}
      </AtTabs>

      {/* 筛选弹窗 */}
      <AtFloatLayout
        isOpened={showFilter}
        title="筛选条件"
        onClose={() => setShowFilter(false)}
      >
        <View className="filter-content">
          <View className="filter-section">
            <Text className="filter-title">难度等级</Text>
            <View className="filter-options">
              {[
                { key: 'all', label: '全部' },
                { key: 'easy', label: '简单' },
                { key: 'medium', label: '中等' },
                { key: 'hard', label: '困难' },
              ].map((option) => (
                <View
                  key={option.key}
                  className={`filter-option ${selectedDifficulty === option.key ? 'active' : ''}`}
                  onClick={() => setSelectedDifficulty(option.key)}
                >
                  <Text className="option-text">{option.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="filter-actions">
            <View className="filter-btn reset" onClick={() => {
              setSelectedDifficulty('all');
            }}>
              <Text>重置</Text>
            </View>
            <View className="filter-btn confirm" onClick={() => setShowFilter(false)}>
              <Text>确定</Text>
            </View>
          </View>
        </View>
      </AtFloatLayout>
    </View>
  );
};

export default Scripts;