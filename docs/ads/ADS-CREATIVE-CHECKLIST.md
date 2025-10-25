# ADS Creative Specs & Preflight Checklist

**Task:** ADS-CREATIVE-CHECKLIST  
**Owner:** ads  
**Last Updated:** 2025-10-25  

---

## 1. Channel Creative Specifications

### Google Ads (Responsive Search & Display Remarketing)
- **RSA Headlines:** up to 15 headlines, 30 characters max each.
- **Descriptions:** up to 4 descriptions, 90 characters max.
- **Display Paths:** 2 paths, 15 characters each.
- **Responsive Display Asset Guidelines:**
  - Square image: 1200×1200 (min 300×300), < 150KB.
  - Landscape image: 1200×628 (min 600×314), < 150KB.
  - Logo: 512×512 or 1200×300.
  - Optional short headline (≤25 chars) and long headline (≤90 chars).
  - CTA: “Start free trial”.

### Meta (Facebook/Instagram)
- **Feed Image/Video:** 1080×1080, MP4/MOV ≤ 4GB, ≤ 120s (preferred 15-30s).
- **Stories/Reels:** 1080×1920, safe-zone margins 250px top/bottom.
- **Primary Text:** recommend ≤125 characters (absolute max 2200).
- **Headline:** ≤40 characters.
- **Description:** ≤30 characters.
- **Lead Form:** 45-character custom question limit; ensure CTA matches objective.

### LinkedIn
- **Single Image Ads:** 1200×627, JPG/PNG ≤ 5MB.
- **Video Ads:** Between 3s and 30 minutes; launch material targeting 15-30s; max file 200MB.
- **Intro Text:** ≤150 characters (short form to avoid truncation).
- **Headline:** ≤70 characters (45 recommended).
- **Conversation Ads:** 300×250 banner, CTA buttons ≤20 characters.

### X (Twitter)
- **Image Posts:** 1200×675 (16:9) or 1200×1200 (1:1), PNG/JPG ≤ 5MB.
- **Video:** MP4/MOV ≤ 1GB, recommended ≤ 30s.
- **Copy Length:** up to 280 characters; aim for ≤200 with hashtags.

### Email (HTML + Plaintext)
- **Hero Image:** 1200×600 (optimize for 1MB or less).
- **GIFs:** ≤3MB, 3-5 frame loops.
- **Preheader:** ≤100 characters.
- **Button Copy:** ≤20 characters; VML fallback for Outlook.

### Content (Blog & Downloadables)
- **Feature Images:** 1600×900 JPG/PNG ≤ 500KB.
- **PDF Playbook:** Letter size, < 5MB, includes accessible text layers.
- **Video Embeds:** Host on approved platform (YouTube/Vimeo) with captions.

---

## 2. Preflight Checklist

### Creative Integrity
- [ ] Asset dimensions match channel requirements.
- [ ] File sizes under platform limits.
- [ ] Motion assets include intro logo lock and CTA end frame.
- [ ] Copy adheres to character limits (h1, headlines, descriptions).

### Brand & Messaging
- [ ] Headline and primary text align with launch value props (“Human-in-the-loop AI”).
- [ ] CTA consistent with campaign goal (“Start Free Trial”, “Book Demo”).
- [ ] References match approved messaging from `docs/marketing/...`.

### Accessibility
- [ ] Color contrast ≥ 4.5:1 (validated with design QA).
- [ ] Videos include captions; audio described where applicable.
- [ ] Alt text provided for static images and GIFs.
- [ ] Email templates tested for screen reader hierarchy.

### Tracking & Compliance
- [ ] UTM parameters correspond to matrix in `docs/ads/ADS-TRACKING-TEST-MATRIX.md`.
- [ ] Pixels/tags confirmed (Meta Pixel, LinkedIn Insight Tag, etc.).
- [ ] Creative filenames map to `utm_content` values.
- [ ] Required disclaimers (if any) included (e.g., privacy copy for lead forms).

### QA & Approvals
- [ ] Previewed across devices (desktop, mobile).
- [ ] QA screenshots stored in `artifacts/ads/<date>/screenshots/`.
- [ ] CEO approval requested via `/admin/marketing/approvals`.
- [ ] Final assets archived in the shared drive per design guidelines.

---

## 3. Coordination Notes
- **Design Team:** Provide layered sources (Figma/AE) for future edits; confirm final color tokens.
- **Analytics:** Validate that creative IDs match reporting taxonomy (Segment/Fivetran).
- **Support:** Share accessibility summaries for CX teams to answer customer inquiries.
- **Legal/Compliance (if needed):** Sign-off on messaging for lead forms and social ads.

---

**Evidence:** This document (`docs/ads/ADS-CREATIVE-CHECKLIST.md`). Update per channel changes before launch.
