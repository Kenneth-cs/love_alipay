// utils/shareUtils.ts
import Taro from "@tarojs/taro";

export interface ShareConfig {
  title?: string;
  path?: string;
  imageUrl?: string;
}

export interface ShareTimelineConfig {
  title?: string;
  imageUrl?: string;
}

/**
 * 随机分享标题
 */
const SHARE_TITLES = [
  "神奇哈哈镜-变身魔法师",
  "神奇哈哈镜-颜值逆天了",
  "神奇哈哈镜-笑到停不下来",
  "神奇哈哈镜-特效太炫酷",
  "神奇哈哈镜-瞬间变网红",
  "神奇哈哈镜-魔幻大变身",
  "神奇哈哈镜-搞怪新玩法",
  "神奇哈哈镜-创意无极限",
  "神奇哈哈镜-趣味大发现",
  "神奇哈哈镜-惊喜连连看"
];

/**
 * 获取随机标题
 */
const getRandomTitle = (): string => {
  const randomIndex = Math.floor(Math.random() * SHARE_TITLES.length);
  return SHARE_TITLES[randomIndex];
};

/**
 * 默认分享配置
 */
const DEFAULT_SHARE_CONFIG: ShareConfig = {
  title: getRandomTitle(),
  path: "/pages/index/index"
  //imageUrl: "https://yuga-1323085362.cos.ap-guangzhou.myqcloud.com/miniapp/hahajing.png",
};

const DEFAULT_TIMELINE_CONFIG: ShareTimelineConfig = {
  title: getRandomTitle(),
  imageUrl: "https://yuga-1323085362.cos.ap-guangzhou.myqcloud.com/miniapp/hahajing.png",
};

/**
 * 设置分享给好友
 * @param config 自定义分享配置，会与默认配置合并
 */
export const useAppMessageShare = (config?: Partial<ShareConfig>) => {
  Taro.useShareAppMessage(() => {
    // 每次分享时都获取新的随机标题
    const shareConfig = { 
      ...DEFAULT_SHARE_CONFIG, 
      title: config?.title || getRandomTitle(),
      ...config 
    };
    return shareConfig;
  });
};

/**
 * 设置分享到朋友圈
 * @param config 自定义分享配置，会与默认配置合并
 */
export const useTimelineShare = (config?: Partial<ShareTimelineConfig>) => {
  Taro.useShareTimeline(() => {
    // 每次分享时都获取新的随机标题
    const shareConfig = { 
      ...DEFAULT_TIMELINE_CONFIG, 
      title: config?.title || getRandomTitle(),
      ...config 
    };
    return shareConfig;
  });
};

/**
 * 同时设置分享给好友和分享到朋友圈
 * @param appMessageConfig 分享给好友的配置
 * @param timelineConfig 分享到朋友圈的配置
 */
export const useShare = (
  appMessageConfig?: Partial<ShareConfig>,
  timelineConfig?: Partial<ShareTimelineConfig>
) => {
  useAppMessageShare(appMessageConfig);
  useTimelineShare(timelineConfig);
};

/**
 * 导出随机标题函数，供其他地方使用
 */
export { getRandomTitle };
