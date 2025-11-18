import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState, useEffect } from "react";
import "./index.scss";

interface TabBarProps {
  current?: number;
}

const TabBar = ({ current = 0 }: TabBarProps) => {
  const [activeTab, setActiveTab] = useState(current);

  const tabs = [
    {
      key: 'index',
      title: '首页',
      icon: '🏠',
      activeIcon: '🏠',
      url: '/pages/index/index'
    },
    {
      key: 'scripts',
      title: '话术',
      icon: '💬',
      activeIcon: '💬',
      url: '/pages/scripts/index'
    },
    {
      key: 'tips',
      title: '支招',
      icon: '💡',
      activeIcon: '💡',
      url: '/pages/tips/index'
    },
    {
      key: 'favorites',
      title: '收藏',
      icon: '❤️',
      activeIcon: '💖',
      url: '/pages/favorites/index'
    }
  ];

  useEffect(() => {
    setActiveTab(current);
  }, [current]);

  const handleTabClick = (index: number, url: string) => {
    if (index === activeTab) return;
    
    setActiveTab(index);
    Taro.switchTab({
      url: url
    });
  };

  return (
    <View className="tab-bar">
      {tabs.map((tab, index) => (
        <View
          key={tab.key}
          className={`tab-item ${index === activeTab ? 'active' : ''}`}
          onClick={() => handleTabClick(index, tab.url)}
        >
          <View className="tab-icon">
            <Text className="icon-text">
              {index === activeTab ? tab.activeIcon : tab.icon}
            </Text>
          </View>
          <Text className="tab-title">{tab.title}</Text>
        </View>
      ))}
    </View>
  );
};

export default TabBar;