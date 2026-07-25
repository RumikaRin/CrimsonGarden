# Cinematic Landing Builder

Preset này dùng để tạo landing page cinematic/high-end. Đây là optional preset,
không phải rule mặc định cho mọi UI.

## 1. Khi Nào Được Dùng

Dùng preset này khi task là:
- Landing page.
- Marketing site.
- Product launch page.
- Waitlist/booking/sales page.
- Brand one-pager cần motion/visual mạnh.

Không dùng preset này cho:
- Dashboard, admin, CRM, SaaS operations tool.
- Form nghiệp vụ dày đặc.
- UI cần density cao và thao tác lặp lại.
- Project đã có design system nghiêm ngặt mà preset này xung đột.

## 2. H5S Guardrails

Thứ tự ưu tiên:

```text
User request > H5S/RULE.md > project stack/design system > this preset
```

Agent phải làm trước khi build:
1. Chọn H5S mode và model tier.
2. Kiểm tra project đang dùng stack gì.
3. Nếu project đã tồn tại, không chạy `npm create vite@latest`.
4. Nếu project là Next.js, đọc `node_modules/next/dist/docs/` liên quan trước khi code.
5. Nếu cần ảnh Unsplash, dùng URL thật và kiểm tra ảnh tải được; không dùng placeholder.
6. Nếu CLI không có `AskUserQuestion`, hỏi 4 câu trong một tin nhắn rồi chờ trả lời.

## 3. Four-Question Intake

Khi người dùng yêu cầu build landing page cinematic, hỏi đúng 4 câu này trong
một lượt:

1. `Brand name and one-line purpose?`
2. `Pick an aesthetic direction: Organic Tech, Midnight Luxe, Brutalist Signal, or Vapor Clinic.`
3. `What are your 3 key value propositions?`
4. `What should visitors do?`

Không hỏi thêm nếu câu trả lời đã đủ để build. Nếu thiếu thông tin nghiêm trọng,
dùng best judgment và ghi giả định.

## 4. Aesthetic Presets

### A. Organic Tech

- Identity: biological research lab meets avant-garde luxury magazine.
- Palette: Moss `#2E4036`, Clay `#CC5833`, Cream `#F2F0E9`, Charcoal `#1A1A1A`.
- Typography: Plus Jakarta Sans/Outfit, Cormorant Garamond Italic, IBM Plex Mono.
- Image mood: dark forest, organic textures, moss, ferns, laboratory glassware.
- Hero pattern: `[Concept noun] is the` + `[Power word].`

### B. Midnight Luxe

- Identity: private members' club meets high-end watchmaker atelier.
- Palette: Obsidian `#0D0D12`, Champagne `#C9A84C`, Ivory `#FAF8F5`, Slate `#2A2A35`.
- Typography: Inter if project permits, Playfair Display Italic, JetBrains Mono.
- Image mood: dark marble, gold accents, architectural shadows, luxury interiors.
- Hero pattern: `[Aspirational noun] meets` + `[Precision word].`

### C. Brutalist Signal

- Identity: future control room, raw precision, high signal density.
- Palette: Paper `#E8E4DD`, Signal Red `#E63B2E`, Off-white `#F5F3EE`, Black `#111111`.
- Typography: Space Grotesk, DM Serif Display Italic, Space Mono.
- Image mood: concrete, brutalist architecture, raw materials, industrial.
- Hero pattern: `[Direct verb] the` + `[System noun].`

### D. Vapor Clinic

- Identity: genome sequencing lab inside a Tokyo nightclub.
- Palette: Deep Void `#0A0A14`, Plasma `#7B61FF`, Ghost `#F0EFF4`, Graphite `#18181B`.
- Typography: Sora, Instrument Serif Italic only if appropriate, Fira Code.
- Image mood: bioluminescence, dark water, neon reflections, microscopy.
- Hero pattern: `[Tech noun] beyond` + `[Boundary word].`

## 5. Fixed Experience Pattern

Use these sections unless user/project scope says otherwise:

1. Navbar: floating pill/island, brand text, 3-4 links, CTA.
2. Hero: full-bleed image, gradient overlay, bottom-left content, strong CTA.
3. Features: 3 interactive cards mapped from the 3 value props.
4. Philosophy: manifesto contrast section.
5. Protocol: 3 stacked process cards.
6. Membership/Pricing or Get Started.
7. Footer: dark footer, nav/legal, system status indicator.

## 6. Interaction Patterns

Feature cards:
- Card 1: Diagnostic Shuffler, 3 overlapping cards cycling every 3 seconds.
- Card 2: Telemetry Typewriter, monospace live feed and blinking cursor.
- Card 3: Cursor Protocol Scheduler, animated cursor selects a weekly grid cell and saves.

Protocol cards:
- Card 1: rotating geometric motif.
- Card 2: scanning laser line over a dot/grid field.
- Card 3: pulsing waveform path.

Motion:
- Use GSAP/ScrollTrigger only if project already allows GSAP or user accepts adding it.
- In React, use `gsap.context()` inside `useEffect` and return `ctx.revert()`.
- Respect `prefers-reduced-motion`; provide a no-motion fallback.

## 7. Technical Defaults

Preferred for a new isolated landing page:
- React.
- Tailwind.
- GSAP + ScrollTrigger.
- Icon library already used by the project; do not add Lucide if project uses another set.
- Google Fonts only when allowed by project privacy/performance constraints.

Project integration rules:
- Existing Next.js project: implement inside existing app structure.
- Existing Vite project: use current `src/` structure.
- Existing design system: adapt preset tokens to existing components.
- No existing frontend project: ask before scaffolding.

## 8. Build Sequence

1. Map answers to preset tokens.
2. Generate hero copy from brand purpose and hero pattern.
3. Map value props to Shuffler, Typewriter, Scheduler.
4. Generate Philosophy contrast statements.
5. Generate Protocol steps from product process.
6. Implement within current project structure.
7. Verify build/lint/typecheck and visual behavior.
8. If UI is significant, run screenshot or browser QA.

## 9. Prompt Mẫu

```text
harness

Task là cinematic landing page. Dùng
H5S/docs/UI_PRESETS/CINEMATIC_LANDING_BUILDER.md.
Trước tiên chọn mode/model tier, kiểm tra project stack, rồi hỏi 4 câu intake
trong một lượt. Không scaffold project mới nếu repo hiện tại đã có frontend.
Sau khi có câu trả lời, tạo UI/UX brief trước rồi mới implement.
```

## 10. Done Criteria

- Không có placeholder text/image.
- CTA rõ trong hero.
- Mobile không vỡ layout, text không tràn.
- Motion có cleanup và reduced-motion fallback.
- Image URLs tải được hoặc được thay bằng asset hợp lệ.
- Verification command đã chạy và có evidence.

