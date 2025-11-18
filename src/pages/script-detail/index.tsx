import { View, Text } from "@tarojs/components";
import { AtButton, AtIcon, AtActionSheet, AtActionSheetItem } from "taro-ui";
import Taro, { useRouter } from "@tarojs/taro";
import { useState, useEffect } from "react";
import { useLoveStore } from "../../store/loveStore";
import { LoveScript, LoveCategory } from "../../types/love";
import "./index.scss";

const ScriptDetail = () => {
  const router = useRouter();
  const [script, setScript] = useState<LoveScript | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [relatedScripts, setRelatedScripts] = useState<LoveScript[]>([]);

  const {
    scripts,
    initializeData,
    getScriptsByCategory,
    toggleFavorite,
    updateScriptUseCount,
  } = useLoveStore();

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    const { id } = router.params;
    if (id && scripts.length > 0) {
      const foundScript = scripts.find(s => s.id === id);
      if (foundScript) {
        setScript(foundScript);
        // 获取相关话术（同分类的其他话术）
        const related = getScriptsByCategory(foundScript.category)
          .filter(s => s.id !== foundScript.id)
          .slice(0, 3);
        setRelatedScripts(related);
      }
    }
  }, [router.params, scripts]);

  const handleCopyScript = () => {
    if (!script) return;
    
    Taro.setClipboardData({
      data: script.content,
      success: () => {
        Taro.showToast({
          title: '已复制到剪贴板',
          icon: 'success',
        });
        updateScriptUseCount(script.id);
      },
    });
  };

  const handleFavoriteToggle = () => {
    if (!script) return;
    toggleFavorite(script.id);
    setScript({ ...script, isFavorite: !script.isFavorite });
  };

  const handleShareScript = () => {
    setShowActionSheet(true);
  };

  const handleShareToFriend = () => {
    if (!script) return;
    
    // 微信分享给朋友
    Taro.showShareMenu({
      withShareTicket: true,
      success: () => {
        console.log('分享成功');
      },
    });
    setShowActionSheet(false);
  };

  const handleShareToMoments = () => {
    if (!script) return;
    
    Taro.showToast({
      title: '请使用右上角分享',
      icon: 'none',
    });
    setShowActionSheet(false);
  };

  const handleRelatedScriptClick = (relatedScript: LoveScript) => {
    Taro.redirectTo({
      url: `/pages/script-detail/index?id=${relatedScript.id}`,
    });
  };

  const handleBackToHome = () => {
    Taro.reLaunch({
      url: '/pages/index/index',
    });
  };

  const getCategoryName = (category: LoveCategory) => {
    const categoryMap = {
      [LoveCategory.GREETING]: '打招呼',
      [LoveCategory.CHAT]: '聊天话题',
      [LoveCategory.COMPLIMENT]: '夸赞',
      [LoveCategory.HUMOR]: '幽默',
      [LoveCategory.CARE]: '关心',
      [LoveCategory.DATE]: '约会',
      [LoveCategory.CONFESSION]: '表白',
      [LoveCategory.COMFORT]: '安慰',
      [LoveCategory.APOLOGY]: '道歉',
      [LoveCategory.GOODNIGHT]: '晚安',
    };
    return categoryMap[category] || '未知';
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

  if (!script) {
    return (
      <View className="script-detail-page">
        <View className="loading-state">
          <Text className="loading-text">加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="script-detail-page">
      {/* 返回首页按钮 */}
      <View className="back-to-home">
        <View className="back-btn" onClick={handleBackToHome}>
          <AtIcon value="home" size="18" color="#ff6b9d" />
          <Text className="back-text">返回首页</Text>
        </View>
      </View>

      {/* 主要内容区域 */}
      <View className="main-content">
        {/* 头部信息 */}
        <View className="header-section">
          <View className="category-badge">
            <Text className="category-text">{getCategoryName(script.category)}</Text>
          </View>
          
          <Text className="script-title">{script.title}</Text>
          
          <View className="meta-info">
            <View className="meta-item">
              <Text
                className="difficulty-tag"
                style={{ color: getDifficultyColor(script.difficulty) }}
              >
                {getDifficultyText(script.difficulty)}
              </Text>
            </View>
            <View className="meta-item">
              <AtIcon value="eye" size="14" color="#999" />
              <Text className="meta-text">使用 {script.useCount} 次</Text>
            </View>
          </View>
        </View>

        {/* 话术内容 */}
        <View className="content-section">
          <View className="content-card">
            <Text className="content-text">{script.content}</Text>
          </View>
        </View>

        {/* 使用场景 */}
        <View className="situation-section">
          <View className="section-title">
            <AtIcon value="lightbulb" size="16" color="#ff6b9d" />
            <Text className="title-text">使用场景</Text>
          </View>
          <Text className="situation-text">{script.situation}</Text>
        </View>

        {/* 标签 */}
        <View className="tags-section">
          <View className="section-title">
            <AtIcon value="tags" size="16" color="#ff6b9d" />
            <Text className="title-text">相关标签</Text>
          </View>
          <View className="tags-container">
            {script.tags.map((tag) => (
              <View key={tag} className="tag-item">
                <Text className="tag-text">#{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 相关推荐 */}
        {relatedScripts.length > 0 && (
          <View className="related-section">
            <View className="section-title">
              <AtIcon value="heart" size="16" color="#ff6b9d" />
              <Text className="title-text">相关推荐</Text>
            </View>
            <View className="related-list">
              {relatedScripts.map((relatedScript) => (
                <View
                  key={relatedScript.id}
                  className="related-item"
                  onClick={() => handleRelatedScriptClick(relatedScript)}
                >
                  <Text className="related-title">{relatedScript.title}</Text>
                  <Text className="related-content">{relatedScript.content}</Text>
                  <View className="related-meta">
                    <Text
                      className="related-difficulty"
                      style={{ color: getDifficultyColor(relatedScript.difficulty) }}
                    >
                      {getDifficultyText(relatedScript.difficulty)}
                    </Text>
                    <AtIcon value="chevron-right" size="14" color="#ccc" />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* 底部操作栏 */}
      <View className="bottom-actions">
        <View className="action-group">
          <View className="action-btn secondary" onClick={handleFavoriteToggle}>
            <AtIcon
              value="heart"
              size="20"
              color={script.isFavorite ? "#ff6b9d" : "#666"}
            />
            <Text className="btn-text">
              {script.isFavorite ? '已收藏' : '收藏'}
            </Text>
          </View>
          
          <View className="action-btn secondary" onClick={handleShareScript}>
            <AtIcon value="share" size="20" color="#666" />
            <Text className="btn-text">分享</Text>
          </View>
        </View>
        
        <AtButton
          type="primary"
          size="normal"
          onClick={handleCopyScript}
          className="copy-btn"
        >
          <AtIcon value="file-generic" size="16" color="white" />
          复制话术
        </AtButton>
      </View>

      {/* 分享操作表 */}
      <AtActionSheet
        isOpened={showActionSheet}
        cancelText="取消"
        onClose={() => setShowActionSheet(false)}
        onCancel={() => setShowActionSheet(false)}
      >
        <AtActionSheetItem onClick={handleShareToFriend}>
          分享给朋友
        </AtActionSheetItem>
        <AtActionSheetItem onClick={handleShareToMoments}>
          分享到朋友圈
        </AtActionSheetItem>
      </AtActionSheet>
    </View>
  );
};

export default ScriptDetail;