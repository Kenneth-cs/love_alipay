// 恋爱话术类型定义
export interface LoveScript {
  id: string;
  title: string;
  content: string;
  category: LoveCategory;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  situation: string;
  isFavorite: boolean;
  useCount: number;
}

// 恋爱话术分类
export enum LoveCategory {
  GREETING = 'greeting', // 打招呼
  CHAT = 'chat', // 聊天话题
  COMPLIMENT = 'compliment', // 夸赞
  HUMOR = 'humor', // 幽默
  CARE = 'care', // 关心
  DATE = 'date', // 约会
  CONFESSION = 'confession', // 表白
  COMFORT = 'comfort', // 安慰
  APOLOGY = 'apology', // 道歉
  GOODNIGHT = 'goodnight' // 晚安
}

// 恋爱支招类型
export interface LoveTip {
  id: string;
  title: string;
  content: string;
  category: TipCategory;
  tags: string[];
  readCount: number;
  isBookmarked: boolean;
}

// 支招分类
export enum TipCategory {
  PSYCHOLOGY = 'psychology', // 心理学
  COMMUNICATION = 'communication', // 沟通技巧
  DATE_PLANNING = 'date_planning', // 约会规划
  APPEARANCE = 'appearance', // 形象管理
  RELATIONSHIP = 'relationship', // 关系维护
  CRISIS = 'crisis' // 危机处理
}

// 用户偏好设置
export interface UserPreferences {
  favoriteCategories: LoveCategory[];
  difficulty: 'easy' | 'medium' | 'hard';
  showUsageStats: boolean;
  darkMode?: boolean;
}