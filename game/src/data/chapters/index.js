// 章节数据统一导出
export { ChapterData_ch01 } from './ch01.js';
export { ChapterData_ch02 } from './ch02.js';
export { ChapterData_ch03 } from './ch03.js';
export { ChapterData_ch04 } from './ch04.js';
export { ChapterData_ch05 } from './ch05.js';

// 所有章节索引
export const ALL_CHAPTERS = {
  ch01: () => import('./ch01.js').then(m => m.ChapterData_ch01),
  ch02: () => import('./ch02.js').then(m => m.ChapterData_ch02),
  ch03: () => import('./ch03.js').then(m => m.ChapterData_ch03),
  ch04: () => import('./ch04.js').then(m => m.ChapterData_ch04),
  ch05: () => import('./ch05.js').then(m => m.ChapterData_ch05)
};
