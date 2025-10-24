# SEO Launch Assets Specification

**Date:** 2025-10-24  
**Purpose:** Specifications for required SEO and branding assets for Hot Dash launch  
**Status:** Ready for creation  

## Required Image Assets

### 1. Open Graph Image (`/public/og-image.png`)

**Purpose:** Social sharing preview image for Facebook, LinkedIn, Twitter

**Specifications:**
- **Dimensions:** 1200 x 630 pixels
- **Format:** PNG (with fallback JPG)
- **File size:** < 1MB (ideally < 300KB)
- **Aspect ratio:** 1.91:1
- **Safe zone:** Keep important content within 1200 x 600px (avoid edges)

**Content Requirements:**
- Hot Dash logo (prominent)
- Tagline: "Shopify Control Center"
- Key visual: Dashboard preview or abstract data visualization
- Brand colors: Use Hot Dash color scheme
- Text: Large, readable at small sizes
- Background: Professional, not too busy

**Design Elements:**
```
┌─────────────────────────────────────────┐
│  [Hot Dash Logo]                        │
│                                         │
│  Shopify Control Center                │
│                                         │
│  Real-time Analytics • Inventory        │
│  Customer Experience • Growth           │
│                                         │
│  [Dashboard Preview/Visual]             │
└─────────────────────────────────────────┘
```

**Testing:**
- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

### 2. Favicons

#### Standard Favicon (`/public/favicon.ico`)
- **Dimensions:** 32x32, 16x16 (multi-size ICO)
- **Format:** ICO
- **Content:** Hot Dash logo mark (simplified)

#### PNG Favicons
**`/public/favicon-32x32.png`**
- **Dimensions:** 32 x 32 pixels
- **Format:** PNG with transparency
- **Content:** Hot Dash logo mark

**`/public/favicon-16x16.png`**
- **Dimensions:** 16 x 16 pixels
- **Format:** PNG with transparency
- **Content:** Hot Dash logo mark (simplified for small size)

#### Apple Touch Icon (`/public/apple-touch-icon.png`)
- **Dimensions:** 180 x 180 pixels
- **Format:** PNG
- **Content:** Hot Dash logo with padding
- **Background:** Solid color (brand color)
- **Padding:** 20px on all sides

### 3. Logo Assets

#### Organization Logo (`/public/logo.png`)
**Purpose:** Structured data, email signatures, documentation

**Specifications:**
- **Dimensions:** 512 x 512 pixels (square)
- **Format:** PNG with transparency
- **Content:** Full Hot Dash logo
- **Background:** Transparent
- **Usage:** Schema.org Organization logo

#### Logo Variations
**`/public/logo-horizontal.png`**
- **Dimensions:** 1200 x 400 pixels
- **Format:** PNG with transparency
- **Content:** Logo + wordmark horizontal layout

**`/public/logo-white.png`**
- **Dimensions:** 512 x 512 pixels
- **Format:** PNG with transparency
- **Content:** White version for dark backgrounds

### 4. PWA Manifest Icons

**Purpose:** Progressive Web App installation

**Required Sizes:**
- 192x192 (`/public/icon-192.png`)
- 512x512 (`/public/icon-512.png`)

**Specifications:**
- **Format:** PNG
- **Content:** Hot Dash logo with padding
- **Background:** Solid color (brand color)
- **Maskable:** Consider maskable icon variant

## Web App Manifest

### File: `/public/site.webmanifest`

```json
{
  "name": "Hot Dash - Shopify Control Center",
  "short_name": "Hot Dash",
  "description": "Real-time analytics, inventory management, and growth automation for Shopify stores",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["business", "productivity", "utilities"],
  "screenshots": [
    {
      "src": "/screenshot-desktop.png",
      "sizes": "1920x1080",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshot-mobile.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

## Brand Colors

**Primary Colors:**
- Brand Primary: `#000000` (Black)
- Brand Secondary: `#ffffff` (White)
- Accent: `#0066cc` (Blue) - for CTAs and links

