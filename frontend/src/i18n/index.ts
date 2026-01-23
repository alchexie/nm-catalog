import { DEFAULT_LANG } from '@/types';
import { createI18n } from 'vue-i18n';

export const SUPPORT_LOCALES = ['en-US', 'ja-JP', 'zh-CN', 'zh-TW'] as const;
export type LocaleType = (typeof SUPPORT_LOCALES)[number];

const modules = import.meta.glob('./lang/*.json', { eager: true });
const messages: Record<LocaleType, any> = {} as any;

Object.entries(modules).forEach(([path, module]) => {
  const match = path.match(/\.\/lang\/(.*)\.json$/);
  const locale = match![1] as LocaleType;
  messages[locale] = (module as any).default;
});

export const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LANG,
  fallbackLocale: DEFAULT_LANG,
  messages: messages,
});
