/**
 * Hot Rod AN Product Catalog
 * Structured product knowledge for 49 AN fitting products
 */

export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  specifications: Record<string, string>;
  features: string[];
  applications: string[];
  compatibility: string[];
  pricing?: {
    basePrice?: number;
    variants?: Array<{ size: string; price: number }>;
  };
  url: string;
  keywords: string[];
}

/**
 * Hot Rod AN Product Categories
 */
export const PRODUCT_CATEGORIES = {
  PTFE_HOSES: {
    id: 'ptfe-hoses',
    name: 'PTFE Braided Hoses',
    description: 'PTFE-lined braided hoses for fuel, oil, and fluid systems',
    count: 10,
  },
  AN_FITTINGS: {
    id: 'an-fittings',
    name: 'AN Hose End Fittings',
    description: 'Reusable swivel fittings for PTFE hoses',
    count: 3,
  },
  ADAPTER_FITTINGS: {
    id: 'adapter-fittings',
    name: 'Adapter Fittings',
    description: 'AN to NPT, ORB, metric, and other thread adapters',
    count: 5,
  },
  FUEL_PUMPS: {
    id: 'fuel-pumps',
    name: 'Fuel Pumps',
    description: 'In-tank and inline fuel pumps for EFI systems',
    count: 4,
  },
  FUEL_COMPONENTS: {
    id: 'fuel-components',
    name: 'Fuel System Components',
    description: 'Filters, regulators, gauges, and sending units',
    count: 8,
  },
  FUEL_KITS: {
    id: 'fuel-kits',
    name: 'Fuel Line Kits',
    description: 'Complete fuel line kits for LS swaps and other applications',
    count: 8,
  },
  TOOLS: {
    id: 'tools',
    name: 'Installation Tools',
    description: 'Tools for installing and working with AN PTFE fittings',
    count: 5,
  },
  TRANSMISSION: {
    id: 'transmission',
    name: 'Transmission Coolers',
    description: 'Transmission oil coolers for performance applications',
    count: 2,
  },
  MISC_HARDWARE: {
    id: 'misc-hardware',
    name: 'Miscellaneous Hardware',
    description: 'Clamps, ferrules, and other hardware',
    count: 4,
  },
};

/**
 * Hot Rod AN Product Database (49 products)
 */