**UI Colors:**
- Background: `#ffffff`
- Surface: `#f5f5f5`
- Border: `#e0e0e0`
- Text Primary: `#000000`
- Text Secondary: `#666666`

**Status Colors:**
- Success: `#00a651`
- Warning: `#ff9800`
- Error: `#d32f2f`
- Info: `#2196f3`

## Typography

**Primary Font:** Inter (from Shopify CDN)
- Headings: Inter Bold (700)
- Body: Inter Regular (400)
- UI: Inter Medium (500)

**Font Loading:**
```html
<link rel="preconnect" href="https://cdn.shopify.com/" />
<link rel="stylesheet" href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css" />
```

## Asset Creation Checklist

### Design Phase
- [ ] Define brand colors and typography
- [ ] Create logo variations (full, mark, horizontal)
- [ ] Design Open Graph image template
- [ ] Design favicon at multiple sizes
- [ ] Create PWA icons

### Production Phase
- [ ] Export all assets at correct dimensions
- [ ] Optimize images (compression, format)
- [ ] Test favicons in browsers
- [ ] Validate Open Graph image
- [ ] Create web app manifest

### Implementation Phase
- [ ] Upload assets to `/public` directory
- [ ] Update meta tags with asset paths
- [ ] Test social sharing previews
- [ ] Verify PWA installation
- [ ] Run Lighthouse audit

## Image Optimization

### Compression Tools
- **PNG:** TinyPNG, ImageOptim, pngquant
- **JPG:** JPEGmini, ImageOptim, mozjpeg
- **WebP:** cwebp, Squoosh

### Optimization Targets
- Open Graph: < 300KB
- Favicons: < 10KB each
- Logo: < 50KB
- PWA Icons: < 100KB each

### Format Recommendations
- **Logos:** PNG with transparency
- **Photos:** JPG or WebP
- **Icons:** SVG (when possible) or PNG
- **Favicons:** ICO + PNG fallbacks

## Testing & Validation

### Social Sharing
1. **Facebook Debugger**
   - URL: https://developers.facebook.com/tools/debug/
   - Test: https://hotdash.fly.dev
   - Verify: Image, title, description

2. **Twitter Card Validator**
   - URL: https://cards-dev.twitter.com/validator
   - Test: https://hotdash.fly.dev
   - Verify: Card type, image, title

3. **LinkedIn Inspector**
   - URL: https://www.linkedin.com/post-inspector/
   - Test: https://hotdash.fly.dev
   - Verify: Image, title, description

### Favicon Testing
- Chrome: Check tab icon
- Firefox: Check tab icon
- Safari: Check tab icon
- iOS: Check home screen icon
- Android: Check home screen icon

### PWA Testing
- Chrome DevTools: Application > Manifest
- Lighthouse: PWA audit
- Test installation on mobile
- Verify icons and colors

## Delivery Format

### Asset Package Structure
```
assets/
├── favicons/
│   ├── favicon.ico
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   └── apple-touch-icon.png
├── logos/
│   ├── logo.png (512x512)
│   ├── logo-horizontal.png
│   └── logo-white.png
├── social/
│   └── og-image.png (1200x630)
├── pwa/
│   ├── icon-192.png
│   └── icon-512.png
└── manifest/
    └── site.webmanifest
```

## Next Steps

1. **Design Assets** (Designer)
   - Create logo and brand assets
   - Design Open Graph image
   - Export at all required sizes

2. **Optimize Assets** (SEO/DevOps)
   - Compress all images
   - Validate formats and sizes
   - Test in browsers

3. **Deploy Assets** (DevOps)
   - Upload to `/public` directory
   - Update CDN if applicable
   - Verify accessibility

4. **Validate** (QA/SEO)
   - Test social sharing
   - Verify favicons
   - Run Lighthouse audit
   - Check PWA installation

## Success Criteria

- ✅ All assets created at correct dimensions
- ✅ File sizes within optimization targets
- ✅ Social sharing previews display correctly
- ✅ Favicons visible in all browsers
- ✅ PWA installable on mobile devices
- ✅ Lighthouse PWA score > 90

