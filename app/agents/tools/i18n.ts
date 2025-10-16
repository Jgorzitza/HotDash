/**
 * Language Detection and i18n Scaffolding
 * 
 * Detects customer language and provides i18n framework.
 * Backlog task #13: Language detection + i18n scaffolding
 */

import { z } from 'zod';

/**
 * Supported languages
 */
export const SupportedLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh'] as const;
export type Language = typeof SupportedLanguages[number];

/**
 * Language detection result
 */
export const LanguageDetectionSchema = z.object({
  language: z.enum(SupportedLanguages),
  confidence: z.number().min(0).max(1),
  alternatives: z.array(z.object({
    language: z.enum(SupportedLanguages),
    confidence: z.number(),
  })).optional(),
});

export type LanguageDetection = z.infer<typeof LanguageDetectionSchema>;

/**
 * Detect language from text
 * 
 * Simple keyword-based detection. In production, would use a proper
 * language detection library or API.
 */
export function detectLanguage(text: string): LanguageDetection {
  const lowerText = text.toLowerCase();

  // Language-specific keywords
  const languagePatterns: Record<Language, string[]> = {
    en: ['the', 'is', 'and', 'to', 'of', 'a', 'in', 'that', 'have', 'it'],
    es: ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se'],
    fr: ['le', 'de', 'un', 'être', 'et', 'à', 'il', 'avoir', 'ne', 'je'],
    de: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich'],
    it: ['il', 'di', 'e', 'la', 'a', 'per', 'che', 'in', 'un', 'è'],
    pt: ['o', 'a', 'de', 'que', 'e', 'do', 'da', 'em', 'um', 'para'],
    ja: ['の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し'],
    zh: ['的', '一', '是', '不', '了', '在', '人', '有', '我', '他'],
  };

  const scores: Record<Language, number> = {
    en: 0, es: 0, fr: 0, de: 0, it: 0, pt: 0, ja: 0, zh: 0,
  };

  // Count keyword matches
  Object.entries(languagePatterns).forEach(([lang, keywords]) => {
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        scores[lang as Language] += matches.length;
      }
    });
  });

  // Find language with highest score
  const sortedLanguages = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([lang, score]) => ({ language: lang as Language, score }));

  const topLanguage = sortedLanguages[0];
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const confidence = totalScore > 0 ? topLanguage.score / totalScore : 0;

  // Default to English if confidence is too low
  if (confidence < 0.3) {
    return {
      language: 'en',
      confidence: 1.0,
    };
  }

  return {
    language: topLanguage.language,
    confidence,
    alternatives: sortedLanguages.slice(1, 3).map(({ language, score }) => ({
      language,
      confidence: totalScore > 0 ? score / totalScore : 0,
    })),
  };
}

/**
 * Translation strings (i18n)
 */
const translations: Record<Language, Record<string, string>> = {
  en: {
    greeting: 'Hello',
    thank_you: 'Thank you',
    apology: 'I apologize',
    order_status: 'Your order status',
    return_policy: 'Our return policy',
    shipping_info: 'Shipping information',
  },
  es: {
    greeting: 'Hola',
    thank_you: 'Gracias',
    apology: 'Lo siento',
    order_status: 'El estado de su pedido',
    return_policy: 'Nuestra política de devoluciones',
    shipping_info: 'Información de envío',
  },
  fr: {
    greeting: 'Bonjour',
    thank_you: 'Merci',
    apology: 'Je m\'excuse',
    order_status: 'L\'état de votre commande',
    return_policy: 'Notre politique de retour',
    shipping_info: 'Informations d\'expédition',
  },
  de: {
    greeting: 'Hallo',
    thank_you: 'Danke',
    apology: 'Entschuldigung',
    order_status: 'Ihr Bestellstatus',
    return_policy: 'Unsere Rückgaberichtlinie',
    shipping_info: 'Versandinformationen',
  },
  it: {
    greeting: 'Ciao',
    thank_you: 'Grazie',
    apology: 'Mi scuso',
    order_status: 'Lo stato del tuo ordine',
    return_policy: 'La nostra politica di reso',
    shipping_info: 'Informazioni sulla spedizione',
  },
  pt: {
    greeting: 'Olá',
    thank_you: 'Obrigado',
    apology: 'Peço desculpas',
    order_status: 'O status do seu pedido',
    return_policy: 'Nossa política de devolução',
    shipping_info: 'Informações de envio',
  },
  ja: {
    greeting: 'こんにちは',
    thank_you: 'ありがとうございます',
    apology: '申し訳ございません',
    order_status: 'ご注文の状況',
    return_policy: '返品ポリシー',
    shipping_info: '配送情報',
  },
  zh: {
    greeting: '你好',
    thank_you: '谢谢',
    apology: '对不起',
    order_status: '您的订单状态',
    return_policy: '我们的退货政策',
    shipping_info: '运输信息',
  },
};

/**
 * Get translation for key
 */
export function translate(key: string, language: Language = 'en'): string {
  return translations[language]?.[key] || translations.en[key] || key;
}

/**
 * Get all translations for a language
 */
export function getTranslations(language: Language): Record<string, string> {
  return translations[language] || translations.en;
}

/**
 * Format message with language-specific greeting
 */
export function formatGreeting(name: string, language: Language = 'en'): string {
  const greeting = translate('greeting', language);
  return `${greeting}, ${name}!`;
}

/**
 * Check if language is supported
 */
export function isLanguageSupported(language: string): language is Language {
  return SupportedLanguages.includes(language as Language);
}

