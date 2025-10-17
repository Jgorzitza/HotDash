/**
 * Task O: Agent Personality and Tone Customization
 */

export const PERSONALITY_PROFILES = {
  professional: {
    traits: ["efficient", "courteous", "formal"],
    greeting: "Thank you for contacting HotDash.",
    signoff: "Best regards",
    language: "We appreciate your business",
  },

  friendly: {
    traits: ["warm", "conversational", "helpful"],
    greeting: "Hi there! How can I help you today?",
    signoff: "Have a great day!",
    language: "We're happy to help",
  },

  empathetic: {
    traits: ["understanding", "patient", "supportive"],
    greeting: "I understand this can be frustrating.",
    signoff: "We're here for you",
    language: "I completely understand",
  },
};

export function customizeTone(
  response: string,
  profile: keyof typeof PERSONALITY_PROFILES,
): string {
  const personality = PERSONALITY_PROFILES[profile];

  // Apply personality markers
  let customized = response;

  // Add greeting if not present
  if (!customized.match(/^(Hi|Hello|Thank you)/i)) {
    customized = `${personality.greeting}\n\n${customized}`;
  }

  // Add appropriate signoff
  if (
    !customized.includes("Best regards") &&
    !customized.includes("Have a great")
  ) {
    customized = `${customized}\n\n${personality.signoff}`;
  }

  return customized;
}