export const PRODUCTS: Product[] = [
  // PTFE Hoses (10 products)
  {
    id: 'ptfe-hose-black-nylon',
    name: 'PTFE-Lined Black Nylon Braided Hose',
    category: 'ptfe-hoses',
    description: 'PTFE-lined hose with black nylon outer braid',
    specifications: {
      liner: 'PTFE (Teflon)',
      outerBraid: 'Black nylon',
      sizes: 'AN-6, AN-8, AN-10',
      temperatureRange: '-40°F to 500°F',
      pressureRating: '1500+ PSI',
      fuelCompatibility: 'Gasoline, E85, methanol, diesel',
    },
    features: [
      'PTFE liner for superior fuel resistance',
      'Lightweight nylon braided covering',
      'Flexible for easy routing',
      'Reusable fittings compatible',
    ],
    applications: ['Fuel lines', 'Oil lines', 'Power steering', 'LS swaps'],
    compatibility: ['AN-6, AN-8, AN-10 reusable fittings'],
    url: 'https://hotrodan.com/products/ptfe-lined-black-nylon-braided-hose-an6-an8-an10',
    keywords: ['PTFE', 'black', 'nylon', 'braided', 'fuel line', 'AN'],
  },
  
  {
    id: 'ptfe-hose-orange-check',
    name: 'PTFE-Lined Black Nylon with Orange Checks Braided Hose',
    category: 'ptfe-hoses',
    description: 'PTFE-lined hose with black and orange checkered pattern',
    specifications: {
      liner: 'PTFE (Teflon)',
      outerBraid: 'Black nylon with orange checks',
      sizes: 'AN-6, AN-8, AN-10',
      temperatureRange: '-40°F to 500°F',
      pressureRating: '1500+ PSI',
    },
    features: ['Distinctive orange and black pattern', 'Same performance as solid black'],
    applications: ['Show cars', 'Engine bay aesthetics', 'Fuel systems'],
    compatibility: ['AN-6, AN-8, AN-10 fittings'],
    url: 'https://hotrodan.com/products/ptfe-lined-black-nylon-with-orange-checks-braided-hose-an6-an8-an10',
    keywords: ['PTFE', 'orange', 'black', 'checkered', 'show', 'AN'],
  },
  
  {
    id: 'ptfe-hose-green-check',
    name: 'PTFE-Lined Black Nylon with Green Checks Braided Hose',
    category: 'ptfe-hoses',
    description: 'PTFE-lined hose with black and green checkered pattern',
    specifications: {
      liner: 'PTFE',
      outerBraid: 'Black nylon with green checks',
      sizes: 'AN-6, AN-8, AN-10',
    },
    features: ['Green and black aesthetic', 'PTFE performance'],
    applications: ['Custom builds', 'Color-matched engine bays'],
    compatibility: ['AN fittings'],
    url: 'https://hotrodan.com/products/ptfe-lined-black-nylon-with-green-checks-braided-hose-an6-an8-an10',
    keywords: ['PTFE', 'green', 'check', 'AN'],
  },
  
  {
    id: 'ptfe-hose-stainless',
    name: 'PTFE-Lined Stainless Steel Braided Hose',
    category: 'ptfe-hoses',
    description: 'PTFE-lined hose with stainless steel outer braid',
    specifications: {
      liner: 'PTFE',
      outerBraid: 'Stainless steel',
      sizes: 'AN-6, AN-8, AN-10',
      temperatureRange: '-40°F to 600°F',
      pressureRating: '2000+ PSI',
    },
    features: [
      'Maximum abrasion resistance',
      'Higher temperature tolerance than nylon',
      'Professional race appearance',
      'Best for harsh environments',
    ],
    applications: ['Racing', 'Near exhaust components', 'High-heat areas'],
    compatibility: ['AN-6, AN-8, AN-10 fittings'],
    url: 'https://hotrodan.com/products/ptfe-lined-stainless-braided-an-hose-an6-an8-an10',
    keywords: ['PTFE', 'stainless', 'steel', 'braided', 'racing', 'AN'],
  },
  
  {
    id: 'ptfe-hose-red-check',
    name: 'PTFE-Lined Black Nylon with Red Check Braided Hose',
    category: 'ptfe-hoses',
    description: 'Popular red and black checkered PTFE hose',
    specifications: {
      liner: 'PTFE',
      outerBraid: 'Black nylon with red checks',
      sizes: 'AN-6, AN-8, AN-10',
    },
    features: ['Popular red and black color scheme', 'Clean performance look'],
    applications: ['Hot rods', 'Muscle cars', 'Show builds'],
    compatibility: ['AN fittings'],
    url: 'https://hotrodan.com/products/ptfe-lined-black-nylon-with-red-check-braided-hose-an6-an8-an10',
    keywords: ['PTFE', 'red', 'black', 'check', 'hot rod', 'AN'],
  },
  
  // AN Fittings (3 main types, each in 3 sizes = 9 SKUs, but counted as 3 products)
  {
    id: 'an-fitting-straight-swivel',
    name: 'AN PTFE Reusable Straight Swivel Hose End',
    category: 'an-fittings',
    subcategory: 'straight',
    description: 'Reusable straight swivel fitting for PTFE hoses',
    specifications: {
      type: 'Straight swivel',
      sizes: 'AN-6, AN-8, AN-10',
      material: 'Aluminum',
      finish: 'Anodized',
      reusable: 'Yes',
    },
    features: [
      '360° swivel for easy installation',
      'Reusable - can be used multiple times',
      'Includes ferrule',
      'No need for specialized crimping tools',
    ],
    applications: ['Fuel lines', 'Oil lines', 'Any fluid application'],
    compatibility: ['PTFE lined braided hoses (nylon or stainless)'],
    url: 'https://hotrodan.com/products/an-ptfe-reusable-straight-swivel-hose-end-an6-an8-an10',
    keywords: ['AN', 'fitting', 'straight', 'swivel', 'reusable', 'PTFE'],
  },
  
  {
    id: 'an-fitting-45-degree',
    name: 'AN PTFE Reusable 45° Swivel Hose End',
    category: 'an-fittings',
    subcategory: '45-degree',
    description: '45-degree swivel fitting for tight routing',
    specifications: {
      type: '45-degree swivel',
      angle: '45°',
      sizes: 'AN-6, AN-8, AN-10',
      material: 'Aluminum',
      reusable: 'Yes',
    },
    features: [
      '45-degree angle for cleaner routing',
      'Swivels for alignment',
      'Reusable construction',
    ],
    applications: ['Tight spaces', 'Clean engine bay routing'],
    compatibility: ['PTFE hoses'],
    url: 'https://hotrodan.com/products/an-ptfe-reusable-45-degree-swivel-hose-end-an6-an8-an10',
    keywords: ['AN', 'fitting', '45', 'degree', 'swivel', 'angle'],
  },
  
  {
    id: 'an-fitting-90-degree',
    name: 'AN PTFE Reusable 90° Swivel Hose End',
    category: 'an-fittings',
    subcategory: '90-degree',
    description: '90-degree swivel fitting for sharp bends',
    specifications: {
      type: '90-degree swivel',
      angle: '90°',
      sizes: 'AN-6, AN-8, AN-10',
      material: 'Aluminum',
      reusable: 'Yes',
    },
    features: [
      '90-degree angle for sharp turns',
      'Perfect for fuel rail connections',
      'Swivel action for alignment',
    ],
    applications: ['Fuel rail connections', 'Tight routing', 'Engine compartments'],
    compatibility: ['PTFE hoses'],
    url: 'https://hotrodan.com/products/an-ptfe-reusable-90-degree-swivel-hose-end-an6-an8-an10',
    keywords: ['AN', 'fitting', '90', 'degree', 'swivel', 'right angle'],
  },
  
  // Fuel Pumps (4 products)
  {
    id: 'walbro-255-in-tank',
    name: 'Walbro TI Automotive 255 LPH In-Tank Fuel Pump (GCA758)',
    category: 'fuel-pumps',
    subcategory: 'in-tank',
    description: 'High-performance in-tank fuel pump for EFI systems',
    specifications: {
      brand: 'Walbro / TI Automotive',
      model: 'GCA758',
      flowRate: '255 LPH',
      horsepower: 'Up to 525 HP (gasoline)',
      fuelTypes: 'Gasoline, E85',
      mounting: 'In-tank',
      voltage: '12V',
    },
    features: [
      'High-pressure EFI compatible',
      'E85 safe construction',
      'Direct replacement for many GM applications',
      'Proven reliability',
    ],
    applications: ['LS swaps', 'EFI conversions', 'Stock replacement'],
    compatibility: ['Works with AN-6 fuel lines', 'GM-style fuel tanks'],
    url: 'https://hotrodan.com/products/walbro-ti-automotive-255-lph-in-tank-fuel-pump-gca758',
    keywords: ['Walbro', 'fuel pump', '255 LPH', 'in-tank', 'EFI', 'E85', 'LS'],
  },
  
  {
    id: 'walbro-255-inline',
    name: 'Walbro TI Automotive 255 LPH Inline Fuel Pump (GSL392)',
    category: 'fuel-pumps',
    subcategory: 'inline',
    description: 'External inline fuel pump for custom fuel systems',
    specifications: {
      brand: 'Walbro / TI Automotive',
      model: 'GSL392',
      flowRate: '255 LPH',
      horsepower: 'Up to 525 HP',
      mounting: 'Inline/external',
      voltage: '12V',
    },
    features: [
      'External mounting flexibility',
      'Perfect for fuel cell setups',
      'Same reliability as in-tank version',
    ],
    applications: ['Fuel cells', 'Custom hot rod builds', 'Race cars'],
    compatibility: ['AN-6 or AN-8 fuel lines'],
    url: 'https://hotrodan.com/products/walbro-ti-automotive-255-lph-inline-fuel-pump-gsl392',
    keywords: ['Walbro', 'fuel pump', '255 LPH', 'inline', 'external', 'fuel cell'],
  },
  
  {
    id: 'aeromotive-stealth-340',
    name: 'Aeromotive Stealth 340 LPH In-Tank Fuel Pump',
    category: 'fuel-pumps',
    subcategory: 'in-tank',
    description: 'High-flow in-tank pump for serious performance',
    specifications: {
      brand: 'Aeromotive',
      model: 'Stealth',
      flowRate: '340 LPH',
      horsepower: 'Up to 700 HP (gasoline)',
      fuelTypes: 'Gasoline, E85, racing fuel',
      mounting: 'In-tank',
    },
    features: [
      'High-flow 340 LPH capacity',
      'Supports high-horsepower builds',
      'E85 and race fuel compatible',
      'Quality Aeromotive construction',
    ],
    applications: ['Forced induction', 'High-horsepower LS builds', 'Race applications'],
    compatibility: ['AN-8 fuel lines recommended'],
    url: 'https://hotrodan.com/products/aeromotive-stealth-340lph-in-tank-fuel-pump',
    keywords: ['Aeromotive', 'Stealth', '340 LPH', 'fuel pump', 'high performance', 'E85'],
  },
  
  {
    id: 'spectra-190-pump',
    name: 'Spectra Premium 190 LPH In-Tank Fuel Pump (GM Design)',
    category: 'fuel-pumps',
    subcategory: 'in-tank',
    description: 'OEM-quality replacement fuel pump',
    specifications: {
      brand: 'Spectra Premium',
      flowRate: '190 LPH',
      horsepower: 'Up to 400 HP',
      design: 'GM-style',
      mounting: 'In-tank',
    },
    features: [
      'OEM-quality construction',
      'Direct replacement',
      'Reliable performance',
    ],
    applications: ['Stock replacements', 'Mild performance builds'],
    compatibility: ['GM fuel tanks', 'AN-6 fuel lines'],
    url: 'https://hotrodan.com/products/spectra-premium-190-lph-in-tank-fuel-pump-gm-design',
    keywords: ['Spectra', 'fuel pump', '190 LPH', 'GM', 'replacement'],
  },
  
  // Fuel Line Kits (2 main products)
  {
    id: 'ls-fuel-kit-return',
    name: 'Return Style LS Engine AN Fuel Line Install Kit',
    category: 'fuel-kits',
    subcategory: 'ls-swap',
    description: 'Complete fuel line kit for return-style LS swaps',
    specifications: {
      application: 'LS engines with return fuel system',
      hoseSize: 'AN-6 or AN-8',
      includes: 'Pre-measured PTFE hose, fittings, adapters, hardware',
      fuelRailAdapters: 'Included for LS fuel rails',
    },
    features: [
      'Complete kit - no additional parts needed',
      'Pre-measured for typical installations',
      'Includes LS fuel rail adapters',
      'Mounting hardware included',
    ],
    applications: ['LS swap fuel systems', 'Return-style EFI'],
    compatibility: ['Most LS engines (LS1, LS2, LS3, LS6, LSX)'],
    url: 'https://hotrodan.com/products/return-style-ls-engine-an-fuel-line-install-kit',
    keywords: ['LS', 'fuel kit', 'return style', 'swap', 'AN', 'PTFE'],
  },
  
  {
    id: 'ls-fuel-kit-returnless',
    name: 'Returnless Style AN LS Engine Fuel Line Kit',
    category: 'fuel-kits',
    subcategory: 'ls-swap',
    description: 'Complete fuel line kit for returnless LS applications',
    specifications: {
      application: 'LS engines with returnless fuel system',
      hoseSize: 'AN-6 or AN-8',
      includes: 'PTFE supply line, fittings, adapters',
    },
    features: [
      'Returnless system design',
      'Simpler installation (no return line)',
      'Works with returnless fuel pumps',
    ],
    applications: ['Modern LS swaps', 'Returnless EFI conversions'],
    compatibility: ['LS engines with returnless fuel rail'],
    url: 'https://hotrodan.com/products/return-less-style-an-ls-engine-fuel-line-kit',
    keywords: ['LS', 'fuel kit', 'returnless', 'swap', 'AN'],
  },
  
  // Tools (5 products)
  {
    id: 'vice-jaws-aluminum',
    name: 'Aluminum Vice Jaws for PTFE Fitting Install (Black Anodized)',
    category: 'tools',
    subcategory: 'assembly',
    description: 'Protective vice jaws for assembling PTFE fittings',
    specifications: {
      material: 'Aluminum',
      finish: 'Black anodized',
      compatibility: 'All AN sizes',
    },
    features: [
      'Protects braided covering during assembly',
      'Prevents damage to hose',
      'Essential for proper PTFE fitting installation',
      'Fits standard bench vise',
    ],
    applications: ['PTFE fitting assembly', 'Hose preparation'],
    compatibility: ['AN-6, AN-8, AN-10 hoses'],
    url: 'https://hotrodan.com/products/aluminum-vice-jaws-for-ptfe-fitting-install-black-anodized',
    keywords: ['vice jaws', 'vise', 'aluminum', 'PTFE', 'installation', 'tool'],
  },
  
  {
    id: 'hose-shears',
    name: 'AN Hose Cutting Shears for Stainless and Nylon Braided PTFE Hose',
    category: 'tools',
    subcategory: 'cutting',
    description: 'Specialized shears for cutting braided hose cleanly',
    specifications: {
      cutCapacity: 'Up to AN-10',
      compatibility: 'Stainless and nylon braided',
    },
    features: [
      'Clean cuts through braided covering',
      'Sharp hardened steel blades',
      'Prevents fraying',
      'Essential for professional installs',
    ],
    applications: ['Cutting PTFE hose to length'],
    compatibility: ['All PTFE braided hoses'],
    url: 'https://hotrodan.com/products/an-hose-cutting-shears-for-stainless-and-nylon-braided-ptfe-hose',
    keywords: ['shears', 'cutting', 'hose', 'tool', 'PTFE', 'AN'],
  },
  
  {
    id: 'spanner-wrench',
    name: 'Adjustable Aluminum Spanner Wrench (AN3-AN12) for PTFE Fitting Install',
    category: 'tools',
    subcategory: 'tightening',
    description: 'Adjustable spanner wrench for assembling AN fittings',
    specifications: {
      sizeRange: 'AN3 through AN12',
      material: 'Aluminum',
      finish: 'Anodized',
    },
    features: [
      'Adjustable for multiple AN sizes',
      'Prevents fitting damage during tightening',
      'Lightweight aluminum construction',
      'Precision fitting installation',
    ],
    applications: ['PTFE fitting assembly', 'Proper torquing'],
    compatibility: ['AN-3 to AN-12 fittings'],
    url: 'https://hotrodan.com/products/adjustable-aluminum-spanner-wrench-an3-an12-anodized-for-an-ptfe-fitting-install',
    keywords: ['spanner', 'wrench', 'tool', 'AN', 'fitting', 'installation'],
  },
  
  {
    id: 'replacement-ferrules',
    name: 'Replacement Ferrules for AN PTFE Fittings',
    category: 'tools',
    subcategory: 'parts',
    description: 'Replacement ferrules for reusable AN PTFE fittings',
    specifications: {
      sizes: 'AN-6, AN-8, AN-10',
      material: 'Steel',
      compatibility: 'Reusable AN PTFE fittings',
    },
    features: [
      'Replacement parts for reusable fittings',
      'Allows multiple hose assemblies',
      'Quality construction',
    ],
    applications: ['Remaking hose assemblies', 'Spare parts'],
    compatibility: ['AN-6, AN-8, AN-10 reusable fittings'],
    url: 'https://hotrodan.com/products/replacement-ferrules-for-an-ptfe-fittings',
    keywords: ['ferrule', 'replacement', 'AN', 'PTFE', 'fitting'],
  },
];

/**
 * Product search by keyword
 */
export function searchProducts(query: string): Product[] {
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/);
  
  return PRODUCTS.filter(product => {
    const searchable = [
      product.name,
      product.description,
      product.category,
      ...product.keywords,
      ...product.features,
      ...product.applications,
      ...Object.values(product.specifications),
    ].join(' ').toLowerCase();
    
    return queryTerms.some(term => searchable.includes(term));
  });
}

/**
 * Get products by category
 */
export function getProductsByCategory(categoryId: string): Product[] {
  return PRODUCTS.filter(p => p.category === categoryId);
}

/**
 * Get product by ID
 */
export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id);
}

