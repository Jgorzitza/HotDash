/**
 * Internationalized Reply Templates for Chatwoot Agent Responses
 * 
 * Supports multi-language agent responses with CEO approval workflow.
 * Each template can have translations in multiple locales.
 */

export type SupportedLocale = 'en' | 'fr' | 'es' | 'de';

export interface LocalizedTemplate {
  id: string;
  label: {
    [key in SupportedLocale]?: string;
  };
  body: {
    [key in SupportedLocale]?: string;
  };
  requiresCEOApproval: boolean;
  ceoApprovedLocales: SupportedLocale[];
}

export const CHATWOOT_TEMPLATES_I18N: LocalizedTemplate[] = [
  {
    id: "ack_delay",
    label: {
      en: "Acknowledge delay",
      fr: "Reconnaître le retard",
    },
    body: {
      en: "Hi {{name}}, thanks for your patience. I'm checking on your order now and will follow up with an update shortly.",
      fr: "Bonjour {{name}}, merci pour votre patience. Je vérifie votre commande maintenant et vous donnerai une mise à jour sous peu.",
    },
    requiresCEOApproval: true,
    ceoApprovedLocales: ['en'],
  },
  {
    id: "ship_update",
    label: {
      en: "Shipping updated",
      fr: "Mise à jour de l'expédition",
    },
    body: {
      en: "Appreciate you reaching out, {{name}}. Your order is with our carrier and I'm expediting a status check right away.",
      fr: "Merci de nous avoir contactés, {{name}}. Votre commande est avec notre transporteur et j'accélère la vérification du statut immédiatement.",
    },
    requiresCEOApproval: true,
    ceoApprovedLocales: ['en'],
  },
  {
    id: "refund_offer",
    label: {
      en: "Refund offer",
      fr: "Offre de remboursement",
    },
    body: {
      en: "I'm sorry for the trouble, {{name}}. I can refund this immediately or offer store credit—let me know what works best.",
      fr: "Je suis désolé pour le désagrément, {{name}}. Je peux effectuer le remboursement immédiatement ou offrir un crédit en magasin—dites-moi ce qui vous convient le mieux.",
    },
    requiresCEOApproval: true,
    ceoApprovedLocales: ['en'],
  },
];

export function getLocalizedTemplate(
  templateId: string,
  locale: SupportedLocale = 'en'
): { label: string; body: string } | undefined {
  const template = CHATWOOT_TEMPLATES_I18N.find((t) => t.id === templateId);
  if (!template) return undefined;

  const useLocale = template.ceoApprovedLocales.includes(locale) ? locale : 'en';

  return {
    label: template.label[useLocale] || template.label.en || '',
    body: template.body[useLocale] || template.body.en || '',
  };
}

export function isLocaleApproved(templateId: string, locale: SupportedLocale): boolean {
  const template = CHATWOOT_TEMPLATES_I18N.find((t) => t.id === templateId);
  return template?.ceoApprovedLocales.includes(locale) ?? false;
}

export function getPendingApprovalLocales(templateId: string): SupportedLocale[] {
  const template = CHATWOOT_TEMPLATES_I18N.find((t) => t.id === templateId);
  if (!template) return [];

  const allLocales = Object.keys(template.body) as SupportedLocale[];
  return allLocales.filter((locale) => !template.ceoApprovedLocales.includes(locale));
}

export function approveCEOLocale(templateId: string, locale: SupportedLocale): boolean {
  const template = CHATWOOT_TEMPLATES_I18N.find((t) => t.id === templateId);
  if (!template) return false;
  
  if (!template.ceoApprovedLocales.includes(locale)) {
    template.ceoApprovedLocales.push(locale);
  }
  
  return true;
}

export function getTranslationStatus(): {
  templateId: string;
  label: string;
  availableLocales: SupportedLocale[];
  approvedLocales: SupportedLocale[];
  pendingLocales: SupportedLocale[];
}[] {
  return CHATWOOT_TEMPLATES_I18N.map((template) => ({
    templateId: template.id,
    label: template.label.en || template.id,
    availableLocales: Object.keys(template.body) as SupportedLocale[],
    approvedLocales: template.ceoApprovedLocales,
    pendingLocales: getPendingApprovalLocales(template.id),
  }));
}
