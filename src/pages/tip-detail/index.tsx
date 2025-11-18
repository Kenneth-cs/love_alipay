import { View, Text, ScrollView } from "@tarojs/components";
import { AtButton, AtIcon, AtActionSheet, AtActionSheetItem } from "taro-ui";
import Taro, { useRouter } from "@tarojs/taro";
import { useState, useEffect } from "react";
import { useLoveStore } from "../../store/loveStore";
import { LoveTip, TipCategory } from "../../types/love";
import "./index.scss";

const TipDetail = () => {
  const router = useRouter();
  const [tip, setTip] = useState<LoveTip | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [relatedTips, setRelatedTips] = useState<LoveTip[]>([]);

  const {
    tips,
    initializeData,
    getTipsByCategory,
    toggleBookmark,
    updateTipReadCount,
  } = useLoveStore();

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    const { id } = router.params;
    if (id && tips.length > 0) {
      const foundTip = tips.find(t => t.id === id);
      if (foundTip) {
        setTip(foundTip);
        // 获取相关支招（同分类的其他支招）
        const related = getTipsByCategory(foundTip.category)
          .filter(t => t.id !== foundTip.id)
          .slice(0, 3);
        setRelatedTips(related);
      }
    }
  }, [router.params, tips]);

  const handleBookmarkToggle = () => {
    if (!tip) return;
    toggleBookmark(tip.id);
    setTip({ ...tip, isBookmarked: !tip.isBookmarked });
  };

  const handleShareTip = () => {
    setShowActionSheet(true);
  };

  const handleShareToFriend = () => {
    if (!tip) return;
    
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
    if (!tip) return;
    
    Taro.showToast({
      title: '请使用右上角分享',
      icon: 'none',
    });
    setShowActionSheet(false);
  };

  const handleRelatedTipClick = (relatedTip: LoveTip) => {
    Taro.redirectTo({
      url: `/pages/tip-detail/index?id=${relatedTip.id}`,
    });
  };

  const handleBackToHome = () => {
    Taro.reLaunch({
      url: '/pages/index/index',
    });
  };

  const getCategoryName = (category: TipCategory) => {
    const categoryMap = {
      [TipCategory.PSYCHOLOGY]: '心理学',
      [TipCategory.COMMUNICATION]: '沟通技巧',
      [TipCategory.DATE_PLANNING]: '约会规划',
      [TipCategory.APPEARANCE]: '形象管理',
      [TipCategory.RELATIONSHIP]: '关系维护',
      [TipCategory.CRISIS]: '危机处理',
    };
    return categoryMap[category] || '未知';
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

  const getCategoryColor = (category: TipCategory) => {
    const colorMap = {
      [TipCategory.PSYCHOLOGY]: '#667eea',
      [TipCategory.COMMUNICATION]: '#4ecdc4',
      [TipCategory.DATE_PLANNING]: '#45b7d1',
      [TipCategory.APPEARANCE]: '#f9ca24',
      [TipCategory.RELATIONSHIP]: '#ff6b9d',
      [TipCategory.CRISIS]: '#e17055',
    };
    return colorMap[category] || '#999';
  };

  // 格式化内容，将换行转换为段落
  const formatContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => (
      <View key={index} className="content-paragraph">
        <Text className="paragraph-text">{paragraph}</Text>
      </View>
    ));
  };

  if (!tip) {
    return (
      <View className="tip-detail-page">
        <View className="loading-state">
          <Text className="loading-text">加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="tip-detail-page">
      {/* 返回首页按钮 */}
      <View className="back-to-home">
        <View className="back-btn" onClick={handleBackToHome}>
          <AtIcon value="home" size="18" color="#ff6b9d" />
          <Text className="back-text">返回首页</Text>
        </View>
      </View>

      <ScrollView scrollY className="scroll-content">
        {/* 头部信息 */}
        <View className="header-section">
          <View className="category-info">
            <View
              className="category-icon"
              style={{ backgroundColor: getCategoryColor(tip.category) }}
            >
              <Text className="icon-text">{getCategoryIcon(tip.category)}</Text>
            </View>
            <Text className="category-name">{getCategoryName(tip.category)}</Text>
          </View>
          
          <Text className="tip-title">{tip.title}</Text>
          
          <View className="meta-info">
            <View className="meta-item">
              <AtIcon value="eye" size="14" color="#999" />
              <Text className="meta-text">阅读 {tip.readCount} 次</Text>
            </View>
            <View className="meta-item">
              <AtIcon value="clock" size="14" color="#999" />
              <Text className="meta-text">约 {Math.ceil(tip.content.length / 300)} 分钟</Text>
            </View>
          </View>
        </View>

        {/* 文章内容 */}
        <View className="content-section">
          <View className="content-container">
            {formatContent(tip.content)}
          </View>
        </View>

        {/* 标签 */}
        <View className="tags-section">
          <View className="section-title">
            <AtIcon value="tags" size="16" color="#ff6b9d" />
            <Text className="title-text">相关标签</Text>
          </View>
          <View className="tags-container">
            {tip.tags.map((tag) => (
              <View key={tag} className="tag-item">
                <Text className="tag-text">#{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 相关推荐 */}
        {relatedTips.length > 0 && (
          <View className="related-section">
            <View className="section-title">
              <AtIcon value="heart" size="16" color="#ff6b9d" />
              <Text className="title-text">相关推荐</Text>
            </View>
            <View className="related-list">
              {relatedTips.map((relatedTip) => (
                <View
                  key={relatedTip.id}
                  className="related-item"
                  onClick={() => handleRelatedTipClick(relatedTip)}
                >
                  <View className="related-header">
                    <View
                      className="related-icon"
                      style={{ backgroundColor: getCategoryColor(relatedTip.category) }}
                    >
                      <Text className="icon-text">
                        {getCategoryIcon(relatedTip.category)}
                      </Text>
                    </View>
                    <View className="related-info">
                      <Text className="related-title">{relatedTip.title}</Text>
                      <Text className="related-category">
                        {getCategoryName(relatedTip.category)}
                      </Text>
                    </View>
                    <AtIcon value="chevron-right" size="14" color="#ccc" />
                  </View>
                  <Text className="related-preview">
                    {relatedTip.content.substring(0, 80)}...
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 底部空白区域，为固定按钮留出空间 */}
        <View className="bottom-spacer" />
      </ScrollView>

      {/* 底部操作栏 */}
      <View className="bottom-actions">
        <View className="action-group">
          <View className="action-btn secondary" onClick={handleBookmarkToggle}>
            <AtIcon
              value="bookmark"
              size="20"
              color={tip.isBookmarked ? "#ff6b9d" : "#666"}
            />
            <Text className="btn-text">
              {tip.isBookmarked ? '已收藏' : '收藏'}
            </Text>
          </View>
          
          <View className="action-btn secondary" onClick={handleShareTip}>
            <AtIcon value="share" size="20" color="#666" />
            <Text className="btn-text">分享</Text>
          </View>
        </View>
        
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

export default TipDetail;