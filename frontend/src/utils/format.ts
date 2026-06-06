import dayjs from 'dayjs';

export const formatDate = (date: string | Date): string => {
  return dayjs(date).format('YYYY-MM-DD');
};

export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

export const getSmartTime = (date: string | Date): string => {
  const now = dayjs();
  const target = dayjs(date);
  const diffDays = now.diff(target, 'day');
  
  if (diffDays === 0) {
    return `今天 ${target.format('HH:mm')}`;
  } else if (diffDays === 1) {
    return `昨天 ${target.format('HH:mm')}`;
  } else if (diffDays === 2) {
    return `前天 ${target.format('HH:mm')}`;
  } else if (now.year() === target.year()) {
    return target.format('MM-DD HH:mm');
  } else {
    return target.format('YYYY-MM-DD HH:mm');
  }
};

export const getGreeting = (): string => {
  const hour = dayjs().hour();
  if (hour < 6) return '夜深了，注意休息';
  if (hour < 9) return '早上好，元气满满';
  if (hour < 12) return '上午好，继续加油';
  if (hour < 14) return '中午好，记得午休';
  if (hour < 18) return '下午好，坚持一下';
  if (hour < 22) return '晚上好，放松一下';
  return '夜深了，注意休息';
};

export const getDailyQuote = (): string => {
  const quotes = [
    '每天进步一点点，积累成就大梦想',
    '坚持就是胜利，打卡每一天',
    '今天的努力，是明天的收获',
    '不积跬步，无以至千里',
    '成功源于每一天的坚持',
    '今天也要元气满满哦',
    '相信自己，你能做到',
    '每一个不曾起舞的日子，都是对生命的辜负',
    '生活不止眼前的苟且，还有诗和远方',
    '努力到无能为力，拼搏到感动自己',
  ];
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return quotes[dayOfYear % quotes.length];
};