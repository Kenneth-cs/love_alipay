import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Taro from '@tarojs/taro';
import { LoveScript, LoveTip, LoveCategory, TipCategory, UserPreferences } from '../types/love';
import { loveScriptsData } from '../data/loveScripts';
import { loveTipsData } from '../data/loveTips';

// 创建 Taro 存储适配器，增强错误处理
const taroStorage = {
  getItem: (name: string): string | null => {
    try {
      const value = Taro.getStorageSync(name);
      return value || null;
    } catch (error) {
      console.error('Storage getItem failed:', error);
      // 尝试显示用户友好的错误提示
      if (process.env.NODE_ENV === 'development') {
        Taro.showToast({
          title: '数据读取失败',
          icon: 'none',
          duration: 1500,
        });
      }
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      Taro.setStorageSync(name, value);
    } catch (error) {
      console.error('Storage setItem failed:', error);
      // 检查是否是存储空间不足
      if (error.message && error.message.includes('exceed')) {
        Taro.showModal({
          title: '存储空间不足',
          content: '设备存储空间不足，请清理一些数据后重试',
          showCancel: false,
        });
      } else {
        Taro.showToast({
          title: '数据保存失败',
          icon: 'none',
          duration: 2000,
        });
      }
    }
  },
  removeItem: (name: string): void => {
    try {
      Taro.removeStorageSync(name);
    } catch (error) {
      console.error('Storage removeItem failed:', error);
      Taro.showToast({
        title: '数据删除失败',
        icon: 'none',
        duration: 1500,
      });
    }
  },
};

interface LoveStore {
  // 恋爱话术相关
  scripts: LoveScript[];
  favorites: LoveScript[];
  
  // 分页相关
  displayedScripts: LoveScript[];
  currentPage: number;
  pageSize: number;
  hasMoreScripts: boolean;
  isLoading: boolean;
  
  // 恋爱支招相关
  tips: LoveTip[];
  bookmarkedTips: LoveTip[];
  
  // 用户偏好
  preferences: UserPreferences;
  
  // Actions
  // 话术相关操作
  getScriptsByCategory: (category: LoveCategory) => LoveScript[];
  getScriptsByCategoryPaginated: (category: LoveCategory | 'all', page?: number) => LoveScript[];
  loadMoreScripts: (category?: LoveCategory | 'all') => void;
  resetPagination: () => void;
  addToFavorites: (script: LoveScript) => void;
  removeFromFavorites: (scriptId: string) => void;
  toggleFavorite: (scriptId: string) => void;
  updateScriptUseCount: (scriptId: string) => void;
  isFavorite: (scriptId: string) => boolean;
  
  // 支招相关操作
  getTipsByCategory: (category: TipCategory) => LoveTip[];
  addToBookmarks: (tip: LoveTip) => void;
  toggleBookmark: (tipId: string) => void;
  removeFromBookmarks: (tipId: string) => void;
  updateTipReadCount: (tipId: string) => void;
  isBookmarked: (tipId: string) => boolean;
  
  // 偏好设置
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  
  // 初始化数据
  initializeData: () => void;
}

