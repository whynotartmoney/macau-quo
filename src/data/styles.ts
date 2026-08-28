import type { LayoutCustom, StyleId } from '../types/doc';

export type StyleMeta = {
  id: StyleId;
  name: string;
  nameEn: string;
  tag: string;
  desc: string;
  paper: string;
  ink: string;
  accent: string;
};

export const STYLE_LIST: StyleMeta[] = [
  {
    id: 'classic',
    name: 'Classic',
    nameEn: 'Classic',
    tag: '會計',
    desc: 'Invoice Simple／會計行最常用的襯線表格式，適合對公打印。',
    paper: '#ffffff',
    ink: '#1c1917',
    accent: '#b42318',
  },
  {
    id: 'clean',
    name: 'Clean',
    nameEn: 'Clean Professional',
    tag: '通用',
    desc: '白底、彩色標題徽章與三張資料卡，報價工具裡選得最多的通用版。',
    paper: '#ffffff',
    ink: '#171717',
    accent: '#e11d48',
  },
  {
    id: 'compact',
    name: 'Compact',
    nameEn: 'Compact',
    tag: '緊湊',
    desc: 'Invoice Simple Compact：標誌靠右、行距緊、一頁裝更多項目。',
    paper: '#ffffff',
    ink: '#262626',
    accent: '#2563eb',
  },
  {
    id: 'sharp',
    name: 'Sharp',
    nameEn: 'Sharp',
    tag: '幾何',
    desc: '左側色條與直角網格，科技與顧問公司常用的利落版。',
    paper: '#ffffff',
    ink: '#111827',
    accent: '#111827',
  },
  {
    id: 'executive',
    name: 'Executive',
    nameEn: 'Executive Dark',
    tag: '企業',
    desc: '黑頂欄加強調色標題，大型合約與高金額報價最常見。',
    paper: '#ffffff',
    ink: '#111111',
    accent: '#dc2626',
  },
  {
    id: 'sidebar',
    name: 'Sidebar',
    nameEn: 'Modern Sidebar',
    tag: '雙欄',
    desc: '左黑右白雙欄，總價固定在側欄，IT 與設計工作室愛用。',
    paper: '#ffffff',
    ink: '#111111',
    accent: '#e11d48',
  },
  {
    id: 'bold',
    name: 'Bold Stripe',
    nameEn: 'Bold',
    tag: '對比',
    desc: '頂部色帶加黑底資料列，市場與創意公司常用的高識別版。',
    paper: '#ffffff',
    ink: '#0a0a0a',
    accent: '#e11d48',
  },
  {
    id: 'navy',
    name: 'Navy',
    nameEn: 'Blue & White',
    tag: '企業藍',
    desc: 'Canva 下載量最高的藍白企業報價：海軍藍頂欄與表格頭。',
    paper: '#ffffff',
    ink: '#0f172a',
    accent: '#1e3a8a',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    nameEn: 'Green Minimal',
    tag: '服務',
    desc: 'Canva 第二熱門的綠白極簡，適合美容、顧問與服務業。',
    paper: '#ffffff',
    ink: '#14532d',
    accent: '#047857',
  },
  {
    id: 'custom',
    name: 'Custom',
    nameEn: 'Custom',
    tag: '可調',
    desc: '以 Clean 為骨架，自選主色、字體與疏密度。',
    paper: '#ffffff',
    ink: '#171717',
    accent: '#2563eb',
  },
];

export const DEFAULT_CUSTOM: LayoutCustom = {
  accent: '#2563eb',
  paper: '#ffffff',
  ink: '#171717',
  layout: 'standard',
  density: 'regular',
  fontPreset: 'sans',
  bilingual: false,
  showChop: true,
  headerAlign: 'split',
  showChineseAmount: true,
  showValidUntil: true,
};

export const FONT_PRESET_LABEL: Record<LayoutCustom['fontPreset'], string> = {
  serif: '宋體襯線',
  sans: '現代黑體',
  display: '大標題體',
  gothic: '哥德粗體',
};

export const LAYOUT_LABEL: Record<LayoutCustom['layout'], string> = {
  standard: '標準表格式',
  split: '左右分欄',
  poster: '海報大字',
  certificate: '證書置中',
};
