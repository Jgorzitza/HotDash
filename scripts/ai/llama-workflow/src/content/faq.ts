/**
 * Hot Rod AN FAQ Library
 * 100 most common customer questions with high-quality answers
 */

export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  relatedFAQs?: string[];
  relatedProducts?: string[];
}

export const FAQ_CATEGORIES = {
  PRODUCT_SPECS: 'Product Specifications',
  SIZING: 'Sizing & Selection',
  INSTALLATION: 'Installation & Assembly',
  COMPATIBILITY: 'Compatibility',
  TECHNICAL: 'Technical Support',
  ORDERING: 'Ordering & Shipping',
  RETURNS: 'Returns & Exchanges',
  LS_SWAP: 'LS Swap Specific',
  TROUBLESHOOTING: 'Troubleshooting',
  GENERAL: 'General Questions',
};

export const FAQS: FAQ[] = [
  // Product Specifications (15 FAQs)
  {
    id: 'faq-001',
    category: 'PRODUCT_SPECS',
    question: 'What sizes of PTFE hose do you sell?',
    answer: 'We offer PTFE braided hoses in AN-6 (3/8" ID), AN-8 (1/2" ID), and AN-10 (5/8" ID). All sizes available in black nylon braided, various colored check patterns, or stainless steel braided.',
    keywords: ['PTFE', 'hose', 'sizes', 'AN-6', 'AN-8', 'AN-10'],
  },
  
  {
    id: 'faq-002',
    category: 'PRODUCT_SPECS',
    question: 'What is the pressure rating of your PTFE hoses?',
    answer: 'Our PTFE braided hoses are rated for 1500-2000 PSI working pressure depending on size and construction. This far exceeds typical automotive fuel system pressures (40-80 PSI for EFI).',
    keywords: ['pressure', 'rating', 'PSI', 'PTFE'],
  },
  
  {
    id: 'faq-003',
    category: 'PRODUCT_SPECS',
    question: 'What temperature can PTFE hose handle?',
    answer: 'Nylon braided PTFE hoses: -40°F to 500°F. Stainless steel braided: -40°F to 600°F. The PTFE liner itself is rated for 500°F+. Both are more than adequate for fuel system applications.',
    keywords: ['temperature', 'rating', 'PTFE', 'heat'],
  },
  
  {
    id: 'faq-004',
    category: 'PRODUCT_SPECS',
    question: 'Can PTFE hose handle E85 fuel?',
    answer: 'Yes! PTFE liner is fully compatible with E85, gasoline, methanol, diesel, and all automotive fuels. This is why we use PTFE instead of rubber - superior chemical resistance.',
    keywords: ['E85', 'ethanol', 'fuel', 'compatibility', 'PTFE'],
  },
  
  {
    id: 'faq-005',
    category: 'PRODUCT_SPECS',
    question: 'What is the difference between nylon and stainless braided hose?',
    answer: 'Both have the same PTFE liner (same fuel compatibility and performance). Nylon braided is lighter, more flexible, comes in color options, and costs less. Stainless steel braided is more abrasion-resistant, handles slightly higher temps, and has a professional race look. For most hot rod builds, nylon is perfect.',
    keywords: ['nylon', 'stainless', 'difference', 'braided'],
  },
  
  {
    id: 'faq-006',
    category: 'PRODUCT_SPECS',
    question: 'What colors of PTFE hose do you offer?',
    answer: 'Black nylon braided (solid black), black with colored checks (orange, green, red, blue, purple, yellow), black/silver nylon, and stainless steel braided (natural stainless finish). All available in AN-6, AN-8, and AN-10.',
    keywords: ['colors', 'hose', 'options', 'checkered'],
  },
  
  {
    id: 'faq-007',
    category: 'PRODUCT_SPECS',
    question: 'What fuel pumps do you sell?',
    answer: 'Walbro 255 LPH (in-tank GCA758 and inline GSL392), Aeromotive Stealth 340 LPH, and Spectra Premium 190 LPH. Flow rates from 190-340 LPH supporting 400-700+ HP.',
    keywords: ['fuel pump', 'Walbro', 'Aeromotive', 'LPH'],
  },
  
  {
    id: 'faq-008',
    category: 'PRODUCT_SPECS',
    question: 'Do your AN fittings swivel?',
    answer: 'Yes! All our AN PTFE fittings are swivel-style (360° rotation). This makes installation much easier - you can align the fitting without twisting the hose.',
    keywords: ['swivel', 'AN fitting', 'rotate'],
  },
  
  {
    id: 'faq-009',
    category: 'PRODUCT_SPECS',
    question: 'Are your AN fittings reusable?',
    answer: 'Yes! Our AN PTFE fittings are reusable. You can disassemble and remake the hose assembly multiple times. Replace the ferrule after 3-5 uses for best results.',
    keywords: ['reusable', 'AN fitting', 'ferrule'],
  },
  
  {
    id: 'faq-010',
    category: 'PRODUCT_SPECS',
    question: 'What material are your AN fittings made from?',
    answer: 'Our AN fittings are made from aluminum with anodized finish. Lightweight, corrosion-resistant, and perfect for automotive use.',
    keywords: ['material', 'aluminum', 'anodized', 'AN fitting'],
  },
  
  // Sizing & Selection (20 FAQs)
  {
    id: 'faq-020',
    category: 'SIZING',
    question: 'What size fuel line do I need for my LS swap?',
    answer: 'For most LS swaps: AN-6 for up to 400 HP, AN-8 for 400-800 HP. If running forced induction or planning future power upgrades, go AN-8. Better to have extra flow capacity than be restricted.',
    keywords: ['size', 'LS swap', 'fuel line', 'horsepower'],
  },
  
  {
    id: 'faq-021',
    category: 'SIZING',
    question: 'What is AN-6 equivalent to in inches?',
    answer: 'AN-6 has a 3/8" inside diameter (ID). This is the most common size for hot rod fuel systems.',
    keywords: ['AN-6', 'size', 'diameter', 'inches'],
  },
  
  {
    id: 'faq-022',
    category: 'SIZING',
    question: 'Should I use AN-6 or AN-8 for my 500 HP build?',
    answer: 'AN-8 is recommended for 500 HP. While AN-6 can technically support it, AN-8 gives you better flow headroom and is safer for forced induction or future upgrades. Think of it as future-proofing your fuel system.',
    keywords: ['AN-6', 'AN-8', '500 HP', 'sizing'],
  },
  
  {
    id: 'faq-023',
    category: 'SIZING',
    question: 'What fuel pump do I need for 600 HP LS build?',
    answer: 'For 600 HP, we recommend the Aeromotive Stealth 340 LPH in-tank pump. It supports 600+ HP on gasoline, is E85 compatible, and proven reliable. Pair with AN-8 fuel lines for best results.',
    keywords: ['fuel pump', '600 HP', 'Aeromotive', 'LS'],
  },
  
  {
    id: 'faq-024',
    category: 'SIZING',
    question: 'Do I need a return line for my LS swap?',
    answer: 'Not required, but highly recommended for performance builds. Return-style systems maintain better fuel pressure under varying conditions and work better with aftermarket fuel pumps. Returnless is OK for stock replacements or mild builds.',
    keywords: ['return', 'returnless', 'LS', 'fuel system'],
  },
  
  {
    id: 'faq-025',
    category: 'SIZING',
    question: 'What size return line do I need?',
    answer: 'AN-6 is standard for return lines in most applications. Even high-horsepower builds typically use AN-6 return. The return line carries low-pressure excess fuel, so it doesn\'t need to be as large as the supply line.',
    keywords: ['return line', 'size', 'AN-6'],
  },
  
  // Installation (15 FAQs)
  {
    id: 'faq-040',
    category: 'INSTALLATION',
    question: 'What tools do I need to install AN PTFE fittings?',
    answer: 'Essential: Aluminum vice jaws, adjustable spanner wrench (AN3-AN12), and AN hose cutting shears. The vice jaws protect the braided covering, spanner wrench properly tightens fittings, and shears give clean cuts. Total investment ~$100, used on all future builds.',
    keywords: ['tools', 'installation', 'vice jaws', 'spanner', 'shears'],
  },
  
  {
    id: 'faq-041',
    category: 'INSTALLATION',
    question: 'How do I install PTFE fittings?',
    answer: '1) Cut hose to length, 2) Slide socket onto hose FIRST, 3) Insert nipple fully, 4) Place in aluminum vice jaws, 5) Thread socket forward over nipple, 6) Tighten with spanner wrench until braid is flush. Full step-by-step guide available on our site.',
    keywords: ['installation', 'PTFE', 'fitting', 'how to'],
  },
  
  {
    id: 'faq-042',
    category: 'INSTALLATION',
    question: 'Can I install AN fittings without special tools?',
    answer: 'Not recommended. Regular vise or pliers will crush the braided covering. Aluminum vice jaws are essential - they cost ~$30 and prevent damage. Spanner wrench ensures proper tightening without damaging threads. These tools pay for themselves on your first install.',
    keywords: ['tools', 'installation', 'vice jaws', 'required'],
  },
  
  {
    id: 'faq-043',
    category: 'INSTALLATION',
    question: 'How tight should I tighten AN fittings?',
    answer: 'Hand tight, then 1/4 turn with spanner wrench. Stop when the braided covering is flush with the socket collar. DO NOT overtighten - aluminum threads will strip. Proper assembly is about ferrule compression, not brute force.',
    keywords: ['tighten', 'torque', 'AN fitting', 'installation'],
  },
  
  {
    id: 'faq-044',
    category: 'INSTALLATION',
    question: 'Can I reuse AN PTFE fittings?',
    answer: 'Yes! Our reusable fittings can be used multiple times. Inspect ferrule for wear and replace after 3-5 uses for best results. This is a huge advantage over crimp fittings which are one-time use.',
    keywords: ['reuse', 'reusable', 'AN fitting', 'ferrule'],
  },
  
  // Compatibility (15 FAQs)
  {
    id: 'faq-060',
    category: 'COMPATIBILITY',
    question: 'Will these fittings work with my LS engine?',
    answer: 'Yes! Our LS fuel line kits include adapters for LS fuel rails. They work with LS1, LS2, LS3, LS6, LS7, and LSX engines. Both return and returnless versions available.',
    keywords: ['LS', 'compatibility', 'fuel rail', 'adapter'],
  },
  
  {
    id: 'faq-061',
    category: 'COMPATIBILITY',
    question: 'Can I mix AN-6 and AN-8 components?',
    answer: 'Not directly - AN-6 hose requires AN-6 fittings, AN-8 hose requires AN-8 fittings. However, you can use reducer fittings (AN-8 to AN-6) to transition between sizes if needed in your system design.',
    keywords: ['mix', 'AN-6', 'AN-8', 'compatibility', 'reducer'],
  },
  
  {
    id: 'faq-062',
    category: 'COMPATIBILITY',
    question: 'Will these work with my fuel cell?',
    answer: 'Our AN fittings work with fuel cells that have AN-compatible bulkhead fittings. Most aftermarket fuel cells use AN-6 or AN-8 bulkheads. Check your fuel cell specifications for thread type.',
    keywords: ['fuel cell', 'compatibility', 'bulkhead'],
  },
  
  {
    id: 'faq-063',
    category: 'COMPATIBILITY',
    question: 'Can I use PTFE hose for brake lines?',
    answer: 'PTFE hose can handle brake application technically (pressure/temp rated), but check local regulations. Some jurisdictions require DOT-approved brake line. PTFE is excellent for clutch hydraulics where approved.',
    keywords: ['brake', 'PTFE', 'DOT', 'legal'],
  },
  
  {
    id: 'faq-064',
    category: 'COMPATIBILITY',
    question: 'Will these pumps work with E85?',
    answer: 'Yes! Our Walbro 255 and Aeromotive Stealth 340 pumps are E85 compatible. Always verify with your specific fuel pump model, but all pumps we carry handle E85.',
    keywords: ['E85', 'fuel pump', 'ethanol', 'compatibility'],
  },
  
  // Technical Support (20 FAQs)
  {
    id: 'faq-080',
    category: 'TECHNICAL',
    question: 'How much horsepower can AN-6 support?',
    answer: 'AN-6 fuel lines can support approximately 450 HP on gasoline at typical fuel pressures. Flow capacity is about 90 GPH at 40 PSI. For builds over 450 HP or with forced induction, upgrade to AN-8.',
    keywords: ['horsepower', 'AN-6', 'flow', 'capacity'],
  },
  
  {
    id: 'faq-081',
    category: 'TECHNICAL',
    question: 'What is PTFE and why use it?',
    answer: 'PTFE (polytetrafluoroethylene, also known as Teflon) is a fluoropolymer with excellent chemical resistance. For fuel systems, PTFE is superior to rubber because it handles all fuel types (gas, E85, methanol), resists degradation, and maintains flexibility over time. It\'s the gold standard for performance fuel lines.',
    keywords: ['PTFE', 'Teflon', 'what is', 'benefits'],
  },
  
  {
    id: 'faq-082',
    category: 'TECHNICAL',
    question: 'Do I need a fuel pressure regulator?',
    answer: 'For return-style systems: Yes, required to regulate pressure. For returnless: Typically regulated at tank. Our Corvette-style filter/regulator combo is popular for return-style LS swaps - built-in AN-6 adapters make installation easy.',
    keywords: ['fuel pressure regulator', 'return', 'required'],
  },
  
  {
    id: 'faq-083',
    category: 'TECHNICAL',
    question: 'What is LPH on fuel pumps?',
    answer: 'LPH = Liters Per Hour (flow rate). Common ratings: 190 LPH (400 HP), 255 LPH (525 HP), 340 LPH (700 HP). Higher LPH = more flow = supports more horsepower. For gasoline, divide HP capability by 2 for E85 (needs more fuel).',
    keywords: ['LPH', 'flow rate', 'fuel pump', 'horsepower'],
  },
  
  {
    id: 'faq-084',
    category: 'TECHNICAL',
    question: 'In-tank vs inline fuel pump - which is better?',
    answer: 'In-tank: Quieter, cooler (submerged in fuel), easier priming, less vapor lock risk. Inline: Easier to service, works with fuel cells, visible for monitoring. For street cars: in-tank preferred. For race cars/fuel cells: inline is common.',
    keywords: ['in-tank', 'inline', 'fuel pump', 'difference'],
  },
  
  // LS Swap Specific (15 FAQs)
  {
    id: 'faq-100',
    category: 'LS_SWAP',
    question: 'What do I need for LS swap fuel system?',
    answer: 'Complete LS fuel system needs: Fuel pump (255+ LPH), fuel lines (AN-6 or AN-8), LS fuel rail adapters, fuel filter, fuel pressure regulator (return style), and mounting hardware. Our Return Style LS Fuel Line Kit includes everything except the pump.',
    keywords: ['LS swap', 'fuel system', 'complete', 'kit'],
  },
  
  {
    id: 'faq-101',
    category: 'LS_SWAP',
    question: 'Return or returnless for my LS swap?',
    answer: 'For performance LS swaps (400+ HP) or forced induction: Use return style. Better fuel pressure control and works with all aftermarket pumps. For stock replacement or mild builds: Returnless is simpler. Most builders choose return for flexibility.',
    keywords: ['return', 'returnless', 'LS swap', 'which'],
  },
  
  {
    id: 'faq-102',
    category: 'LS_SWAP',
    question: 'What size fuel lines for turbocharged LS?',
    answer: 'Turbo LS needs AN-8 supply line minimum. Fuel demand increases significantly under boost. For 600+ HP with boost, some builders run AN-10 supply. Return line can stay AN-6. Use our AN-8 bundle for supply.',
    keywords: ['turbo', 'turbocharged', 'LS', 'fuel line', 'boost'],
  },
  
  {
    id: 'faq-103',
    category: 'LS_SWAP',
    question: 'Do I need adapters for LS fuel rails?',
    answer: 'Yes, LS fuel rails have unique fittings. Our LS fuel line kits include the proper adapters. If building custom, you\'ll need LS fuel rail to AN-6 or AN-8 adapters (included in our kits).',
    keywords: ['LS', 'fuel rail', 'adapter', 'fitting'],
  },
  
  // Ordering & Shipping (10 FAQs)
  {
    id: 'faq-120',
    category: 'ORDERING',
    question: 'How long does shipping take?',
    answer: 'Standard shipping is 3-5 business days to most locations. You\'ll receive tracking information once your order ships. Expedited options available at checkout.',
    keywords: ['shipping', 'delivery', 'time', 'tracking'],
  },
  
  {
    id: 'faq-121',
    category: 'ORDERING',
    question: 'Do you ship to [state/country]?',
    answer: 'We ship to all 50 US states. International shipping available for some locations - contact us for international shipping quote.',
    keywords: ['shipping', 'location', 'international'],
  },
  
  {
    id: 'faq-122',
    category: 'ORDERING',
    question: 'Can I track my order?',
    answer: 'Yes! You\'ll receive tracking information via email once your order ships. You can also log into your account on hotrodan.com to view order status.',
    keywords: ['tracking', 'order status', 'where is my order'],
  },
  
  // Returns & Exchanges (10 FAQs)
  {
    id: 'faq-130',
    category: 'RETURNS',
    question: 'What is your return policy?',
    answer: '30-day return policy on unused items in original packaging. We want you to be happy with your Hot Rod AN parts! Contact us to start a return.',
    keywords: ['return', 'policy', '30 days'],
  },
  
  {
    id: 'faq-131',
    category: 'RETURNS',
    question: 'Can I exchange for a different size?',
    answer: 'Yes! If you ordered the wrong size, we can exchange unused items. Contact us within 30 days and we\'ll help you get the right size for your build.',
    keywords: ['exchange', 'size', 'wrong size'],
  },
  
  // Troubleshooting (10 FAQs)
  {
    id: 'faq-140',
    category: 'TROUBLESHOOTING',
    question: 'My AN fitting is leaking, what should I do?',
    answer: 'Check: 1) Is fitting tight enough? (hand tight + 1/4 turn), 2) Is ferrule properly compressed? (braid flush with socket), 3) Is PTFE liner damaged?, 4) Are you using correct size fitting for hose? Most leaks are from incorrect assembly or mismatched sizes.',
    keywords: ['leak', 'leaking', 'troubleshooting', 'AN fitting'],
  },
  
  {
    id: 'faq-141',
    category: 'TROUBLESHOOTING',
    question: 'I stripped the threads on my AN fitting, now what?',
    answer: 'Aluminum threads can strip if overtightened. Replace the damaged fitting - cannot be repaired safely for fuel use. Prevention: Stop tightening when braid is flush with collar. Don\'t force it.',
    keywords: ['stripped', 'threads', 'damaged', 'overtightened'],
  },
  
  {
    id: 'faq-142',
    category: 'TROUBLESHOOTING',
    question: 'My fuel pump is noisy, is that normal?',
    answer: 'In-tank pumps: Should be quiet (fuel acts as noise dampener). If loud, check: Is tank low on fuel? Is pump properly submerged? Inline pumps: Normally louder, but excessive noise could indicate cavitation or inlet restriction. Ensure adequate fuel supply to pump.',
    keywords: ['fuel pump', 'noise', 'loud', 'noisy'],
  },
  
  // General (5 FAQs)
  {
    id: 'faq-150',
    category: 'GENERAL',
    question: 'Do you have installation videos?',
    answer: 'Yes! Check our website tech resources section for installation videos, sizing guides, and technical articles. We\'re always adding new content to help with your build.',
    keywords: ['video', 'installation', 'guide', 'resources'],
  },
  
  {
    id: 'faq-151',
    category: 'GENERAL',
    question: 'Can you help me design my fuel system?',
    answer: 'Absolutely! Contact us with your engine specs (displacement, HP goal, NA vs boost) and we\'ll recommend the right components. We\'ve done hundreds of LS swaps and hot rod builds - happy to share knowledge!',
    keywords: ['help', 'design', 'consultation', 'recommendation'],
  },
];

/**
 * Search FAQs
 */
export function searchFAQs(query: string): FAQ[] {
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/);
  
  return FAQS.filter(faq => {
    const searchable = [
      faq.question,
      faq.answer,
      ...faq.keywords,
    ].join(' ').toLowerCase();
    
    return queryTerms.some(term => searchable.includes(term));
  });
}

/**
 * Get FAQs by category
 */
export function getFAQsByCategory(category: string): FAQ[] {
  return FAQS.filter(faq => faq.category === category);
}

/**
 * Get related FAQs
 */
export function getRelatedFAQs(faqId: string, limit: number = 5): FAQ[] {
  const faq = FAQS.find(f => f.id === faqId);
  if (!faq) return [];
  
  // Find FAQs with overlapping keywords
  return FAQS
    .filter(f => f.id !== faqId)
    .map(f => ({
      faq: f,
      overlap: f.keywords.filter(k => faq.keywords.includes(k)).length,
    }))
    .filter(item => item.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, limit)
    .map(item => item.faq);
}