export const useLoveStore = create<LoveStore>()(
  persist(
    (set, get) => ({
      scripts: [],
      favorites: [],
      
      // 分页相关初始状态
      displayedScripts: [],
      currentPage: 0,
      pageSize: 15, // 每页15条数据，减少单次传输量
      hasMoreScripts: true,
      isLoading: false,
      
      tips: [],
      bookmarkedTips: [],
      preferences: {
        favoriteCategories: [],
        difficulty: 'easy',
        showUsageStats: true,
        darkMode: false,
      },
getScriptsByCategory: (category: LoveCategory) => {
  return get().scripts.filter(script => script.category === category);
},

getScriptsByCategoryPaginated: (category: LoveCategory | 'all', page = 0) => {
  const state = get();
  const allScripts = category === 'all'
    ? state.scripts
    : state.scripts.filter(script => script.category === category);
  
  const startIndex = page * state.pageSize;
  const endIndex = startIndex + state.pageSize;
  return allScripts.slice(startIndex, endIndex);
},

loadMoreScripts: (category?: LoveCategory | 'all') => {
  const state = get();
  if (state.isLoading || !state.hasMoreScripts) return;

  set({ isLoading: true });

  // 模拟异步加载
  setTimeout(() => {
    const nextPage = state.currentPage + 1;
    const newScripts = get().getScriptsByCategoryPaginated(
      category || 'all',
      nextPage
    );

    if (newScripts.length === 0) {
      set({
        isLoading: false,
        hasMoreScripts: false
      });
    } else {
      set(prevState => ({
        displayedScripts: [...prevState.displayedScripts, ...newScripts],
        currentPage: nextPage,
        isLoading: false,
        hasMoreScripts: newScripts.length === prevState.pageSize
      }));
    }
  }, 300); // 300ms延迟模拟网络请求
},

resetPagination: () => {
  set({
    displayedScripts: [],
    currentPage: 0,
    hasMoreScripts: true,
    isLoading: false
  });
},


      

      addToFavorites: (script: LoveScript) => {
        set(state => {
          const isAlreadyFavorited = state.favorites.some(fav => fav.id === script.id);
          if (!isAlreadyFavorited) {
            return {
              favorites: [...state.favorites, script],
            };
          }
          return state;
        });
      },

      removeFromFavorites: (scriptId: string) => {
        set(state => ({
          favorites: state.favorites.filter(script => script.id !== scriptId),
        }));
      },

      toggleFavorite: (scriptId: string) => {
        const state = get();
        const script = state.scripts.find(s => s.id === scriptId);
        if (!script) return;

        const isAlreadyFavorited = state.favorites.some(fav => fav.id === scriptId);
        if (isAlreadyFavorited) {
          // 从收藏中移除
          set(prevState => ({
            favorites: prevState.favorites.filter(fav => fav.id !== scriptId),
          }));
        } else {
          // 添加到收藏
          set(prevState => ({
            favorites: [...prevState.favorites, script],
          }));
        }
      },

      updateScriptUseCount: (scriptId: string) => {
        set(state => ({
          scripts: state.scripts.map(script =>
            script.id === scriptId 
              ? { ...script, useCount: script.useCount + 1 }
              : script
          ),
        }));
      },

      getTipsByCategory: (category: TipCategory) => {
        return get().tips.filter(tip => tip.category === category);
      },
      

      addToBookmarks: (tip: LoveTip) => {
        set(state => {
          const isAlreadyBookmarked = state.bookmarkedTips.some(bookmark => bookmark.id === tip.id);
          if (!isAlreadyBookmarked) {
            return {
              bookmarkedTips: [...state.bookmarkedTips, tip],
            };
          }
          return state;
        });
      },

      removeFromBookmarks: (tipId: string) => {
        set(state => ({
          bookmarkedTips: state.bookmarkedTips.filter(tip => tip.id !== tipId),
        }));
      },
toggleBookmark: (tipId: string) => {
        const state = get();
        const tip = state.tips.find(t => t.id === tipId);
        if (!tip) return;

        const isAlreadyBookmarked = state.bookmarkedTips.some(bookmark => bookmark.id === tipId);
        if (isAlreadyBookmarked) {
          // 从收藏中移除
          set(prevState => ({
            bookmarkedTips: prevState.bookmarkedTips.filter(bookmark => bookmark.id !== tipId),
          }));
        } else {
          // 添加到收藏
          set(prevState => ({
            bookmarkedTips: [...prevState.bookmarkedTips, tip],
          }));
        }
      },

      updateTipReadCount: (tipId: string) => {
        set(state => ({
          tips: state.tips.map(tip =>
            tip.id === tipId 
              ? { ...tip, readCount: tip.readCount + 1 }
              : tip
          ),
        }));
      },

      updatePreferences: (newPreferences: Partial<UserPreferences>) => {
        set(state => ({
          preferences: { ...state.preferences, ...newPreferences },
        }));
      },

      isFavorite: (scriptId: string) => {
        return get().favorites.some(fav => fav.id === scriptId);
      },

      isBookmarked: (tipId: string) => {
        return get().bookmarkedTips.some(bookmark => bookmark.id === tipId);
      },

      initializeData: () => {
        const state = get();
        // 获取第一页数据
        const firstPageScripts = loveScriptsData.slice(0, state.pageSize);
        
        set({
          scripts: loveScriptsData,
          tips: loveTipsData,
          displayedScripts: firstPageScripts,
          currentPage: 0,
          hasMoreScripts: firstPageScripts.length === state.pageSize,
          isLoading: false
        });
      },
    }),
    {
      name: 'love-app-storage',
      storage: createJSONStorage(() => taroStorage),
      partialize: (state) => ({
        favorites: state.favorites,
        bookmarkedTips: state.bookmarkedTips,
        preferences: state.preferences,
      }),
    }
  )
);