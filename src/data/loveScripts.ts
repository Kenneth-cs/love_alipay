import { LoveScript } from '../types/love';

// 导入所有分拆的话术文件
import { greetingScripts } from './scripts/greeting';
import { chatScripts } from './scripts/chat';
import { mixedScripts } from './scripts/mixed';
import { newGreetingChatScripts } from './scripts/new-greeting-chat';
import { extendedScripts } from './scripts/extended-scripts';

// 合并所有话术数据
export const loveScriptsData: LoveScript[] = [
  ...greetingScripts,      // 35条打招呼类话术 (ID: 1-10, 91-120)
  ...chatScripts,          // 60条聊天话题类话术 (ID: 11-20, 96-100, 121-140)
  ...mixedScripts,         // 85条混合类话术 (ID: 21-90) - 夸赞、幽默、关心、约会、表白、安慰、道歉、晚安
  ...newGreetingChatScripts, // 70条新增打招呼和聊天话术 (ID: 141-210)
  ...extendedScripts,      // 160条扩展话术 (ID: 211-370) - 夸奖40条、约会40条、关心40条、幽默40条
];

// 统计信息
export const scriptsStats = {
  totalScripts: loveScriptsData.length,
  originalScripts: 140,
  newScripts: 70,
  extendedScripts: 160,
  categories: {
    greeting: greetingScripts.length + newGreetingChatScripts.filter(s => s.category === 'greeting').length,
    chat: chatScripts.length + newGreetingChatScripts.filter(s => s.category === 'chat').length,
    compliment: mixedScripts.filter(s => s.category === 'compliment').length + extendedScripts.filter(s => s.category === 'compliment').length,
    humor: mixedScripts.filter(s => s.category === 'humor').length + extendedScripts.filter(s => s.category === 'humor').length,
    care: mixedScripts.filter(s => s.category === 'care').length + extendedScripts.filter(s => s.category === 'care').length,
    date: mixedScripts.filter(s => s.category === 'date').length + extendedScripts.filter(s => s.category === 'date').length,
    confession: mixedScripts.filter(s => s.category === 'confession').length,
    comfort: mixedScripts.filter(s => s.category === 'comfort').length,
    apology: mixedScripts.filter(s => s.category === 'apology').length,
    goodnight: mixedScripts.filter(s => s.category === 'goodnight').length,
  }
};